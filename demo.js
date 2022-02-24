"use strict";

//require("dotenv").config(".env");
//require("dotenv").config(".env.secret");

let hdkey = require("hdkey");
//let Bip39 = require("bip39");

let Base58Check = require("@root/base58check").Base58Check;
let b58c = Base58Check.create({
  pubKeyHashVersion: "4c",
  privateKeyVersion: "cc",
});

async function main() {
  /*
  let mnemonic = process.env.BASE2048_PASSPHRASE;
  let seed = await Bip39.mnemonicToSeed(mnemonic);
  //let hdkey = HdKey.fromMasterSeed(seed);
  var privateRoot = hdkey.fromMasterSeed(seed);
  let version = 5; // Dash
  var publicParentExtendedKey = privateRoot.derive(
    `m/44'/${version}'/0'/0`
  ).publicExtendedKey; //missing the final 0

  console.log(publicParentExtendedKey); //xpub6Eaz...M6tmjr7t
  */
  var publicParentExtendedKey =
    "xpub6Dt9h5i7DmE4sDbjkhVQm5vJ1LZNJnVX3teeyJwCNVR4ZCCjYBjJjegLCfLqHax6ERPeMR4v9MZ8xrzzKnwhH7WytcmRC9325b9V8Xu8Ysu";

  var derivedRoot = hdkey.fromExtendedKey(publicParentExtendedKey);
  for (let i = 0; i < 10; i += 1) {
    await genNext(i);
  }

  async function genNext(userIndex) {
    var derivedChild = derivedRoot.deriveChild(userIndex);
    console.log(derivedChild.pubKeyHash);

    let addr = await b58c.encode({
      version: "4c",
      pubKeyHash: derivedChild.pubKeyHash.toString("hex"),
    });

    console.log(addr);
  }
}

main();
