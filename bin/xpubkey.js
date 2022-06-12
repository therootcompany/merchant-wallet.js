#!/usr/bin/env node
"use strict";

require("dotenv").config({ path: ".env" });
require("dotenv").config({ path: ".env.secret" });

let Wallet = require("../lib/wallet.js").Wallet;

async function main() {
  let coinName = process.argv[2] || process.env.WALLET_TYPE || "dash";

  let coins = require("../lib/coins.json");
  let myCoin = coins[coinName];

  let direction = process.argv[3] || 0;
  let account = process.argv[4] || 0;
  let derive = Wallet.create(myCoin, direction, account);

  let mnemonic = process.env.BASE2048_PASSPHRASE;
  if (!mnemonic) {
    console.error(
      "BASE2048_PASSPHRASE (mnemonic) is NOT DEFINED in .env or .env.secret"
    );
    process.exit(1);
    return;
  }

  let xpubKey = await derive.xpubKeyFromMnemonic(mnemonic);
  console.info(xpubKey);
}

main().catch(function (err) {
  console.error("Fail:");
  console.error(err.stack || err);
});
