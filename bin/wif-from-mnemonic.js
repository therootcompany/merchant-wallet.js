#!/usr/bin/env node
"use strict";

require("dotenv").config({ path: ".env" });
require("dotenv").config({ path: ".env.secret" });

let Wallet = require("../lib/wallet.js").Wallet;

async function main() {
  let indices = process.argv[2].split("-");
  let index = parseInt(indices[0], 10);
  let end = parseInt(indices[1], 10) || index;
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

  let direction = process.argv[4] || 0;
  let account = process.argv[5] || 0;
  let derive = Wallet.create(myCoin, direction, account);

  let mnemonic = process.env.BASE2048_PASSPHRASE;
  if (!mnemonic) {
    console.error(
      "BASE2048_PASSPHRASE (mnemonic) is NOT DEFINED in .env or .env.secret"
    );
    process.exit(1);
    return;
  }

  let coinNameUpper = myCoin.name.toUpperCase();
  console.info();
  console.info(
    `    ====== [${coinNameUpper}] WIF (Wallet Import Format) Private Key ======    `
  );
  console.info();

  for (let i = index; i <= end; i += 2) {
    let next = i + 1;
    let wif1 = await derive.wifFromMnemonic(
      mnemonic,
      index + 0,
      direction,
      account
    );
    let ascii1 = await derive.wifQrFromMnemonic(
      mnemonic,
      index + 0,
      { format: "ascii" },
      direction,
      account
    );
    //console.info(ascii1);

    let wif2 = await derive.wifFromMnemonic(
      mnemonic,
      index + 1,
      direction,
      account
    );
    let ascii2 = await derive.wifQrFromMnemonic(
      mnemonic,
      index + 1,
      { format: "ascii" },
      direction,
      account
    );

    let ascii1Lines = ascii1.split(/\n/);
    let ascii2Lines = ascii2.split(/\n/);
    let max = Math.max(ascii1Lines.length, ascii2Lines.length);
    for (let n = 0; n < max; n += 1) {
      let line1 = (ascii1Lines[n] || "").padStart(34, " ");
      if (next <= end) {
        let line2 = (ascii2Lines[n] || "").padStart(34, " ");
        if (n === max - 1) {
          // TODO why the offset?
          console.info(`${line1}       ${line2}`);
        } else {
          console.info(`${line1}    ${line2}`);
        }
      } else {
        console.info(`${line1}`);
      }
    }
    if (i === end) {
      console.info(`${coinNameUpper}: ${wif1}`);
    } else {
      console.info(`${coinNameUpper}: ${wif1}, ${wif2}`);
    }
  }
  console.info();
}

main().catch(function (err) {
  console.error("Fail:");
  console.error(err.stack || err);
});
