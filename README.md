<div style="margin-left: auto; margin-right: auto; width: 80%">
    <img src="https://sembeacon.org/images/logo.svg" width="100%">
</div>

## Description
The SemBeacon application showcases the capabilities of the SemBeacon platform. It provides a comprehensive example of how to integrate and utilize SemBeacon's features for real-time location tracking and data analysis. This application is designed to help developers understand the potential of SemBeacon and how it can be applied to various use cases.

## Development
```bash
cp .env.example .env   # set VITE_MAPBOX_TOKEN (maps and geocoding)
yarn install           # also copies the OpenHPS browser bundles to public/js/vendor
yarn dev               # https://localhost:8085
```

CI builds get the Mapbox token from the `MAPBOX_TOKEN` repository secret.

Browsers cannot scan for or advertise Bluetooth beacons, so the scanner and simulator show
"not supported" on the web. To see the app with data, run `SemBeacon.demo()` in the browser
console, or build with `VITE_DEMO_MODE=true`. Optional service overrides are listed in
[`.env.example`](./.env.example).

Play Integrity is optional. Set `VITE_PLAY_INTEGRITY_CLOUD_PROJECT` to the Google Cloud
project number linked to the Play Console app (CI: the `PLAY_INTEGRITY_CLOUD_PROJECT`
secret). Without it — on the web, in emulators, in sideloaded builds and during a Google
outage — shortener requests use the anonymous tier; the app never blocks on integrity.

Demo mode includes a local SemBeacon 1.1 IoT device with an observable property and a local
actuation demo (`src/demo/fixtures/iot.ttl`). The OpenHPS building example is loaded from the
website as usual; without internet, the scanner keeps the detected SemBeacon visible and shows
a clear offline error with a retry.

### Android device over Wi-Fi
Enable **Developer options > Wireless debugging** on the phone and pair it once:

```bash
adb pair <phone-ip>:<pairing-port>     # enter the pairing code shown on the phone
adb connect <phone-ip>:<connect-port>  # port shown on the Wireless debugging screen
adb devices                            # the phone should be listed
```

Open `chrome://inspect/#devices` in Chrome to debug the WebView of a debug build: console,
network, sources and breakpoints. `adb logcat -s Capacitor:V` shows the WebView console and the
native logs (needed for Bluetooth and foreground-service problems). On Android 10 and older,
connect the phone over USB once, run `adb tcpip 5555`, then `adb connect <phone-ip>:5555`.

#### Install an APK
```bash
yarn build:android:debug               # android/app/build/outputs/apk/debug/app-debug.apk
adb install -r android/app/build/outputs/apk/debug/app-debug.apk
adb install -r android/app/build/outputs/apk/release/app-release-signed.apk   # CI release APK
```

Without adb, move the APK to the phone and open it: `adb push app-debug.apk /sdcard/Download/`,
or serve it from the host with `python3 -m http.server 9000` and open
`http://<host-ip>:9000/app-debug.apk` on the phone. Allow installing unknown apps when asked.
A release APK signed with the upload key does not replace a Play Store install (different
signature): uninstall the Play version first.

#### Devcontainer
The devcontainer uses the adb server on the host. Start `adb -a nodaemon server start` on the
host; the container reaches it through `host.docker.internal` (`ADB_SERVER_SOCKET`). For live
reload, `yarn dev` already listens on `0.0.0.0:8085`, so run:

```bash
npx cap run android --live-reload --host localhost --port 8085 --https --forwardPorts 8085:8085
```

The dev server uses a self-signed certificate that the WebView may reject; when it does, install
a debug build instead and reload it manually.

### Code structure
Dependencies point one way: views and components use stores, stores use services, and
services and utilities never import stores, Vue or Ionic (enforced by `yarn lint`).

| Where | What |
|---|---|
| `src/views`, `src/components` | Ionic pages and components |
| `src/stores` | Pinia stores: UI state and orchestration, persistence via Capacitor Preferences |
| `src/services` | Framework-free logic: Bluetooth scanning pipeline (`BeaconScanner`), SemBeacon service and URL shortener |
| `src/platform` | Small wrappers for platform differences (status bar) |
| `src/demo` | Demo beacons and demo mode (`window.SemBeacon` debug API) |
| `src/config.ts` | External endpoints and keys (overridable with `VITE_*`) |
| `src/workers` | Web Worker that classifies beacons and resolves SemBeacons off the UI thread |

## Testing
| Command | What it checks | Where it runs |
|---|---|---|
| `yarn lint`, `yarn format:check`, `yarn typecheck` | ESLint (incl. layering), Prettier, TypeScript | anywhere |
| `yarn test` / `yarn test:coverage` | Unit and component tests (Vitest, happy-dom) in `tests/unit` | anywhere |
| `yarn test:e2e` | End-to-end tests in `tests/e2e/specs` on Pixel 7 (Chromium) and iPhone 14 (WebKit), against the production build | host (WebKit needs its system libraries) or `yarn test:e2e:docker` |
| `yarn test:visual` | Screenshot comparison of the main pages, light and dark | Docker only (`mcr.microsoft.com/playwright`, same as CI) |
| `yarn screenshots` | App Store / Play Store screenshots in `resources/screenshots` | anywhere; Docker for consistent fonts |
| `yarn test:native:android` / `yarn test:native:ios` | Maestro flows in `tests/native` on an emulator / simulator | Android SDK + KVM / macOS with Xcode, plus [Maestro](https://maestro.mobile.dev) |

The e2e tests never use the network: the URL shortener, CORS proxy and resolved RDF documents
are served from `tests/e2e/fixtures/http` (the Solid profile there is synthetic). Demo mode
provides the beacons.

### Visual baselines
Fonts differ between machines, so baselines in `tests/e2e/visual/__screenshots__` are only
valid when made in the Playwright Docker image. After an intended UI change:

```bash
yarn test:visual:update   # rewrites all baselines; review the PNG diff before committing
```

Relative times ("5s ago") are masked, and the beacon list is sorted by RSSI (ties sorted by
UID), so the screenshots do not depend on timing.

### Store screenshots
`yarn screenshots` captures scanner, SemBeacon details, simulator (Android only) and menu at
the store sizes (phone, 7" and 10" tablet, iPhone 6.9" and 6.5", iPad 13") in light and dark
mode. The web build cannot show native-only UI (permission dialogs, the status bar, iOS without
simulator): those come from the Maestro flows, which save screenshots to
`resources/screenshots/native`. CI produces both as artifacts (workflow `Checks` with
*screenshots*, workflow `Native UI tests`).

### Native tests
```bash
yarn build:android:demo        # demo-mode debug APK
yarn test:native:android       # starts an emulator, installs the APK, runs tests/native
yarn test:native:ios           # macOS: simulator build in demo mode + Maestro
```

Emulators and simulators cannot scan for real beacons. Before a release, check on a device:
- the scanner finds a beacon (a second phone can advertise one with the simulator)
- the simulator advertises, and *Stop broadcasting* in the notification stops it
- a detected SemBeacon resolves and shows its building on the map
- after leaving and reopening the app, detected beacons are still listed

### Troubleshooting

#### Ionic can not find my Android device
First verify that adb can find the device using `adb devices`. The command `npx native-run android --list --verbose` can provide more insights into connection errors.

## Production
1. Set the `SIGNING_STORE_PASSWORD`, `SIGNING_KEY_ALIAS`, and `SIGNING_KEY_PASSWORD` environment variables.
2. `npx cap build android --androidreleasetype APK --keystorepath keystore/sembeacon.jks --keystorepass $SIGNING_STORE_PASSWORD --keystorealias $SIGNING_KEY_ALIAS --keystorealiaspass $SIGNING_KEY_PASSWORD` (change with AAB for Google Play Store)
3. `adb install -r android/app/build/outputs/apk/release/app-release-signed.apk`

## Contributing
We welcome contributions to improve the SemBeacon application. Please refer to the [Contributing Guide](./CONTRIBUTING.md) for more details.

## License
This project is licensed under the Apache 2.0 License. See the [LICENSE](./LICENSE) file for more information.
