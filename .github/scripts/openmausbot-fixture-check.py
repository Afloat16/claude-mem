import json
import os
import signal
import subprocess
import sys
from pathlib import Path

out = Path(sys.argv[1])
scratch = Path(__file__).parent / "tmp"
scratch.mkdir(exist_ok=True)
env = {**os.environ, "TMPDIR": str(scratch.resolve())}
launcher = subprocess.Popen(
    ["node", "--experimental-strip-types", "scripts/control-omb.ts", "launch"],
    stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True, env=env,
)
try:
    text = ""
    for line in launcher.stdout:
        text += line
        try:
            info = json.loads(text)
        except json.JSONDecodeError:
            continue
        break
    else:
        raise RuntimeError(text)
    if not info.get("ok"):
        raise RuntimeError(text)
    doctor = subprocess.run(
        ["node", "--experimental-strip-types", "scripts/control-omb.ts", "doctor", "--url", info["url"]],
        capture_output=True, text=True, env=env, timeout=60,
    )
    out.write_text(text + doctor.stdout + doctor.stderr)
    if doctor.returncode:
        raise RuntimeError(doctor.stdout + doctor.stderr)
    result = json.loads(doctor.stdout)
    if not result.get("ok"):
        raise RuntimeError(doctor.stdout)
    print(json.dumps({"ok": result["ok"], "health": result["health"], "problems": result["problems"], "log": str(out)}))
finally:
    launcher.send_signal(signal.SIGINT)
    try:
        launcher.wait(timeout=20)
    except subprocess.TimeoutExpired:
        launcher.kill()
        launcher.wait()
