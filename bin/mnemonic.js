#!/usr/bin/env node
"use strict";

let Bip39 = require("bip39");

let mnemonic = Bip39.generateMnemonic();

console.info(mnemonic);
