import test from "node:test";
import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import {
  AUTO_BACKUP_KEY,
  BACKUP_SCHEMA_VERSION,
  CHALLENGE_SAVE_KEY,
  IMPORT_SLOT_KEY,
  MAX_BACKUPS,
  NORMAL_SAVE_KEY,
  backupFileName,
  buildExportEnvelope,
  createAutoBackup,
  estimateLocalStorage,
  importBackupToStorage,
  listAutoBackups,
  parseImportText,
  restoreAutoBackup,
  serializeBackup,
  trimGameReports,
  validateBackupEnvelope,
} from "../pwaSystem.js";
import { EXPERIENCE_SETTINGS_KEY } from "../gameExperience.js";
import { localeStorageKey } from "../i18n/index.js";

class MemoryStorage {
  constructor() {
    this.map = new Map();
  }

  get length() {
    return this.map.size;
  }

  getItem(key) {
    return this.map.has(key) ? this.map.get(key) : null;
  }

  setItem(key, value) {
    this.map.set(String(key), String(value));
  }

  removeItem(key) {
    this.map.delete(String(key));
  }

  key(index) {
    return Array.from(this.map.keys())[index] || null;
  }
}

function baseSave(overrides = {}) {
  return {
    saveVersion: 23,
    career: { id: "teacher", name: "小学老师", salary: 18000, expenses: 14500, savings: 12000 },
    month: 3,
    round: 7,
    position: 4,
    cash: 28000,
    salary: 18000,
    baseExpenses: 12000,
    assets: [],
    liabilities: [],
    ownedProperties: [],
    propertyTransactions: [{ id: "property-1", type: "buy", cashChange: -10000 }],
    stockHoldings: [],
    stockTransactions: [{ id: "stock-1", type: "buy", cashChange: -1000 }],
    businessHoldings: [],
    businessTransactions: [{ id: "business-1", type: "invest", cashChange: -5000 }],
    bankTransactions: [],
    insurancePolicies: [],
    insuranceClaims: [],
    lifeEventHistory: [],
    gameReports: Array.from({ length: 14 }, (_, index) => ({ id: `report-${index}`, round: index + 1 })),
    aiPlayers: [],
    logs: ["测试存档"],
    ...overrides,
  };
}

function storageWithSave(save = baseSave()) {
  const storage = new MemoryStorage();
  storage.setItem(NORMAL_SAVE_KEY, JSON.stringify(save));
  storage.setItem(EXPERIENCE_SETTINGS_KEY, JSON.stringify({ muted: true, visualQuality: "standard" }));
  storage.setItem(localeStorageKey, JSON.stringify({ locale: "en", version: 1 }));
  return storage;
}

test("PWA manifest, icons, and service worker shell are present", async () => {
  const manifest = JSON.parse(await readFile("manifest.webmanifest", "utf8"));
  assert.equal(manifest.display, "standalone");
  assert.equal(manifest.start_url.startsWith("./"), true);
  assert.ok(manifest.icons.length >= 4);
  await access("icons/app-icon-192.svg");
  await access("icons/app-icon-512.svg");
  await access("icons/app-icon-maskable.svg");
  await access("icons/apple-touch-icon.svg");

  const worker = await readFile("sw.js", "utf8");
  assert.match(worker, /networkFirst/);
  assert.match(worker, /staleWhileRevalidate/);
  assert.match(worker, /response\.ok/);
  assert.match(worker, /SKIP_WAITING/);
});

test("export envelope is valid, trimmed, and serializable", () => {
  const envelope = buildExportEnvelope(storageWithSave(), { locale: "zh-TW", now: "2026-07-22T10:00:00.000Z" });
  assert.equal(envelope.schemaVersion, BACKUP_SCHEMA_VERSION);
  assert.equal(envelope.locale, "zh-TW");
  assert.equal(envelope.normalGameSave.gameReports.length, 10);
  assert.equal(envelope.normalGameSave.cash, 28000);
  assert.equal(envelope.settings.muted, true);
  assert.equal(Object.prototype.hasOwnProperty.call(envelope, "device"), false);

  const serialized = serializeBackup(envelope);
  assert.equal(serialized.ok, true);
  assert.match(serialized.text, /"normalGameSave"/);
  assert.match(backupFileName(new Date("2026-07-22T03:04:00")), /cashflow-game-backup-2026-07-22-0304\.json/);
});

test("import parser accepts valid backups and rejects unsafe input", () => {
  const envelope = buildExportEnvelope(storageWithSave());
  const serialized = serializeBackup(envelope);
  const parsed = parseImportText(serialized.text);
  assert.equal(parsed.ok, true);
  assert.equal(parsed.summary.round, 7);

  assert.equal(parseImportText("{bad").ok, false);
  assert.equal(parseImportText(JSON.stringify({ schemaVersion: 999 })).errors.includes("newerVersion"), true);
  assert.equal(parseImportText(`{"schemaVersion":1,"__proto__":{"polluted":true}}`).errors.includes("unsafeKey"), true);
  assert.equal(parseImportText("x".repeat(650000)).errors.includes("tooLarge"), true);
  assert.equal({}.polluted, undefined);
});

test("failed imports do not overwrite current save, valid imports make a backup first", () => {
  const storage = storageWithSave(baseSave({ cash: 11111 }));
  const invalid = importBackupToStorage(storage, { schemaVersion: 1, normalGameSave: "broken" });
  assert.equal(invalid.ok, false);
  assert.equal(JSON.parse(storage.getItem(NORMAL_SAVE_KEY)).cash, 11111);

  const envelope = buildExportEnvelope(storageWithSave(baseSave({ cash: 44444, round: 12 })));
  const result = importBackupToStorage(storage, envelope, { replace: true });
  assert.equal(result.ok, true);
  assert.equal(JSON.parse(storage.getItem(NORMAL_SAVE_KEY)).cash, 44444);
  assert.ok(listAutoBackups(storage).length >= 1);
});

test("backup slots are limited and can restore safely", () => {
  const storage = storageWithSave();
  for (let index = 0; index < MAX_BACKUPS + 3; index += 1) {
    storage.setItem(NORMAL_SAVE_KEY, JSON.stringify(baseSave({ cash: 1000 + index, round: index + 1 })));
    const result = createAutoBackup(storage, `test-${index}`);
    assert.equal(result.ok, true);
  }
  const backups = listAutoBackups(storage);
  assert.equal(backups.length, MAX_BACKUPS);
  const target = backups[backups.length - 1];
  const restored = restoreAutoBackup(storage, target.backupId);
  assert.equal(restored.ok, true);
  assert.equal(JSON.parse(storage.getItem(NORMAL_SAVE_KEY)).round, target.round);
});

test("storage management trims reports and estimates known buckets", () => {
  const storage = storageWithSave();
  storage.setItem(CHALLENGE_SAVE_KEY, JSON.stringify(baseSave({ round: 2 })));
  storage.setItem(IMPORT_SLOT_KEY, JSON.stringify({ schemaVersion: 1 }));
  storage.setItem(AUTO_BACKUP_KEY, JSON.stringify([{ backupId: "b1", data: buildExportEnvelope(storageWithSave()) }]));
  const estimate = estimateLocalStorage(storage);
  assert.ok(estimate.totalBytes > 0);
  assert.ok(estimate.known.mainSave > 0);
  assert.ok(estimate.known.challengeSave > 0);
  assert.ok(estimate.known.importedSlot > 0);

  const trimmed = trimGameReports(storage);
  assert.equal(trimmed.ok, true);
  assert.equal(JSON.parse(storage.getItem(NORMAL_SAVE_KEY)).gameReports.length, 10);
});

test("validator normalizes safe old saves and rejects duplicate transactions within one bucket", () => {
  const good = validateBackupEnvelope({
    schemaVersion: 1,
    normalGameSave: baseSave({
      propertyTransactions: [{ id: "same" }],
      stockTransactions: [{ id: "same" }],
    }),
  });
  assert.equal(good.ok, true);

  const duplicate = validateBackupEnvelope({
    schemaVersion: 1,
    normalGameSave: baseSave({ propertyTransactions: [{ id: "dup" }, { id: "dup" }] }),
  });
  assert.equal(duplicate.ok, false);
  assert.equal(duplicate.errors.includes("normalDuplicateTransactions"), true);
});
