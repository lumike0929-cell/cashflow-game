import { access, readFile } from "node:fs/promises";
import assert from "node:assert/strict";

const requiredFiles = [
  "index.html",
  "styles.css",
  "game.js",
  "gameExperience.js",
  "releaseInfo.js",
  "pwaSystem.js",
  "manifest.webmanifest",
  "sw.js",
  "icons/app-icon-192.svg",
  "icons/app-icon-512.svg",
  "icons/app-icon-maskable.svg",
  "icons/apple-touch-icon.svg",
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
  "feedbackSystem.js",
  "i18n/index.js",
  "i18n/formatters.js",
  "i18n/glossary.js",
  "i18n/zh-TW.js",
  "i18n/zh-CN.js",
  "i18n/en.js",
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
assert.match(game, /movePlayerStepByStep/);
assert.match(game, /showTilePreview/);
assert.match(data, /realEstateOpportunities/);
assert.match(await readFile("gameExperience.js", "utf8"), /boardPath/);
assert.match(await readFile("stockData.js", "utf8"), /stockDefinitions/);
assert.match(await readFile("businessData.js", "utf8"), /businessDefinitions/);
assert.match(await readFile("bankingData.js", "utf8"), /interestProfiles/);
assert.match(game, /showBankCenter/);
assert.match(await readFile("lifeEventData.js", "utf8"), /lifeEvents/);
assert.match(await readFile("insuranceData.js", "utf8"), /insurancePolicies/);
assert.match(game, /showInsuranceCenter/);
assert.match(await readFile("aiCompetitionSystem.js", "utf8"), /runAiTurnCycle/);
assert.match(await readFile("feedbackSystem.js", "utf8"), /buildDiagnosticsSummary/);
assert.match(await readFile("i18n/index.js", "utf8"), /setLocale/);
assert.match(await readFile("i18n/zh-TW.js", "utf8"), /財務自由/);
assert.match(await readFile("i18n/zh-CN.js", "utf8"), /财务自由/);
assert.match(await readFile("i18n/en.js", "utf8"), /Financial Freedom/);
assert.match(await readFile("releaseInfo.js", "utf8"), /1\.24\.0-rc\.1/);
assert.match(await readFile("releaseInfo.js", "utf8"), /Public Beta/);
assert.match(html, /rel="manifest" href="\.\/manifest\.webmanifest"/);
assert.match(await readFile("manifest.webmanifest", "utf8"), /"display": "standalone"/);
assert.match(await readFile("sw.js", "utf8"), /cashflow-game-shell-rc1/);
assert.match(game, /registerServiceWorker/);

console.log("Static build check passed.");
