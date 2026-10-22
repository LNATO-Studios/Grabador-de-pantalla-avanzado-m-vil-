#!/usr/bin/env python3
"""Control de emulador/dispositivo Android vía ADB para pruebas de la app."""
import argparse
import os
import shutil
import subprocess
import sys
import time


def adb_bin():
    return os.environ.get("ADB", "adb")


def run_adb(args, timeout=120):
    cmd = [adb_bin()] + args
    try:
        r = subprocess.run(cmd, capture_output=True, text=True, timeout=timeout)
    except FileNotFoundError:
        print("ERROR: adb no encontrado. Instala Android platform-tools.", file=sys.stderr)
        sys.exit(127)
    out = []
    if r.stdout:
        out.append(r.stdout.rstrip("\n"))
    if r.stderr:
        out.append(f"[stderr]\n{r.stderr.rstrip(chr(10))}")
    out.append(f"[exit {r.returncode}]")
    print("\n".join(out))
    return r.returncode


def cmd_devices(_):
    return run_adb(["devices", "-l"])


def cmd_screenshot(args):
    out = args.output
    # capture via exec-out to file
    try:
        with open(out, "wb") as f:
            r = subprocess.run([adb_bin(), "exec-out", "screencap", "-p"], stdout=f, stderr=subprocess.PIPE, timeout=60)
        if r.returncode != 0:
            print(f"[stderr]\n{r.stderr.decode('utf-8', 'replace')}")
            print(f"[exit {r.returncode}]")
            return r.returncode
        print(f"screenshot guardada: {out}")
        print("[exit 0]")
        return 0
    except FileNotFoundError:
        print("ERROR: adb no encontrado.", file=sys.stderr)
        return 127


def cmd_tap(args):
    return run_adb(["shell", "input", "tap", str(args.x), str(args.y)])


def cmd_swipe(args):
    cmd = ["shell", "input", "swipe", str(args.x1), str(args.y1), str(args.x2), str(args.y2)]
    if args.duration is not None:
        cmd.append(str(args.duration))
    return run_adb(cmd)


def cmd_text(args):
    # adb input text needs spaces escaped
    text = args.text.replace(" ", "%s")
    return run_adb(["shell", "input", "text", text])


def cmd_key(args):
    return run_adb(["shell", "input", "keyevent", str(args.keycode)])


def cmd_install(args):
    return run_adb(["install", "-r", args.apk], timeout=300)


def cmd_launch(args):
    comp = args.component
    return run_adb(["shell", "am", "start", "-n", comp])


def cmd_wait(args):
    time.sleep(args.seconds)
    print(f"esperado {args.seconds}s")
    print("[exit 0]")
    return 0


def cmd_emulator_start(args):
    emu = shutil.which("emulator") or os.environ.get("EMULATOR")
    if not emu:
        print("ERROR: emulator no encontrado en PATH.", file=sys.stderr)
        return 127
    # launch in background
    subprocess.Popen([emu, "-avd", args.avd, "-no-window", "-no-audio", "-gpu", "swiftshader_indirect"],
                     stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    print(f"emulador {args.avd} lanzado (headless)")
    print("[exit 0]")
    return 0


def main():
    p = argparse.ArgumentParser(description="Control de dispositivo/emulador Android vía ADB")
    sub = p.add_subparsers(dest="cmd", required=True)

    sub.add_parser("devices", help="Lista dispositivos conectados")

    s = sub.add_parser("screenshot", help="Captura de pantalla")
    s.add_argument("output", help="Ruta del PNG de salida")
    s.set_defaults(func=cmd_screenshot)

    t = sub.add_parser("tap", help="Toque en coordenadas")
    t.add_argument("x", type=int)
    t.add_argument("y", type=int)
    t.set_defaults(func=cmd_tap)

    sw = sub.add_parser("swipe", help="Deslizar")
    sw.add_argument("x1", type=int)
    sw.add_argument("y1", type=int)
    sw.add_argument("x2", type=int)
    sw.add_argument("y2", type=int)
    sw.add_argument("duration", nargs="?", type=int, default=None)
    sw.set_defaults(func=cmd_swipe)

    tx = sub.add_parser("text", help="Escribir texto")
    tx.add_argument("text")
    tx.set_defaults(func=cmd_text)

    k = sub.add_parser("key", help="Evento de tecla")
    k.add_argument("keycode")
    k.set_defaults(func=cmd_key)

    ins = sub.add_parser("install", help="Instalar APK")
    ins.add_argument("apk")
    ins.set_defaults(func=cmd_install)

    ln = sub.add_parser("launch", help="Lanzar componente (pkg/Activity)")
    ln.add_argument("component")
    ln.set_defaults(func=cmd_launch)

    w = sub.add_parser("wait", help="Esperar segundos")
    w.add_argument("seconds", type=int)
    w.set_defaults(func=cmd_wait)

    es = sub.add_parser("emulator-start", help="Arrancar emulador headless")
    es.add_argument("avd")
    es.set_defaults(func=cmd_emulator_start)

    args = p.parse_args()
    # dispatch devices
    if args.cmd == "devices":
        sys.exit(cmd_devices(args))
    sys.exit(args.func(args))


if __name__ == "__main__":
    main()
