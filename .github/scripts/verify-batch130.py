"""Verify isolated source branches and publish only their generated runtime changes."""
import base64
import hashlib
import json
import os
from pathlib import Path
import subprocess
import sys


def run(args, **kwargs):
    print('+ ' + ' '.join(args), flush=True)
    return subprocess.run(args, check=True, **kwargs)


def output(args):
    return subprocess.check_output(args, text=True).strip()


def artifact_hashes():
    result = {}
    for prefix in ['plugin', 'openclaw/dist', 'omp', 'pi', 'dsh', 'hermes']:
        for path in Path(prefix).rglob('*'):
            if path.is_file() and 'node_modules' not in path.parts:
                result[str(path)] = hashlib.sha256(path.read_bytes()).hexdigest()
    return result


def logged(args, path, expected_success=True):
    with path.open('w') as stream:
        result = subprocess.run(args, stdout=stream, stderr=subprocess.STDOUT)
    print(path.read_text(), flush=True)
    if (result.returncode == 0) != expected_success:
        raise RuntimeError('Unexpected result from ' + ' '.join(args))


items = json.loads(Path(sys.argv[1]).read_text())
temporary = Path(os.environ['RUNNER_TEMP'])
token = os.environ.pop('GH_TOKEN')
run(['git', 'config', 'user.name', 'Afloat'])
run(['git', 'config', 'user.email', 'ShuffleMonkey@163.com'])
bases = {item['original_base'] for item in items}
if len(bases) != 1:
    raise RuntimeError('Each verification batch requires one exact baseline')
baseline_sha = bases.pop()
run(['git', 'fetch', 'origin', baseline_sha, '--depth=1'])
for item in items:
    run(['git', 'fetch', 'origin', item['branch'], '--depth=2'])
    if output(['git', 'rev-parse', 'FETCH_HEAD']) != item['source_sha']:
        raise RuntimeError('Branch changed before verification: ' + item['slug'])
    if output(['git', 'rev-parse', item['source_sha'] + '^']) != baseline_sha:
        raise RuntimeError('Unexpected source parent: ' + item['slug'])

run(['git', 'checkout', '--detach', '--force', baseline_sha])
run(['npm', 'install', '--ignore-scripts', '--no-audit', '--no-fund', '--no-package-lock'])
run(['npm', 'run', 'build'])
baseline = artifact_hashes()
(temporary / 'batch130-baseline-artifacts.json').write_text(json.dumps(baseline, indent=2))

for item in items:
    print('::group::' + item['slug'], flush=True)
    run(['git', 'checkout', '--detach', '--force', baseline_sha])
    if item.get('benchmark'):
        result = subprocess.run(['bun', 'run', str(temporary / item['benchmark']), str(Path.cwd())], check=True, text=True, capture_output=True)
        item['benchmark_baseline'] = json.loads(result.stdout.strip().splitlines()[-1])
    else:
        run(['git', 'restore', '--source', item['source_sha'], '--', *item['regression_tests']])
        logged(['bun', 'test', *item['regression_tests']], temporary / (item['slug'] + '-baseline.log'), expected_success=False)
    run(['git', 'checkout', '--detach', '--force', item['source_sha']])
    logged(['npm', 'run', 'typecheck'], temporary / (item['slug'] + '-types.log'))
    logged(['bun', 'test', *item['tests']], temporary / (item['slug'] + '-changed.log'))
    if item.get('benchmark'):
        result = subprocess.run(['bun', 'run', str(temporary / item['benchmark']), str(Path.cwd())], check=True, text=True, capture_output=True)
        item['benchmark_fixed'] = json.loads(result.stdout.strip().splitlines()[-1])
        before, after = item['benchmark_baseline'], item['benchmark_fixed']
        if before['outputSha256'] != after['outputSha256']:
            raise RuntimeError('Benchmark changed search results')
        if after['medianMs'] >= before['medianMs'] * 0.5:
            raise RuntimeError('The bounded snippet benchmark did not establish the expected improvement')
        print(json.dumps({'baseline': before, 'fixed': after}), flush=True)
    run(['npm', 'run', 'build'])
    current = artifact_hashes()
    changed = sorted(path for path in baseline.keys() | current.keys() if baseline.get(path) != current.get(path))
    staged = []
    for path in changed:
        tracked = subprocess.run(['git', 'ls-files', '--error-unmatch', '--', path], capture_output=True).returncode == 0
        if not tracked and not path.startswith('plugin/'):
            continue
        if Path(path).exists():
            run(['git', 'add', '-f', '--', path])
        elif tracked:
            run(['git', 'rm', '--', path])
        staged.append(path)
    if subprocess.run(['git', 'diff', '--cached', '--quiet']).returncode:
        run(['git', 'commit', '-m', 'build: synchronize verified runtime artifacts'])
    item['final_head'] = output(['git', 'rev-parse', 'HEAD'])
    item['runtime_artifacts'] = staged
    print('::endgroup::', flush=True)

# Use the workflow's own repository token only to advance the exact branches
# verified above. A concurrent edit fails the lease instead of being replaced.
push_env = os.environ.copy()
authorization = base64.b64encode(('x-access-token:' + token).encode()).decode()
push_env.update({'GIT_CONFIG_COUNT': '1', 'GIT_CONFIG_KEY_0': 'http.https://github.com/.extraheader',
                 'GIT_CONFIG_VALUE_0': 'AUTHORIZATION: basic ' + authorization})
push = ['git', 'push', '--atomic', 'origin']
for item in items:
    push.extend([item['final_head'] + ':refs/heads/' + item['branch'],
                 '--force-with-lease=refs/heads/' + item['branch'] + ':' + item['source_sha']])
run(push, env=push_env)
(temporary / 'batch130-verification-results.json').write_text(json.dumps(items, indent=2))
with open(os.environ['GITHUB_STEP_SUMMARY'], 'a') as summary:
    summary.write('| Contribution | Verified source | Final branch head |\n|---|---|---|\n')
    for item in items:
        summary.write('| ' + item['slug'] + ' | `' + item['source_sha'] + '` | `' + item['final_head'] + '` |\n')
print(json.dumps(items, indent=2), flush=True)
