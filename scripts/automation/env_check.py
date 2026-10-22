import platform
import sys
import os

def main():
    print(f"python={sys.version.split()[0]}")
    print(f"platform={platform.platform()}")
    print(f"executable={sys.executable}")
    print(f"cwd={os.getcwd()}")
    try:
        import numpy
        print("numpy=available")
    except Exception:
        print("numpy=missing")
    try:
        import jinja2
        print("jinja2=available")
    except Exception:
        print("jinja2=missing")

if __name__ == "__main__":
    main()
