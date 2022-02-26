#!/usr/bin/env node
"use strict";

require("dotenv").config({ path: ".env" });
require("dotenv").config({ path: ".env.secret" });

let Crypto = require("crypto");
let Assert = require("assert");

let Wallet = require("../lib/wallet.js").Wallet;

let Base58Check = require("@root/base58check").Base58Check;

let Bip39 = require("bip39");
let HdKey = require("hdkey");

async function main() {
  let coinName = process.argv[2] || process.env.WALLET_TYPE || "dash";

  let coins = require("../lib/coins.json");
  let myCoin = coins[coinName];

  let b58c = Base58Check.create({
    pubKeyHashVersion: myCoin.pubKeyHashVersion,
    privateKeyVersion: myCoin.privateKeyVersion,
  });

  let derive = Wallet.create(myCoin);

  let mnemonic = process.env.BASE2048_PASSPHRASE;
  if (!mnemonic) {
    console.error(
      "BASE2048_PASSPHRASE (mnemonic) is NOT DEFINED in .env or .env.secret"
    );
    process.exit(1);
    return;
  }

  let seed = await Bip39.mnemonicToSeed(mnemonic);
  let privateRoot = HdKey.fromMasterSeed(seed);
  // The full path looks like `m/44'/5'/0'/0/0`
  // We "harden" the prefix `m/44'/5'/0'/0`
  let derivationPath = `m/44'/${myCoin.coinType}'/0'/0`;
  let publicParentExtendedKey =
    privateRoot.derive(derivationPath).publicExtendedKey;

  let xpubKeyCheck = await derive.xpubKeyFromMnemonic(mnemonic);
  Assert.equal(publicParentExtendedKey, xpubKeyCheck);

  let derivedRoot = HdKey.fromExtendedKey(publicParentExtendedKey);

  // xpub6EVf...wGVJ
  console.info();
  console.info("==== EXTENDED PUBLIC KEY (xpub key) ====");
  console.info();
  console.info(publicParentExtendedKey);
  console.info();
  console.info("==== Proof of Idempotency ===");

  for (let i = 0; i < 4; i += 1) {
    if (0 !== i) {
      console.info();
    }
    await genNext(i);
  }
  console.info();
  console.info("(so you can rest assumed xpub key monies are reclaimable)");
  console.info("=============================");
  console.info();

  async function genNext(userIndex) {
    let userNo = userIndex.toString().padStart(4, "0");

    var derivedChild = derivedRoot.deriveChild(userIndex);
    //console.log(derivedChild.pubKeyHash);
    let childKey = privateRoot.derive(
      `m/44'/${myCoin.coinType}'/0'/0/${userIndex}`
    );

    let childPubKeyHash = pubKeyToPubKeyHash(childKey.publicKey).toString(
      "hex"
    );
    Assert.equal(childPubKeyHash, childKey.pubKeyHash.toString("hex"));

    let addrFromPrivKey = await b58c.encode({
      version: myCoin.pubKeyHashVersion,
      pubKeyHash: childKey.pubKeyHash.toString("hex"),
    });
    let addrFromPrivKeyCheck = await derive.addrFromMnemonic(
      mnemonic,
      userIndex
    );
    Assert.equal(addrFromPrivKey, addrFromPrivKeyCheck);
    console.info(`Index ${userNo} (Derived by PrivKey): ${addrFromPrivKey}`);

    let addrFromXPubKey = await b58c.encode({
      version: myCoin.pubKeyHashVersion,
      pubKeyHash: derivedChild.pubKeyHash.toString("hex"),
    });
    let addrFromXPubKeyCheck = await derive.addrFromXPubKey(
      publicParentExtendedKey,
      userIndex
    );
    Assert.equal(addrFromXPubKey, addrFromXPubKeyCheck);
    console.info(`Index ${userNo} (Derived by XPubKey): ${addrFromXPubKey}`);

    Assert.equal(addrFromPrivKey, addrFromXPubKey);
  }
}

function pubKeyToPubKeyHash(pubKey) {
  let sha256 = Crypto.createHash("sha256").update(pubKey).digest();
  let pubKeyHash = Crypto.createHash("ripemd160").update(sha256).digest();
  return pubKeyHash;
}

module.exports = main().catch(function (err) {
  console.error("Fail:");
  console.error(err.stack || err);
});
