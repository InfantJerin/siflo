#!/usr/bin/env bash
# Keeps every tool, cache and emulator file inside <project>/.tooling.
# Source this file; do not execute it.

SIFLO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]:-$0}")/.." && pwd)"
TOOLING="$SIFLO_ROOT/.tooling"

export SIFLO_ROOT TOOLING
export JAVA_HOME="$TOOLING/jdk"
export ANDROID_HOME="$TOOLING/android-sdk"
export ANDROID_SDK_ROOT="$ANDROID_HOME"
export ANDROID_USER_HOME="$TOOLING/android-user"
export ANDROID_EMULATOR_HOME="$ANDROID_USER_HOME"
export ANDROID_AVD_HOME="$ANDROID_USER_HOME/avd"
export npm_config_cache="$TOOLING/npm-cache"
export __UNSAFE_EXPO_HOME_DIRECTORY="$TOOLING/expo-home"
export EXPO_NO_TELEMETRY=1

export PATH="$JAVA_HOME/bin:$ANDROID_HOME/cmdline-tools/latest/bin:$ANDROID_HOME/platform-tools:$ANDROID_HOME/emulator:$PATH"

SIFLO_AVD="siflo-pixel"
SIFLO_SYSTEM_IMAGE="system-images;android-36;google_apis_playstore;arm64-v8a"
