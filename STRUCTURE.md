# Estructura del proyecto

```
Grabador-de-pantalla-avanzado-m-vil-/
├── .github/
│   └── workflows/
│       ├── build-apk.yml                 # Build APK (Release/Debug)
│       ├── build-apk-emulator.yml         # Build + smoke test en emulador
│       └── opencode.yml                  # Agente OpenCode (CI)
├── .opencode/
│   ├── agents/                           # Subagentes especializados
│   ├── skills/                           # Skills (cpp-pro, kotlin-specialist, qt-ui-design, devops-engineer)
│   ├── tools/                            # phone, vision_describe
│   └── commands/
├── android/
│   ├── AndroidManifest.xml
│   ├── src/org/qtproject/example/screenrecorder/
│   │   ├── MainActivity.kt               # Puente onActivityResult
│   │   └── ScreenRecorder.kt             # Captura nativa (MediaProjection)
│   └── res/                              # Iconos
├── qml/
│   └── Main.qml                          # UI principal
├── src/
│   ├── recordercontroller.h
│   └── recordercontroller.cpp            # Controlador + JNI
├── scripts/
│   ├── automation/                       # phone_simulator.py, env checks
│   └── ci/                               # rea-mcp-filter.mjs
├── main.cpp
├── CMakeLists.txt
├── README.md
├── AGENTS.md
├── AI_CONTEXT.md
├── STRUCTURE.md
├── ROADMAP.md
└── README_AI.md
```

## Módulos
- **UI**: `qml/Main.qml` (QML6).
- **Control**: `src/recordercontroller.*` expone `recorder` al contexto QML.
- **Nativo Android**: `android/.../ScreenRecorder.kt` ejecuta captura.
- **Build**: CMake + Qt Android; workflows compilan APK.