import { access, readFile } from "node:fs/promises";
import assert from "node:assert/strict";

const requiredFiles = [
  "index.html",
  "styles.css",
  "game.js",
  "realEstateData.js",
  "realEstateCalculator.js",
  "realEstateTransactions.js",
  "realEstateStorageMigration.js",
  "realEstateEventResolver.js",
];

for (const file of requiredFiles) {
  await access(file);
}

const html = await readFile("index.html", "utf8");
const game = await readFile("game.js", "utf8");
const data = await readFile("realEstateData.js", "utf8");

assert.match(html, /type="module" src="\.\/game\.js"/);
assert.match(html, /realEstatePortfolio/);
assert.match(game, /cashflowDebug/);
assert.match(data, /realEstateOpportunities/);

console.log("Static build check passed.");
