#!/bin/bash
# Copyright 2013 The Chromium Authors. All rights reserved.
# Use of this source code is governed by a BSD-style license that can be
# found in the LICENSE file.

set -e

DIR="$( cd "$( dirname "$0" )" && pwd )"
if [ "$(uname -s)" = "Darwin" ]; then
  if [ "$(whoami)" = "root" ]; then
    TARGET_DIR="/Library/Google/Chrome/NativeMessagingHosts"
  else
    TARGET_DIR="$HOME/Library/Application Support/Google/Chrome/NativeMessagingHosts"
  fi
else
  if [ "$(whoami)" = "root" ]; then
    TARGET_DIR="/etc/opt/chrome/native-messaging-hosts"
  else
    TARGET_DIR="$HOME/.config/google-chrome/NativeMessagingHosts"
  fi
fi

HOST_NAME=com.google.chrome.example.echo

# Create directory to store native messaging host.
mkdir -p "$TARGET_DIR"

# Copy native messaging host manifest.
cp "$DIR/$HOST_NAME.json" "$TARGET_DIR"

# Update host path in the manifest.
HOST_PATH=$DIR/native-messaging-example-host
ESCAPED_HOST_PATH=${HOST_PATH////\\/} # not sure howt his escape works
sed -i -e "s/HOST_PATH/$ESCAPED_HOST_PATH/" "$TARGET_DIR/$HOST_NAME.json"

# Set permissions for the manifest so that all users can read it.
chmod o+r "$TARGET_DIR/$HOST_NAME.json"

echo "Native messaging host $HOST_NAME has been installed."

# Install Axel

PKGMANAGER=undefined

case "$(uname -s)" in
   Darwin)
    echo 'OS X DETECTED'
    PKGMANAGER=brew
    command -v axel || $PKGMANAGER update
    ;;
   Linux)
    echo 'Linux DETECTED'
    PKGMANAGER="sudo apt-get -yf"
    command -v axel || sudo apt-get update
    ;;
   CYGWIN*|MINGW32*|MSYS*)
    echo 'MS Windows DETECTED'
    ;;
   *)
    echo 'other OS DETECTED' 
    ;;
esac

# Dependency install
command -v axel >/dev/null || { echo 'INSTALLING AXEL...'; $PKGMANAGER install axel; }
