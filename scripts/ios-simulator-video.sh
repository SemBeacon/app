#!/usr/bin/env bash
# Records the real iOS Simulator (iPhone and iPad) while a Maestro walkthrough drives the demo app,
# then composes resources/video/sembeacon-ios-announcement.mp4. Requires macOS with Xcode,
# CocoaPods, Maestro, ffmpeg (libx264), numpy and Playwright's chromium (`npx playwright install chromium`).
set -euo pipefail

RAW="${RAW:-resources/video/raw}"
DERIVED_DATA="${DERIVED_DATA:-ios/build}"
LOGS="${LOGS:-resources/video/logs}"
mkdir -p "$RAW" "$LOGS"

# Newest simulator whose name matches a pattern, e.g. 'iPhone 1[5-9] Pro$' (falls back to any $2)
pick() {
    xcrun simctl list devices available -j | python3 -c '
import json, re, sys
pattern, fallback = sys.argv[1], sys.argv[2]
devices = [(rt, d) for rt, ds in json.load(sys.stdin)["devices"].items() for d in ds]
for pat in (pattern, fallback):
    hits = sorted((x for x in devices if re.search(pat, x[1]["name"])), key=lambda x: (x[0], x[1]["name"]))
    if hits:
        print(hits[-1][1]["udid"]); break
' "$1" "$2"
}
IPHONE_ID="${IPHONE_ID:-$(pick '^iPhone 1[5-9] Pro$' '^iPhone')}"
IPAD_ID="${IPAD_ID:-$(pick '^iPad Pro 13-inch' '^iPad')}"

VITE_DEMO_MODE=true npm run build
rm -f ios/App/Podfile.lock # stale pins, see scripts/ios-simulator-e2e.sh
npx cap sync ios
xcodebuild -workspace ios/App/App.xcworkspace -scheme SemBeacon -configuration Debug \
    -sdk iphonesimulator -destination 'generic/platform=iOS Simulator' \
    -derivedDataPath "$DERIVED_DATA" CODE_SIGNING_ALLOWED=NO build
APP="$DERIVED_DATA/Build/Products/Debug-iphonesimulator/SemBeacon.app"

record() { # <name> <udid>
    local name="$1" id="$2"
    echo "== $name ($id)"
    xcrun simctl boot "$id" || true
    xcrun simctl bootstatus "$id" -b
    # Clean, App Store style status bar: 9:41, full signal, full battery
    xcrun simctl status_bar "$id" override --time 9:41 --dataNetwork wifi --wifiMode active --wifiBars 3 \
        --cellularMode active --cellularBars 4 --batteryState charged --batteryLevel 100
    xcrun simctl install "$id" "$APP"
    xcrun simctl launch "$id" org.sembeacon >/dev/null || true

    # The app must load (BEACON_08 listed), otherwise the job fails here
    maestro --device "$id" test tests/native/video/warmup.yaml --test-output-dir "$LOGS/$name-warmup"
    xcrun simctl io "$id" screenshot "$LOGS/$name-loaded.png"

    xcrun simctl io "$id" recordVideo --codec h264 --force "$RAW/$name.mp4" &
    local pid=$!
    sleep 2
    set +e
    maestro --device "$id" test tests/native/video/showcase.yaml --test-output-dir "$LOGS/$name-showcase"
    local status=$?
    set -e
    sleep 1
    kill -INT "$pid" 2>/dev/null || true
    wait "$pid" 2>/dev/null || true
    xcrun simctl shutdown "$id" || true
    return $status
}

record iphone "$IPHONE_ID"
record ipad "$IPAD_ID"

python3 scripts/video/score.py resources/video/work/score.wav 2>/dev/null || {
    mkdir -p resources/video/work && python3 scripts/video/score.py resources/video/work/score.wav
}
node scripts/video/build.mjs
