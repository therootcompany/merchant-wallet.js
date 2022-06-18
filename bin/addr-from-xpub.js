#!/usr/bin/env node
"use strict";

require("dotenv").config({ path: ".env" });
//require("dotenv").config({ path: ".env.secret" });

let Fs = require("fs").promises;

let request = require("@root/request");
let Wallet = require("../lib/wallet.js").Wallet;

async function main() {
  let indices = process.argv[2].split("-");
  let index = parseInt(indices[0], 10);
  let end = parseInt(indices[1], 10) || index;
  let amount = parseFloat(process.argv[3], 10);
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

  // multiple addresses
  let hasMany = end > index;
  if (!hasMany) {
    return;
  }

  for (let i = index; i <= end; i += 1) {
    let addr = await derive.addrFromXPubKey(xpubKey, i);
    let resp = await request({
      url: `https://insight.dash.org/insight-api/txs?address=${addr}&pageNum=0`,
      json: true,
    });

    let pagesTotal = resp.body.pagesTotal;
    for (let cursor = 1; cursor < pagesTotal; cursor += 1) {
      let nextResp = await request({
        url: `https://insight.dash.org/insight-api/txs?address=${addr}&pageNum=${i}`,
        json: true,
      });
      // Note: this could still be wrong, but I don't think we have
      // a better way to page so... whatever
      resp.body.txs = resp.body.txs.concat(nextResp.body.txs);
    }

    //console.log(JSON.stringify(resp.body, null, 2));

    let credits = 0;
    let debits = 0;
    let satoshis = 100 * 1000 * 1000;
    resp.body.txs.forEach(function (tx) {
      //let fee = tx.valueIn - tx.valueOut;
      // consumed as an input
      tx.vin.forEach(function (vin) {
        if (addr === vin.addr) {
          debits += vin.valueSat;
        }
      });
      tx.vout.forEach(function (vout) {
        let value = Math.round(parseFloat(vout.value) * satoshis);
        if (vout.scriptPubKey.addresses.includes(addr)) {
          credits += value;
        }
      });
    });
    let n = i.toString().padStart(3, "0");
    let total = (credits - debits).toString().padStart(9, "0");
    total = total[0] + "." + total.slice(1);

    let creditsStr = credits.toString().padStart(9, "0");
    let debitsStr = debits.toString().padStart(9, "0");
    console.info(`${n}: ${addr}: ${total} (${creditsStr} - ${debitsStr})`);
  }
  console.info();
}

main().catch(function (err) {
  console.error("Fail:");
  console.error(err.stack || err);
});
