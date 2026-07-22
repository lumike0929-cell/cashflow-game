import assert from "node:assert/strict";
import test from "node:test";
import {
  FEEDBACK_ERROR_KEY,
  FEEDBACK_TRACE_KEY,
  MAX_ERROR_ITEMS,
  MAX_TRACE_ITEMS,
  buildDiagnosticsSummary,
  buildFeedbackReport,
  buildGameStateSummary,
  clearFeedbackDiagnostics,
  feedbackErrorCodes,
  feedbackFileName,
  feedbackIssueTypes,
  feedbackReportToMarkdown,
  knownIssuesForRelease,
  rc2IssueCategories,
  rc2IssuePriorities,
  recordFeedbackError,
  recordFeedbackTrace,
} from "../feedbackSystem.js";
import { releaseInfo } from "../releaseInfo.js";

class MemoryStorage {
  constructor() {
    this.map = new Map();
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
}

function sampleState(overrides = {}) {
  return {
    gameMode: "ai-race",
    round: 8,
    month: 3,
    position: 12,
    cash: 42000,
    currentActorId: "ai-1",
    marketCycle: { phase: "expansion" },
    career: { id: "teacher", name: "Do Not Export Name" },
    stockHoldings: [{ stockId: "growth" }],
    ownedProperties: [{ id: "property-1" }],
    businessHoldings: [],
    liabilities: [{ id: "loan-1" }],
    aiPlayers: [{ id: "ai-1" }],
    stockTransactions: [{ id: "tx-stock-1", type: "buy", note: "private details" }],
    propertyTransactions: [{ id: "tx-home-1", type: "buy", amount: 100000 }],
    activeEvent: { id: "event-1" },
    lastSavedAt: "2026-07-22T10:00:00.000Z",
    ...overrides,
  };
}

test("feedback constants cover beta issue categories, error codes, and RC2 triage", () => {
  assert.equal(feedbackIssueTypes.length, 10);
  assert.equal(feedbackIssueTypes.includes("translation"), true);
  assert.equal(feedbackIssueTypes.includes("ai"), true);
  assert.equal(feedbackErrorCodes.includes("SAVE_WRITE_FAILED"), true);
  assert.equal(feedbackErrorCodes.includes("AI_TURN_TIMEOUT"), true);
  assert.equal(feedbackErrorCodes.includes("SERVICE_WORKER_FAILED"), true);
  assert.deepEqual(rc2IssuePriorities, ["P0", "P1", "P2", "P3", "P4"]);
  assert.equal(rc2IssueCategories.includes("Accessibility"), true);
  assert.deepEqual(knownIssuesForRelease(), []);
});

test("diagnostics are whitelist based and never serialize full storage or sensitive device text", () => {
  const storage = new MemoryStorage();
  storage.setItem("cashflow-freedom-game-v1", JSON.stringify(sampleState({ cash: 999999 })));
  storage.setItem("vercel-token", "secret-token");
  storage.setItem("email", "child@example.com");
  recordFeedbackTrace(storage, "GAME_STARTED", { screen: "home" });
  recordFeedbackError(storage, "SAVE_WRITE_FAILED", "quota child@example.com /Users/private");

  const previousNavigator = globalThis.navigator;
  Object.defineProperty(globalThis, "navigator", {
    configurable: true,
    value: { userAgent: "Mozilla/5.0 very-long-agent child@example.com Chrome/120", platform: "MacIntel" },
  });
  const diagnostics = buildDiagnosticsSummary({
    storage,
    state: sampleState(),
    locale: "zh-TW",
    online: false,
    viewport: { width: 390, height: 844 },
    displayMode: "standalone",
    currentScreen: "board",
    qualityMode: "standard",
    reducedMotion: true,
  });
  Object.defineProperty(globalThis, "navigator", { configurable: true, value: previousNavigator });

  const text = JSON.stringify(diagnostics);
  assert.equal(diagnostics.releaseChannel, "Public Beta");
  assert.equal(diagnostics.browserType, "Chrome");
  assert.equal(diagnostics.platformType, "macOS");
  assert.equal(diagnostics.saveExists, true);
  assert.equal(text.includes("999999"), false);
  assert.equal(text.includes("secret-token"), false);
  assert.equal(text.includes("child@example.com"), false);
  assert.equal(text.includes("Mozilla/5.0"), false);
  assert.equal(text.includes("/Users/"), false);
});

test("game state summary is small, optional exact cash is explicit, and transactions are limited", () => {
  const banded = buildGameStateSummary(sampleState(), { exactCash: false });
  assert.equal(banded.cash, "10000-49999");
  assert.equal(banded.careerId, "teacher");
  assert.equal(banded.hasAi, true);
  assert.equal(banded.recentTransactions.length <= 5, true);
  assert.equal(JSON.stringify(banded).includes("private details"), false);

  const exact = buildGameStateSummary(sampleState(), { exactCash: true });
  assert.equal(exact.cash, 42000);
});

test("feedback report only includes diagnostics and game summary when the player opts in", () => {
  const diagnostics = { appVersion: releaseInfo.appVersion, token: "must-not-appear" };
  const gameSummary = { round: 3, cash: "0-9999" };
  const report = buildFeedbackReport({
    issueType: "finance",
    screen: "board",
    summary: "Numbers changed after a card.",
    steps: "Roll, resolve the card.",
    expected: "Cash should change once.",
    actual: "It seemed to change twice.",
    frequency: "sometimes",
    affectsSave: true,
    includeDiagnostics: false,
    includeGameSummary: false,
    __proto__: { polluted: true },
  }, diagnostics, gameSummary);

  assert.equal(report.diagnostics, null);
  assert.equal(report.gameSummary, null);
  assert.equal(report.issueType, "finance");
  assert.equal({}.polluted, undefined);

  const included = buildFeedbackReport({
    issueType: "save",
    screen: "settings",
    summary: "Import failed.",
    frequency: "once",
    includeDiagnostics: true,
    includeGameSummary: true,
  }, diagnostics, gameSummary);
  assert.equal(included.diagnostics.appVersion, releaseInfo.appVersion);
  assert.equal(included.gameSummary.round, 3);
  assert.equal(JSON.stringify(included).includes("__proto__"), false);
});

test("trace and error logs are capped and clearing diagnostics keeps game saves", () => {
  const storage = new MemoryStorage();
  storage.setItem("cashflow-freedom-game-v1", "save");
  for (let index = 0; index < MAX_TRACE_ITEMS + 10; index += 1) {
    recordFeedbackTrace(storage, "DICE_ROLLED", { screen: `screen-${index}` });
  }
  for (let index = 0; index < MAX_ERROR_ITEMS + 10; index += 1) {
    recordFeedbackError(storage, feedbackErrorCodes[index % feedbackErrorCodes.length], `error-${index}`);
  }
  assert.equal(JSON.parse(storage.getItem(FEEDBACK_TRACE_KEY)).length, MAX_TRACE_ITEMS);
  assert.equal(JSON.parse(storage.getItem(FEEDBACK_ERROR_KEY)).length <= MAX_ERROR_ITEMS, true);
  assert.equal(clearFeedbackDiagnostics(storage).ok, true);
  assert.equal(storage.getItem(FEEDBACK_TRACE_KEY), null);
  assert.equal(storage.getItem(FEEDBACK_ERROR_KEY), null);
  assert.equal(storage.getItem("cashflow-freedom-game-v1"), "save");
});

test("feedback markdown and file names are local export friendly", () => {
  const report = buildFeedbackReport({
    issueType: "layout",
    screen: "home",
    summary: "Button overlaps text.",
    steps: "Open on small phone.",
    expected: "Button stays visible.",
    actual: "It overlaps.",
    frequency: "always",
    includeDiagnostics: true,
  }, { appVersion: releaseInfo.appVersion }, null);
  const markdown = feedbackReportToMarkdown(report, { title: "Cashflow Test Report", notIncluded: "Not included" });
  assert.match(markdown, /Cashflow Test Report/);
  assert.match(markdown, /Button overlaps text/);
  assert.match(feedbackFileName("json", new Date("2026-07-22T03:04:00")), /cashflow-feedback-rc1-public-beta-2026-07-22-0304\.json/);
});
