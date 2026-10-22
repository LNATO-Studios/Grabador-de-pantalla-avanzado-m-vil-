---
name: qml6-mobile-design-best-practices
description: Best practices for designing and implementing QML6 user interfaces for mobile apps: responsive layouts, touch targets, performance, accessibility, theming, and Qt Quick Controls usage.
---

# QML6 Mobile Design Best Practices

## General principles
- Prefer Qt Quick Controls built-ins over custom controls; customize via styling only when needed.
- Keep business logic in C++ (or Kotlin native) and expose to QML through models/properties; QML stays declarative.
- Separate visual `.ui.qml` files from logic `.qml` files when using Qt Design Studio.
- Use declarative property bindings instead of imperative assignments; avoid `eval()` and deleting properties.

## Mobile layout
- Design for multiple screen sizes and densities: use `Layout` attached properties, `anchors`, and `implicitWidth/Height`; never hardcode pixel sizes for touch targets.
- Minimum touch target: 48x48 dp (Material) / 44x44 pt (iOS). Use `Layout.minimumWidth/Height` or `implicitWidth`.
- Respect safe areas: handle notches, status bars, and gesture insets via `SafeArea`/margins and `ApplicationWindow` header/footer.
- Support portrait and landscape: avoid fixed orientations unless required; test rotation; use `SwipeView`/`StackView` with lazy loading.
- Use `ListView`/`GridView` with `delegate` and model; avoid `Repeater` for large datasets; enable `cacheBuffer` carefully.
- Prefer `ColumnLayout`/`RowLayout`/`GridLayout` over nested `anchors` for responsive resizing.

## Performance (mobile)
- Target 60 FPS (~16 ms/frame). Profile with QML Profiler before optimizing.
- Limit `clip`, `opacity`, `layer.enabled`, and `ShaderEffect` usage; they cost GPU.
- Avoid heavy JavaScript in bindings; move computation to C++.
- Load images asynchronously: `Image { asynchronous: true; sourceSize }`; downscale with `sourceSize` to save memory; use `Image.PreserveAspectFit`.
- Use `Loader` with `active`/`sourceComponent` for lazy instantiation; set `asynchronous: true` for off-thread loading.
- Keep delegates lightweight; avoid complex bindings and inline components in hot lists.
- Use Qt Quick Compiler (`.qmlc`/AOT) and static linking where possible; reduce startup time.
- Avoid `clip: true` on scroll containers unless necessary; it breaks batching.

## State and navigation
- Use `StackView` for hierarchical navigation with `push`/`pop`; reuse pages via `Loader`.
- Keep state in models (`ListModel`, C++ `QAbstractListModel`) rather than delegates.
- Use `State`/`Transition` sparingly; prefer property animations with `Behavior`.

## Theming and accessibility
- Support light/dark via `Material.theme`/`Universal.theme` or custom `palette`; react to `Application.styleHints.colorScheme`.
- Provide sufficient contrast (WCAG AA 4.5:1 text). Use `font.pixelSize` scaled by `Screen.devicePixelRatio`? Prefer `sp`-equivalent via `Qt.application.font`.
- Add `Accessible.name`/`description`/`role` to custom controls; ensure keyboard/focus navigation (`focus: true`, `KeyNavigation`).
- Support dynamic font sizes and RTL layouts (`LayoutMirroring`).

## Touch and gestures
- Use `TapHandler`/`DragHandler` instead of `MouseArea` for multi-touch; avoid blocking parent gestures.
- Provide visual feedback (ripple/highlight) for tappable items.
- Handle back button / gesture navigation via `Keys.onBackPressed` or Android back.

## Memory and lifecycle
- Unload off-screen pages; avoid keeping large image caches.
- Disconnect signals/listeners when components destroyed; use `Component.onDestruction`.
- Avoid global singletons holding large data; scope to page.

## Testing
- Use `qmltestrunner`/`Qt Quick Test` for component tests.
- Snapshot test key screens; run on target device/emulator.

## Anti-patterns
- Hardcoding sizes/positions for one device.
- Doing network/IO on UI thread.
- Binding to heavy C++ calls every frame.
- Creating custom controls when built-ins suffice.
