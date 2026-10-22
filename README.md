# Grabador de pantalla avanzado (móvil)

Grabador de pantalla para Android con interfaz QML6 (Qt 6) y captura nativa en Kotlin/C++.

- UI: QML6 (`qml/Main.qml`) con botón de grabación.
- Captura: Kotlin (`android/.../ScreenRecorder.kt`) usando MediaProjection + VirtualDisplay + MediaCodec + MediaMuxer, incluyendo audio interno vía AudioPlaybackCapture.
- Puente C++/Kotlin vía JNI (`src/recordercontroller.cpp`).

## Compilación (Android)

Requiere Qt 6.8+ con soporte Android, Android SDK/NDK y CMake.

```bash
cmake -S . -B build -DCMAKE_TOOLCHAIN_FILE=$ANDROID_NDK/build/cmake/android.toolchain.cmake -DANDROID_ABI=arm64-v8a
cmake --build build
```

Abrir el proyecto en Qt Creator y desplegar en dispositivo Android 10+.
