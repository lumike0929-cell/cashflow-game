import { mkdir, copyFile, rm } from "node:fs/promises";

const deployFiles = [
  "index.html",
  "styles.css",
  "game.js",
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
];

await rm("public", { recursive: true, force: true });
await mkdir("public", { recursive: true });

for (const file of deployFiles) {
  await copyFile(file, `public/${file}`);
}

console.log("Prepared public output directory.");
