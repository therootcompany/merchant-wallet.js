#!/usr/bin/env node
"use strict";

require("dotenv").config({ path: ".env" });
require("dotenv").config({ path: ".env.secret" });

let Fs = require("fs").promises;

let Wallet = require("../lib/wallet.js").Wallet;
let coins = require("../lib/coins.json");

async function main() {
  let addrOrWif = process.argv[2];
  let amount = process.argv[3];
  let coinName = (
    process.argv[4] ||
    process.env.WALLET_TYPE ||
    "dash"
  ).toLowerCase();

  let myCoin = coins[coinName];

  if (!addrOrWif || !myCoin) {
    console.error();
    console.error("Usage:");
    console.error(
      "        node bin/qr <addr-or-wif (str or file)> [amount] [coin-name]"
    );
    console.error("Ex:");
    console.error(
      "        node bin/wif-from-mnemonic 'Xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
    );
    console.error("        node bin/wif-from-mnemonic ./priv.wif 1.001 dash");
    console.error();
    process.exit(1);
    return;
  }

  addrOrWif = await Fs.readFile(addrOrWif, "utf8").catch(function () {
    return addrOrWif;
  });
  addrOrWif = addrOrWif.trim();

  let w = Wallet.create(myCoin);
  let qr = w.qrFromAddr(addrOrWif, amount, { format: "ascii" });

  let coinNameUpper = myCoin.name.toUpperCase();
  let header = `    =========== [${coinNameUpper}] Payment Address (PubKeyHash) ===========    `;
  if (addrOrWif.length > 34) {
    header = `    ====== [${coinNameUpper}] WIF (Wallet Import Format) Private Key ======    `;
  }

  console.info();
  console.info(header);
  console.info();
  console.info(qr);
  console.info(`    ${coinNameUpper}: ${addrOrWif}    `);
  console.info();
}

main().catch(function (err) {
  console.error("Fail:");
  console.error(err.stack || err);
});
