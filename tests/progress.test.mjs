import test from "node:test";
import assert from "node:assert/strict";
import {
  achievementDefinitions,
  addReport,
  badgeDefinitions,
  buildAchievementGroups,
  buildBadgeCollection,
  buildChallengeCards,
  buildMilestoneTimeline,
  buildMissionCards,
  buildProgressDashboard,
  buildReportSections,
  calculateFinancialFreedomProgress,
  challengeDefinitions,
  claimCompletedMissions,
  continueFreedomMode,
  createDifficultyAdjustedCareer,
  createGameReport,
  createShareCard,
  difficultyModes,
  evaluateFinancialPressure,
  evaluateProgress,
  evaluateVictoryState,
  migrateProgressState,
  milestoneDefinitions,
  missionTemplates,
  nextProgressNotification,
  recordProgressEvent,
  refreshActiveMissions,
  startChallengeState,
} from "../progressSystem.js";

function baseState(overrides = {}) {
  return migrateProgressState({
    month: 1,
    round: 1,
    cash: 20000,
    salary: 18000,
    baseExpenses: 12000,
    assets: [],
    liabilities: [],
    ownedProperties: [],
    propertyTransactions: [],
    stockHoldings: [],
    stockTransactions: [],
    businessHoldings: [],
    businessTransactions: [],
    bankTransactions: [],
    insurancePolicies: [],
    insuranceClaims: [],
    lifeEventHistory: [],
    lifeActiveEffects: [],
    emergencyDebt: 0,
    gameOver: false,
    logs: [],
    ...overrides,
  });
}

test("财务自由进度计算正确且支出为零不产生异常", () => {
  const state = baseState({
    baseExpenses: 10000,
    ownedProperties: [{ monthlyRent: 6000, monthlyExpenses: 1000, mortgagePayment: 0, currentValue: 100000, mortgageBalance: 0 }],
  });
  const progress = calculateFinancialFreedomProgress(state);
  assert.equal(progress.passiveIncome, 6000);
  assert.equal(progress.necessaryExpenses, 11000);
  assert.equal(progress.remaining, 5000);
  assert.equal(progress.stage, "现金流成长");

  const zeroExpense = baseState({ baseExpenses: 0, salary: 0 });
  const safe = calculateFinancialFreedomProgress(zeroExpense);
  assert.equal(Number.isFinite(safe.percent), true);
  assert.equal(safe.percent, 0);
});

test("胜利只触发一次，未完成事件不会触发胜利，自由模式可继续", () => {
  const state = baseState({
    baseExpenses: 1000,
    ownedProperties: [{ monthlyRent: 1500, monthlyExpenses: 0, mortgagePayment: 0, currentValue: 100000, mortgageBalance: 0 }],
  });
  const blocked = evaluateVictoryState(state, { turnPhase: "resolvingEvent", hasOpenEvent: true });
  assert.equal(blocked.triggered, false);
  assert.equal(blocked.blocked, true);

  const first = evaluateVictoryState(state, { turnPhase: "idle", hasOpenEvent: false });
  assert.equal(first.triggered, true);
  assert.equal(state.victoryState.triggered, true);
  const second = evaluateVictoryState(state, { turnPhase: "idle", hasOpenEvent: false });
  assert.equal(second.triggered, false);
  continueFreedomMode(state);
  assert.equal(state.gameOver, false);
  assert.equal(state.victoryState.continued, true);
});

test("里程碑、成就和徽章只解锁一次并可排队", () => {
  const state = baseState({
    round: 12,
    cash: 60000,
    ownedProperties: [{ monthlyRent: 2000, monthlyExpenses: 100, mortgagePayment: 0, currentValue: 120000, mortgageBalance: 0 }],
    stockTransactions: [{ type: "买入", cashChange: -1000 }],
    businessHoldings: [{ currentValue: 20000, cumulativeProfit: 12000 }],
    businessTransactions: [{ type: "升級" }],
    insurancePolicies: [{ active: true, monthlyPremium: 200 }],
  });
  const first = evaluateProgress(state, { turnPhase: "idle", hasOpenEvent: false });
  assert.ok(first.unlocked.length >= 3);
  const unlockedAfterFirst = state.achievements.filter((item) => item.unlocked).length;
  const second = evaluateProgress(state, { turnPhase: "idle", hasOpenEvent: false });
  assert.equal(second.unlocked.length, 0);
  assert.equal(state.achievements.filter((item) => item.unlocked).length, unlockedAfterFirst);
  assert.ok(state.unlockQueue.length >= 1);
  assert.ok(milestoneDefinitions.length >= 20);
  assert.ok(achievementDefinitions.length >= 30);
  assert.ok(badgeDefinitions.length >= 10);
});

test("任务进度可更新、领取并在刷新迁移后恢复", () => {
  const state = baseState({ cash: 15000 });
  assert.equal(state.activeMissions.length, 3);
  recordProgressEvent(state, "propertyCard");
  evaluateProgress(state, { turnPhase: "idle", hasOpenEvent: false });
  assert.equal(state.activeMissions.some((item) => item.id === "property-card" && item.completed), true);
  const claimed = claimCompletedMissions(state);
  assert.equal(claimed.length >= 1, true);
  const restored = migrateProgressState(JSON.parse(JSON.stringify(state)));
  assert.equal(restored.completedMissions.length >= 1, true);
  assert.equal(restored.activeMissions.length <= 3, true);
  assert.ok(missionTemplates.length >= 10);
});

test("Sprint 17 进度中心派生资料完整且任务刷新有冷却", () => {
  const state = baseState({
    cash: 70000,
    round: 16,
    month: 6,
    ownedProperties: [{ monthlyRent: 9000, monthlyExpenses: 500, mortgagePayment: 0, currentValue: 200000, mortgageBalance: 0 }],
    insurancePolicies: [{ active: true, monthlyPremium: 300 }],
  });
  evaluateProgress(state, { turnPhase: "idle", hasOpenEvent: false });
  const dashboard = buildProgressDashboard(state);
  assert.equal(Number.isFinite(dashboard.percent), true);
  assert.ok(dashboard.passiveSources.length >= 1);
  assert.ok(dashboard.expenseSources.length >= 1);

  const missions = buildMissionCards(state);
  assert.equal(missions.length <= 3, true);
  assert.ok(missions[0].status.length > 0);
  assert.ok(missions[0].howToComplete.length > 0);

  const refreshed = refreshActiveMissions(state);
  assert.equal(refreshed.refreshed, true);
  const cooldown = refreshActiveMissions(state);
  assert.equal(cooldown.refreshed, false);
  assert.ok(cooldown.nextAllowedRound > state.round);
});

test("Sprint 17 成就、徽章、时间线、通知队列和报告资料可展示", () => {
  const state = baseState({
    round: 18,
    cash: 90000,
    stockTransactions: [{ type: "买入", cashChange: -1000 }],
    ownedProperties: [{ monthlyRent: 7000, monthlyExpenses: 200, mortgagePayment: 0, currentValue: 180000, mortgageBalance: 0 }],
    businessHoldings: [{ currentValue: 30000, cumulativeProfit: 12000 }],
    businessTransactions: [{ type: "升級" }],
    insurancePolicies: [{ active: true, monthlyPremium: 100 }],
  });
  evaluateProgress(state, { turnPhase: "idle", hasOpenEvent: false });
  const groups = buildAchievementGroups(state, "all", "all");
  assert.ok(Object.keys(groups).length >= 1);
  const unlocked = buildAchievementGroups(state, "unlocked", "all");
  assert.ok(Object.values(unlocked).flat().length >= 1);
  const badges = buildBadgeCollection(state);
  assert.equal(badges.length, badgeDefinitions.length);
  assert.ok(badges.some((item) => item.unlocked));
  const timeline = buildMilestoneTimeline(state);
  assert.ok(timeline.length >= 1);
  const rounds = timeline.map((item) => item.round || 0);
  assert.deepEqual(rounds, rounds.slice().sort((a, b) => a - b));
  const notification = nextProgressNotification(state);
  assert.ok(notification);
  const duplicate = state.shownNotificationIds.includes(notification.notificationId);
  assert.equal(duplicate, true);

  for (let index = 0; index < 12; index += 1) {
    const report = createGameReport({ ...state, round: index + 1 }, "manual");
    addReport(state, { ...report, id: `manual-${index}` });
  }
  assert.equal(state.gameReports.length, 10);
  const sections = buildReportSections(state, state.gameReports[0]);
  assert.ok(sections.summary.length >= 6);
  assert.ok(sections.sections.length >= 7);
  const share = createShareCard(state, state.gameReports[0]);
  assert.ok(share.dataUrl.startsWith("data:image/svg+xml"));
  assert.match(share.text, /现金流冒险城/);
});

test("Sprint 17 挑战卡保留正常存档并保存最佳成绩", () => {
  const normal = baseState({ cash: 20000, round: 9, liabilities: [{ balance: 12000, payment: 500 }] });
  const cardsBefore = buildChallengeCards(normal);
  assert.equal(cardsBefore.length, challengeDefinitions.length);
  const challenge = startChallengeState(normal, "starter-cashflow", { savings: 30000 });
  challenge.baseExpenses = 1000;
  challenge.salary = 5000;
  evaluateProgress(challenge, { turnPhase: "idle", hasOpenEvent: false });
  const cardsAfter = buildChallengeCards(challenge);
  assert.ok(cardsAfter.find((item) => item.id === "starter-cashflow")?.bestResult.length > 0);
  assert.equal(normal.round, 9);
});

test("挑战使用独立状态、超时可结算、难度参数有界", () => {
  const normal = baseState({ cash: 22000, round: 5, liabilities: [{ balance: 20000, payment: 800 }] });
  const challenge = startChallengeState(normal, "starter-cashflow", { savings: 30000 });
  assert.notEqual(challenge, normal);
  assert.equal(normal.round, 5);
  assert.equal(challenge.activeChallenge.id, "starter-cashflow");
  challenge.round = 30;
  const result = evaluateProgress(challenge, { turnPhase: "idle", hasOpenEvent: false });
  assert.equal(result.challenge.active, true);
  assert.equal(result.challenge.timedOut || result.challenge.completed, true);
  assert.ok(challengeDefinitions.length >= 6);

  const beginner = createDifficultyAdjustedCareer({ id: "teacher", salary: 100, expenses: 80, savings: 1000 }, "beginner");
  const advanced = createDifficultyAdjustedCareer({ id: "teacher", salary: 100, expenses: 80, savings: 1000 }, "advanced");
  assert.ok(beginner.savings > advanced.savings);
  assert.ok(difficultyModes.length >= 3);
});

test("旧存档安全迁移，报告与压力状态来自真实财务资料", () => {
  const legacy = migrateProgressState(baseState({ activeMissions: undefined, achievements: undefined, milestones: undefined }));
  assert.equal(legacy.gameDifficulty, "standard");
  assert.equal(Array.isArray(legacy.achievements), true);
  const report = addReport(legacy, createGameReport(legacy, "manual"));
  assert.equal(report.cash, legacy.cash);
  assert.equal(legacy.gameReports.length, 1);

  const pressure = evaluateFinancialPressure(baseState({
    cash: -5000,
    baseExpenses: 20000,
    salary: 0,
    liabilities: [{ type: "emergency", balance: 90000, payment: 2000 }],
  }));
  assert.equal(pressure.severe, true);
  assert.ok(pressure.actions.includes("前往银行"));
});
