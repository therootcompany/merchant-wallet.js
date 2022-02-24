"use strict";

require("dotenv").config(".env");
require("dotenv").config(".env.secret");

let Crypto = require("crypto");
let Fs = require("fs").promises;

let Base58Check = require("@root/base58check").Base58Check;
let Qr = require("./lib/qr.js");

let Bip39 = require("bip39");
// TODO require("@root/passphrase")
let HdKey = require("hdkey");

async function main() {
  let b58c = Base58Check.create({
    pubKeyHashVersion: "4c",
    privateKeyVersion: "cc",
  });
  let version = 5; // Dash

  ///*
  let mnemonic = process.env.BASE2048_PASSPHRASE;
  let seed = await Bip39.mnemonicToSeed(mnemonic);

  let hdkey = HdKey.fromMasterSeed(seed);
  //let masterPrivateKey = hdkey.privateKey.toString("hex");
  //console.log("pubExt", hdkey.publicExtendedKey);
  //console.log("pubExt", hdkey.derive(`m/44'/${version}'/0'/0`).publicExtendedKey);
  //*/

  ///*
  //let hdkey = HdKey.fromExtendedKey(
  //  "xpub6Dt9h5i7DmE4sDbjkhVQm5vJ1LZNJnVX3teeyJwCNVR4ZCCjYBjJjegLCfLqHax6ERPeMR4v9MZ8xrzzKnwhH7WytcmRC9325b9V8Xu8Ysu"
  //"xpub661MyMwAqRbcG2ZABMCgTfHzmvMWXDNeoQx912YvnvhpYa8z3oA58KnYR2YGrHc2EpycbMDwGcDNefw8B7xZTbMtadScJSiS1WsWCGQaiFT"
  //);
  //*/

  for (let i = 0; i < 10; i += 1) {
    let pub = await generatePubKey(i);
    console.log("pub:");
    console.log(pub);
  }

  async function generatePubKey(n) {
    let customer = n;
    console.info();
    console.info(`Address for customer ${customer}...`);
    console.info();

    let childKey = hdkey.derive(`m/44'/${version}'/0'/0/${customer}`);
    //let childKey = hdkey.derive(`m/0/${customer}`);
    //let childKey = hdkey.derive(`${customer}`);

    let publicKey = childKey.publicKey.toString("hex");
    console.log("publicKey:", publicKey);

    let pubKeyHash = pubKeyToPubKeyHash(childKey.publicKey).toString("hex");
    let addr = await b58c.encode({
      version: "4c",
      pubKeyHash: pubKeyHash,
    });
    console.log("pubKeyHash(0):", childKey.pubKeyHash.toString("hex"));
    console.log("pubKeyHash(1):", pubKeyHash);
    console.log("pubKeyHash(b58):", addr);

    return addr;
  }

  /*
  console.log();
  console.log("privateKey(hex):", childKey.privateKey.toString("hex"));
  let priv = await b58c.encode({
    version: "cc",
    privateKey: childKey.privateKey.toString("hex"), //.padStart(66, "0"),
    compressed: true,
  });
  console.log("privateKey(wif):", priv);

  await Qr.generate("public.svg", addr);
  await Qr.generate("private.svg", priv);
  let privMask = priv[0] + "*".repeat(priv.length - 2) + priv[priv.length - 1];
  let html = await Fs.readFile("./index.html", "utf8");
  html = html.replace(
    /<wallet-privatekey>.*<\/wallet-privatekey>/i,
    `<wallet-privatekey>${privMask}</wallet-privatekey>`
  );
  html = html.replace(
    /<wallet-pubkeyhash>.*<\/wallet-pubkeyhash>/i,
    `<wallet-pubkeyhash>${addr}</wallet-pubkeyhash>`
  );
  await Fs.writeFile("./index.html", html, "utf8");

  console.info("");
  console.info("HD Wallet QR Codes saved to ./private.svg and ./public.svg.");
  console.info("");
  console.info("Preview at ./index.html.");
  console.info("");
  */
}

function pubKeyToPubKeyHash(pubKey) {
  let sha256 = Crypto.createHash("sha256").update(pubKey).digest();
  let pubKeyHash = Crypto.createHash("ripemd160").update(sha256).digest();
  return pubKeyHash;
}

main();
