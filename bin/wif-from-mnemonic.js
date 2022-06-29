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

  // TODO sparse range
  let cols = 3;
  for (let i = index; i <= end; i += cols) {
    let max = 0;
    let addrs = [];
    for (let m = 0; m < cols; m += 1) {
      let next = i + m;
      if (next > end) {
        continue;
      }
      let wif = await derive.wifFromMnemonic(
        mnemonic,
        next,
        direction,
        account
      );
      let ascii = await derive.wifQrFromMnemonic(
        mnemonic,
        next,
        { format: "ascii" },
        direction,
        account
      );
      let lines = ascii.split("\n");
      max = Math.max(lines.length, max);

      addrs.push({
        wif,
        lines,
      });
    }

    for (let n = 0; n < max; n += 1) {
      let longLine = "";
      addrs.forEach(function (addr, j) {
        let line = (addr.lines[n] || "").padStart(34, " ");
        longLine += `${line}    `;
      });
      console.info(longLine);
    }
    console.info();

    /*
    let addrsLine = `${coinNameUpper}: `;
    addrs.forEach(function (addr, j) {
      if (0 === j) {
        addrsLine += addr.wif;
      } else {
        addrsLine += `, ${addr.wif}`;
      }
    });
    console.info(addrsLine);
    */
    addrs.forEach(function (addr, j) {
      console.info(i + j, addr.wif);
    });
    console.info();
  }
  console.info();
}

main().catch(function (err) {
  console.error("Fail:");
  console.error(err.stack || err);
});
