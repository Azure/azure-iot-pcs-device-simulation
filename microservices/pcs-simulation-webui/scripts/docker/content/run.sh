#!/usr/bin/env bash
# Copyright (c) Microsoft. All rights reserved.
# Note: Windows Bash doesn't support shebang extra params
set -ex

# serve the app via nginx
mkdir -p /app/logs
nginx -g 'daemon off;' -c /app/nginx.conf
