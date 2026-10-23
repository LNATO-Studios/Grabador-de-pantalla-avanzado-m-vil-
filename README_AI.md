# README_AI — Grabador de pantalla avanzado (móvil)

Documento pensado para asistentes de IA (OpenCode/Copilot/Claude) que trabajan en este repo. Resume propósito, stack, flujo y convenciones para acelerar cambios seguros.

## Propósito
App móvil Android (Qt 6 + Kotlin) para grabar la pantalla del dispositivo, con audio interno (AudioPlaybackCapture) y opción de micrófono. UI en QML6 con dos pestañas: Grabar y Opciones.

## Stack
- C++17/Qt 6.8 (Core, Gui, Quick, Qml, QuickControls2, QuickLayouts)
- QML6 (`qml/Main.qml`) UI
- Kotlin/Android (MediaProjection, VirtualDisplay, MediaCodec, MediaMuxer) en `android/src/.../ScreenRecorder.kt`
- JNI puente C++ ↔ Kotlin (`src/recordercontroller.*`)
- CMake + Gradle/Qt Android deployment
- CI: GitHub Actions (`build-apk.yml`, `build-apk-emulator.yml`, `opencode.yml`)

## Flujo de grabación
1. QML llama `recorder.toggleRecording()`.
2. C++ `RecorderController` invoca `ScreenRecorder.start(activity, path, micEnabled)` por JNI.
3. Si no hay `MediaProjection`, Kotlin lanza `createScreenCaptureIntent()` (diálogo del sistema) y retorna false.
4. Al conceder permiso, `MainActivity.onActivityResult` → `ScreenRecorder.onActivityResult` → `startCapture` inicia captura y notifica a C++ vía `nativeOnRecordingStarted()`.
5. C++ actualiza `recording=true` y estado "Grabando...".
6. Detener: C++ llama `ScreenRecorder.stop()` y actualiza estado.

## Archivos clave
- `main.cpp`, `src/recordercontroller.{h,cpp}`: controlador y JNI.
- `qml/Main.qml`: UI principal (barra inferior Grabar/Opciones, toggle micrófono, versión).
- `android/.../ScreenRecorder.kt`: captura nativa.
- `android/.../MainActivity.kt`: puente de resultados de actividad.
- `android/AndroidManifest.xml`: permisos y actividad principal.
- `CMakeLists.txt`: build Qt/Android.

## Convenciones
- Sin comentarios en código salvo petición.
- Responder en español nativo.
- Delegar dominios a subagentes (cpp/kotlin/qml/devops).
- No commitear secretos.

## Comandos
- Build APK: workflow `Build APK` (Qt 6.8.3, Android arm64-v8a).
- Emulador smoke test: workflow `Build APK + Emulador (Debug)`.

## Permisos Android relevantes
RECORD_AUDIO, FOREGROUND_SERVICE, FOREGROUND_SERVICE_MEDIA_PROJECTION, WRITE_EXTERNAL_STORAGE (maxSdk 28). El diálogo de captura de pantalla es del sistema (MediaProjection).