#!/bin/bash
set -e
set -u

if [[ ! -e ".env.secret" ]]; then
    touch .env.secret
fi

if ! grep -q '^BASE2048_PASSPHRASE=' .env.secret; then
    echo "BASE2048_PASSPHRASE=\"$(node ./bin/mnemonic.js)\"" >> .env.secret
    echo "Created new mnemonic (wallet) in .env.secret"
else
    echo "BASE2048_PASSPHRASE is already defined in .env.secret"
fi
