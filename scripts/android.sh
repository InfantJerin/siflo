#!/usr/bin/env bash
# Boots the project's emulator (if needed) and opens the app in Expo Go.
set -euo pipefail
source "$(dirname "$0")/env.sh"

if ! command -v emulator >/dev/null; then
  echo "Android tooling not found. Run ./scripts/setup.sh first." >&2
  exit 1
fi

if ! adb devices | grep -q "emulator-"; then
  echo "▸ Starting emulator $SIFLO_AVD"
  nohup emulator -avd "$SIFLO_AVD" -no-snapshot-save -no-boot-anim >"$TOOLING/emulator.log" 2>&1 &
  adb wait-for-device
  until [ "$(adb shell getprop sys.boot_completed 2>/dev/null | tr -d '\r')" = "1" ]; do sleep 2; done
  echo "✓ Emulator ready"
fi

# On-screen Back / Home / Recents buttons — swipe gestures are awkward with a mouse.
adb shell cmd overlay enable-exclusive --category com.android.internal.systemui.navbar.threebutton >/dev/null 2>&1 || true

cd "$SIFLO_ROOT"
exec npx expo start --android "$@"
