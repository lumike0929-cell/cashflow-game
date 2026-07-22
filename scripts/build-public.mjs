import { mkdir, copyFile, rm } from "node:fs/promises";

const deployFiles = [
  "index.html",
  "styles.css",
  "game.js",
  "gameExperience.js",
  "releaseInfo.js",
  "pwaSystem.js",
  "manifest.webmanifest",
  "sw.js",
  "realEstateCalculator.js",
  "realEstateData.js",
  "realEstateEventResolver.js",
  "realEstateStorageMigration.js",
  "realEstateTransactions.js",
  "stockCalculator.js",
  "stockData.js",
  "stockEventResolver.js",
  "stockStorageMigration.js",
  "stockTransactions.js",
  "businessCalculator.js",
  "businessData.js",
  "businessEventResolver.js",
  "businessStorageMigration.js",
  "businessTransactions.js",
  "bankingCalculator.js",
  "bankingData.js",
  "bankingStorageMigration.js",
  "bankingTransactions.js",
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
  "i18n/index.js",
  "i18n/formatters.js",
  "i18n/glossary.js",
  "i18n/zh-TW.js",
  "i18n/zh-CN.js",
  "i18n/en.js",
];

await rm("public", { recursive: true, force: true });
await mkdir("public", { recursive: true });
await mkdir("public/i18n", { recursive: true });
await mkdir("public/icons", { recursive: true });

for (const file of deployFiles) {
  await copyFile(file, `public/${file}`);
}

await copyFile("icons/app-icon-192.svg", "public/icons/app-icon-192.svg");
await copyFile("icons/app-icon-512.svg", "public/icons/app-icon-512.svg");
await copyFile("icons/app-icon-maskable.svg", "public/icons/app-icon-maskable.svg");
await copyFile("icons/apple-touch-icon.svg", "public/icons/apple-touch-icon.svg");

console.log("Prepared public output directory.");
