#!/usr/bin/env node
"use strict";

require("dotenv").config({ path: ".env" });
require("dotenv").config({ path: ".env.secret" });

let Wallet = require("../lib/wallet.js").Wallet;

async function main() {
  let index = parseInt(process.argv[2], 10);
  let coinName = process.argv[3] || process.env.WALLET_TYPE || "dash";

  if (!process.argv[2] || (!index && 0 !== index)) {
    console.error();
    console.error("Usage:");
    console.error("        node bin/wif-from-mnemonic <address-index>");
    console.error("Ex:");
    console.error("        node bin/wif-from-mnemonic 0");
    console.error();
    process.exit(1);
    return;
  }

  let coins = require("../lib/coins.json");
  let myCoin = coins[coinName];

  let derive = Wallet.create(myCoin);

  let mnemonic = process.env.BASE2048_PASSPHRASE;
  if (!mnemonic) {
    console.error(
      "BASE2048_PASSPHRASE (mnemonic) is NOT DEFINED in .env or .env.secret"
    );
    process.exit(1);
    return;
  }

  console.info();
  let coinNameUpper = myCoin.name.toUpperCase();
  console.info(
    `    ====== [${coinNameUpper}] WIF (Wallet Import Format) Private Key ======    `
  );
  let wif = await derive.wifFromMnemonic(mnemonic, index);
  console.info();
  let ascii = await derive.wifQrFromMnemonic(mnemonic, index, {
    format: "ascii",
  });
  console.info(ascii);
  console.info(`    ${coinNameUpper}: ${wif}    `);
  console.info();
}

main().catch(function (err) {
  console.error("Fail:");
  console.error(err.stack || err);
});
