---
name: kotlin-logic-best-practices
description: Best practices for Kotlin logic in mobile apps: null safety, coroutines, architecture, Android/NDK interop, security, testing, and performance.
---

# Kotlin Logic Best Practices

## Language and style
- Prefer immutable `val` over `var`; use `data class` for value objects but avoid exposing data classes in public library APIs (binary compat).
- Leverage null safety: annotate Java interop with `@Nullable`/`@NonNull`; avoid platform types (`!`).
- Use extension functions and scope functions (`let`, `apply`, `also`) judiciously; avoid deep nesting.
- Prefer sealed classes/interfaces for state machines and exhaustive `when`.
- Use `value class` for type-safe wrappers around primitives.

## Coroutines and concurrency
- Use structured concurrency: `viewModelScope`/`lifecycleScope`; never `GlobalScope`.
- Inject dispatchers (`Dispatchers.IO`, `Default`) for testability; do not hardcode in classes.
- Prefer `Flow`/`StateFlow`/`SharedFlow` for observable state; expose immutable types.
- Use `suspend` functions for one-shot async work; cancellation-aware loops.
- Handle exceptions with `CoroutineExceptionHandler` or `runCatching`; avoid swallowing.
- All TestDispatchers should share the same scheduler in tests.

## Architecture
- Separate UI, domain, data layers; ViewModel exposes UI state (data classes), not raw models.
- Repository pattern with single source of truth; cache with Room/DataStore.
- Use dependency injection (Hilt/Koin) for testability.
- Avoid business logic in Activities/Fragments/Composables.

## Android specifics
- Use KTX extensions; prefer `Lifecycle`-aware components.
- Persist with DataStore (preferences/proto) over SharedPreferences.
- Handle configuration changes via ViewModel; avoid leaking Context.
- Use WorkManager for deferrable background work; foreground services only when needed.
- Permissions: request at runtime, handle denial gracefully; follow least privilege.

## Native/NDK and Qt interop
- Keep JNI boundaries thin; marshal data explicitly; validate inputs.
- Use `@JvmStatic`/`@JvmName` for Java-friendly APIs; avoid exposing Kotlin-specific types to Java callers.
- Manage native memory carefully; release references in `finalize`/`AutoCloseable`.
- Thread safety: native callbacks may arrive on non-main threads; dispatch to main via `Handler`/coroutines.

## Security
- Never log secrets/tokens; use Android Keystore for keys.
- Validate and sanitize all external input; avoid SQL/command injection.
- Use HTTPS with certificate pinning where appropriate; avoid cleartext traffic.
- Minimize permissions; avoid exported components unless needed; protect with permissions.
- Store sensitive data encrypted (EncryptedSharedPreferences/Tink).

## Performance
- Avoid allocations in hot paths; use `Sequence`/`Flow` for large collections.
- Use `inline`/`reified` appropriately; measure before micro-optimizing.
- Profile with Android Studio Profiler; fix leaks via LeakCanary.

## Testing
- Unit test with JUnit + MockK/Fake; coroutine tests with `runTest`.
- Instrumented tests for DB/Context; use Robolectric where appropriate.
- Test nullability contracts and error paths.

## Anti-patterns
- `!!` (force unwrap) in production code.
- Blocking main thread (network/disk).
- Catching `Throwable` broadly.
- Leaking Activity/Context references.
