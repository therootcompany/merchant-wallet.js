#!/usr/bin/env node
"use strict";

require("dotenv").config({ path: ".env" });
//require("dotenv").config({ path: ".env.secret" });

let Fs = require("fs").promises;

let Wallet = require("../lib/wallet.js").Wallet;

async function main() {
  let index = parseInt(process.argv[2], 10);
  let amount = parseInt(process.argv[3], 10);
  let coinName = process.argv[4] || process.env.WALLET_TYPE || "dash";

  if (!process.argv[2] || (!index && 0 !== index)) {
    console.error();
    console.error("Usage:");
    console.error(
      "        node bin/addr-from-xpub <address-index> [amount] [coin type]"
    );
    console.error("Ex:");
    console.error("        node bin/addr-from-xpub 0");
    console.error("        node bin/addr-from-xpub 0 1.5 dash");
    console.error();
    process.exit(1);
    return;
  }

  let coins = require("../lib/coins.json");
  let myCoin = coins[coinName];

  let derive = Wallet.create(myCoin);

  let xpubKey = process.env.XPUB_KEY;
  if (!xpubKey) {
    console.error("XPUB_KEY is NOT DEFINED in .env");
    process.exit(1);
    return;
  }

  let coinNameUpper = myCoin.name.toUpperCase();
  let addr = await derive.addrFromXPubKey(xpubKey, index);
  let ascii = await derive.qrFromXPubKey(xpubKey, index, amount, {
    format: "ascii",
  });
  let svg = await derive.qrFromXPubKey(xpubKey, index, amount, {
    format: "svg",
  });
  console.info();
  console.info(
    `    ====== [${coinNameUpper}] (Derived) Public Key Hash ======    `
  );
  console.info();
  console.info(ascii);
  console.info(`        ${coinNameUpper}: ${addr}        `);
  console.info();

  await Fs.writeFile(`./payment-address-${index}.svg`, svg, "utf8");
  console.info(`Saved to ./payment-address-${index}.svg`);
  await Fs.writeFile(
    `./payment-address-${index}.html`,
    `<img src="./payment-address-${index}.svg" />`,
    "utf8"
  );
  console.info(`Saved to ./payment-address-${index}.html`);
  console.info();
}

main().catch(function (err) {
  console.error("Fail:");
  console.error(err.stack || err);
});
