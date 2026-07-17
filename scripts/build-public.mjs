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
];

await rm("public", { recursive: true, force: true });
await mkdir("public", { recursive: true });

for (const file of deployFiles) {
  await copyFile(file, `public/${file}`);
}

console.log("Prepared public output directory.");
