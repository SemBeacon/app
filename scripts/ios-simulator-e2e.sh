#!/usr/bin/env bash
# Build the iOS app for the simulator (demo mode) and run the Maestro flows (tests/native).
# Requires macOS with Xcode, CocoaPods and Maestro.
set -euo pipefail

OUTPUT="${OUTPUT:-resources/screenshots/native/ios}"
DERIVED_DATA="${DERIVED_DATA:-ios/build}"

# First available iPhone simulator, unless one is given
DEVICE_ID="${DEVICE_ID:-$(xcrun simctl list devices available -j |
    python3 -c 'import json,sys; d=json.load(sys.stdin)["devices"]; print(next(x["udid"] for r in d.values() for x in r if x["name"].startswith("iPhone")))')}"

VITE_DEMO_MODE=true npm run build
npx cap sync ios

xcodebuild \
    -workspace ios/App/App.xcworkspace \
    -scheme App \
    -configuration Debug \
    -sdk iphonesimulator \
    -destination "id=$DEVICE_ID" \
    -derivedDataPath "$DERIVED_DATA" \
    CODE_SIGNING_ALLOWED=NO \
    build

xcrun simctl boot "$DEVICE_ID" || true
xcrun simctl bootstatus "$DEVICE_ID" -b
xcrun simctl install "$DEVICE_ID" "$DERIVED_DATA/Build/Products/Debug-iphonesimulator/App.app"

mkdir -p "$OUTPUT"
maestro --device "$DEVICE_ID" test tests/native --test-output-dir "$OUTPUT/maestro" --format junit --output "$OUTPUT/report.xml"
# Collect the flows' screenshots (Maestro stores them per flow)
find "$OUTPUT/maestro" -path "*takeScreenshot*" -name "*.png" -exec cp {} "$OUTPUT/" \;
