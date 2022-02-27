#!/bin/bash
set -e
set -u

if [[ ! -e .env ]]; then
    touch .env
fi
if ! grep -q '^XPUB_KEY=' .env; then
    echo "XPUB_KEY=$(node ./bin/xpubkey.js)" >> .env
    echo "Saved Extended Public Key to .env (keep it secret for anonymity)"
else
    echo "XPUB_KEY is already defined in .env"
fi
