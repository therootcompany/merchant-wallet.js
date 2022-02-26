"use strict";

let Base58Check = require("@root/base58check").Base58Check;

let Qr = require("./qr.js");

let Bip39 = require("bip39");
let HdKey = require("hdkey");

function mustMnemonic(mnemonic) {
  // TODO switch to @root/passphrase for proper checksum verification
  if (
    !mnemonic ||
    "undefined" === mnemonic ||
    12 !== mnemonic.trim().split(/\s+/).length
  ) {
    throw new Error("[merchant-wallet] mnemonic is not 12 words");
  }
}

exports.Wallet = {};
exports.Wallet.create = function (myCoin) {
  let b58c = Base58Check.create({
    pubKeyHashVersion: myCoin.pubKeyHashVersion,
    privateKeyVersion: myCoin.privateKeyVersion,
  });

  // The full path looks like `m/44'/5'/0'/0/0`
  // We "harden" the prefix `m/44'/5'/0'/0`
  let derivationPath = `m/44'/${myCoin.coinType}'/0'/0`;

  let wallet = {};

  wallet.xpubKeyFromMnemonic = async function (mnemonic) {
    mustMnemonic(mnemonic);
    let seed = await Bip39.mnemonicToSeed(mnemonic);
    return await wallet.xpubKeyFromSeed(seed);
  };
  wallet.xpubKeyFromSeed = async function (seed) {
    let privateRoot = HdKey.fromMasterSeed(seed);
    return wallet.xpubKeyFromPrivateRoot(privateRoot);
  };
  wallet.xpubKeyFromPrivateRoot = function (privateRoot) {
    let publicParentExtendedKey =
      privateRoot.derive(derivationPath).publicExtendedKey;
    return publicParentExtendedKey;
  };
  wallet.qrFromMnemonic = async function (mnemonic, index, amount, opts) {
    mustMnemonic(mnemonic);
    let seed = await Bip39.mnemonicToSeed(mnemonic);
    let privateRoot = HdKey.fromMasterSeed(seed);
    let xpubKey = privateRoot.derive(derivationPath).publicExtendedKey;
    let addr = await wallet.addrFromXPubKey(xpubKey, index);
    return wallet.qrFromAddr(addr, amount, opts);
  };

  // Private to Private
  wallet.wifFromMnemonic = async function (mnemonic, index) {
    mustMnemonic(mnemonic);
    let seed = await Bip39.mnemonicToSeed(mnemonic);
    let privateRoot = HdKey.fromMasterSeed(seed);
    let wif = await wallet.wifFromPrivateRoot(privateRoot, index);

    return wif;
  };
  wallet.wifFromPrivateRoot = async function (privateRoot, index) {
    //mustMnemonic(mnemonic);
    //let seed = await Bip39.mnemonicToSeed(mnemonic);
    //let privateRoot = HdKey.fromMasterSeed(seed);
    let childKey = privateRoot.derive(
      `m/44'/${myCoin.coinType}'/0'/0/${index}`
    );
    let wif = await b58c.encode({
      version: myCoin.privateKeyVersion,
      privateKey: childKey.privateKey.toString("hex"),
      compressed: true,
    });

    return wif;
  };
  wallet.wifQrFromMnemonic = async function (mnemonic, index, opts) {
    mustMnemonic(mnemonic);
    let seed = await Bip39.mnemonicToSeed(mnemonic);
    let privateRoot = HdKey.fromMasterSeed(seed);
    let wif = await wallet.wifFromPrivateRoot(privateRoot, index);
    return wallet.qrFromAddr(wif, 0, opts);
  };

  // Private to Public Parts
  wallet.addrFromMnemonic = async function (mnemonic, index) {
    mustMnemonic(mnemonic);
    let seed = await Bip39.mnemonicToSeed(mnemonic);
    return await wallet.addrFromSeed(seed, index);
  };
  wallet.addrFromSeed = async function (seed, index) {
    let privateRoot = HdKey.fromMasterSeed(seed);
    return await wallet.addrFromPrivateRoot(privateRoot, index);
  };
  wallet.addrFromPrivateRoot = async function (privateRoot, index) {
    let childKey = privateRoot.derive(
      `m/44'/${myCoin.coinType}'/0'/0/${index}`
    );

    let addrFromPrivKey = await b58c.encode({
      version: myCoin.pubKeyHashVersion,
      pubKeyHash: childKey.pubKeyHash.toString("hex"),
    });

    return addrFromPrivKey;
  };

  // XPub to Public Parts
  wallet.addrFromXPubKey = async function (xpubKey, index) {
    let derivedRoot = HdKey.fromExtendedKey(xpubKey);
    return await wallet.addrFromXPubRoot(derivedRoot, index);
  };
  wallet.addrFromXPubRoot = async function (derivedRoot, index) {
    let derivedChild = derivedRoot.deriveChild(index);
    let addrFromXPubKey = await b58c.encode({
      version: myCoin.pubKeyHashVersion,
      pubKeyHash: derivedChild.pubKeyHash.toString("hex"),
    });

    return addrFromXPubKey;
  };

  // QR
  wallet.qrFromXPubKey = async function (xpubKey, index, amount, opts) {
    let addr = await wallet.addrFromXPubKey(xpubKey, index);
    return wallet.qrFromAddr(addr, amount, opts);
  };
  wallet.qrFromAddr = function (addr, amount, opts) {
    let content = addr;
    if ("dash" === myCoin.name) {
      let search = "";
      if (amount) {
        search = "amount=amount";
      }
      content = `dash://${addr}?${search}`;
    }

    if ("ascii" === opts?.format) {
      return Qr.ascii(addr);
    }
    return Qr.svg(addr);
  };

  return wallet;
};
