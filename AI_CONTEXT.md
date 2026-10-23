# AI Context — Grabador de pantalla avanzado

Contexto compacto para modelos de IA que editan este repositorio.

## Estado actual
- App Qt/QML para Android con captura de pantalla vía MediaProjection.
- UI con barra inferior: pestañas "Grabar" y "Opciones".
- Toggle de micrófono (audio interno) y versión en Opciones.
- Permiso de captura: diálogo del sistema se muestra al presionar "grabar" (MediaProjectionManager.createScreenCaptureIntent). Resultado manejado por MainActivity → ScreenRecorder.

## Invariantes
- `RecorderController` es singleton lógico (`s_instance`) para callback JNI.
- `ScreenRecorder` es `object` (singleton) en Kotlin.
- `mediaProjection` se retiene para reutilización; `stop()` la libera.
- `m_recording` en C++ se sincroniza con Kotlin vía `nativeOnRecordingStarted()`.

## Restricciones
- No modificar lógica de captura (codecs/muxer) sin pruebas en dispositivo.
- Mantener firmas JNI: `start(Activity,String,boolean)`, `stop()`.
- Manifest debe declarar `MainActivity` como actividad principal para onActivityResult.
- Android 10+ (API 29+) para AudioPlaybackCapture.

## Convenciones de respuesta
- Español nativo, conciso.
- Delegar a subagentes por dominio.
- Ejecutar lint/typecheck si existen (aquí: validar workflows con `python scripts/automation/validate_workflows.py`).

## Riesgos conocidos
- Emulador CI requiere imagen x86_64 (no x86).
- Callback JNI puede no estar disponible en host (try/catch UnsatisfiedLinkError).