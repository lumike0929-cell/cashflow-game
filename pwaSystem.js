import { parseSavedState } from "./realEstateStorageMigration.js";
import { EXPERIENCE_SETTINGS_KEY } from "./gameExperience.js";
import { localeStorageKey, normalizeLocale } from "./i18n/index.js";

export const APP_VERSION = "1.23.0";
export const PWA_CACHE_VERSION = "cashflow-game-shell-v23";
export const BACKUP_SCHEMA_VERSION = 1;
export const NORMAL_SAVE_KEY = "cashflow-freedom-game-v1";
export const CHALLENGE_SAVE_KEY = "cashflow-freedom-challenge-v1";
export const AUTO_BACKUP_KEY = "cashflow-game-auto-backups-v1";
export const IMPORT_SLOT_KEY = "cashflow-game-imported-backup-v1";
export const INSTALL_PROMPT_KEY = "cashflow-game-install-dismissed-v1";
export const MAX_BACKUPS = 5;
export const MAX_IMPORT_BYTES = 640000;
export const MAX_REPORTS = 10;

const unsafeKeys = new Set(["__proto__", "prototype", "constructor"]);
const saveKeys = [NORMAL_SAVE_KEY, CHALLENGE_SAVE_KEY, EXPERIENCE_SETTINGS_KEY, localeStorageKey];

export function registerServiceWorker({ onUpdate, onStatus } = {}) {
  if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) {
    onStatus?.("unsupported");
    return Promise.resolve({ supported: false });
  }
  return navigator.serviceWorker.register("./sw.js").then((registration) => {
    onStatus?.("registered");
    registration.addEventListener("updatefound", () => {
      const worker = registration.installing;
      if (!worker) return;
      worker.addEventListener("statechange", () => {
        if (worker.state === "installed" && navigator.serviceWorker.controller) onUpdate?.(registration);
      });
    });
    return { supported: true, registration };
  }).catch(() => {
    onStatus?.("failed");
    return { supported: false, failed: true };
  });
}

export function applyServiceWorkerUpdate(registration) {
  const worker = registration?.waiting;
  if (!worker) return false;
  worker.postMessage({ type: "SKIP_WAITING" });
  return true;
}

export function listenNetworkStatus(callback) {
  if (typeof window === "undefined") return () => {};
  const notify = (online) => callback?.({ online, at: new Date().toISOString() });
  const onOnline = () => notify(true);
  const onOffline = () => notify(false);
  window.addEventListener("online", onOnline);
  window.addEventListener("offline", onOffline);
  notify(navigator.onLine !== false);
  return () => {
    window.removeEventListener("online", onOnline);
    window.removeEventListener("offline", onOffline);
  };
}

export function isStandaloneDisplay() {
  if (typeof window === "undefined") return false;
  return window.matchMedia?.("(display-mode: standalone)")?.matches || window.navigator?.standalone === true;
}

export function shouldShowInstallPrompt(storage, now = Date.now()) {
  if (isStandaloneDisplay()) return false;
  const parsed = safeJsonParse(storage?.getItem(INSTALL_PROMPT_KEY));
  const dismissedUntil = Number(parsed?.dismissedUntil || 0);
  return !Number.isFinite(dismissedUntil) || dismissedUntil <= now;
}

export function dismissInstallPrompt(storage, days = 14, now = Date.now()) {
  try {
    storage?.setItem(INSTALL_PROMPT_KEY, JSON.stringify({ dismissedUntil: now + days * 86400000 }));
    return true;
  } catch {
    return false;
  }
}

export function buildExportEnvelope(storage, options = {}) {
  const normalGameSave = pruneSave(readJsonFromStorage(storage, NORMAL_SAVE_KEY));
  const challengeSave = pruneSave(readJsonFromStorage(storage, CHALLENGE_SAVE_KEY));
  const settings = readJsonFromStorage(storage, EXPERIENCE_SETTINGS_KEY) || {};
  const localePreference = readJsonFromStorage(storage, localeStorageKey) || {};
  const locale = normalizeLocale(options.locale || localePreference.locale || normalGameSave?.locale);
  const now = options.now || new Date().toISOString();
  return {
    schemaVersion: BACKUP_SCHEMA_VERSION,
    exportedAt: now,
    appVersion: APP_VERSION,
    locale,
    normalGameSave,
    aiCompetitionSave: normalGameSave?.aiPlayers?.length ? pickAiSave(normalGameSave) : null,
    challengeSave,
    tutorialProgress: pickTutorial(normalGameSave, settings),
    achievements: safeArray(normalGameSave?.achievements),
    missions: {
      active: safeArray(normalGameSave?.activeMissions).slice(0, 3),
      completed: safeArray(normalGameSave?.completedMissions).slice(0, 80),
    },
    badges: safeArray(normalGameSave?.badges).slice(0, 80),
    gameReports: safeArray(normalGameSave?.gameReports).slice(0, MAX_REPORTS),
    settings,
    localePreference,
  };
}

export function serializeBackup(envelope) {
  const checked = validateBackupEnvelope(envelope);
  if (!checked.ok) return { ok: false, errors: checked.errors, text: "" };
  return { ok: true, text: `${JSON.stringify(checked.value, null, 2)}\n`, errors: [] };
}

export function backupFileName(date = new Date()) {
  const pad = (value) => String(value).padStart(2, "0");
  return `cashflow-game-backup-${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}-${pad(date.getHours())}${pad(date.getMinutes())}.json`;
}

export function parseImportText(text) {
  if (typeof text !== "string" || !text.trim()) return { ok: false, errors: ["empty"] };
  if (new TextEncoder().encode(text).length > MAX_IMPORT_BYTES) return { ok: false, errors: ["tooLarge"] };
  const parsed = safeJsonParse(text);
  if (!parsed) return { ok: false, errors: ["invalidJson"] };
  return validateBackupEnvelope(parsed);
}

export function validateBackupEnvelope(candidate) {
  const errors = [];
  const warnings = [];
  if (!candidate || typeof candidate !== "object" || Array.isArray(candidate)) errors.push("notObject");
  if (candidate && containsUnsafeKey(candidate)) errors.push("unsafeKey");
  if (errors.length) return { ok: false, errors, warnings };

  const schemaVersion = Math.round(Number(candidate.schemaVersion) || 0);
  if (schemaVersion < 1) errors.push("missingSchema");
  if (schemaVersion > BACKUP_SCHEMA_VERSION) errors.push("newerVersion");

  const value = sanitizePlainObject(candidate);
  value.schemaVersion = schemaVersion;
  value.appVersion = String(value.appVersion || "unknown").slice(0, 32);
  value.exportedAt = validIso(value.exportedAt) ? value.exportedAt : new Date().toISOString();
  value.locale = normalizeLocale(value.locale);
  value.normalGameSave = normalizeMaybeSave(value.normalGameSave, "normal", errors, warnings);
  value.challengeSave = normalizeMaybeSave(value.challengeSave, "challenge", errors, warnings);
  value.aiCompetitionSave = value.normalGameSave?.aiPlayers?.length ? pickAiSave(value.normalGameSave) : null;
  value.settings = sanitizePlainObject(value.settings || {});
  value.localePreference = sanitizePlainObject(value.localePreference || {});
  value.tutorialProgress = sanitizePlainObject(value.tutorialProgress || {});
  value.achievements = safeArray(value.achievements).slice(0, 120);
  value.missions = sanitizePlainObject(value.missions || {});
  value.badges = safeArray(value.badges).slice(0, 120);
  value.gameReports = safeArray(value.gameReports).slice(0, MAX_REPORTS);
  return { ok: errors.length === 0, value, errors, warnings, summary: summarizeEnvelope(value) };
}

export function importBackupToStorage(storage, envelope, { replace = true } = {}) {
  const checked = validateBackupEnvelope(envelope);
  if (!checked.ok) return { ok: false, errors: checked.errors };
  if (!replace) {
    try {
      storage?.setItem(IMPORT_SLOT_KEY, JSON.stringify(checked.value));
      return { ok: true, importedSlot: true, summary: checked.summary };
    } catch {
      return { ok: false, errors: ["storageFailed"] };
    }
  }
  createAutoBackup(storage, "import-before-replace");
  try {
    if (checked.value.normalGameSave) storage?.setItem(NORMAL_SAVE_KEY, JSON.stringify(checked.value.normalGameSave));
    if (checked.value.challengeSave) storage?.setItem(CHALLENGE_SAVE_KEY, JSON.stringify(checked.value.challengeSave));
    if (checked.value.settings) storage?.setItem(EXPERIENCE_SETTINGS_KEY, JSON.stringify(checked.value.settings));
    if (checked.value.locale) storage?.setItem(localeStorageKey, JSON.stringify({ locale: checked.value.locale, version: 1 }));
    return { ok: true, summary: checked.summary };
  } catch {
    return { ok: false, errors: ["storageFailed"] };
  }
}

export function createAutoBackup(storage, reason = "manual") {
  const envelope = buildExportEnvelope(storage);
  const checked = validateBackupEnvelope(envelope);
  if (!checked.ok) return { ok: false, errors: checked.errors };
  const backups = listAutoBackups(storage);
  const backup = {
    backupId: `backup-${Date.now()}-${Math.round(Math.random() * 10000)}`,
    createdAt: new Date().toISOString(),
    reason: String(reason).slice(0, 48),
    round: checked.summary.round,
    month: checked.summary.month,
    character: checked.summary.character,
    summary: checked.summary,
    data: checked.value,
  };
  const next = [backup, ...backups].slice(0, MAX_BACKUPS);
  try {
    storage?.setItem(AUTO_BACKUP_KEY, JSON.stringify(next));
    return { ok: true, backup, count: next.length };
  } catch {
    try {
      storage?.setItem(AUTO_BACKUP_KEY, JSON.stringify(next.slice(0, 2)));
      return { ok: true, backup, count: Math.min(2, next.length), trimmed: true };
    } catch {
      return { ok: false, errors: ["storageFailed"] };
    }
  }
}

export function listAutoBackups(storage) {
  const parsed = readJsonFromStorage(storage, AUTO_BACKUP_KEY);
  return safeArray(parsed)
    .filter((item) => item && typeof item === "object" && item.data)
    .slice(0, MAX_BACKUPS);
}

export function restoreAutoBackup(storage, backupId) {
  const backup = listAutoBackups(storage).find((item) => item.backupId === backupId);
  if (!backup) return { ok: false, errors: ["notFound"] };
  createAutoBackup(storage, "before-restore");
  return importBackupToStorage(storage, backup.data, { replace: true });
}

export function clearOldBackups(storage) {
  try {
    storage?.removeItem(AUTO_BACKUP_KEY);
    return { ok: true };
  } catch {
    return { ok: false, errors: ["storageFailed"] };
  }
}

export function trimGameReports(storage) {
  const save = readJsonFromStorage(storage, NORMAL_SAVE_KEY);
  if (!save || typeof save !== "object") return { ok: true, trimmed: 0 };
  const before = safeArray(save.gameReports).length;
  save.gameReports = safeArray(save.gameReports).slice(0, MAX_REPORTS);
  try {
    storage?.setItem(NORMAL_SAVE_KEY, JSON.stringify(save));
    return { ok: true, trimmed: Math.max(0, before - save.gameReports.length) };
  } catch {
    return { ok: false, errors: ["storageFailed"] };
  }
}

export function estimateLocalStorage(storage) {
  const items = {};
  let totalBytes = 0;
  for (let index = 0; index < (storage?.length || 0); index += 1) {
    const key = storage.key(index);
    const value = storage.getItem(key) || "";
    const bytes = new TextEncoder().encode(`${key}${value}`).length;
    items[key] = bytes;
    totalBytes += bytes;
  }
  return {
    totalBytes,
    items,
    known: {
      mainSave: items[NORMAL_SAVE_KEY] || 0,
      challengeSave: items[CHALLENGE_SAVE_KEY] || 0,
      settings: items[EXPERIENCE_SETTINGS_KEY] || 0,
      backups: items[AUTO_BACKUP_KEY] || 0,
      importedSlot: items[IMPORT_SLOT_KEY] || 0,
    },
  };
}

export async function clearOfflineCaches() {
  if (typeof caches === "undefined") return { ok: true, cleared: 0 };
  const keys = await caches.keys();
  const targets = keys.filter((key) => key.startsWith("cashflow-game-"));
  await Promise.all(targets.map((key) => caches.delete(key)));
  return { ok: true, cleared: targets.length };
}

export function summarizeEnvelope(envelope) {
  const save = envelope?.normalGameSave || envelope?.challengeSave || {};
  return {
    appVersion: String(envelope?.appVersion || "unknown"),
    exportedAt: envelope?.exportedAt || "",
    locale: normalizeLocale(envelope?.locale),
    character: save.career?.name || save.career?.id || "unknown",
    round: finitePositive(save.round, 1),
    month: finitePositive(save.month, 1),
    cash: finiteMoney(save.cash),
    netWorth: finiteMoney(save.netWorth || 0),
    aiPlayers: safeArray(save.aiPlayers).length,
    reports: safeArray(envelope?.gameReports).length,
  };
}

function normalizeMaybeSave(save, label, errors, warnings) {
  if (save === null || save === undefined) return null;
  if (!save || typeof save !== "object" || Array.isArray(save)) {
    errors.push(`${label}SaveInvalid`);
    return null;
  }
  if (safeArray(save.aiPlayers).length > 3) errors.push(`${label}TooManyAi`);
  if (hasDuplicateTransactions(save)) errors.push(`${label}DuplicateTransactions`);
  const migrated = parseSavedState(JSON.stringify(save));
  if (!migrated) {
    errors.push(`${label}MigrationFailed`);
    return null;
  }
  if (migrated.round < 1 || migrated.month < 1) warnings.push(`${label}DateNormalized`);
  return pruneSave(migrated);
}

function pruneSave(save) {
  if (!save || typeof save !== "object") return null;
  const copy = sanitizePlainObject(save);
  copy.logs = safeArray(copy.logs).slice(0, 20);
  copy.gameReports = safeArray(copy.gameReports).slice(0, MAX_REPORTS);
  copy.pendingNotifications = safeArray(copy.pendingNotifications).slice(0, 20);
  copy.roundHistory = safeArray(copy.roundHistory).slice(0, 20);
  copy.marketNews = safeArray(copy.marketNews).slice(0, 12);
  copy.aiActionSummaries = safeArray(copy.aiActionSummaries).slice(0, 20);
  trimHistory(copy, "propertyTransactions", 140);
  trimHistory(copy, "stockTransactions", 140);
  trimHistory(copy, "businessTransactions", 140);
  trimHistory(copy, "bankTransactions", 120);
  trimHistory(copy, "insuranceClaims", 80);
  trimHistory(copy, "lifeEventHistory", 120);
  trimHistory(copy, "transactionHistory", 160);
  return copy;
}

function trimHistory(target, key, limit) {
  if (Array.isArray(target[key])) target[key] = target[key].slice(0, limit);
}

function pickAiSave(save) {
  return {
    gameMode: save.gameMode || "solo",
    aiDifficulty: save.aiDifficulty || "standard",
    aiPlayers: safeArray(save.aiPlayers).slice(0, 3),
    turnOrder: safeArray(save.turnOrder).slice(0, 4),
    currentActorId: save.currentActorId || "player",
    marketCycle: save.marketCycle || null,
    leaderboardSettings: save.leaderboardSettings || null,
  };
}

function pickTutorial(save, settings) {
  return {
    tutorialVersion: save?.tutorialVersion || 0,
    tutorialCompleted: Boolean(save?.tutorialCompleted || settings?.tutorialComplete),
    tutorialCurrentStep: save?.tutorialCurrentStep || "welcome",
    tutorialChapterProgress: save?.tutorialChapterProgress || {},
    onboardingCompleted: Boolean(save?.onboardingCompleted || settings?.onboardingCompleted),
    glossaryViewedTerms: safeArray(save?.glossaryViewedTerms),
    beginnerMissionProgress: save?.beginnerMissionProgress || {},
  };
}

function hasDuplicateTransactions(save) {
  const buckets = [
    save.propertyTransactions,
    save.stockTransactions,
    save.businessTransactions,
    save.bankTransactions,
    save.lifeEventHistory,
    save.transactionHistory,
  ];
  for (const bucket of buckets) {
    const ids = new Set();
    for (const item of safeArray(bucket)) {
      const id = item?.id || item?.transactionId;
      if (!id) continue;
      if (ids.has(id)) return true;
      ids.add(id);
    }
  }
  return false;
}

function containsUnsafeKey(value, seen = new WeakSet()) {
  if (!value || typeof value !== "object") return false;
  if (seen.has(value)) return false;
  seen.add(value);
  for (const key of Object.keys(value)) {
    if (unsafeKeys.has(key)) return true;
    if (containsUnsafeKey(value[key], seen)) return true;
  }
  return false;
}

function sanitizePlainObject(value, depth = 0) {
  if (depth > 18) return null;
  if (Array.isArray(value)) return value.slice(0, 300).map((item) => sanitizePlainObject(item, depth + 1));
  if (!value || typeof value !== "object") return sanitizePrimitive(value);
  const clean = {};
  Object.entries(value).forEach(([key, item]) => {
    if (unsafeKeys.has(key)) return;
    clean[String(key).slice(0, 80)] = sanitizePlainObject(item, depth + 1);
  });
  return clean;
}

function sanitizePrimitive(value) {
  if (typeof value === "number") return finiteMoney(value);
  if (typeof value === "string") return value.slice(0, 1800);
  if (typeof value === "boolean" || value === null) return value;
  return null;
}

function readJsonFromStorage(storage, key) {
  return safeJsonParse(storage?.getItem(key));
}

export function safeJsonParse(raw) {
  if (typeof raw !== "string" || !raw.trim()) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function safeArray(value) {
  return Array.isArray(value) ? value.filter((item) => item !== undefined) : [];
}

function finiteMoney(value) {
  const number = Number(value);
  if (!Number.isFinite(number)) return 0;
  const rounded = Math.round(number);
  return Object.is(rounded, -0) ? 0 : Math.max(-999999999, Math.min(999999999, rounded));
}

function finitePositive(value, fallback) {
  const number = Math.round(Number(value));
  return Number.isFinite(number) && number > 0 ? number : fallback;
}

function validIso(value) {
  return typeof value === "string" && !Number.isNaN(Date.parse(value));
}
