import { realEstateOpportunities } from "./realEstateData.js";
import { stockDefinitions } from "./stockData.js";
import { businessDefinitions } from "./businessData.js";
import { insurancePolicies } from "./insuranceData.js";
import {
  applyMortgagePayday,
  buyProperty,
  calculateMonthlyCashflow,
  calculateNetWorth,
  calculatePassiveIncome,
  calculateTotalExpenses,
  recalculateProperty,
  syncMortgageLiabilities,
} from "./realEstateCalculator.js";
import { buyStock, normalizeStockMarket, settleStockDividends, stockMoney } from "./stockCalculator.js";
import { ensureBusinessState, investBusiness, settleBusinessPayday } from "./businessCalculator.js";
import { calculateMortgagePurchasePlan, ensureBankingState, takePersonalLoan } from "./bankingCalculator.js";
import { ensureInsuranceState, purchaseInsurancePolicy } from "./insuranceCalculator.js";
import { calculateFinancialFreedomProgress, migrateProgressState } from "./progressSystem.js";

export const AI_SAVE_VERSION = 1;

export const gameModes = [
  { id: "solo", title: "单人学习", aiCount: 0, description: "只有玩家，保持目前节奏。" },
  { id: "ai-race", title: "AI 竞赛", aiCount: 2, description: "玩家与 1 到 3 名本机 AI 轮流行动。" },
  { id: "quick-race", title: "快速挑战", aiCount: 2, description: "玩家与 2 名 AI，用快速动画和固定回合目标。" },
];

export const aiDifficultyModes = [
  { id: "easy", title: "轻松", reserveScale: 1.25, riskScale: 0.82, mistakeRate: 0.28, description: "更保守，偶尔错过合理机会。" },
  { id: "standard", title: "标准", reserveScale: 1, riskScale: 1, mistakeRate: 0.12, description: "平衡评估现金流、风险和分散。" },
  { id: "expert", title: "专家", reserveScale: 0.9, riskScale: 1.16, mistakeRate: 0.04, description: "更重视现金流、分散和债务成本。" },
];

export const aiTemplates = [
  aiTemplate("steady-saver", "稳健储蓄者", "稳", "高现金储备，偏好保险和稳定房产。", 0.28, 4, 0.22, 0.35, 0.75, 0.32, 0.9, 0.7, 0.7, 1),
  aiTemplate("stock-sprinter", "股票积极型", "股", "接受市场波动，偏好股票和股息。", 0.72, 2, 0.5, 0.95, 0.28, 0.36, 0.35, 0.45, 0.92, 1.04),
  aiTemplate("property-builder", "房产经营型", "房", "偏好正现金流房产，合理使用房贷。", 0.58, 2.5, 0.62, 0.34, 0.95, 0.36, 0.45, 0.5, 0.82, 1.03),
  aiTemplate("business-maker", "创业型", "店", "偏好小生意，接受较高初期风险。", 0.66, 2, 0.55, 0.34, 0.4, 0.96, 0.32, 0.62, 0.88, 1.02),
  aiTemplate("debt-careful", "债务谨慎型", "债", "优先还款，很少使用高成本贷款。", 0.36, 3.5, 0.12, 0.42, 0.42, 0.32, 0.62, 0.78, 0.74, 0.98),
  aiTemplate("balanced-racer", "平衡型", "衡", "股票、房产和小生意平均配置。", 0.52, 2.5, 0.44, 0.58, 0.58, 0.58, 0.48, 0.62, 0.82, 1),
];

export const marketPhases = [
  { id: "recovery", title: "复苏", stockBias: 0.018, realEstateBias: 0.006, rentBias: 0.004, businessBias: 0.012, costBias: -0.004, interestLevel: "low" },
  { id: "expansion", title: "扩张", stockBias: 0.025, realEstateBias: 0.01, rentBias: 0.007, businessBias: 0.018, costBias: 0.002, interestLevel: "normal" },
  { id: "peak", title: "高峰", stockBias: 0.006, realEstateBias: 0.004, rentBias: 0.002, businessBias: 0.005, costBias: 0.012, interestLevel: "high" },
  { id: "slowdown", title: "放缓", stockBias: -0.014, realEstateBias: -0.006, rentBias: -0.003, businessBias: -0.01, costBias: 0.006, interestLevel: "normal" },
  { id: "recession", title: "衰退", stockBias: -0.026, realEstateBias: -0.012, rentBias: -0.007, businessBias: -0.02, costBias: 0.002, interestLevel: "low" },
];

export function migrateAiCompetitionState(state) {
  if (!state || typeof state !== "object") return state;
  state.aiSaveVersion = AI_SAVE_VERSION;
  state.gameMode = normalizeGameMode(state.gameMode);
  state.aiDifficulty = normalizeAiDifficulty(state.aiDifficulty);
  state.aiAnimationSpeed = state.aiAnimationSpeed === "skip" || state.aiAnimationSpeed === "watch" ? state.aiAnimationSpeed : "fast";
  state.leaderboardSettings = normalizeLeaderboardSettings(state.leaderboardSettings);
  state.marketCycle = normalizeMarketCycle(state.marketCycle);
  state.marketNews = normalizeMarketNews(state.marketNews);
  state.roundHistory = normalizeRoundHistory(state.roundHistory);
  state.aiActionSummaries = normalizeRoundHistory(state.aiActionSummaries);
  state.turnManager = normalizeTurnManager(state.turnManager);
  state.aiPlayers = normalizeAiPlayers(state.aiPlayers, state);
  if (state.gameMode === "solo") {
    state.aiPlayers = [];
    state.turnOrder = ["player"];
    state.currentActorId = "player";
    state.turnManager.status = "waitingPlayer";
  } else {
    const count = state.gameMode === "quick-race" ? 2 : Math.max(1, Math.min(3, state.aiPlayers.length || 2));
    if (state.aiPlayers.length < count) {
      state.aiPlayers = createAiPlayers(count, state.aiDifficulty, state.career || defaultCareer(), state.stockMarket);
    }
    state.aiPlayers = state.aiPlayers.slice(0, count).map((ai) => normalizeAiState(ai, state));
    state.turnOrder = ["player", ...state.aiPlayers.map((ai) => ai.id)];
    state.currentActorId = state.currentActorId && state.turnOrder.includes(state.currentActorId) ? state.currentActorId : "player";
  }
  return state;
}

export function configureAiMode(state, { mode = "solo", aiCount = null, difficulty = "standard" } = {}) {
  state.gameMode = normalizeGameMode(mode);
  state.aiDifficulty = normalizeAiDifficulty(difficulty);
  state.aiAnimationSpeed = state.gameMode === "quick-race" ? "skip" : "fast";
  state.turnManager = normalizeTurnManager(null);
  if (state.gameMode === "solo") {
    state.aiPlayers = [];
  } else {
    const count = state.gameMode === "quick-race" ? 2 : Math.max(1, Math.min(3, aiCount || 2));
    state.aiPlayers = createAiPlayers(count, state.aiDifficulty, state.career || defaultCareer(), state.stockMarket);
  }
  migrateAiCompetitionState(state);
  return state;
}

export function createAiPlayers(count, difficultyId = "standard", playerCareer = defaultCareer(), sharedMarket = stockDefinitions) {
  const market = normalizeStockMarket(sharedMarket);
  return aiTemplates.slice(0, Math.max(0, Math.min(3, count))).map((template, index) => createAiState(template, difficultyId, playerCareer, market, index));
}

export function runAiTurnCycle(state, boardTiles, random = Math.random) {
  migrateAiCompetitionState(state);
  if (state.gameMode === "solo" || !state.aiPlayers.length) return { skipped: true, summaries: [] };
  if (state.turnManager.lastAiCycleRound === safeNumber(state.round, 1)) {
    return { skipped: true, summaries: [], reason: "本轮 AI 已完成行动。" };
  }
  const summaries = [];
  state.turnManager.status = "aiThinking";
  state.currentActorId = state.aiPlayers[0]?.id || "player";
  for (const ai of state.aiPlayers) {
    if (state.turnManager.actedActorIds.includes(ai.id)) continue;
    const summary = simulateAiTurn(state, ai.id, boardTiles, random);
    summaries.push(summary);
  }
  const market = advanceMarketCycle(state, random);
  const leaderboard = calculateLeaderboard(state);
  const roundSummary = {
    id: nextAiId(state, "round-summary"),
    round: safeNumber(state.round, 1),
    month: safeNumber(state.month, 1),
    playerAction: state.logs?.[0] || "玩家完成本回合行动。",
    aiActions: summaries.map((item) => item.shortText),
    marketChange: market.news.title,
    ranking: leaderboard.slice(0, 4).map((item) => `${item.rank}. ${item.name} ${item.freedomPercent}%`),
    income: summaries.filter((item) => item.amount > 0).reduce((sum, item) => sum + safeNumber(item.amount), 0),
    expenses: summaries.filter((item) => item.amount < 0).reduce((sum, item) => sum + Math.abs(safeNumber(item.amount)), 0),
    newAssets: summaries.filter((item) => ["buyStock", "buyProperty", "buyBusiness"].includes(item.action)).length,
    newDebt: summaries.filter((item) => item.action === "loan").reduce((sum, item) => sum + safeNumber(item.amount), 0),
    nextTip: market.news.learningTip,
  };
  state.roundHistory = [roundSummary, ...state.roundHistory].slice(0, 20);
  state.turnManager = {
    status: "roundComplete",
    actedActorIds: [],
    lastActorId: "player",
    lastSummaryId: roundSummary.id,
    lastAiCycleRound: safeNumber(state.round, 1),
    aiRunning: false,
    round: safeNumber(state.round, 1),
  };
  state.currentActorId = "player";
  return { skipped: false, summaries, market, leaderboard, roundSummary };
}

export function simulateAiTurn(state, aiId, boardTiles, random = Math.random) {
  migrateAiCompetitionState(state);
  const ai = state.aiPlayers.find((item) => item.id === aiId);
  if (!ai) return { ok: false, shortText: "没有找到 AI 角色。" };
  state.turnManager.status = "aiRolling";
  const roll = Math.floor(random() * 6) + 1;
  const previousPosition = ai.currentPosition;
  ai.currentPosition = (previousPosition + roll) % boardTiles.length;
  ai.position = ai.currentPosition;
  ai.currentRound = safeNumber(ai.currentRound, 1) + 1;
  ai.round = ai.currentRound;
  if (ai.currentPosition < previousPosition) settleAiPayday(ai);
  state.turnManager.status = "aiResolving";
  syncSharedMarketToAi(state, ai);
  const tile = boardTiles[ai.currentPosition] || boardTiles[0];
  const decision = resolveAiTile(state, ai, tile, random);
  ai.financialFreedomProgress = calculateFinancialFreedomProgress(ai);
  ai.netWorth = calculateNetWorth(ai);
  ai.monthlyCashflow = calculateMonthlyCashflow(ai);
  const summary = {
    id: nextAiId(state, `ai-action-${ai.id}`),
    aiId: ai.id,
    aiName: ai.name,
    roll,
    from: previousPosition,
    to: ai.currentPosition,
    tileType: tile.type,
    action: decision.action,
    amount: decision.amount || 0,
    shortReason: decision.shortReason,
    learningReason: decision.learningReason,
    financialImpact: decision.financialImpact || "现金流保持观察。",
    shortText: `${ai.name}${decision.shortReason}`,
  };
  ai.recentDecisions = [summary, ...ai.recentDecisions].slice(0, 10);
  ai.transactionHistory = [summary, ...ai.transactionHistory].slice(0, 60);
  state.aiActionSummaries = [summary, ...(state.aiActionSummaries || [])].slice(0, 20);
  state.turnManager.actedActorIds = [...new Set([...state.turnManager.actedActorIds, ai.id])];
  state.turnManager.lastActorId = ai.id;
  state.turnManager.status = "aiResolving";
  return summary;
}

export function resolveAiDecisionScore(ai, opportunity, category, marketCycle = { phase: "stable" }) {
  const profile = ai.profile;
  const cashRequired = safeNumber(opportunity.cashRequired ?? opportunity.downPayment ?? opportunity.startupCost ?? opportunity.currentPrice ?? 0);
  const expectedMonthlyCashflow = safeNumber(opportunity.monthlyCashflow ?? opportunity.monthlyProfit ?? opportunity.dividendPerShare ?? 0);
  const riskScore = riskValue(opportunity.riskLevel) * (1 - profile.riskTolerance * 0.45);
  const liquidityAfterPurchase = safeNumber(ai.cash) - cashRequired;
  const reserveTarget = safeNumber(ai.baseExpenses) * profile.cashReserveTarget;
  const reserveImpact = liquidityAfterPurchase >= reserveTarget ? 18 : -28;
  const debtRequired = safeNumber(opportunity.loanAmount ?? opportunity.originalMortgage ?? 0);
  const debtPenalty = debtRequired > 0 ? Math.min(30, (debtRequired / Math.max(1, calculateNetWorth(ai) + safeNumber(ai.salary))) * 20 * (1 - profile.debtTolerance)) : 0;
  const categoryWeight = {
    stock: profile.stockPreference,
    property: profile.realEstatePreference,
    business: profile.businessPreference,
    insurance: profile.insurancePreference,
  }[category] || 0.5;
  const marketWeight = marketCycle.phase === "recession" && category === "stock" ? -8 : marketCycle.phase === "expansion" ? 8 : 0;
  const score = clampScore(48 + expectedMonthlyCashflow / 250 + reserveImpact - riskScore * 12 - debtPenalty + categoryWeight * 24 + marketWeight);
  return {
    action: score >= 58 ? "buy" : "skip",
    score,
    shortReason: score >= 58 ? "选择行动，因为现金流与风险符合策略。" : "选择等待，因为现金储备或风险不合适。",
    learningReason: "AI 只用当前现金、现金流、风险和市场阶段评分，不预知未来。",
    rejectedReasons: score >= 58 ? [] : ["现金储备不足", "风险分数偏高", "月现金流改善有限"],
    confidence: score >= 76 ? "高" : score >= 58 ? "中" : "低",
  };
}

export function createSeededRandom(seed = 1) {
  let value = Math.max(1, safeNumber(seed, 1)) % 2147483647;
  return () => {
    value = (value * 48271) % 2147483647;
    return value / 2147483647;
  };
}

export function buildAiAcceptanceScenarios() {
  return [
    { id: "cash-rich-property", title: "现金充足，正现金流房产", category: "property", opportunity: { cashRequired: 20000, monthlyCashflow: 1200, riskLevel: "低", originalMortgage: 180000 }, marketPhase: "expansion" },
    { id: "loan-needed-property", title: "现金不足，可合理借款", category: "property", opportunity: { cashRequired: 42000, monthlyCashflow: 1500, riskLevel: "中", originalMortgage: 280000 }, marketPhase: "recovery" },
    { id: "high-debt-repay", title: "高负债，应优先还款", category: "bank", opportunity: { cashRequired: 0, monthlyCashflow: 0, riskLevel: "低" }, marketPhase: "slowdown" },
    { id: "expansion-stock", title: "扩张期股票机会", category: "stock", opportunity: { cashRequired: 3600, monthlyCashflow: 90, dividendPerShare: 18, riskLevel: "中" }, marketPhase: "expansion" },
    { id: "recession-stock", title: "衰退期股票机会", category: "stock", opportunity: { cashRequired: 3600, monthlyCashflow: 90, dividendPerShare: 18, riskLevel: "高" }, marketPhase: "recession" },
    { id: "high-return-business", title: "高回报高风险小生意", category: "business", opportunity: { cashRequired: 28000, startupCost: 28000, monthlyCashflow: 2600, monthlyProfit: 2600, riskLevel: "高" }, marketPhase: "expansion" },
  ];
}

export function evaluateAiPersonalityTendencies(scenario = buildAiAcceptanceScenarios()[0], difficultyId = "standard") {
  const marketCycle = { phase: scenario.marketPhase || "recovery" };
  return aiTemplates.map((template, index) => {
    const ai = createAiState(template, difficultyId, defaultCareer(), stockDefinitions, index);
    ai.cash = scenario.id === "loan-needed-property" ? 18000 : 80000;
    ai.liabilities = scenario.id === "high-debt-repay" ? [{ id: "scenario-loan", type: "personalLoan", name: "高成本贷款", balance: 18000, payment: 900 }] : [];
    const score = scenario.category === "bank"
      ? {
          action: template.id === "debt-careful" || template.debtTolerance < 0.3 ? "repayDebt" : "wait",
          score: template.id === "debt-careful" ? 86 : 58,
          shortReason: template.id === "debt-careful" ? "优先降低高成本债务。" : "先观察现金与负债压力。",
          learningReason: "债务谨慎型会更重视降低固定还款压力。",
          rejectedReasons: [],
          confidence: template.id === "debt-careful" ? "高" : "中",
        }
      : resolveAiDecisionScore(ai, scenario.opportunity, scenario.category, marketCycle);
    return {
      templateId: template.id,
      name: template.name,
      preferredCategory: strongestPreference(template),
      action: score.action,
      score: score.score,
      shortReason: score.shortReason,
    };
  });
}

export function runAiStressSimulation({ aiCount = 3, rounds = 30, seed = 19, difficulty = "standard" } = {}) {
  const random = createSeededRandom(seed);
  const state = {
    career: defaultCareer(),
    month: 1,
    round: 1,
    position: 0,
    cash: 50000,
    salary: 24000,
    activeIncome: 24000,
    passiveIncome: 0,
    baseExpenses: 16000,
    monthlyExpenses: 16000,
    monthlyCashflow: 8000,
    netWorth: 50000,
    assets: [],
    liabilities: [],
    ownedProperties: [],
    stockMarket: stockDefinitions,
    stockHoldings: [],
    businessHoldings: [],
    logs: ["压力测试开始。"],
  };
  configureAiMode(state, { mode: "ai-race", aiCount, difficulty });
  const tiles = [
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
  const actionCounts = {};
  for (let index = 0; index < rounds; index += 1) {
    const result = runAiTurnCycle(state, tiles, random);
    result.summaries.forEach((summary) => {
      actionCounts[summary.action] = (actionCounts[summary.action] || 0) + 1;
    });
    state.round += 1;
    state.turnManager.lastAiCycleRound = 0;
  }
  const leaderboard = calculateLeaderboard(state);
  return {
    aiCount: state.aiPlayers.length,
    rounds,
    actionCounts,
    marketNews: state.marketNews.length,
    roundHistory: state.roundHistory.length,
    marketRecords: state.marketCycle.records.length,
    maxAiTransactions: Math.max(0, ...state.aiPlayers.map((ai) => ai.transactionHistory.length)),
    currentActorId: state.currentActorId,
    leaderboard,
    invalidNumbers: hasInvalidAiNumbers(state),
  };
}

export function buildMarketDashboard(state) {
  migrateAiCompetitionState(state);
  const phase = marketPhases.find((item) => item.id === state.marketCycle.phase) || marketPhases[0];
  const stockSeries = normalizeStockMarket(state.stockMarket).slice(0, 6).map((stock) => ({
    id: stock.id,
    symbol: stock.symbol,
    name: stock.name,
    currentPrice: stock.currentPrice,
    previousPrice: stock.previousPrice,
    change: stockMoney(safeNumber(stock.currentPrice) - safeNumber(stock.previousPrice)),
    changePercent: safeNumber(stock.previousPrice) > 0 ? Math.round(((stock.currentPrice - stock.previousPrice) / stock.previousPrice) * 1000) / 10 : 0,
    history: (stock.priceHistory || [stock.currentPrice]).slice(-24),
    dividends: (stock.dividendHistory || []).slice(-24),
    volatility: stock.volatility || 0,
  }));
  const propertySeries = [...(state.ownedProperties || []), ...(state.aiPlayers || []).flatMap((ai) => ai.ownedProperties || [])]
    .slice(0, 6)
    .map((property) => ({
      id: property.id,
      name: property.name,
      currentValue: safeNumber(property.currentValue),
      previousValue: safeNumber(property.previousValue || property.purchasePrice || property.currentValue),
      equity: safeNumber(property.currentValue) - safeNumber(property.mortgageBalance),
      rent: safeNumber(property.monthlyRent),
      vacancyRisk: property.vacancyRisk || 0,
      repairRisk: property.repairRisk || 0,
      valueHistory: (property.valueHistory || [property.currentValue]).slice(-12),
      rentHistory: (property.rentHistory || [property.monthlyRent]).slice(-12),
    }));
  const businessSeries = [...(state.businessHoldings || []), ...(state.aiPlayers || []).flatMap((ai) => ai.businessHoldings || [])]
    .slice(0, 6)
    .map((business) => ({
      id: business.businessId || business.id,
      name: business.name,
      revenue: safeNumber(business.monthlyRevenue),
      expenses: safeNumber(business.monthlyExpenses),
      profit: safeNumber(business.monthlyProfit),
      demandIndex: business.demandIndex || 1,
      history: (business.businessHistory || [{ revenue: business.monthlyRevenue, expenses: business.monthlyExpenses, phase: phase.id }]).slice(-12),
      customerTrend: business.customerTrend || "需求稳定",
    }));
  return {
    phase: phase.id,
    phaseTitle: phase.title,
    monthInPhase: state.marketCycle.monthInPhase,
    monthsRemaining: state.marketCycle.monthsRemaining,
    trends: {
      stocks: trendWord(phase.stockBias),
      realEstate: trendWord(phase.realEstateBias),
      business: trendWord(phase.businessBias),
      interest: phase.interestLevel,
    },
    news: state.marketNews?.[0] || null,
    records: (state.marketCycle.records || []).slice(0, 12),
    stockSeries,
    propertySeries,
    businessSeries,
  };
}

export function advanceMarketCycle(state, random = Math.random) {
  migrateAiCompetitionState(state);
  const currentIndex = marketPhases.findIndex((phase) => phase.id === state.marketCycle.phase);
  const shouldAdvance = state.marketCycle.monthsRemaining <= 1;
  const nextIndex = shouldAdvance ? (currentIndex + 1 + marketPhases.length) % marketPhases.length : Math.max(0, currentIndex);
  const phase = marketPhases[nextIndex] || marketPhases[0];
  state.marketCycle = {
    phase: phase.id,
    monthInPhase: shouldAdvance ? 1 : state.marketCycle.monthInPhase + 1,
    monthsRemaining: shouldAdvance ? 3 : Math.max(1, state.marketCycle.monthsRemaining - 1),
    lastUpdatedRound: safeNumber(state.round, 1),
    records: state.marketCycle.records || [],
  };
  const stockChanges = updateSharedStockMarket(state, phase, random);
  const propertyChanges = updatePropertiesForActor(state, phase, "player");
  const businessChanges = updateBusinessesForActor(state, phase, "player");
  state.aiPlayers.forEach((ai) => {
    syncSharedMarketToAi(state, ai);
    updatePropertiesForActor(ai, phase, ai.id);
    updateBusinessesForActor(ai, phase, ai.id);
    ai.bank.interestLevel = phase.interestLevel;
    ai.financialFreedomProgress = calculateFinancialFreedomProgress(ai);
  });
  state.bank = { ...(state.bank || {}), interestLevel: phase.interestLevel };
  const news = createMarketNews(state, phase, { stockChanges, propertyChanges, businessChanges });
  state.marketNews = [news, ...state.marketNews.filter((item) => item.title !== news.title)].slice(0, 12);
  state.marketCycle.records = [
    {
      id: nextAiId(state, "market-cycle"),
      round: safeNumber(state.round, 1),
      month: safeNumber(state.month, 1),
      phase: phase.id,
      title: phase.title,
      stockChanges: stockChanges.length,
      propertyChanges: propertyChanges.length,
      businessChanges: businessChanges.length,
    },
    ...(state.marketCycle.records || []),
  ].slice(0, 24);
  return { phase, news, stockChanges, propertyChanges, businessChanges };
}

export function calculateLeaderboard(state, metric = null) {
  migrateAiCompetitionState(state);
  const rows = [
    leaderboardRow("player", "玩家", state.career?.name || "玩家", state, true),
    ...state.aiPlayers.map((ai) => leaderboardRow(ai.id, ai.avatarKey, ai.name, ai, false)),
  ].map((item, order) => ({ ...item, order }));
  const key = metric || state.leaderboardSettings.metric || "freedom";
  return rows
    .sort((left, right) => compareLeaderboard(left, right, key))
    .map((item, index) => ({ ...item, rank: index + 1, currentStatus: item.freedomPercent >= 100 ? "财务自由" : item.monthlyCashflow >= 0 ? "现金流稳定" : "现金流承压" }));
}

export function buildAiPublicSummary(state, aiId) {
  migrateAiCompetitionState(state);
  const ai = state.aiPlayers.find((item) => item.id === aiId);
  if (!ai) return null;
  const progress = calculateFinancialFreedomProgress(ai);
  return {
    id: ai.id,
    name: ai.name,
    avatarKey: ai.avatarKey,
    personality: ai.personality,
    creditScore: safeNumber(ai.bank?.creditScore, 650),
    cash: safeNumber(ai.cash),
    monthlyCashflow: calculateMonthlyCashflow(ai),
    passiveIncome: progress.passiveIncome,
    netWorth: calculateNetWorth(ai),
    assetCount: (ai.ownedProperties?.length || 0) + (ai.stockHoldings?.length || 0) + (ai.businessHoldings?.length || 0),
    liabilities: ai.liabilities?.reduce((sum, item) => sum + safeNumber(item.balance), 0) || 0,
    freedomPercent: progress.percent,
    portfolio: {
      stocks: ai.stockHoldings?.reduce((sum, item) => sum + safeNumber(item.currentValue), 0) || 0,
      realEstate: ai.ownedProperties?.reduce((sum, item) => sum + safeNumber(item.currentValue), 0) || 0,
      businesses: ai.businessHoldings?.reduce((sum, item) => sum + safeNumber(item.currentValue), 0) || 0,
    },
    recentDecisions: ai.recentDecisions?.slice(0, 6) || [],
  };
}

function createAiState(template, difficultyId, playerCareer, sharedMarket, index) {
  const difficulty = findAiDifficulty(difficultyId);
  const salary = safeNumber(playerCareer.salary, 22000) + (index + 1) * 2600;
  const baseExpenses = Math.max(5000, Math.round(safeNumber(playerCareer.expenses, 16000) * (0.88 + index * 0.04)));
  const cash = Math.max(8000, Math.round(safeNumber(playerCareer.savings, 16000) * (0.95 + index * 0.12)));
  const ai = {
    id: `ai-${template.id}`,
    templateId: template.id,
    name: ["小凯", "露露", "妮娜"][index] || template.name,
    avatarKey: template.avatarKey,
    personality: template.personality,
    profile: applyDifficultyToProfile(template, difficulty),
    cash,
    salary,
    activeIncome: salary,
    passiveIncome: 0,
    monthlyExpenses: baseExpenses,
    monthlyCashflow: salary - baseExpenses,
    baseExpenses,
    assets: [],
    liabilities: [],
    stockMarket: normalizeStockMarket(sharedMarket),
    stockHoldings: [],
    stockTransactions: [],
    stockMarketRecords: [],
    settledStockEvents: [],
    realizedStockGain: 0,
    ownedProperties: [],
    propertyTransactions: [],
    settledEvents: [],
    businessHoldings: [],
    businessTransactions: [],
    businessMarketRecords: [],
    settledBusinessEvents: [],
    settledBusinessMonths: [],
    insurancePolicies: [],
    insuranceTransactions: [],
    insuranceClaims: [],
    settledLifeEvents: [],
    bank: { creditScore: 650 + index * 20, interestLevel: "normal", bankruptcyWarning: false },
    bankTransactions: [],
    settledBankEvents: [],
    unemployment: {},
    lifeActiveEffects: [],
    emergencyDebt: 0,
    currentPosition: index * 3,
    position: index * 3,
    currentRound: 1,
    round: 1,
    currentMonth: 1,
    month: 1,
    transactionHistory: [],
    achievements: [],
    recentDecisions: [],
    financialFreedomProgress: null,
    netWorth: 0,
    status: "active",
    aiSequence: 0,
  };
  return normalizeAiState(ai, { stockMarket: sharedMarket });
}

function normalizeAiPlayers(value, parentState) {
  if (!Array.isArray(value)) return [];
  return value.filter(Boolean).slice(0, 3).map((ai) => normalizeAiState(ai, parentState));
}

function normalizeAiState(ai, parentState) {
  const template = aiTemplates.find((item) => item.id === ai.templateId) || aiTemplates.find((item) => `ai-${item.id}` === ai.id) || aiTemplates[0];
  const next = {
    ...ai,
    id: String(ai.id || `ai-${template.id}`),
    templateId: template.id,
    name: String(ai.name || template.name),
    avatarKey: String(ai.avatarKey || template.avatarKey),
    personality: String(ai.personality || template.personality),
    profile: { ...applyDifficultyToProfile(template, findAiDifficulty(parentState.aiDifficulty)), ...(ai.profile && typeof ai.profile === "object" ? ai.profile : {}) },
    cash: safeNumber(ai.cash),
    salary: safeNumber(ai.salary),
    baseExpenses: safeNumber(ai.baseExpenses || ai.monthlyExpenses),
    assets: Array.isArray(ai.assets) ? ai.assets : [],
    liabilities: Array.isArray(ai.liabilities) ? ai.liabilities : [],
    stockMarket: normalizeStockMarket(parentState.stockMarket || ai.stockMarket),
    stockHoldings: Array.isArray(ai.stockHoldings) ? ai.stockHoldings : [],
    stockTransactions: Array.isArray(ai.stockTransactions) ? ai.stockTransactions : [],
    stockMarketRecords: Array.isArray(ai.stockMarketRecords) ? ai.stockMarketRecords : [],
    settledStockEvents: Array.isArray(ai.settledStockEvents) ? ai.settledStockEvents : [],
    ownedProperties: Array.isArray(ai.ownedProperties) ? ai.ownedProperties : [],
    propertyTransactions: Array.isArray(ai.propertyTransactions) ? ai.propertyTransactions : [],
    settledEvents: Array.isArray(ai.settledEvents) ? ai.settledEvents : [],
    businessHoldings: Array.isArray(ai.businessHoldings) ? ai.businessHoldings : [],
    businessTransactions: Array.isArray(ai.businessTransactions) ? ai.businessTransactions : [],
    businessMarketRecords: Array.isArray(ai.businessMarketRecords) ? ai.businessMarketRecords : [],
    settledBusinessEvents: Array.isArray(ai.settledBusinessEvents) ? ai.settledBusinessEvents : [],
    settledBusinessMonths: Array.isArray(ai.settledBusinessMonths) ? ai.settledBusinessMonths : [],
    insurancePolicies: Array.isArray(ai.insurancePolicies) ? ai.insurancePolicies : [],
    insuranceTransactions: Array.isArray(ai.insuranceTransactions) ? ai.insuranceTransactions : [],
    insuranceClaims: Array.isArray(ai.insuranceClaims) ? ai.insuranceClaims : [],
    settledLifeEvents: Array.isArray(ai.settledLifeEvents) ? ai.settledLifeEvents : [],
    bank: ai.bank && typeof ai.bank === "object" ? ai.bank : {},
    bankTransactions: Array.isArray(ai.bankTransactions) ? ai.bankTransactions : [],
    settledBankEvents: Array.isArray(ai.settledBankEvents) ? ai.settledBankEvents : [],
    unemployment: ai.unemployment && typeof ai.unemployment === "object" ? ai.unemployment : {},
    lifeActiveEffects: Array.isArray(ai.lifeActiveEffects) ? ai.lifeActiveEffects : [],
    emergencyDebt: safeNumber(ai.emergencyDebt),
    currentPosition: Math.max(0, safeNumber(ai.currentPosition ?? ai.position) % 40),
    position: Math.max(0, safeNumber(ai.position ?? ai.currentPosition) % 40),
    currentRound: Math.max(1, safeNumber(ai.currentRound ?? ai.round, 1)),
    round: Math.max(1, safeNumber(ai.round ?? ai.currentRound, 1)),
    currentMonth: Math.max(1, safeNumber(ai.currentMonth ?? ai.month, 1)),
    month: Math.max(1, safeNumber(ai.month ?? ai.currentMonth, 1)),
    transactionHistory: Array.isArray(ai.transactionHistory) ? ai.transactionHistory.slice(0, 60) : [],
    achievements: Array.isArray(ai.achievements) ? ai.achievements : [],
    recentDecisions: Array.isArray(ai.recentDecisions) ? ai.recentDecisions.slice(0, 10) : [],
    status: ai.status || "active",
    aiSequence: Math.max(0, safeNumber(ai.aiSequence)),
  };
  next.position = next.currentPosition;
  ensureBusinessState(next);
  ensureBankingState(next);
  ensureInsuranceState(next);
  syncMortgageLiabilities(next);
  migrateProgressState(next);
  next.financialFreedomProgress = calculateFinancialFreedomProgress(next);
  next.passiveIncome = calculatePassiveIncome(next);
  next.monthlyExpenses = calculateTotalExpenses(next);
  next.monthlyCashflow = calculateMonthlyCashflow(next);
  next.netWorth = calculateNetWorth(next);
  return next;
}

function resolveAiTile(parentState, ai, tile, random) {
  if (tile.type === "payday") {
    const payday = settleAiPayday(ai);
    return decisionResult("payday", `领取月结，现金流 ${moneyText(payday.cashflow)}。`, payday.cashflow, "AI 也需要按月支付支出和债务。");
  }
  if (tile.type === "stockOpportunity") return decideStock(parentState, ai, random);
  if (tile.type === "opportunity") return decideProperty(parentState, ai, random);
  if (tile.type === "businessOpportunity") return decideBusiness(parentState, ai, random);
  if (tile.type === "insurance") return decideInsurance(ai);
  if (tile.type === "bank") return decideBank(ai);
  if (tile.type === "doodad" || tile.type === "lifeEvent" || tile.type === "family") return applyAiExpense(ai, tile.title, 900 + Math.floor(random() * 2400));
  return decisionResult("wait", `观察「${tile.title}」，这回合没有投资。`, 0, "等待也是财务选择。");
}

function decideStock(parentState, ai, random) {
  const stock = pickByPreference(parentState.stockMarket || stockDefinitions, ai.profile.stockPreference, random);
  const quantity = Math.max(1, Math.min(5, Math.floor(ai.cash / Math.max(1, stock.currentPrice * 16))));
  const score = resolveAiDecisionScore(ai, { ...stock, cashRequired: stock.currentPrice * quantity, monthlyCashflow: stock.dividendPerShare * quantity }, "stock", parentState.marketCycle);
  if (score.action !== "buy" || quantity <= 0) return decisionResult("skip", `拒绝了 ${stock.name}，${score.shortReason}`, 0, score.learningReason, score);
  const result = buyStock(ai, stock.id, quantity, `ai-stock-${ai.id}-${ai.currentRound}-${stock.id}`);
  if (!result.ok) return decisionResult("skip", `没有买入 ${stock.name}：${result.reason}`, 0, "AI 不能在现金不足时非法购买。", score);
  return decisionResult("buyStock", `购买了 ${stock.name} ${quantity} 股。`, -result.totalAmount, score.learningReason, score);
}

function decideProperty(parentState, ai, random) {
  const opportunities = realEstateOpportunities.filter((item) => item.monthlyRent - item.mortgagePayment - item.managementFee - item.repairReserve > 0);
  const opportunity = opportunities[Math.floor(random() * opportunities.length)] || realEstateOpportunities[0];
  const plan = calculateMortgagePurchasePlan(ai, opportunity, "mortgage");
  const score = resolveAiDecisionScore(ai, { ...opportunity, ...plan }, "property", parentState.marketCycle);
  if (score.action !== "buy") return decisionResult("skip", `拒绝了高负债房产「${opportunity.name}」。`, 0, score.learningReason, score);
  if (ai.cash < plan.cashRequired) {
    const loan = takePersonalLoan(ai, Math.min(10000, plan.cashRequired - ai.cash), `ai-loan-for-property-${ai.id}-${ai.currentRound}`);
    if (!loan.ok) return decisionResult("skip", `现金不足，放弃 ${opportunity.name}。`, 0, "借款也要通过信用额度。", score);
  }
  const result = buyProperty(ai, opportunity, `ai-property-${ai.id}-${ai.currentRound}-${opportunity.id}`, plan);
  if (!result.ok) return decisionResult("skip", `没有买入房产：${result.reason}`, 0, "交易失败会安全回退。", score);
  return decisionResult("buyProperty", `购买了正现金流房产「${opportunity.name}」。`, -plan.cashRequired, score.learningReason, score);
}

function decideBusiness(parentState, ai, random) {
  const candidates = businessDefinitions.filter((item) => item.monthlyProfit > 0);
  const definition = candidates[Math.floor(random() * candidates.length)] || businessDefinitions[0];
  const score = resolveAiDecisionScore(ai, definition, "business", parentState.marketCycle);
  if (score.action !== "buy") return decisionResult("skip", `暂时不投资 ${definition.name}。`, 0, score.learningReason, score);
  const result = investBusiness(ai, definition, `ai-business-${ai.id}-${ai.currentRound}-${definition.id}`);
  if (!result.ok) return decisionResult("skip", `没有投资小生意：${result.reason}`, 0, "小生意也要现金足够才能投资。", score);
  return decisionResult("buyBusiness", `投资了小生意「${definition.name}」。`, -definition.startupCost, score.learningReason, score);
}

function decideInsurance(ai) {
  const policy = insurancePolicies.find((item) => item.category === "medical") || insurancePolicies[0];
  if (!policy || ai.insurancePolicies.some((item) => item.id === policy.id && item.active)) {
    return decisionResult("wait", "检查了保险，暂不重复购买。", 0, "同一保单不能重复购买。");
  }
  const score = resolveAiDecisionScore(ai, { cashRequired: policy.monthlyPremium, monthlyCashflow: -policy.monthlyPremium, riskLevel: "低" }, "insurance");
  if (score.score < 52) return decisionResult("skip", "暂时不购买保险，先保留现金。", 0, score.learningReason, score);
  const result = purchaseInsurancePolicy(ai, policy.id, `ai-insurance-${ai.id}-${ai.currentRound}-${policy.id}`);
  if (!result.ok) return decisionResult("skip", `没有购买保险：${result.reason}`, 0, "保险也需要首月保费。", score);
  return decisionResult("buyInsurance", `购买了 ${policy.name}。`, -policy.monthlyPremium, "保费是固定小支出，用来分担部分大风险。", score);
}

function decideBank(ai) {
  const highDebt = (ai.liabilities || []).find((item) => item.type === "personalLoan" && safeNumber(item.balance) > 0);
  if (highDebt && ai.cash > ai.baseExpenses * 2) {
    const payment = Math.min(5000, highDebt.balance, Math.max(0, ai.cash - ai.baseExpenses * 2));
    highDebt.balance = Math.max(0, safeNumber(highDebt.balance) - payment);
    ai.cash = safeNumber(ai.cash) - payment;
    return decisionResult("repayDebt", `偿还了 ${moneyText(payment)} 贷款。`, -payment, "降低负债会减少未来压力。");
  }
  if (ai.cash < ai.baseExpenses && ai.profile.debtTolerance > 0.35) {
    const result = takePersonalLoan(ai, 3000, `ai-personal-loan-${ai.id}-${ai.currentRound}`);
    if (result.ok) return decisionResult("loan", `申请了 ${moneyText(result.amount)} 个人贷款。`, result.amount, "借款会增加现金，也会增加未来月供。");
  }
  return decisionResult("wait", "在银行保留现金，未借款。", 0, "不借款也是控制风险的一种选择。");
}

function applyAiExpense(ai, title, amount) {
  const cost = safeNumber(amount);
  ai.cash = safeNumber(ai.cash) - cost;
  if (ai.cash < 0) {
    const emergency = Math.abs(ai.cash);
    ai.cash = 0;
    ai.emergencyDebt = safeNumber(ai.emergencyDebt) + emergency;
    ai.aiSequence = safeNumber(ai.aiSequence);
    ai.aiSequence += 1;
    ai.liabilities.push({ id: `ai-emergency-${ai.id}-${ai.aiSequence}`, type: "emergency", name: `${title}紧急负债`, balance: emergency, payment: Math.ceil(emergency * 0.04) });
  }
  return decisionResult("expense", `支付了 ${title} ${moneyText(cost)}。`, -cost, "突发支出会考验现金储备。");
}

function settleAiPayday(ai) {
  const cashflow = calculateMonthlyCashflow(ai);
  ai.cash = safeNumber(ai.cash) + cashflow;
  applyMortgagePayday(ai);
  settleStockDividends(ai);
  settleBusinessPayday(ai);
  ai.month = safeNumber(ai.month, 1) + 1;
  ai.currentMonth = ai.month;
  ai.financialFreedomProgress = calculateFinancialFreedomProgress(ai);
  return { cashflow };
}

function updateSharedStockMarket(state, phase, random) {
  state.stockMarket = normalizeStockMarket(state.stockMarket).map((stock) => {
    const before = stock.currentPrice;
    const riskScale = stock.riskLevel === "高" ? 1.6 : stock.riskLevel === "中" ? 1.1 : 0.75;
    const movement = clampDecimal(phase.stockBias + (random() - 0.5) * stock.volatility * riskScale, -0.16, 0.16);
    const currentPrice = Math.max(2, stockMoney(before * (1 + movement)));
    return {
      ...stock,
      previousPrice: before,
      currentPrice,
      priceHistory: [...(stock.priceHistory || []), currentPrice].slice(-36),
      dividendHistory: [...(stock.dividendHistory || []), stock.dividendPerShare || 0].slice(-36),
      marketSensitivity: stock.marketSensitivity || stock.eventSensitivity || 1,
    };
  });
  return state.stockMarket.map((stock) => ({ stockId: stock.id, currentPrice: stock.currentPrice, previousPrice: stock.previousPrice }));
}

function updatePropertiesForActor(actor, phase, actorId) {
  if (!Array.isArray(actor.ownedProperties)) return [];
  const changes = [];
  actor.ownedProperties = actor.ownedProperties.map((property) => {
    const before = recalculateProperty(property);
    const valueFactor = clampDecimal(1 + phase.realEstateBias * (before.riskLevel === "高" ? 1.25 : 1), 0.92, 1.08);
    const rentFactor = clampDecimal(1 + phase.rentBias, 0.94, 1.06);
    const after = recalculateProperty({
      ...before,
      previousValue: before.currentValue,
      estimatedValue: Math.max(1000, Math.round(before.currentValue * valueFactor)),
      currentValue: Math.max(1000, Math.round(before.currentValue * valueFactor)),
      monthlyRent: Math.max(0, Math.round(before.monthlyRent * rentFactor)),
      valueHistory: [...(before.valueHistory || []), before.currentValue].slice(-36),
      rentHistory: [...(before.rentHistory || []), before.monthlyRent].slice(-36),
      vacancyRisk: clampDecimal((before.vacancyRisk || 0.05) + (phase.id === "recession" ? 0.02 : -0.005), 0.02, 0.22),
      repairRisk: clampDecimal((before.repairRisk || 0.05) + phase.costBias, 0.02, 0.2),
      interestSensitivity: before.interestSensitivity || 1,
      lastMarketChange: `${phase.title}影响：价值与租金更新`,
    });
    changes.push({ actorId, propertyId: after.id, beforeValue: before.currentValue, afterValue: after.currentValue });
    return after;
  });
  syncMortgageLiabilities(actor);
  return changes;
}

function updateBusinessesForActor(actor, phase, actorId) {
  if (!Array.isArray(actor.businessHoldings)) return [];
  const changes = [];
  actor.businessHoldings = actor.businessHoldings.map((business) => {
    const revenueMultiplier = clampDecimal((business.revenueMultiplier || 1) * (1 + phase.businessBias), 0.65, 1.55);
    const costMultiplier = clampDecimal((business.costMultiplier || 1) * (1 + phase.costBias), 0.75, 1.45);
    const revenue = Math.max(0, Math.round(business.monthlyRevenue * (1 + phase.businessBias)));
    const expenses = Math.max(0, Math.round(business.monthlyExpenses * (1 + phase.costBias)));
    const next = {
      ...business,
      demandIndex: clampDecimal((business.demandIndex || 1) * (1 + phase.businessBias), 0.55, 1.7),
      revenueMultiplier,
      costMultiplier,
      monthlyRevenue: revenue,
      monthlyExpenses: expenses,
      monthlyProfit: revenue - expenses,
      businessHistory: [...(business.businessHistory || []), { revenue, expenses, phase: phase.id }].slice(-36),
      customerTrend: phase.businessBias >= 0 ? "需求上升" : "需求下降",
      recentEvent: `${phase.title}市场影响`,
    };
    changes.push({ actorId, businessId: business.businessId, revenue, expenses });
    return next;
  });
  return changes;
}

function syncSharedMarketToAi(state, ai) {
  ai.stockMarket = normalizeStockMarket(state.stockMarket || stockDefinitions);
  ai.bank = { ...(ai.bank || {}), interestLevel: state.marketCycle?.phase ? marketPhases.find((phase) => phase.id === state.marketCycle.phase)?.interestLevel || "normal" : "normal" };
}

function createMarketNews(state, phase, changes) {
  const category = phase.id === "recession" || phase.id === "slowdown" ? "warning" : "market";
  const titles = {
    recovery: "小型商业信心回升",
    expansion: "住宅租赁市场趋紧",
    peak: "利率上升，房贷成本增加",
    slowdown: "消费支出下降",
    recession: "市场进入防守阶段",
  };
  const title = titles[phase.id] || "市场周期变化";
  return {
    id: nextAiId(state, `market-news-${phase.id}`),
    title,
    summary: `${phase.title}阶段影响股票、房产、小生意和银行利率，所有角色看到相同市场。`,
    category,
    marketPhase: phase.id,
    affectedAssets: [
      `股票 ${changes.stockChanges.length}`,
      `房产 ${changes.propertyChanges.length}`,
      `小生意 ${changes.businessChanges.length}`,
    ],
    effectDuration: state.marketCycle.monthsRemaining,
    learningTip: "这是游戏中的市场规则，不是真实投资建议，也不承诺未来走势。",
  };
}

function leaderboardRow(id, avatarKey, name, actor, isPlayer) {
  const progress = calculateFinancialFreedomProgress(actor);
  const debt = (actor.liabilities || []).reduce((sum, item) => sum + safeNumber(item.balance), 0);
  const netWorth = calculateNetWorth(actor);
  return {
    id,
    avatarKey,
    name,
    isPlayer,
    freedomPercent: progress.percent,
    netWorth,
    monthlyCashflow: calculateMonthlyCashflow(actor),
    passiveIncome: progress.passiveIncome,
    cash: safeNumber(actor.cash),
    debt,
    debtRatio: netWorth > 0 ? Math.round((debt / netWorth) * 100) : debt > 0 ? 999 : 0,
    recentAction: isPlayer ? actor.logs?.[0] || "玩家行动" : actor.recentDecisions?.[0]?.shortText || "等待行动",
  };
}

function compareLeaderboard(left, right, key) {
  const pickValue = (item) => ({
    freedom: item.freedomPercent,
    netWorth: item.netWorth,
    passiveIncome: item.passiveIncome,
    monthlyCashflow: item.monthlyCashflow,
    cash: item.cash,
    debtRatio: -item.debtRatio,
  }[key] ?? item.freedomPercent);
  const diff = pickValue(right) - pickValue(left);
  if (diff !== 0) return diff;
  const netWorthDiff = right.netWorth - left.netWorth;
  if (netWorthDiff !== 0) return netWorthDiff;
  const cashflowDiff = right.monthlyCashflow - left.monthlyCashflow;
  if (cashflowDiff !== 0) return cashflowDiff;
  return left.order - right.order;
}

function nextAiId(state, prefix) {
  state.aiSequence = Math.max(0, safeNumber(state.aiSequence));
  state.aiSequence += 1;
  return `${prefix}-${safeNumber(state.round, 1)}-${state.aiSequence}`;
}

function strongestPreference(template) {
  const preferences = [
    ["stock", template.stockPreference],
    ["property", template.realEstatePreference],
    ["business", template.businessPreference],
    ["insurance", template.insurancePreference],
  ];
  return preferences.sort((left, right) => right[1] - left[1])[0]?.[0] || "balanced";
}

function trendWord(value) {
  if (value > 0.01) return "上升";
  if (value > 0) return "小幅上升";
  if (value < -0.01) return "下降";
  if (value < 0) return "小幅下降";
  return "稳定";
}

function hasInvalidAiNumbers(state) {
  const actors = [state, ...(state.aiPlayers || [])];
  return actors.some((actor) => {
    const values = [
      actor.cash,
      actor.salary,
      actor.passiveIncome,
      actor.monthlyExpenses,
      actor.monthlyCashflow,
      actor.netWorth,
      ...(actor.liabilities || []).map((item) => item.balance),
      ...(actor.stockHoldings || []).map((item) => item.shares),
      ...(actor.ownedProperties || []).flatMap((item) => [item.currentValue, item.mortgageBalance, item.monthlyRent]),
      ...(actor.businessHoldings || []).flatMap((item) => [item.monthlyRevenue, item.monthlyExpenses, item.monthlyProfit]),
    ];
    return values.some((value) => !Number.isFinite(Number(value)) || Object.is(Number(value), -0));
  });
}

function decisionResult(action, shortReason, amount = 0, learningReason = "AI 使用规则引擎解释行动。", score = null) {
  return {
    action,
    amount,
    score: score?.score ?? 0,
    shortReason,
    learningReason,
    rejectedReasons: score?.rejectedReasons || [],
    confidence: score?.confidence || "中",
    financialImpact: amount === 0 ? "现金没有变化" : amount > 0 ? `现金增加 ${moneyText(amount)}` : `现金减少 ${moneyText(Math.abs(amount))}`,
  };
}

function aiTemplate(id, name, avatarKey, personality, riskTolerance, cashReserveTarget, debtTolerance, stockPreference, realEstatePreference, businessPreference, insurancePreference, learningPriority, decisionSpeed, difficultyModifier) {
  return { id, name, avatarKey, personality, riskTolerance, cashReserveTarget, debtTolerance, stockPreference, realEstatePreference, businessPreference, insurancePreference, learningPriority, decisionSpeed, difficultyModifier };
}

function applyDifficultyToProfile(template, difficulty) {
  return {
    riskTolerance: clampDecimal(template.riskTolerance * difficulty.riskScale, 0.05, 0.95),
    cashReserveTarget: clampDecimal(template.cashReserveTarget * difficulty.reserveScale, 1, 6),
    debtTolerance: clampDecimal(template.debtTolerance * difficulty.riskScale, 0.05, 0.9),
    stockPreference: template.stockPreference,
    realEstatePreference: template.realEstatePreference,
    businessPreference: template.businessPreference,
    insurancePreference: template.insurancePreference,
    learningPriority: template.learningPriority,
    decisionSpeed: template.decisionSpeed,
    difficultyModifier: template.difficultyModifier,
    mistakeRate: difficulty.mistakeRate,
  };
}

function normalizeGameMode(value) {
  return gameModes.some((item) => item.id === value) ? value : "solo";
}

function normalizeAiDifficulty(value) {
  return aiDifficultyModes.some((item) => item.id === value) ? value : "standard";
}

function findAiDifficulty(id) {
  return aiDifficultyModes.find((item) => item.id === id) || aiDifficultyModes[1];
}

function normalizeLeaderboardSettings(value) {
  const source = value && typeof value === "object" ? value : {};
  return {
    metric: ["freedom", "netWorth", "passiveIncome", "monthlyCashflow", "cash", "debtRatio"].includes(source.metric) ? source.metric : "freedom",
    showRoundSummary: ["always", "important", "off"].includes(source.showRoundSummary) ? source.showRoundSummary : "important",
  };
}

function normalizeMarketCycle(value) {
  const source = value && typeof value === "object" ? value : {};
  const phase = marketPhases.some((item) => item.id === source.phase) ? source.phase : "recovery";
  return {
    phase,
    monthInPhase: Math.max(1, safeNumber(source.monthInPhase, 1)),
    monthsRemaining: Math.max(1, safeNumber(source.monthsRemaining, 3)),
    lastUpdatedRound: Math.max(0, safeNumber(source.lastUpdatedRound)),
    records: Array.isArray(source.records) ? source.records.slice(0, 24) : [],
  };
}

function normalizeMarketNews(value) {
  return Array.isArray(value) ? value.filter(Boolean).slice(0, 12) : [];
}

function normalizeRoundHistory(value) {
  return Array.isArray(value) ? value.filter(Boolean).slice(0, 20) : [];
}

function normalizeTurnManager(value) {
  const source = value && typeof value === "object" ? value : {};
  return {
    status: source.status || "waitingPlayer",
    actedActorIds: Array.isArray(source.actedActorIds) ? source.actedActorIds : [],
    lastActorId: source.lastActorId || "player",
    lastSummaryId: source.lastSummaryId || null,
    lastAiCycleRound: Math.max(0, safeNumber(source.lastAiCycleRound)),
    aiRunning: Boolean(source.aiRunning),
    round: Math.max(1, safeNumber(source.round, 1)),
  };
}

function pickByPreference(items, preference, random) {
  const list = Array.isArray(items) && items.length ? items : [];
  if (!list.length) return stockDefinitions[0];
  const sorted = list.slice().sort((left, right) => {
    const leftScore = (left.dividendPerShare || 0) * (1 - preference) + riskValue(left.riskLevel) * preference;
    const rightScore = (right.dividendPerShare || 0) * (1 - preference) + riskValue(right.riskLevel) * preference;
    return rightScore - leftScore;
  });
  return sorted[Math.min(sorted.length - 1, Math.floor(random() * Math.min(4, sorted.length)))] || sorted[0];
}

function riskValue(level) {
  if (level === "高") return 3;
  if (level === "中") return 2;
  return 1;
}

function clampScore(value) {
  return Math.max(0, Math.min(100, Math.round(Number.isFinite(Number(value)) ? Number(value) : 0)));
}

function clampDecimal(value, min, max) {
  const number = Number(value);
  if (!Number.isFinite(number)) return min;
  return Math.max(min, Math.min(max, Math.round(number * 1000) / 1000));
}

function safeNumber(value, fallback = 0) {
  const number = Number(value);
  if (!Number.isFinite(number)) return fallback;
  const rounded = Math.round(number);
  return Object.is(rounded, -0) ? 0 : rounded;
}

function moneyText(value) {
  const safe = safeNumber(value);
  const sign = safe < 0 ? "-" : "";
  return `${sign}¥${Math.abs(safe).toLocaleString("zh-CN")}`;
}

function defaultCareer() {
  return { id: "ai-default", name: "AI 学员", salary: 24000, expenses: 16000, savings: 18000 };
}
