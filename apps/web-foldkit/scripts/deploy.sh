#!/usr/bin/env bash
# Builds with the production env and publishes to the hazel-app Worker behind app.hazel.sh.
set -euo pipefail
cd "$(dirname "$0")/.."
. scripts/production-env.sh
# Keep the currently deployed Clerk frontend until the new backend routes are live.
# A missing/disabled Hazel backend must never be replaced by a frontend that cannot sign in.
if ! curl --fail --silent --show-error --max-time 15 --request POST \
 --header "Content-Type: application/json" --header "x-effect-auth-csrf: 1" \
 --header "Origin: ${VITE_APP_URL}" --data '{}' "${VITE_BACKEND_URL%/}/auth/getSession" >/dev/null; then
 echo "Hazel auth is unavailable. Deploy the auth-enabled API before publishing Foldkit." >&2
 exit 1
fi
rm -rf dist
bunx vite build
bunx wrangler deploy --message "web-foldkit $(git rev-parse --short HEAD)"
