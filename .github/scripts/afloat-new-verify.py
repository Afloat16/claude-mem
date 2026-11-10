"""Validate independent contribution branches and commit only relevant runtime output."""
import base64
import hashlib
import json
import os
from pathlib import Path
import re
import subprocess
import sys


def run(args, **kwargs):
    print('+ ' + ' '.join(args), flush=True)
    return subprocess.run(args, check=True, **kwargs)


def output(args):
    return subprocess.check_output(args, text=True).strip()


def artifacts():
    result = {}
    for prefix in ['plugin', 'openclaw/dist', 'omp', 'pi', 'dsh', 'hermes']:
        for path in Path(prefix).rglob('*'):
            if path.is_file() and 'node_modules' not in path.parts:
                result[str(path)] = hashlib.sha256(path.read_bytes()).hexdigest()
    return result


def checked_tests(command, log_path, baseline=False):
    with log_path.open('w') as stream:
        result = subprocess.run(command, stdout=stream, stderr=subprocess.STDOUT, timeout=240)
    text = log_path.read_text()
    print(text, flush=True)
    if baseline:
        if result.returncode == 0:
            raise RuntimeError('Regression passes the original implementation: ' + log_path.name)
        if not re.search(r'error: expect|AssertionError|Expected:|Expected pattern:|ERR_ASSERTION', text):
            raise RuntimeError('Baseline failure does not establish an assertion regression: ' + log_path.name)
    elif result.returncode != 0:
        raise RuntimeError('Changed implementation tests failed: ' + log_path.name)


items = json.loads(Path(sys.argv[1]).read_text())
temporary = Path(os.environ['RUNNER_TEMP'])
token = os.environ.pop('GH_TOKEN')
run(['git', 'config', 'user.name', 'Afloat16'])
run(['git', 'config', 'user.email', '132809511+Afloat16@users.noreply.github.com'])
base = items[0]['base']
if any(item['base'] != base for item in items):
    raise RuntimeError('One batch must share its verified base')
run(['git', 'fetch', 'https://github.com/thedotmack/claude-mem.git', base, '--depth=1'])
for item in items:
    run(['git', 'fetch', 'origin', item['branch'], '--depth=2'])
    if output(['git', 'rev-parse', 'FETCH_HEAD']) != item['source_sha']:
        raise RuntimeError('Contribution changed before validation: ' + item['slug'])

run(['git', 'checkout', '--detach', '--force', base])
run(['npm', 'install', '--no-audit', '--no-fund'])
run(['npm', 'run', 'typecheck'])
run(['npm', 'run', 'build'])
baseline = artifacts()
(temporary / 'baseline-artifacts.json').write_text(json.dumps(baseline, indent=2))

completed = []
for item in items:
    print('::group::' + item['slug'], flush=True)
    run(['git', 'checkout', '--detach', '--force', base])
    run(['git', 'clean', '-fd', '--', 'tests', 'src/ui/my-work/src', 'plugin/ui/work-view/assets'])
    run(['git', 'restore', '--source', item['source_sha'], '--', *item['regression_files']])
    checked_tests(item['regression_command'], temporary / (item['slug'] + '-baseline.log'), baseline=True)
    run(['git', 'checkout', '--detach', '--force', item['source_sha']])
    run(['npm', 'run', 'typecheck'])
    checked_tests(item['test_command'], temporary / (item['slug'] + '-changed.log'))
    run(['npm', 'run', 'build'])
    current = artifacts()
    changed = set(path for path in baseline.keys() | current.keys() if baseline.get(path) != current.get(path))
    # Vite chunks refer to each other's content-hashed names. When this app is
    # changed, commit its complete emitted set and retire the old tracked set.
    if any(path.startswith('plugin/ui/work-view/') for path in changed):
        changed.update(path for path in current if path.startswith('plugin/ui/work-view/'))
        changed.update(output(['git', 'ls-files', '--', 'plugin/ui/work-view']).splitlines())
    staged = []
    for path in sorted(changed):
        tracked = subprocess.run(['git', 'ls-files', '--error-unmatch', '--', path], capture_output=True).returncode == 0
        if not tracked and not path.startswith('plugin/'):
            continue
        if Path(path).exists():
            run(['git', 'add', '-f', '--', path])
        elif tracked:
            run(['git', 'rm', '--', path])
        staged.append(path)
    if subprocess.run(['git', 'diff', '--cached', '--quiet']).returncode != 0:
        run(['git', 'commit', '-m', 'build: synchronize verified runtime artifacts'])
    item['final_head'] = output(['git', 'rev-parse', 'HEAD'])
    item['runtime_artifacts'] = staged
    # Only update this task's own source ref; the lease preserves concurrent work.
    authorization = base64.b64encode(('x-access-token:' + token).encode()).decode()
    push_env = os.environ.copy()
    push_env.update({'GIT_CONFIG_COUNT': '1', 'GIT_CONFIG_KEY_0': 'http.https://github.com/.extraheader',
                     'GIT_CONFIG_VALUE_0': 'AUTHORIZATION: basic ' + authorization})
    run(['git', 'push', 'origin', item['final_head'] + ':refs/heads/' + item['branch'],
         '--force-with-lease=refs/heads/' + item['branch'] + ':' + item['source_sha']], env=push_env)
    completed.append(item)
    (temporary / 'verification-results.json').write_text(json.dumps(completed, indent=2))
    with open(os.environ['GITHUB_STEP_SUMMARY'], 'a') as summary:
        summary.write('- `' + item['slug'] + '` verified and built: `' + item['final_head'] + '`\n')
    print('::endgroup::', flush=True)

print(json.dumps(completed, indent=2), flush=True)
