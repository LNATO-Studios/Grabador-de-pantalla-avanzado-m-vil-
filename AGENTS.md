# AGENTS.md

Instrucciones para el agente primario (build) y subagentes del repositorio.

## Contexto del proyecto
App móvil (Qt/C++ + Kotlin en Android). Código en `src/`, `qml/`, `android/`, `CMakeLists.txt`. No copies código de terceros; implementa con paridad funcional. Responde siempre en español nativo.

## Subagentes disponibles
Delega el trabajo especializado en lugar de hacerlo directamente. Usa el Task tool con `subagent_type` o mención `@nombre`.

| Subagente | Cuándo usarlo |
|---|---|
| `kotlin-logic-expert` | Lógica Kotlin, coroutines, arquitectura, JNI/interop, seguridad Android |
| `kotlin-vuln-scanner` | Auditoría de seguridad (solo lectura) en Kotlin |
| `cpp-logic-expert` | Backends C++/Qt, rendimiento, memoria, concurrencia, build |
| `cpp-vuln-scanner` | Auditoría de seguridad (solo lectura) en C++ |
| `qml6-ui-designer` | Diseño y layouts QML6, componentes, accesibilidad |
| `qml6-vuln-scanner` | Auditoría de seguridad (solo lectura) en QML6 |
| `devops-engineer` | CI/CD, workflows GitHub Actions, scripts, automatizaciones |
| `vision-describer` | Descripción detallada de imágenes/capturas con coordenadas (fallback visión, modelo nemotron-3.5-super-vl-free) |
| `mobile-qa-tester` | Pruebas de la app en emulador/dispositivo vía tool `phone` y análisis visual |

## Reglas de delegación
- Si la tarea toca Kotlin, delega a `kotlin-logic-expert`; si es C++, a `cpp-logic-expert`; si es QML/UI, a `qml6-ui-designer`; si es CI/CD, a `devops-engineer`.
- Para revisiones de seguridad o antes de merge, invoca el `*-vuln-scanner` correspondiente (solo lectura).
- Para tareas multi-dominio, delega en paralelo a varios subagentes.
- No implementes directamente código de un dominio si existe subagente especializado.
- Los subagentes cargan su skill antes de implementar (`cpp-pro`, `kotlin-specialist`, `qt-ui-design`, `devops-engineer`).
- En GitHub Actions/CI aplica las mismas reglas de delegación.

## Permisos
`permission.task` permite invocar todos los subagentes (`"*": "allow"`). Los usuarios también pueden invocarlos manualmente con `@nombre`.
