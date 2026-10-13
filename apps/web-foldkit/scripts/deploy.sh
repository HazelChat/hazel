#!/usr/bin/env bash
# Builds with the production env and publishes to the hazel-app Worker behind app.hazel.sh.
set -euo pipefail
cd "$(dirname "$0")/.."
. scripts/production-env.sh
rm -rf dist
bunx vite build
bunx wrangler deploy --message "web-foldkit $(git rev-parse --short HEAD)"
