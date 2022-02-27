# Merchant Wallet

> HD Wallet + QR Code Generator

Generate secure (unique) per-customer Payment Addresses (PubKeyHash) and QR
Codes for receiving payments via Digital Cash (Dash, or similar).

<img width="365" alt="dash://XcsLKywcU85QginxhJNYibJc3j4Aawa41Q?amount=0.1" src="https://user-images.githubusercontent.com/122831/155840879-a2b26db2-aa05-4c33-ab91-3496a34155de.png">

```txt
    ====== [DASH] (Derived) Public Key Hash ======

       DASH: XcsLKywcU85QginxhJNYibJc3j4Aawa41Q
```

Use this library and included tools to generate a private key, and an "extended"
public key, which will allow you to create payment addresses on your server
without storing your private key on your server.

# Watch the Video

<https://youtu.be/Q01nLQ74xUI>

## Features

- QuickStart
  - [x] Get a Wallet and "Extended" Public Key
  - [x] Generate Payment QR Codes
  - [x] Generate WIFs & QR Codes \
         (for importing private keys)
- Config
  - [x] Generate Passphrase
  - [x] Generate XPub Key
- Tools for Exploring & Debugging
  - [x] Payment Addresses via Private Key & XPub Key
  - [x] QR Codes for Payment Addresses
  - [x] QR Codes (WIF) for Payment import

## Usage & QuickStart

```bash
npm install --save @root/merchant-wallet
```

### Create XPub Key

```js
"use strict";

require("dotenv").config({ path: ".env" });
require("dotenv").config({ path: ".env.secret" });

let Coins = require("@root/merchant-wallet/lib/coins.json");
let Wallet = require("@root/merchant-wallet").Wallet;

let wallet = Wallet.create(Coins.dash);

// The mnemonic *is* the wallet, more or less
// (it can be used by any wallet app)
let mnemonic = process.env.BASE2048_PASSPHRASE;

let xpubkey = await wallet.xpubKeyFromMnemonic(mnemonic);
```

### Generate Payment Addrs & QR Codes

```js
let index = 0;
let amount = 0.01;

let paymentAddr = await wallet.addrFromXPubKey(xpubKey, index);
let qr = await wallet.qrFromXPubKey(xpubKey, index, amount, { format: "svg" });
let qrAscii = await wallet.qrFromXPubKey(xpubKey, index, amount, {
  format: "ascii",
});

console.info(`Wallet Import Format for Private Key:\n${wifQrAscii}`);
console.info(`${wif}`);
```

### Generate Private Key WIFs & QR Codes

```js
let index = 0;

let wif = await wallet.wifFromMnemonic(mnemonic, index);
let wifQr = await wallet.wifQrFromMnemonic(mnemonic, index, {
  format: "svg",
});
let wifQrAscii = await wallet.wifQrFromMnemonic(mnemonic, index, {
  format: "ascii",
});

console.info(`Wallet Import Format for Private Key:\n${wifQrAscii}`);
console.info(`${wif}`);
```

## Config

See [./example.env](/example.env).

1. Add your [wallet passphrase](https://passphrase.js.org) (mnemonic) to
   `.env.secret` as `BASE2048_PASSPHRASE`, or generate a new one:
   ```bash
   bash bin/mnemonic-to-secret-env.sh
   ```
2. Add your xpub (extended public) key to `.env` as `XPUB_KEY`, or generate it
   from the existing ENVs:
   ```bash
   bash bin/xpubkey-to-env.sh
   ```

### Examples

`.env`:

```bash
WALLET_TYPE=dash
XPUB_KEY=xpub6EVfukfarxzs7NhxQbMQybLvsfLDEYrex5SdDsEuZ7oddnPxaLSW4wX9ZAR5zVYSFnxAum6oiSH4CYmLvJrpe75NXNnVuyWGoz9vdNcwGVJ
```

`.env.secret`:

```bash
BASE2048_PASSPHRASE="peanut valley bargain affair zebra antenna govern bind myth doll weekend elbow"
```

## Exploring & Debugging

```bash
git clone https://github.com/therootcompany/merchant-wallet.js.git
pushd ./merchant-wallet.js/
```

### Passphrase (mnemonic) + Extended Public Key (xpub)

```bash
# Create a passphrase / mnemonic
bash bin/mnemonic-to-secret-env.sh

# See derived keys
node bin/derive-xpub-key.js
```

### Generate Payment Addresses & QR Codes

- `index` should start from 0 and count up sequentially
- `amount` is optional for Dash

```bash
# node bin/addr-from-xpub.js <customer-index> <amount>
node bin/addr-from-xpub.js 0
```

### Generate Wallet Import Addresses & QR Codes

From the Dash app you can choose "Send" to scan a wallet (private key) and send
the money to your primary wallet.

```bash
node bin/wif-from-mnemonic.js 0
```
