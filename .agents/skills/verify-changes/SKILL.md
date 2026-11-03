---
name: verify-changes
description: Pick and run the right checks (lint, format, typecheck, unit, e2e, visual, native) for a change in the SemBeacon app. Use before declaring work done or when a CI check fails.
---

# Verify changes

Run the cheapest layer that can catch the problem first, then widen.

1. Always: `yarn lint && yarn format:check && yarn typecheck`. Fix with `yarn format` / `yarn lint:fix`.
   `yarn typecheck:vue` additionally type-checks `.vue` templates.
2. Always: `yarn test` (Vitest + happy-dom, `tests/unit`). One file: `yarn vitest run tests/unit/stores/settings.spec.ts`.
   `yarn test:coverage` enforces the thresholds in `vitest.config.mts`.
3. UI, routing or store changes visible in pages: `yarn test:e2e` (builds the app, runs Pixel 7
   Chromium and iPhone 14 WebKit). WebKit needs system libraries; otherwise use `yarn test:e2e:docker`.
4. Intended visual change: see skill `visual-baselines`.
5. Native code, permissions, advertising or `capacitor.config.ts`: see skill `native-tests`.

## Writing unit tests
- Files: `tests/unit/<same path as src>/<name>.spec.ts`; shared data in `tests/unit/fixtures`.
- `tests/unit/setup.ts` provides a fresh Pinia, cleared localStorage (Capacitor Preferences) and fake IndexedDB per test.
- Services are plain classes and need no Vue.
- Property-based tests use `fast-check`.

## Reporting
State which layers ran and which did not (e.g. native tests need an emulator). Do not claim
device behavior verified from emulator or web runs: emulators cannot scan real beacons.
