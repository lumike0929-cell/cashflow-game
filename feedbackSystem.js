import { releaseInfo } from "./releaseInfo.js";

export const FEEDBACK_TRACE_KEY = "cashflow-game-feedback-trace-v1";
export const FEEDBACK_ERROR_KEY = "cashflow-game-feedback-errors-v1";
export const MAX_TRACE_ITEMS = 50;
export const MAX_ERROR_ITEMS = 20;

export const feedbackIssueTypes = [
  "stuck",
  "button",
  "finance",
  "layout",
  "save",
  "offline",
  "translation",
  "tutorial",
  "ai",
  "other",
];

export const feedbackErrorCodes = [
  "SAVE_WRITE_FAILED",
  "SAVE_PARSE_FAILED",
  "SAVE_MIGRATION_FAILED",
  "BACKUP_RESTORE_FAILED",
  "EVENT_RESOLUTION_FAILED",
  "TRANSACTION_ROLLBACK",
  "AI_TURN_TIMEOUT",
  "AI_INVALID_ACTION",
  "MARKET_UPDATE_FAILED",
  "I18N_KEY_MISSING",
  "SERVICE_WORKER_FAILED",
  "OFFLINE_CACHE_MISSING",
  "IMPORT_INVALID_FILE",
  "IMPORT_VERSION_UNSUPPORTED",
  "AUDIO_INIT_FAILED",
  "CANVAS_EXPORT_FAILED",
  "UI_TARGET_MISSING",
];

export const rc2IssuePriorities = ["P0", "P1", "P2", "P3", "P4"];
export const rc2IssueCategories = [
  "Core Gameplay",
  "Finance",
  "Save",
  "AI",
  "Market",
  "Tutorial",
  "i18n",
  "PWA",
  "Offline",
  "UI",
  "Accessibility",
  "Performance",
];

export function recordFeedbackTrace(storage, type, details = {}) {
  const trace = readList(storage, FEEDBACK_TRACE_KEY).slice(0, MAX_TRACE_ITEMS - 1);
  const item = {
    type: safeEnum(type, [
      "APP_STARTED",
      "GAME_STARTED",
      "GAME_LOADED",
      "DICE_ROLLED",
      "PLAYER_MOVED",
      "EVENT_OPENED",
      "EVENT_RESOLVED",
      "TRANSACTION_COMPLETED",
      "TRANSACTION_FAILED",
      "AI_TURN_STARTED",
      "AI_TURN_COMPLETED",
      "MARKET_UPDATED",
      "SAVE_COMPLETED",
      "SAVE_FAILED",
      "LOCALE_CHANGED",
      "APP_WENT_OFFLINE",
      "APP_WENT_ONLINE",
      "UPDATE_STARTED",
      "UPDATE_COMPLETED",
    ], "APP_STARTED"),
    at: new Date().toISOString(),
    screen: safeText(details.screen || "unknown", 48),
  };
  return writeList(storage, FEEDBACK_TRACE_KEY, [item, ...trace]);
}

export function recordFeedbackError(storage, code, message = "") {
  const normalized = safeEnum(code, feedbackErrorCodes, "UI_TARGET_MISSING");
  const errors = readList(storage, FEEDBACK_ERROR_KEY).filter((item) => item.code !== normalized).slice(0, MAX_ERROR_ITEMS - 1);
  return writeList(storage, FEEDBACK_ERROR_KEY, [{
    code: normalized,
    message: sanitizeDiagnosticText(message, 140),
    at: new Date().toISOString(),
  }, ...errors]);
}

export function clearFeedbackDiagnostics(storage) {
  try {
    storage?.removeItem(FEEDBACK_TRACE_KEY);
    storage?.removeItem(FEEDBACK_ERROR_KEY);
    return { ok: true };
  } catch {
    return { ok: false };
  }
}

export function buildDiagnosticsSummary({ storage, state, locale, online, viewport, displayMode, currentScreen, qualityMode, reducedMotion }) {
  const safeState = state && typeof state === "object" ? state : {};
  return {
    appVersion: releaseInfo.appVersion,
    releaseChannel: releaseInfo.releaseChannel,
    releaseLabel: releaseInfo.releaseLabel,
    nextFixTarget: releaseInfo.nextFixTarget,
    saveSchemaVersion: releaseInfo.saveSchemaVersion,
    translationSchemaVersion: releaseInfo.translationSchemaVersion,
    serviceWorkerVersion: releaseInfo.serviceWorkerVersion,
    locale: safeText(locale || "unknown", 12),
    displayMode: safeText(displayMode || "browser", 24),
    online: Boolean(online),
    viewport: {
      width: safeNumber(viewport?.width),
      height: safeNumber(viewport?.height),
    },
    browserType: simplifyUserAgent(globalThis.navigator?.userAgent || ""),
    platformType: simplifyPlatform(globalThis.navigator?.platform || ""),
    pwaInstalled: displayMode === "standalone",
    reducedMotion: Boolean(reducedMotion),
    qualityMode: safeText(qualityMode || "standard", 24),
    gameMode: safeText(safeState.gameMode || "solo", 24),
    currentRound: safeNumber(safeState.round),
    currentMonth: safeNumber(safeState.month),
    currentActorType: safeState.currentActorId && safeState.currentActorId !== "player" ? "ai" : "player",
    currentScreen: safeText(currentScreen || "unknown", 48),
    hasActiveEvent: Boolean(safeState.activeEvent || safeState.pendingEvent || safeState.eventInProgress),
    saveExists: Boolean(storage?.getItem("cashflow-freedom-game-v1")),
    backupExists: Boolean(storage?.getItem("cashflow-game-auto-backups-v1")),
    lastSuccessfulSaveAt: safeText(safeState.lastSavedAt || "", 40),
    lastErrorCode: readList(storage, FEEDBACK_ERROR_KEY)[0]?.code || "",
    recentErrors: readList(storage, FEEDBACK_ERROR_KEY).slice(0, MAX_ERROR_ITEMS),
    recentTrace: readList(storage, FEEDBACK_TRACE_KEY).slice(0, MAX_TRACE_ITEMS),
  };
}

export function buildGameStateSummary(state, { exactCash = false } = {}) {
  const safeState = state && typeof state === "object" ? state : {};
  const recentTransactions = [
    ...safeArray(safeState.propertyTransactions),
    ...safeArray(safeState.stockTransactions),
    ...safeArray(safeState.businessTransactions),
    ...safeArray(safeState.bankTransactions),
    ...safeArray(safeState.lifeEventHistory),
  ]
    .slice(-5)
    .map((item) => ({
      id: safeText(item.id || item.transactionId || "unknown", 64),
      type: safeText(item.type || item.category || "unknown", 48),
    }));
  return {
    gameMode: safeText(safeState.gameMode || "solo", 24),
    round: safeNumber(safeState.round),
    month: safeNumber(safeState.month),
    careerId: safeText(safeState.career?.id || "unknown", 40),
    boardPosition: safeNumber(safeState.position),
    marketPhase: safeText(safeState.marketCycle?.phase || "unknown", 24),
    cash: exactCash ? safeNumber(safeState.cash) : cashBand(safeState.cash),
    assetCount: safeArray(safeState.assets).length + safeArray(safeState.ownedProperties).length + safeArray(safeState.businessHoldings).length,
    liabilityCount: safeArray(safeState.liabilities).length,
    hasStocks: safeArray(safeState.stockHoldings).length > 0,
    hasRealEstate: safeArray(safeState.ownedProperties).length > 0,
    hasBusiness: safeArray(safeState.businessHoldings).length > 0,
    unemployed: Boolean(safeState.unemployment?.unemployed),
    hasAi: safeArray(safeState.aiPlayers).length > 0,
    uiState: safeText(safeState.turnPhase || "unknown", 32),
    currentEventId: safeText(safeState.activeEvent?.id || safeState.pendingEvent?.id || "", 64),
    recentTransactions,
  };
}

export function buildFeedbackReport(form, diagnostics, gameSummary = null) {
  const report = {
    reportSchemaVersion: 1,
    createdAt: new Date().toISOString(),
    issueType: safeEnum(form.issueType, feedbackIssueTypes, "other"),
    screen: safeText(form.screen, 60),
    summary: safeText(form.summary, 240),
    steps: safeText(form.steps, 900),
    expected: safeText(form.expected, 500),
    actual: safeText(form.actual, 500),
    frequency: safeEnum(form.frequency, ["now", "always", "sometimes", "once", "unsure"], "unsure"),
    affectsSave: Boolean(form.affectsSave),
    includeDiagnostics: Boolean(form.includeDiagnostics),
    includeGameSummary: Boolean(form.includeGameSummary),
    diagnostics: form.includeDiagnostics ? diagnostics : null,
    gameSummary: form.includeGameSummary ? gameSummary : null,
    privacyNote: "No account, cookie, IP, exact location, full localStorage, or full save data is included.",
  };
  return stripUnsafe(report);
}

export function feedbackReportToMarkdown(report, labels = {}) {
  const line = (key, value) => `- ${labels[key] || key}: ${value || "-"}`;
  return [
    `# ${labels.title || "Cashflow Game Feedback"}`,
    line("issueType", report.issueType),
    line("screen", report.screen),
    line("summary", report.summary),
    line("frequency", report.frequency),
    line("affectsSave", report.affectsSave ? "yes" : "no"),
    "",
    `## ${labels.steps || "Steps"}`,
    report.steps || "-",
    "",
    `## ${labels.expected || "Expected"}`,
    report.expected || "-",
    "",
    `## ${labels.actual || "Actual"}`,
    report.actual || "-",
    "",
    `## ${labels.diagnostics || "Diagnostics"}`,
    report.diagnostics ? `\`\`\`json\n${JSON.stringify(report.diagnostics, null, 2)}\n\`\`\`` : labels.notIncluded || "Not included",
    "",
    `## ${labels.gameSummary || "Game Summary"}`,
    report.gameSummary ? `\`\`\`json\n${JSON.stringify(report.gameSummary, null, 2)}\n\`\`\`` : labels.notIncluded || "Not included",
  ].join("\n");
}

export function feedbackFileName(extension = "json", date = new Date()) {
  const pad = (value) => String(value).padStart(2, "0");
  const stamp = `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}-${pad(date.getHours())}${pad(date.getMinutes())}`;
  return `cashflow-feedback-${releaseInfo.releaseLabel.replace(/\s+/g, "-").toLowerCase()}-${stamp}.${extension}`;
}

export function knownIssuesForRelease() {
  return [];
}

function readList(storage, key) {
  try {
    const parsed = JSON.parse(storage?.getItem(key) || "[]");
    return Array.isArray(parsed) ? parsed.filter((item) => item && typeof item === "object") : [];
  } catch {
    return [];
  }
}

function writeList(storage, key, list) {
  try {
    storage?.setItem(key, JSON.stringify(list));
    return true;
  } catch {
    return false;
  }
}

function stripUnsafe(value, depth = 0) {
  if (depth > 8) return null;
  if (Array.isArray(value)) return value.slice(0, 80).map((item) => stripUnsafe(item, depth + 1));
  if (!value || typeof value !== "object") return value;
  const clean = {};
  Object.entries(value).forEach(([key, item]) => {
    if (["__proto__", "prototype", "constructor"].includes(key)) return;
    clean[key] = stripUnsafe(item, depth + 1);
  });
  return clean;
}

function simplifyUserAgent(userAgent) {
  const value = String(userAgent).toLowerCase();
  if (value.includes("edg/")) return "Edge";
  if (value.includes("chrome/") || value.includes("crios/")) return "Chrome";
  if (value.includes("safari/")) return "Safari";
  if (value.includes("firefox/")) return "Firefox";
  return "Other";
}

function simplifyPlatform(platform) {
  const value = String(platform).toLowerCase();
  if (value.includes("iphone") || value.includes("ipad")) return "iOS";
  if (value.includes("android")) return "Android";
  if (value.includes("mac")) return "macOS";
  if (value.includes("win")) return "Windows";
  if (value.includes("linux")) return "Linux";
  return "Other";
}

function cashBand(value) {
  const amount = safeNumber(value);
  if (amount < 0) return "negative";
  if (amount < 10000) return "0-9999";
  if (amount < 50000) return "10000-49999";
  if (amount < 100000) return "50000-99999";
  return "100000+";
}

function safeArray(value) {
  return Array.isArray(value) ? value : [];
}

function safeNumber(value) {
  const number = Math.round(Number(value) || 0);
  return Number.isFinite(number) && !Object.is(number, -0) ? number : 0;
}

function safeText(value, limit) {
  return String(value || "").replace(/[\u0000-\u001f]/g, " ").slice(0, limit);
}

function sanitizeDiagnosticText(value, limit) {
  return safeText(value, limit)
    .replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, "[redacted-email]")
    .replace(/\/Users\/[^\s]+/g, "[redacted-path]")
    .replace(/[A-Za-z]:\\[^\s]+/g, "[redacted-path]");
}

function safeEnum(value, allowed, fallback) {
  const next = String(value || "");
  return allowed.includes(next) ? next : fallback;
}
