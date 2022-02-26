"use strict";

async function main() {
  await require("./bin/derive-xpub-key.js");
  console.info(`(passed if there was no error message)`);
  console.info();
}

main();
