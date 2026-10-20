#!/usr/bin/env bash
# One-time setup. Installs node modules, a JDK, the Android SDK, the emulator
# and a Pixel virtual device — all inside <project>/.tooling.
# Delete the project folder and everything is gone.
set -euo pipefail
source "$(dirname "$0")/env.sh"

if [ "$(uname -s)" != "Darwin" ] || [ "$(uname -m)" != "arm64" ]; then
  echo "This script targets Apple Silicon Macs. Use Expo Go on a phone instead (see README)." >&2
  exit 1
fi

mkdir -p "$TOOLING" "$ANDROID_HOME" "$ANDROID_AVD_HOME"

echo "▸ Installing node modules"
(cd "$SIFLO_ROOT" && npm install --no-audit --no-fund)

if [ ! -x "$JAVA_HOME/bin/java" ]; then
  echo "▸ Downloading JDK 21 (Temurin)"
  tmp="$TOOLING/jdk-download"
  rm -rf "$tmp" && mkdir -p "$tmp"
  curl -fL --progress-bar \
    "https://api.adoptium.net/v3/binary/latest/21/ga/mac/aarch64/jdk/hotspot/normal/eclipse" \
    | tar -xz -C "$tmp"
  rm -rf "$JAVA_HOME"
  mv "$tmp"/*/Contents/Home "$JAVA_HOME"
  rm -rf "$tmp"
fi

if [ ! -x "$ANDROID_HOME/cmdline-tools/latest/bin/sdkmanager" ]; then
  echo "▸ Downloading Android command-line tools"
  zip_name="$(curl -fs https://dl.google.com/android/repository/repository2-3.xml \
    | grep -oE 'commandlinetools-mac-[0-9]+_latest.zip' | sort -t- -k3 -n | tail -1)"
  curl -fL --progress-bar -o "$TOOLING/cmdline-tools.zip" \
    "https://dl.google.com/android/repository/$zip_name"
  rm -rf "$ANDROID_HOME/cmdline-tools"
  mkdir -p "$ANDROID_HOME/cmdline-tools"
  unzip -q "$TOOLING/cmdline-tools.zip" -d "$ANDROID_HOME/cmdline-tools"
  mv "$ANDROID_HOME/cmdline-tools/cmdline-tools" "$ANDROID_HOME/cmdline-tools/latest"
  rm "$TOOLING/cmdline-tools.zip"
fi

echo "▸ Installing emulator + Android 16 Play Store image (a few GB, takes a while)"
yes | sdkmanager --licenses >/dev/null || true
sdkmanager --install "platform-tools" "emulator" "$SIFLO_SYSTEM_IMAGE"

if ! avdmanager list avd -c | grep -qx "$SIFLO_AVD"; then
  echo "▸ Creating virtual device $SIFLO_AVD (Pixel 7, 412dp wide — matches the Figma frames)"
  echo "no" | avdmanager create avd -n "$SIFLO_AVD" -k "$SIFLO_SYSTEM_IMAGE" -d pixel_7
fi

echo "✓ Setup complete. Run: npm run android"
