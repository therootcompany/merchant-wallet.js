"use strict";

var Qr = require("./lib/qr.js");

var Dashcore = require("@dashevo/dashcore-lib");

async function main() {
    console.info("");

    var dashkey = new Dashcore.PrivateKey();
    var privateKey = dashkey.toWIF();
    var publicKey = dashkey.toAddress().toString();

    console.info("Private Key:", privateKey);
    await Qr.generate("private.svg", privateKey);

    console.info("Public Key:", publicKey);
    // dash:XfZGhjFu1JSG7bvcSkDYKehSxKmZr8V6AD?amount=0.18369&currency=USD&local=25.00
    await Qr.generate("public.svg", `dash:${publicKey}?amount=0.0010`);

    console.info("");
    console.info("Dashcore QR Codes saved to ./private.svg and ./public.svg.");
    console.info("");
    console.info("Preview at ./index.html.");
    console.info("");
}

main();
