#!/usr/bin/env bash
# Run the Maestro flows (tests/native) on a headless Android emulator.
# Needs the Android SDK (sdkmanager, avdmanager), KVM and Maestro
# (https://maestro.mobile.dev). Expects a demo build first: yarn build:android:demo
set -euo pipefail

API_LEVEL="${API_LEVEL:-35}"
IMAGE="system-images;android-${API_LEVEL};google_apis;x86_64"
APK="${APK:-android/app/build/outputs/apk/debug/app-debug.apk}"
OUTPUT="${OUTPUT:-resources/screenshots/native/android}"

if ! command -v maestro > /dev/null; then
    echo "Maestro is not installed, see https://maestro.mobile.dev" >&2
    exit 1
fi

yes | sdkmanager --licenses > /dev/null || true
sdkmanager --install emulator platform-tools "$IMAGE" > /dev/null
echo no | avdmanager create avd --force --name e2e --package "$IMAGE" --device pixel_7 > /dev/null

emulator -avd e2e -no-window -no-audio -no-boot-anim -no-snapshot -gpu swiftshader_indirect \
    > /tmp/emulator.log 2>&1 &
adb wait-for-device
until [ "$(adb shell getprop sys.boot_completed 2> /dev/null | tr -d '\r')" = "1" ]; do sleep 2; done
for setting in window_animation_scale transition_animation_scale animator_duration_scale; do
    adb shell settings put global "$setting" 0
done

adb install -r "$APK"
mkdir -p "$OUTPUT"
set +e
maestro test tests/native --test-output-dir "$OUTPUT/maestro" --format junit --output "$OUTPUT/report.xml"
STATUS=$?
set -e
# Collect the flows' screenshots (Maestro stores them per flow)
find "$OUTPUT/maestro" -path "*takeScreenshot*" -name "*.png" -exec cp {} "$OUTPUT/" \;
# Collect the flows' screen recordings (startRecording/stopRecording in the flows)
find "$OUTPUT/maestro" -path "*startRecording*" -name "*.mp4" -exec cp {} "$OUTPUT/" \;
exit "$STATUS"
