---
name: cpp-best-practices
description: Best practices for modern C++: RAII, ownership, safety, performance, concurrency, build, testing, and secure coding.
---

# C++ Best Practices

## Language and style
- Target a modern standard (C++17/20/23) consistently; document minimum compiler support.
- Use `const` correctness; prefer `constexpr`/`consteval` for compile-time computation.
- Use `auto` when type is obvious from context; avoid for public API types.
- Prefer `enum class` over unscoped enums; strong types over bare ints/bools.
- Use `std::optional`/`std::expected` (C++23) for fallible operations instead of sentinels.
- Prefer standard library algorithms over hand-written loops.

## Ownership and memory
- Encode ownership in type system: `std::unique_ptr` for single owner, `std::shared_ptr` only for true shared ownership, `std::weak_ptr` to break cycles.
- RAII for all resources (files, sockets, locks, GPU handles); destructors `noexcept`.
- Avoid raw `new`/`delete`; use `std::make_unique`/`make_shared`.
- No dangling pointers/references; validate lifetimes at boundaries.
- Moved-from objects must remain valid/assignable.

## Safety
- Avoid undefined behavior: no out-of-bounds, no signed overflow, no use-after-free, no strict-aliasing violations.
- Prefer `std::span`, `std::array`, `.at()` over raw pointers/unchecked indexing when bounds matter.
- Avoid C-style casts; use `static_cast`/`reinterpret_cast` deliberately.
- Initialize all variables; beware uninitialized reads.
- Use sanitizers in CI: ASan, UBSan, TSan; MSan where feasible.

## Performance
- Avoid unnecessary copies; use move semantics and `std::string_view`/`span` for read-only views.
- Reserve vector capacity; prefer `emplace_back`.
- Profile before optimizing; use hardware counters; benchmark with Google Benchmark.
- Be mindful of cache locality; avoid false sharing in concurrency.
- Use `noexcept` on move ops and destructors to enable optimizations.

## Concurrency
- Prefer higher-level primitives (`std::jthread`, `std::mutex`, `std::condition_variable`, atomics) over raw threads.
- Avoid data races; document thread-safety contracts.
- Use thread pools/executors; avoid unbounded thread creation.
- `const` methods should be thread-safe.

## Build and tooling
- Use CMake with reproducible builds; pin toolchain; enable warnings as errors (`-Wall -Wextra -Wpedantic -Werror`).
- Use clang-format and clang-tidy; integrate in CI.
- Manage dependencies via vcpkg/Conan; lock versions.
- Enable LTO and appropriate optimization levels per config.

## Testing
- Unit test with GoogleTest/Catch2; property-based testing where useful.
- Test edge cases, error paths, and concurrency.
- Run sanitizers in test builds.

## Security (native)
- Prevent buffer overflows, format string bugs, integer overflows/truncation.
- Avoid `system()`/`popen()` with untrusted input; use exec with argument arrays.
- Validate inputs at trust boundaries; least privilege.
- Keep secrets out of binaries; no hardcoded credentials.
- Keep dependencies updated; scan with SAST/DAST.

## Qt/C++ interop (if applicable)
- Use signals/slots with queued connections across threads; avoid blocking UI thread.
- Keep QML-facing APIs minimal and documented; use `Q_PROPERTY` with notify.
- Prefer `QAbstractListModel` for lists exposed to QML.

## Anti-patterns
- Manual memory management with raw pointers.
- `using namespace std;` in headers.
- Global mutable state.
- Ignoring compiler warnings.
