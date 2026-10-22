import os
import sys
import glob
import yaml

root = os.getcwd()
paths = sorted(glob.glob(os.path.join(root, ".github", "workflows", "*.yml")) +
               glob.glob(os.path.join(root, ".github", "workflows", "*.yaml")))
if not paths:
    print("no workflows found")
    sys.exit(0)

ok = True
for p in paths:
    try:
        with open(p, encoding="utf-8") as f:
            data = yaml.safe_load(f)
        name = data.get("name", os.path.basename(p)) if isinstance(data, dict) else os.path.basename(p)
        jobs = list((data or {}).get("jobs", {}).keys()) if isinstance(data, dict) else []
        print(f"OK {os.path.relpath(p, root)} name={name} jobs={','.join(jobs) or '-'}")
    except Exception as e:
        ok = False
        print(f"FAIL {os.path.relpath(p, root)}: {e}")

sys.exit(0 if ok else 1)
