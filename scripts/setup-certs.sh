#!/bin/bash
# Setup local TLS certificates for development
# Required for Caddy reverse proxy (Docker)

set -e

CERTS_DIR="$(dirname "$0")/../certs"

# Check if certs already exist
if [ -f "$CERTS_DIR/localhost.pem" ] && [ -f "$CERTS_DIR/localhost-key.pem" ]; then
    echo "Certificates already exist in $CERTS_DIR"
    exit 0
fi

# Check if mkcert is installed
if ! command -v mkcert &> /dev/null; then
    echo "mkcert is not installed. Please install it first:"
    echo ""
    echo "  macOS:   brew install mkcert"
    echo "  Linux:   https://github.com/FiloSottile/mkcert#installation"
    echo "  Windows: choco install mkcert"
    echo ""
    exit 1
fi

# Create certs directory
mkdir -p "$CERTS_DIR"

# Install the local CA if not already done
echo "Installing local CA (you may be prompted for your password)..."
mkcert -install

# Generate certificates
echo "Generating localhost certificates..."
cd "$CERTS_DIR"
mkcert localhost

echo ""
echo "Certificates created successfully!"

# Restart Caddy if it's running (or was failing to start)
if docker compose ps caddy &> /dev/null; then
    echo "Restarting Caddy to pick up new certificates..."
    docker compose restart caddy
fi

echo "You can now start Docker services with: docker compose up -d"
