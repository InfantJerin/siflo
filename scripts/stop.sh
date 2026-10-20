#!/usr/bin/env bash
# Shuts down the emulator and the adb server started by this project.
source "$(dirname "$0")/env.sh"
adb emu kill 2>/dev/null || true
adb kill-server 2>/dev/null || true
echo "✓ Emulator stopped"
