import { readFile } from "node:fs/promises";
import assert from "node:assert/strict";

const files = [
  "game.js",
  "realEstateData.js",
  "realEstateCalculator.js",
  "realEstateTransactions.js",
  "realEstateStorageMigration.js",
  "realEstateEventResolver.js",
  "scripts/build-public.mjs",
  "tests/real-estate.test.mjs",
  "tests/browser-acceptance.mjs",
  "tests/static-check.mjs",
];

for (const file of files) {
  const source = await readFile(file, "utf8");
  assert.equal(source.includes("\t"), false, `${file} contains tabs`);
  assert.equal(source.includes(" any"), false, `${file} contains loose any text`);
  assert.equal(/console\.error\(/.test(source), false, `${file} should not emit console.error`);
}

const css = await readFile("styles.css", "utf8");
assert.match(css, /prefers-reduced-motion/);
assert.match(css, /safe-area-inset-bottom/);

console.log("Lint check passed.");
