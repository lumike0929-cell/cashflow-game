import test from "node:test";
import assert from "node:assert/strict";
import {
  aiDifficultyModes,
  aiTemplates,
  advanceMarketCycle,
  buildAiPublicSummary,
  calculateLeaderboard,
  configureAiMode,
  createAiPlayers,
  gameModes,
  migrateAiCompetitionState,
  resolveAiDecisionScore,
  runAiTurnCycle,
  simulateAiTurn,
} from "../aiCompetitionSystem.js";
import { stockDefinitions } from "../stockData.js";
import { calculateFinancialFreedomProgress } from "../progressSystem.js";

const boardTiles = [
  { type: "payday", title: "月结日" },
  { type: "stockOpportunity", title: "股票机会" },
  { type: "opportunity", title: "房产机会" },
  { type: "businessOpportunity", title: "小生意机会" },
  { type: "bank", title: "银行" },
  { type: "insurance", title: "保险" },
  { type: "doodad", title: "账单" },
  { type: "market", title: "市场" },
  { type: "learn", title: "学习" },
  { type: "payday", title: "月结日" },
];

function baseState(overrides = {}) {
  return migrateAiCompetitionState({
    career: { id: "teacher", name: "小学老师", salary: 18000, expenses: 14500, savings: 12000 },
    month: 1,
    round: 1,
    position: 0,
    cash: 50000,
    salary: 18000,
    baseExpenses: 12000,
    assets: [],
    liabilities: [],
    ownedProperties: [],
    propertyTransactions: [],
    settledEvents: [],
    stockMarket: stockDefinitions,
    stockHoldings: [],
    stockTransactions: [],
    stockMarketRecords: [],
    settledStockEvents: [],
    businessHoldings: [],
    businessTransactions: [],
    businessMarketRecords: [],
    settledBusinessEvents: [],
    settledBusinessMonths: [],
    bank: { creditScore: 650, interestLevel: "normal" },
    bankTransactions: [],
    settledBankEvents: [],
    insurancePolicies: [],
    insuranceTransactions: [],
    insuranceClaims: [],
    settledLifeEvents: [],
    lifeActiveEffects: [],
    emergencyDebt: 0,
    logs: ["玩家开始游戏。"],
    ...overrides,
  });
}

test("单人模式不生成 AI，AI 模式会生成指定人数且财务独立", () => {
  const solo = baseState();
  assert.equal(solo.gameMode, "solo");
  assert.equal(solo.aiPlayers.length, 0);

  configureAiMode(solo, { mode: "ai-race", aiCount: 3, difficulty: "standard" });
  assert.equal(solo.aiPlayers.length, 3);
  assert.equal(solo.turnOrder.length, 4);
  solo.aiPlayers[0].cash = 12345;
  assert.notEqual(solo.aiPlayers[1].cash, 12345);
  assert.notEqual(solo.aiPlayers[0].stockHoldings, solo.aiPlayers[1].stockHoldings);
  assert.ok(aiTemplates.length >= 6);
  assert.ok(aiDifficultyModes.length >= 3);
  assert.ok(gameModes.length >= 3);
});

test("AI 骰子与移动一致，回合顺序不会重复行动", () => {
  const state = baseState();
  configureAiMode(state, { mode: "ai-race", aiCount: 2, difficulty: "standard" });
  const firstPosition = state.aiPlayers[0].currentPosition;
  const summary = simulateAiTurn(state, state.aiPlayers[0].id, boardTiles, () => 0.2);
  assert.equal(summary.roll, 2);
  assert.equal(state.aiPlayers[0].currentPosition, (firstPosition + 2) % boardTiles.length);
  assert.equal(state.turnManager.actedActorIds.includes(state.aiPlayers[0].id), true);

  const cycle = runAiTurnCycle(state, boardTiles, () => 0.1);
  assert.equal(cycle.skipped, false);
  assert.equal(cycle.summaries.length, 1);
  assert.equal(state.turnManager.lastAiCycleRound, state.round);
  const repeated = runAiTurnCycle(state, boardTiles, () => 0.1);
  assert.equal(repeated.skipped, true);
  assert.equal(repeated.summaries.length, 0);
});

test("AI 决策可解释且不能在现金不足时非法购买", () => {
  const state = baseState();
  configureAiMode(state, { mode: "ai-race", aiCount: 1, difficulty: "easy" });
  const ai = state.aiPlayers[0];
  ai.cash = 10;
  const score = resolveAiDecisionScore(ai, { cashRequired: 20000, monthlyCashflow: 500, riskLevel: "中" }, "property", state.marketCycle);
  assert.ok(score.shortReason.length > 0);
  assert.ok(score.learningReason.length > 0);
  const beforeProperties = ai.ownedProperties.length;
  ai.currentPosition = 1;
  const summary = simulateAiTurn(state, ai.id, boardTiles, () => 0.15);
  const latestAi = state.aiPlayers.find((item) => item.id === ai.id);
  assert.equal(latestAi.ownedProperties.length, beforeProperties);
  assert.ok(summary.shortReason.length > 0);
  assert.ok(latestAi.recentDecisions[0].shortReason.length > 0);
});

test("AI 借款符合银行规则，难度不会给隐藏资产", () => {
  const easy = createAiPlayers(1, "easy", { salary: 20000, expenses: 15000, savings: 10000 }, stockDefinitions)[0];
  const expert = createAiPlayers(1, "expert", { salary: 20000, expenses: 15000, savings: 10000 }, stockDefinitions)[0];
  assert.equal(easy.cash, expert.cash);
  assert.equal(easy.ownedProperties.length, 0);
  assert.equal(expert.ownedProperties.length, 0);

  const state = baseState();
  configureAiMode(state, { mode: "ai-race", aiCount: 1, difficulty: "standard" });
  const ai = state.aiPlayers[0];
  ai.cash = 100;
  ai.currentPosition = 3;
  const summary = simulateAiTurn(state, ai.id, boardTiles, () => 0.1);
  assert.ok(summary.shortReason.length > 0);
  assert.equal(ai.cash >= 0, true);
});

test("动态市场阶段、新闻和共享价格安全更新", () => {
  const state = baseState();
  configureAiMode(state, { mode: "ai-race", aiCount: 2, difficulty: "standard" });
  state.marketCycle.monthsRemaining = 1;
  const before = state.stockMarket[0].currentPrice;
  const market = advanceMarketCycle(state, () => 0.7);
  assert.ok(market.news.title.length > 0);
  assert.ok(state.marketNews.length >= 1);
  assert.equal(state.aiPlayers[0].stockMarket[0].id, state.stockMarket[0].id);
  assert.equal(state.stockMarket[0].currentPrice > 0, true);
  assert.notEqual(state.stockMarket[0].currentPrice, before);
});

test("排名、AI 财务详情和 AI 财务自由状态来自真实数据", () => {
  const state = baseState({
    ownedProperties: [{ monthlyRent: 16000, monthlyExpenses: 0, mortgagePayment: 0, currentValue: 300000, mortgageBalance: 0 }],
  });
  configureAiMode(state, { mode: "ai-race", aiCount: 1, difficulty: "standard" });
  state.aiPlayers[0].ownedProperties.push({ monthlyRent: 14000, monthlyExpenses: 0, mortgagePayment: 0, currentValue: 260000, mortgageBalance: 0 });
  migrateAiCompetitionState(state);
  const leaderboard = calculateLeaderboard(state);
  assert.equal(leaderboard.length, 2);
  assert.equal(leaderboard[0].freedomPercent >= leaderboard[1].freedomPercent, true);
  const summary = buildAiPublicSummary(state, state.aiPlayers[0].id);
  assert.ok(summary);
  assert.equal(summary.freedomPercent, calculateFinancialFreedomProgress(state.aiPlayers[0]).percent);
  assert.equal(summary.recentDecisions.length >= 0, true);
});

test("旧存档迁移为单人，AI 数据损坏时安全回退", () => {
  const legacy = migrateAiCompetitionState(baseState({ gameMode: undefined, aiPlayers: "broken", marketCycle: null }));
  assert.equal(legacy.gameMode, "solo");
  assert.equal(Array.isArray(legacy.aiPlayers), true);
  assert.equal(legacy.aiPlayers.length, 0);
  configureAiMode(legacy, { mode: "quick-race", difficulty: "expert" });
  assert.equal(legacy.aiPlayers.length, 2);
  assert.equal(legacy.turnOrder[0], "player");
  assert.equal(legacy.currentActorId, "player");
});
