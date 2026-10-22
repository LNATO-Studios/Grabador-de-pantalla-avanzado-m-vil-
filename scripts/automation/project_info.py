import os
import subprocess
import sys

def run(cmd):
    try:
        out = subprocess.check_output(cmd, shell=True, stderr=subprocess.STDOUT, text=True)
        return out.strip()
    except Exception as e:
        return f"error: {e}"

def main():
    print("repo-root:", os.getcwd())
    print("git-branch:", run("git rev-parse --abbrev-ref HEAD"))
    print("git-status:", run("git status --short"))
    print("files:", len([f for f in os.listdir(".") if os.path.isfile(f)]))

if __name__ == "__main__":
    main()
