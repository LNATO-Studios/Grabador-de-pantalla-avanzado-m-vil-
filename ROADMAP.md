# Roadmap — Grabador de pantalla avanzado

## v1.0 (actual)
- [x] Captura de pantalla con MediaProjection
- [x] Audio interno (AudioPlaybackCapture)
- [x] UI QML con botón de grabación
- [x] Toggle de micrófono
- [x] Barra inferior (Grabar / Opciones) y versión
- [x] Diálogo de permiso de captura al grabar
- [x] CI: build APK + smoke test emulador (x86_64)

## v1.1
- [ ] Foreground service para grabaciones largas (Android 14+)
- [ ] Notificación de grabación en curso con botón detener
- [ ] Selección de resolución/bitrate/FPS
- [ ] Guardado en MediaStore (galería) en lugar de ruta directa

## v1.2
- [ ] Edición básica (recorte) y compartir
- [ ] Soporte de orientación landscape
- [ ] Temas claro/oscuro

## Calidad/CI
- [ ] Pruebas unitarias de RecorderController
- [ ] Validación de APK en emulador automática (interacción UI)
- [ ] Firma de release y publicación de artefactos

## Deuda técnica
- Sincronización C++↔Kotlin basada en callback JNI (mejorar con señales Qt).
- Manejo de errores de codec/muxer y limpieza parcial.