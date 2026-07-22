import { readFile } from "node:fs/promises";
import assert from "node:assert/strict";

const files = [
  "game.js",
  "gameExperience.js",
  "realEstateData.js",
  "realEstateCalculator.js",
  "realEstateTransactions.js",
  "realEstateStorageMigration.js",
  "realEstateEventResolver.js",
  "stockData.js",
  "stockCalculator.js",
  "stockTransactions.js",
  "stockStorageMigration.js",
  "stockEventResolver.js",
  "businessData.js",
  "businessCalculator.js",
  "businessTransactions.js",
  "businessStorageMigration.js",
  "businessEventResolver.js",
  "bankingData.js",
  "bankingCalculator.js",
  "bankingTransactions.js",
  "bankingStorageMigration.js",
  "insuranceData.js",
  "insuranceCalculator.js",
  "insuranceTransactions.js",
  "lifeEventData.js",
  "lifeEventCalculator.js",
  "lifeEventResolver.js",
  "lifeEventTransactions.js",
  "lifeEventStorageMigration.js",
  "unemploymentEngine.js",
  "taxCalculator.js",
  "economyCycleEngine.js",
  "progressSystem.js",
  "aiCompetitionSystem.js",
  "scripts/build-public.mjs",
  "tests/real-estate.test.mjs",
  "tests/stock.test.mjs",
  "tests/business.test.mjs",
  "tests/bank.test.mjs",
  "tests/loan.test.mjs",
  "tests/mortgage.test.mjs",
  "tests/credit.test.mjs",
  "tests/life-event.test.mjs",
  "tests/insurance.test.mjs",
  "tests/unemployment.test.mjs",
  "tests/tax.test.mjs",
  "tests/game-experience.test.mjs",
  "tests/progress.test.mjs",
  "tests/ai-competition.test.mjs",
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
