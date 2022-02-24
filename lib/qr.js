"use strict";

let Qr = module.exports;

var QrCode = require("qrcode-svg");

Qr.generate = async function (filepath, data) {
    var qrcode = new QrCode({
        content: data,
        padding: 4,
        width: 256,
        height: 256,
        color: "#000000",
        background: "#ffffff",
        ecl: "M",
    });
    return await new Promise(function (resolve, reject) {
        qrcode.save(filepath, function (err) {
            if (err) {
                reject(err);
                return;
            }
            resolve();
        });
    });
};
