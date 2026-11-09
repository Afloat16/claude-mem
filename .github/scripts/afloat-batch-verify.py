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


items = json.loads(Path(sys.argv[1]).read_text())
temporary = Path(os.environ['RUNNER_TEMP'])
token = os.environ.pop('GH_TOKEN')
run(['git', 'config', 'user.name', 'Afloat'])
run(['git', 'config', 'user.email', 'ShuffleMonkey@163.com'])
run(['git', 'fetch', 'https://github.com/thedotmack/claude-mem.git', 'main', '--depth=1'])
upstream = output(['git', 'rev-parse', 'FETCH_HEAD'])
for item in items:
    run(['git', 'fetch', 'origin', item['branch'], '--depth=2'])
    if output(['git', 'rev-parse', 'FETCH_HEAD']) != item['source_sha']:
        raise RuntimeError('Contribution branch changed before validation: ' + item['slug'])
    run(['git', 'rebase', '--onto', upstream, item['original_base'], item['source_sha']])
    item['verified_source_sha'] = output(['git', 'rev-parse', 'HEAD'])

run(['git', 'checkout', '--detach', '--force', upstream])
run(['npm', 'install', '--no-audit', '--no-fund'])
run(['npm', 'run', 'build'])
baseline = artifact_hashes()
(temporary / 'batch-baseline-artifacts.json').write_text(json.dumps(baseline, indent=2))

for item in items:
    print('::group::' + item['slug'], flush=True)
    run(['git', 'checkout', '--detach', '--force', upstream])
    run(['git', 'restore', '--source', item['verified_source_sha'], '--', *item['regression_tests']])
    regression_log = temporary / (item['slug'] + '-baseline.log')
    with regression_log.open('w') as stream:
        baseline_result = subprocess.run(['bun', 'test', *item['regression_tests']], stdout=stream, stderr=subprocess.STDOUT)
    print(regression_log.read_text(), flush=True)
    if baseline_result.returncode == 0:
        raise RuntimeError('Regression unexpectedly passes unchanged upstream: ' + item['slug'])
    run(['git', 'checkout', '--detach', '--force', item['verified_source_sha']])
    run(['npm', 'run', 'typecheck'])
    changed_log = temporary / (item['slug'] + '-changed.log')
    with changed_log.open('w') as stream:
        changed_result = subprocess.run(['bun', 'test', *item['tests']], stdout=stream, stderr=subprocess.STDOUT)
    print(changed_log.read_text(), flush=True)
    if changed_result.returncode != 0:
        raise RuntimeError('Changed native test selection failed: ' + item['slug'])
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
    run(['git', 'rm', '.github/workflows/afloat-verify-contribution.yml'])
    run(['git', 'commit', '-m', 'build: synchronize verified runtime artifacts'])
    item['final_head'] = output(['git', 'rev-parse', 'HEAD'])
    item['verification_base'] = upstream
    item['runtime_artifacts'] = staged
    print('::endgroup::', flush=True)

# All corrections must pass before any target ref moves. Each lease rejects
# a branch changed by someone else while this job was running.
push_env = os.environ.copy()
authorization = base64.b64encode(('x-access-token:' + token).encode()).decode()
push_env.update({
    'GIT_CONFIG_COUNT': '1',
    'GIT_CONFIG_KEY_0': 'http.https://github.com/.extraheader',
    'GIT_CONFIG_VALUE_0': 'AUTHORIZATION: basic ' + authorization,
})
push = ['git', 'push', '--atomic', 'origin']
for item in items:
    push.extend([item['final_head'] + ':refs/heads/' + item['branch'],
                 '--force-with-lease=refs/heads/' + item['branch'] + ':' + item['source_sha']])
run(push, env=push_env)
(temporary / 'batch-verification-results.json').write_text(json.dumps(items, indent=2))
with open(os.environ['GITHUB_STEP_SUMMARY'], 'a') as summary:
    summary.write('| Contribution | Validated source | Final branch head |\n|---|---|---|\n')
    for item in items:
        summary.write('| ' + item['slug'] + ' | `' + item['source_sha'] + '` | `' + item['final_head'] + '` |\n')
print(json.dumps(items, indent=2), flush=True)
