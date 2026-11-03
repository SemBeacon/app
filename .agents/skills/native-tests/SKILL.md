---
name: native-tests
description: Run and write Maestro native UI flows for the SemBeacon app on an Android emulator or iOS simulator. Use for changes to permissions, advertising, foreground service, Capacitor config or native plugins.
---

# Native tests (Maestro)

Flows are YAML in `tests/native` (`scanner.yaml`, `simulator.yaml`, `menu.yaml`, shared steps in
`subflows/`, app id and settings in `config.yaml`). They run against a demo-mode build because
emulators cannot scan for beacons.

## Run
- Android (Linux/macOS, Android SDK + KVM, [Maestro](https://maestro.mobile.dev) installed):
  `yarn build:android:demo && yarn test:native:android`. The script boots a headless emulator
  (`API_LEVEL`, default 35), disables animations, installs the APK and writes screenshots and
  `report.xml` to `resources/screenshots/native/android`.
- iOS (macOS with Xcode only): `yarn test:native:ios`.
- A single flow against an already running device: `maestro test tests/native/scanner.yaml -e OUTPUT=/tmp/out`.

## Write
- Reuse `subflows/launch.yaml` for startup and permission dialogs; add new shared steps as subflows.
- Prefer text or id selectors over coordinates; keep waits explicit (`extendedWaitUntil`) because
  animations are off but BLE and permission dialogs are slow.
- Take screenshots with `takeScreenshot: ${OUTPUT}/<name>` so CI collects them.

## Not covered
Real beacon scanning, advertising reach and notification-stop behavior need a physical device;
the manual checklist is in the README under "Native tests".
