import {
  calculateMonthlyCashflow,
  calculateNetWorth,
  calculatePassiveIncome,
  calculateTotalExpenses,
} from "./realEstateCalculator.js";

export const PROGRESS_STORAGE_VERSION = 1;

export const difficultyModes = [
  {
    id: "beginner",
    title: "新手",
    description: "现金更宽裕，提醒更多，适合第一次学习。",
    cashMultiplier: 1.35,
    expenseMultiplier: 0.95,
    negativeEventScale: 0.85,
    marketVolatilityScale: 0.9,
    creditCostScale: 0.92,
  },
  {
    id: "standard",
    title: "标准",
    description: "使用目前平衡，适合一般挑战。",
    cashMultiplier: 1,
    expenseMultiplier: 1,
    negativeEventScale: 1,
    marketVolatilityScale: 1,
    creditCostScale: 1,
  },
  {
    id: "advanced",
    title: "进阶",
    description: "现金较少，市场和风险略高，但仍保持合理。",
    cashMultiplier: 0.82,
    expenseMultiplier: 1.05,
    negativeEventScale: 1.12,
    marketVolatilityScale: 1.12,
    creditCostScale: 1.08,
  },
];

export const milestoneDefinitions = [
  milestone("first-round", "完成第一回合", "你已经开始现金流城市的第一步。", "学习", "旗", (state) => state.round > 1),
  milestone("first-payday", "第一次领薪水", "月结日会让你看到现金流是否健康。", "现金流", "薪", (state) => state.month > 1),
  milestone("positive-cashflow", "第一次正现金流", "每月留下的钱开始变多了。", "现金流", "流", (state) => calculateMonthlyCashflow(state) > 0),
  milestone("first-stock", "第一次购买股票", "你拥有了虚构公司的一小部分。", "股票", "股", (state) => state.stockTransactions?.some((item) => item.type === "买入")),
  milestone("first-dividend", "第一次收到股息", "有些公司会把部分成果分享给股东。", "股票", "息", (state) => totalDividends(state) > 0),
  milestone("first-property", "第一次购买房产", "你开始学习租金、房贷和净值。", "房地产", "房", (state) => state.ownedProperties?.length > 0),
  milestone("first-rent", "第一次收到租金", "租金是资产带来的收入来源之一。", "房地产", "租", (state) => totalRent(state) > 0),
  milestone("first-business", "第一次投资小生意", "营收扣除成本后才是净利。", "小生意", "店", (state) => state.businessHoldings?.length > 0),
  milestone("first-business-upgrade", "第一次生意升级", "升级要同时看收入和成本变化。", "小生意", "升", (state) => state.businessTransactions?.some((item) => item.type === "升級")),
  milestone("first-insurance", "第一次购买保险", "保费是小支出，用来分担某些大风险。", "保险", "盾", (state) => activeInsuranceCount(state) > 0),
  milestone("first-claim", "第一次成功理赔", "保险不能让意外消失，但能减少压力。", "保险", "理", (state) => state.insuranceClaims?.length > 0),
  milestone("first-loan", "第一次借款", "借款会增加现金，也会增加未来月供。", "银行", "贷", (state) => state.bankTransactions?.some((item) => item.type === "个人贷款")),
  milestone("first-debt-paid", "第一次还清贷款", "减少负债会改善之后的现金流。", "银行", "清", (state) => state.progressStats?.debtPaidOffCount > 0 || state.bankTransactions?.some((item) => item.type === "debtCleared")),
  milestone("survive-unemployment", "第一次度过失业", "预备金与保险给你更多选择时间。", "工作", "稳", (state) => state.progressStats?.unemploymentRecoveredCount > 0),
  milestone("reemployed", "第一次重新就业", "收入恢复后可以重新规划现金流。", "工作", "职", (state) => state.lifeEventHistory?.some((item) => String(item.description || "").includes("重新就业"))),
  milestone("freedom-25", "被动收入达到 25%", "你已经开始建立基础。", "财务自由", "25", (state) => calculateFinancialFreedomProgress(state).percent >= 25),
  milestone("freedom-50", "被动收入达到 50%", "现金流正在成长。", "财务自由", "50", (state) => calculateFinancialFreedomProgress(state).percent >= 50),
  milestone("freedom-75", "被动收入达到 75%", "你接近自由阶段。", "财务自由", "75", (state) => calculateFinancialFreedomProgress(state).percent >= 75),
  milestone("net-worth-100k", "净资产达到 ¥100,000", "资产减负债后仍然为正并成长。", "资产", "资", (state) => calculateNetWorth(state) >= 100000),
  milestone("financial-freedom", "达成财务自由", "被动收入已覆盖每月必要支出。", "财务自由", "自", (state) => calculateFinancialFreedomProgress(state).percent >= 100),
];

export const achievementDefinitions = [
  achievement("cashflow-3", "连续 3 个月正现金流", "现金流", "保持每月现金流为正。", (state) => state.progressStats?.positiveCashflowStreak >= 3),
  achievement("cashflow-6", "连续 6 个月正现金流", "现金流", "稳定留下更多选择空间。", (state) => state.progressStats?.positiveCashflowStreak >= 6),
  achievement("cash-10k", "第一桶金", "现金流", "保留至少 ¥10,000 现金。", (state) => state.cash >= 10000),
  achievement("cash-50k", "现金缓冲", "现金流", "保留至少 ¥50,000 现金。", (state) => state.cash >= 50000),
  achievement("property-1", "房产新手", "房地产", "拥有 1 项房产。", (state) => state.ownedProperties?.length >= 1),
  achievement("property-3", "房产组合", "房地产", "拥有 3 项房产。", (state) => state.ownedProperties?.length >= 3),
  achievement("mortgage-paid", "还清第一笔房贷", "房地产", "有一项房产房贷已还清。", (state) => state.ownedProperties?.some((item) => moneyNumber(item.mortgageBalance) <= 0)),
  achievement("rent-5k", "租金成长", "房地产", "每月租金达到 ¥5,000。", (state) => totalRent(state) >= 5000),
  achievement("stock-first", "股票探索者", "股票", "完成第一次股票交易。", (state) => state.stockTransactions?.length > 0),
  achievement("stock-dividends-3", "股息观察员", "股票", "累计收到 3 次股息。", (state) => state.progressStats?.dividendCount >= 3 || totalDividends(state) > 0),
  achievement("stock-3", "分散持股", "股票", "持有 3 种不同虚构股票。", (state) => state.stockHoldings?.length >= 3),
  achievement("stock-profit", "实现一次股票结果", "股票", "卖出股票并记录实现损益。", (state) => state.stockTransactions?.some((item) => item.type === "卖出")),
  achievement("business-first", "创业起步", "小生意", "拥有第一间小生意。", (state) => state.businessHoldings?.length >= 1),
  achievement("business-upgrade", "完成第一次升级", "小生意", "小生意完成一次升级。", (state) => state.businessTransactions?.some((item) => item.type === "升級")),
  achievement("business-profit-10k", "小生意累积获利", "小生意", "小生意累计获利达到 ¥10,000。", (state) => totalBusinessProfit(state) >= 10000),
  achievement("business-2", "多店经营", "小生意", "同时拥有 2 个小生意。", (state) => state.businessHoldings?.length >= 2),
  achievement("loan-paid", "债务管理者", "银行与债务", "还清第一笔个人贷款。", (state) => state.progressStats?.debtPaidOffCount > 0),
  achievement("refinance", "月供降低", "银行与债务", "完成一次再融资。", (state) => state.bankTransactions?.some((item) => item.type === "再融资")),
  achievement("credit-720", "信用成长", "银行与债务", "信用分达到 720。", (state) => moneyNumber(state.bank?.creditScore) >= 720),
  achievement("debt-under-10k", "负债降温", "银行与债务", "总负债低于 ¥10,000。", (state) => totalDebt(state) <= 10000),
  achievement("insurance-first", "保险守护者", "保险", "购买第一张保险。", (state) => activeInsuranceCount(state) >= 1),
  achievement("insurance-claim", "成功理赔", "保险", "获得一次保险理赔。", (state) => state.insuranceClaims?.length > 0),
  achievement("insurance-2", "保障组合", "保险", "同时拥有 2 张保单。", (state) => activeInsuranceCount(state) >= 2),
  achievement("job-recovered", "工作复原力", "工作与人生", "从失业中恢复。", (state) => state.progressStats?.unemploymentRecoveredCount > 0),
  achievement("promotion", "工作发展", "工作与人生", "触发一次升职或加薪。", (state) => state.lifeEventHistory?.some((item) => String(item.type || item.description || "").includes("升") || String(item.description || "").includes("加薪"))),
  achievement("tutorial", "完成新手教学", "学习", "完成或跳过新手教学。", (state) => state.progressStats?.tutorialComplete === true),
  achievement("why-10", "好奇心十次", "学习", "查看 10 次为什么。", (state) => state.progressStats?.whyViews >= 10),
  achievement("tax-first", "第一次税务结算", "学习", "完成一次游戏税务结算。", (state) => state.tax?.taxPaid > 0 || state.tax?.taxBalance > 0),
  achievement("round-10", "完成 10 回合", "长期游玩", "持续玩到第 10 回合。", (state) => state.round >= 10),
  achievement("round-30", "完成 30 回合", "长期游玩", "持续玩到第 30 回合。", (state) => state.round >= 30),
  achievement("round-50", "完成 50 回合", "长期游玩", "持续玩到第 50 回合。", (state) => state.round >= 50),
  achievement("freedom", "财务自由", "财务自由", "被动收入覆盖必要支出。", (state) => calculateFinancialFreedomProgress(state).percent >= 100),
];

export const badgeDefinitions = [
  badge("first-cash", "第一桶金", "现金流", "现金达到 ¥10,000。", "金"),
  badge("property-rookie", "房产新手", "房地产", "拥有第一项房产。", "房"),
  badge("stock-explorer", "股票探索者", "股票", "完成第一次股票交易。", "股"),
  badge("business-starter", "创业起步", "小生意", "拥有第一间小生意。", "店"),
  badge("insurance-guardian", "保险守护者", "保险", "购买第一张保险。", "盾"),
  badge("debt-manager", "债务管理者", "银行与债务", "还清第一笔贷款。", "清"),
  badge("job-resilience", "工作复原力", "工作与人生", "从失业中恢复。", "职"),
  badge("cashflow-growth", "现金流成长", "现金流", "连续 3 个月正现金流。", "流"),
  badge("passive-master", "被动收入高手", "财务自由", "被动收入达到支出 75%。", "75"),
  badge("freedom", "财务自由", "财务自由", "被动收入覆盖必要支出。", "自"),
];

export const missionTemplates = [
  mission("cash-reserve", "保留 ¥10,000 现金", "让现金保持在 ¥10,000 以上。", "现金流", 10000, "beginner"),
  mission("stock-trade", "完成一次股票交易", "买入或卖出一支虚构股票。", "股票", 1, "standard"),
  mission("property-card", "查看房产机会", "看过一张房产机会卡。", "房地产", 1, "beginner"),
  mission("repay-debt", "偿还一部分贷款", "偿还至少 ¥1,000 债务。", "银行", 1000, "standard"),
  mission("business-upgrade", "完成一次小生意升级", "让一个小生意完成升级。", "小生意", 1, "standard"),
  mission("buy-insurance", "购买一张保险", "为某类风险准备一张保单。", "保险", 1, "beginner"),
  mission("positive-two", "连续两个月正现金流", "连续 2 个月月现金流为正。", "现金流", 2, "standard"),
  mission("view-finance", "查看一次财务面板", "打开财务资讯，理解现金流。", "学习", 1, "beginner"),
  mission("learn-event", "完成一次学习事件", "完成一次学习格事件。", "学习", 1, "beginner"),
  mission("passive-500", "被动收入提升 ¥500", "让被动收入比任务开始时多 ¥500。", "财务自由", 500, "advanced"),
];

export const challengeDefinitions = [
  challenge("starter-cashflow", "新手现金流", "20 回合内达到正现金流。", "新手", 20, "现金流成长"),
  challenge("emergency-fund", "紧急预备金", "累积 3 个月必要支出。", "标准", 30, "第一桶金"),
  challenge("debt-cleanup", "债务清理", "在指定回合内降低负债。", "标准", 25, "债务管理者"),
  challenge("property-start", "房产起步", "购买第一项正现金流房产。", "标准", 35, "房产新手"),
  challenge("diverse-income", "多元收入", "同时拥有 3 种收入来源。", "进阶", 40, "现金流成长"),
  challenge("freedom-run", "财务自由", "在指定回合内达成被动收入覆盖支出。", "进阶", 60, "财务自由"),
];

export function createDifficultyAdjustedCareer(career, difficultyId = "standard") {
  const mode = findDifficulty(difficultyId);
  return {
    ...career,
    savings: moneyNumber(career.savings * mode.cashMultiplier),
    expenses: Math.max(1, moneyNumber(career.expenses * mode.expenseMultiplier)),
  };
}

export function migrateProgressState(state) {
  if (!state || typeof state !== "object") return state;
  const previousStage = state.financialFreedomProgress?.stage || null;
  state.progressVersion = PROGRESS_STORAGE_VERSION;
  state.gameDifficulty = findDifficulty(state.gameDifficulty || "standard").id;
  state.progressStats = {
    whyViews: 0,
    financeViews: 0,
    propertyCardsViewed: 0,
    learningEventsCompleted: 0,
    debtRepaidAmount: 0,
    debtPaidOffCount: 0,
    unemploymentRecoveredCount: 0,
    dividendCount: 0,
    positiveCashflowStreak: 0,
    tutorialComplete: false,
    ...(state.progressStats && typeof state.progressStats === "object" ? state.progressStats : {}),
  };
  state.financialFreedomProgress = normalizeProgress(state.financialFreedomProgress);
  state.milestones = normalizeUnlocks(state.milestones, milestoneDefinitions);
  state.achievements = normalizeUnlocks(state.achievements, achievementDefinitions);
  state.badges = normalizeUnlocks(state.badges, badgeDefinitions);
  state.activeMissions = normalizeMissions(state.activeMissions);
  state.completedMissions = Array.isArray(state.completedMissions) ? state.completedMissions.slice(0, 60) : [];
  state.challenges = normalizeChallengeBestResults(state.challenges || state.challengeBestResults);
  state.challengeBestResults = state.challenges;
  state.activeChallenge = normalizeActiveChallenge(state.activeChallenge);
  state.gameReports = Array.isArray(state.gameReports) ? state.gameReports.slice(0, 10) : [];
  state.victoryState = normalizeVictoryState(state.victoryState);
  state.unlockQueue = Array.isArray(state.unlockQueue) ? state.unlockQueue.slice(0, 12) : [];
  state.pendingNotifications = normalizeNotifications(state.pendingNotifications || state.unlockQueue);
  state.shownNotificationIds = Array.isArray(state.shownNotificationIds) ? state.shownNotificationIds.slice(0, 80) : [];
  state.progressHistory = normalizeProgressHistory(state.progressHistory, previousStage);
  state.missionRefresh = normalizeMissionRefresh(state.missionRefresh);
  ensureMissionSlots(state);
  return state;
}

export function calculateFinancialFreedomProgress(state) {
  const passive = moneyNumber(calculatePassiveIncome(state));
  const necessaryExpenses = Math.max(0, moneyNumber(calculateTotalExpenses(state)));
  const rawPercent = necessaryExpenses <= 0 ? (passive > 0 ? 100 : 0) : (passive / necessaryExpenses) * 100;
  const percent = clampPercent(rawPercent);
  const remaining = Math.max(0, moneyNumber(necessaryExpenses - passive));
  return {
    passiveIncome: passive,
    necessaryExpenses,
    remaining,
    percent,
    displayPercent: Math.min(150, percent),
    stage: freedomStage(percent),
    educationTip: "这是游戏中的简化模型，用来练习现金流，不代表人生唯一目标或真实建议。",
  };
}

export function evaluateProgress(state, options = {}) {
  migrateProgressState(state);
  const previousProgress = state.financialFreedomProgress;
  const progress = calculateFinancialFreedomProgress(state);
  state.financialFreedomProgress = progress;
  recordProgressHistory(state, previousProgress, progress);
  updateCashflowStreak(state);
  updateMissions(state);
  const unlocked = [
    ...unlockItems(state, "milestones", milestoneDefinitions, "里程碑"),
    ...unlockItems(state, "achievements", achievementDefinitions, "成就"),
    ...unlockBadges(state),
  ];
  const victory = evaluateVictoryState(state, { turnPhase: options.turnPhase || "idle", hasOpenEvent: Boolean(options.hasOpenEvent) });
  const pressure = evaluateFinancialPressure(state);
  const challenge = evaluateChallenge(state);
  return { progress, unlocked, victory, pressure, challenge };
}

export function recordProgressEvent(state, eventType, amount = 1) {
  migrateProgressState(state);
  const value = Math.max(0, moneyNumber(amount));
  if (eventType === "why") state.progressStats.whyViews += 1;
  if (eventType === "financeView") state.progressStats.financeViews += 1;
  if (eventType === "propertyCard") state.progressStats.propertyCardsViewed += 1;
  if (eventType === "learningEvent") state.progressStats.learningEventsCompleted += 1;
  if (eventType === "debtRepaid") state.progressStats.debtRepaidAmount += value;
  if (eventType === "debtPaidOff") state.progressStats.debtPaidOffCount += 1;
  if (eventType === "unemploymentRecovered") state.progressStats.unemploymentRecoveredCount += 1;
  if (eventType === "dividend") state.progressStats.dividendCount += 1;
  if (eventType === "tutorialComplete") state.progressStats.tutorialComplete = true;
  updateMissions(state);
}

export function claimCompletedMissions(state) {
  migrateProgressState(state);
  const claimed = [];
  state.activeMissions = state.activeMissions.map((missionItem) => {
    if (missionItem.completed && !missionItem.claimed) {
      claimed.push(missionItem);
      return { ...missionItem, claimed: true };
    }
    return missionItem;
  });
  state.completedMissions = [...claimed, ...state.completedMissions].slice(0, 60);
  state.activeMissions = state.activeMissions.filter((missionItem) => !missionItem.claimed);
  ensureMissionSlots(state);
  claimed.forEach((missionItem) => queueProgressNotification(state, {
    id: `mission-claimed-${missionItem.id}`,
    type: "任务",
    iconKey: "任",
    title: missionItem.title,
    description: "任务奖励已领取，新的短期目标已更新。",
    targetTab: "missions",
  }));
  return claimed;
}

export function refreshActiveMissions(state) {
  migrateProgressState(state);
  const round = Math.max(1, moneyNumber(state.round, 1));
  if (round < state.missionRefresh.nextAllowedRound) {
    return {
      refreshed: false,
      reason: `第 ${state.missionRefresh.nextAllowedRound} 回合后可以刷新任务。`,
      nextAllowedRound: state.missionRefresh.nextAllowedRound,
    };
  }
  state.missionRefresh = {
    count: Math.min(99, state.missionRefresh.count + 1),
    lastRound: round,
    nextAllowedRound: round + 5,
  };
  state.activeMissions = [];
  ensureMissionSlots(state);
  queueProgressNotification(state, {
    id: `missions-refreshed-${round}-${state.missionRefresh.count}`,
    type: "任务",
    iconKey: "刷",
    title: "任务已刷新",
    description: "新的任务会根据目前游戏状态继续追踪。",
    targetTab: "missions",
  });
  return { refreshed: true, activeMissions: state.activeMissions };
}

export function buildProgressDashboard(state) {
  migrateProgressState(state);
  const progress = calculateFinancialFreedomProgress(state);
  const next = nextFreedomStage(progress.percent);
  const history = state.progressHistory.slice(0, 5);
  const passiveSources = passiveIncomeSources(state).filter((item) => item.amount > 0).slice(0, 4);
  const expenseSources = expenseSourcesForProgress(state).filter((item) => item.amount > 0).slice(0, 4);
  return {
    ...progress,
    nextStage: next.stage,
    nextStagePercent: next.percent,
    nextStageRemainingPercent: Math.max(0, moneyNumber(next.percent - progress.percent)),
    nextStageIncomeGap: progress.necessaryExpenses > 0 ? Math.max(0, moneyNumber((next.percent / 100) * progress.necessaryExpenses - progress.passiveIncome)) : 0,
    recentChanges: history,
    passiveSources: passiveSources.length ? passiveSources : [{ label: "尚无被动收入", amount: 0, iconKey: "起" }],
    expenseSources: expenseSources.length ? expenseSources : [{ label: "尚无必要支出", amount: 0, iconKey: "稳" }],
  };
}

export function buildMissionCards(state) {
  migrateProgressState(state);
  updateMissions(state);
  const round = Math.max(1, moneyNumber(state.round, 1));
  return state.activeMissions.slice(0, 3).map((missionItem) => ({
    ...missionItem,
    status: missionStatus(missionItem, round),
    remainingRounds: Math.max(0, moneyNumber(missionItem.expiresAtRound) - round),
    progressPercent: missionItem.target <= 0 ? 0 : Math.min(100, Math.round((moneyNumber(missionItem.progress) / moneyNumber(missionItem.target, 1)) * 100)),
    howToComplete: missionHelp(missionItem.id),
  }));
}

export function buildAchievementGroups(state, filter = "all", category = "all") {
  migrateProgressState(state);
  const filtered = state.achievements.filter((item) => {
    const filterMatch = filter === "all"
      || (filter === "unlocked" && item.unlocked)
      || (filter === "locked" && !item.unlocked)
      || (filter === "recent" && item.unlocked && moneyNumber(item.unlockedAtRound) >= Math.max(1, moneyNumber(state.round) - 10));
    const categoryMatch = category === "all" || item.category === category;
    return filterMatch && categoryMatch;
  });
  return groupByCategory(filtered.map((item) => ({
    ...item,
    displayTitle: item.hidden && !item.unlocked ? "神秘成就" : item.title,
    displayDescription: item.hidden && !item.unlocked ? "继续探索城市后会揭晓。" : item.description,
    progressLabel: achievementProgressLabel(state, item),
  })));
}

export function buildBadgeCollection(state) {
  migrateProgressState(state);
  return state.badges.map((item) => ({
    ...item,
    rarity: item.id === "freedom" ? "传奇" : item.category === "财务自由" ? "稀有" : "普通",
    outline: !item.unlocked,
  }));
}

export function buildMilestoneTimeline(state) {
  migrateProgressState(state);
  return state.milestones
    .filter((item) => item.unlocked)
    .slice()
    .sort((a, b) => moneyNumber(a.unlockedAtRound) - moneyNumber(b.unlockedAtRound) || moneyNumber(a.unlockedAtMonth) - moneyNumber(b.unlockedAtMonth))
    .map((item) => ({
      id: item.id,
      title: item.title,
      iconKey: item.iconKey,
      category: item.category,
      round: item.unlockedAtRound,
      month: item.unlockedAtMonth,
      result: `第 ${item.unlockedAtRound || "-"} 回合 · 第 ${item.unlockedAtMonth || "-"} 月`,
      learningTip: item.learningTip,
    }));
}

export function buildChallengeCards(state) {
  migrateProgressState(state);
  return challengeDefinitions.map((item) => {
    const best = state.challengeBestResults[item.id] || {};
    return {
      ...item,
      bestResult: best.completed ? `最佳 ${best.bestRound} 回合` : best.lastResult === "timedOut" ? "曾经超时" : "尚未完成",
      completed: Boolean(best.completed),
      independentSave: true,
    };
  });
}

export function buildReportSections(state, report) {
  migrateProgressState(state);
  const activeReport = report || state.gameReports[0] || createGameReport(state, "preview");
  return {
    summary: [
      ["总回合", `${activeReport.round}`],
      ["最终现金", moneyText(activeReport.cash)],
      ["月现金流", moneyText(activeReport.monthlyCashflow)],
      ["被动收入", moneyText(activeReport.passiveIncome)],
      ["净资产", moneyText(activeReport.netWorth)],
      ["财务自由进度", `${activeReport.freedomPercent}%`],
    ],
    sections: [
      { title: "收入结构", items: [`月收入 ${moneyText(activeReport.totalIncome)}`, `被动收入 ${moneyText(activeReport.passiveIncome)}`] },
      { title: "支出结构", items: [`月支出 ${moneyText(activeReport.monthlyExpenses)}`, `最大单笔支出 ${moneyText(activeReport.largestExpense)}`] },
      { title: "资产组合", items: [`房产 ${activeReport.propertyCount} 项`, `股票 ${activeReport.stockHoldingCount} 种`, `小生意 ${activeReport.businessCount} 个`] },
      { title: "负债状况", items: [`总负债 ${moneyText(activeReport.totalLiabilities)}`, `保单 ${activeReport.activeInsuranceCount} 张`] },
      { title: "完成内容", items: [`任务 ${activeReport.completedMissions} 个`, `成就 ${activeReport.unlockedAchievements} 个`] },
      { title: "关键决策", items: activeReport.keyDecisions },
      { title: "教育总结", items: buildEducationSummary(activeReport) },
    ],
  };
}

export function createShareCard(state, report) {
  migrateProgressState(state);
  const activeReport = report || state.gameReports[0] || createGameReport(state, "share");
  const recentBadge = state.badges.find((item) => item.unlocked) || { title: "现金流新手", iconKey: "起" };
  const summary = buildEducationSummary(activeReport)[0] || "你正在练习现金流选择。";
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="720" height="960" viewBox="0 0 720 960">
  <rect width="720" height="960" rx="44" fill="#e8f3ec"/>
  <rect x="42" y="42" width="636" height="876" rx="38" fill="#fffdf2" stroke="#d8a21f" stroke-width="6"/>
  <circle cx="604" cy="138" r="58" fill="#fff4cf"/>
  <text x="72" y="132" font-family="system-ui, sans-serif" font-size="46" font-weight="900" fill="#17201d">现金流冒险城</text>
  <text x="72" y="190" font-family="system-ui, sans-serif" font-size="28" font-weight="800" fill="#246b9f">我的游戏结算卡</text>
  <text x="72" y="292" font-family="system-ui, sans-serif" font-size="96" font-weight="900" fill="#1f7a52">${Math.min(999, moneyNumber(activeReport.freedomPercent))}%</text>
  <text x="72" y="340" font-family="system-ui, sans-serif" font-size="28" font-weight="800" fill="#66736d">财务自由进度</text>
  ${shareCardLine(72, 430, "回合", `${activeReport.round}`)}
  ${shareCardLine(72, 500, "最终现金", moneyText(activeReport.cash))}
  ${shareCardLine(72, 570, "月现金流", moneyText(activeReport.monthlyCashflow))}
  ${shareCardLine(72, 640, "被动收入", moneyText(activeReport.passiveIncome))}
  ${shareCardLine(72, 710, "净资产", moneyText(activeReport.netWorth))}
  <rect x="72" y="768" width="576" height="86" rx="24" fill="#e3f4eb"/>
  <text x="104" y="820" font-family="system-ui, sans-serif" font-size="26" font-weight="900" fill="#17201d">${escapeSvg(recentBadge.iconKey)} ${escapeSvg(recentBadge.title)}</text>
  <text x="72" y="888" font-family="system-ui, sans-serif" font-size="22" font-weight="800" fill="#66736d">${escapeSvg(summary).slice(0, 40)}</text>
</svg>`;
  const dataUrl = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
  return { svg, dataUrl, text: `现金流冒险城：第 ${activeReport.round} 回合，财务自由进度 ${activeReport.freedomPercent}%，净资产 ${moneyText(activeReport.netWorth)}。${summary}` };
}

export function nextProgressNotification(state) {
  migrateProgressState(state);
  const shown = new Set(state.shownNotificationIds);
  const next = state.pendingNotifications.find((item) => !shown.has(item.notificationId));
  if (!next) return null;
  state.shownNotificationIds = [next.notificationId, ...state.shownNotificationIds].slice(0, 80);
  state.pendingNotifications = state.pendingNotifications.filter((item) => item.notificationId !== next.notificationId).slice(0, 12);
  return next;
}

export function evaluateVictoryState(state, options = {}) {
  migrateProgressState(state);
  const progress = calculateFinancialFreedomProgress(state);
  const invalidPhase = ["rolling", "moving", "resolvingEvent", "openingEvent", "showingResult"].includes(options.turnPhase || "idle");
  const blocked = invalidPhase || options.hasOpenEvent;
  const hasWon = progress.percent >= 100 && calculateNetWorth(state) >= 0 && totalEmergencyDebt(state) < Math.max(50000, progress.necessaryExpenses * 6);
  if (!hasWon || blocked || state.victoryState.triggered) {
    return { triggered: false, blocked, canWin: hasWon, progress };
  }
  state.victoryState = {
    triggered: true,
    continued: false,
    achievedAtMonth: Math.max(1, moneyNumber(state.month, 1)),
    achievedAtRound: Math.max(1, moneyNumber(state.round, 1)),
    reportId: `report-victory-${Date.now()}`,
  };
  state.gameOver = true;
  const report = createGameReport(state, "victory");
  state.victoryState.reportId = report.id;
  addReport(state, report);
  return { triggered: true, blocked: false, canWin: true, progress, report };
}

export function continueFreedomMode(state) {
  migrateProgressState(state);
  state.victoryState.continued = true;
  state.gameOver = false;
  return state;
}

export function evaluateFinancialPressure(state) {
  const cash = moneyNumber(state.cash);
  const flow = calculateMonthlyCashflow(state);
  const debt = totalDebt(state) + totalEmergencyDebt(state);
  const severe = cash < 0 && (debt > Math.max(30000, calculateTotalExpenses(state) * 3) || flow < 0);
  return {
    severe,
    cash,
    monthlyGap: flow < 0 ? Math.abs(flow) : 0,
    debt,
    message: severe ? "现金和负债压力偏高，可以先查看银行、出售资产或调整支出。" : "目前尚未进入严重压力状态。",
    actions: ["前往银行", "出售资产", "降低支出", "寻找工作", "使用保险", "重新开始", "继续挑战"],
  };
}

export function createGameReport(state, reason = "manual") {
  migrateProgressState(state);
  const progress = calculateFinancialFreedomProgress(state);
  const assetsTotal = totalAssets(state);
  const liabilitiesTotal = totalDebt(state);
  return {
    id: `report-${reason}-${Date.now()}`,
    reason,
    month: moneyNumber(state.month),
    round: moneyNumber(state.round),
    cash: moneyNumber(state.cash),
    totalIncome: moneyNumber(calculateMonthlyCashflow(state) + calculateTotalExpenses(state)),
    monthlyExpenses: moneyNumber(calculateTotalExpenses(state)),
    monthlyCashflow: moneyNumber(calculateMonthlyCashflow(state)),
    passiveIncome: progress.passiveIncome,
    freedomPercent: progress.percent,
    netWorth: moneyNumber(calculateNetWorth(state)),
    totalAssets: assetsTotal,
    totalLiabilities: liabilitiesTotal,
    propertyCount: state.ownedProperties?.length || 0,
    stockHoldingCount: state.stockHoldings?.length || 0,
    businessCount: state.businessHoldings?.length || 0,
    activeInsuranceCount: activeInsuranceCount(state),
    unlockedAchievements: unlockedCount(state.achievements),
    completedMissions: state.completedMissions?.length || 0,
    largestIncome: largestTransaction(state, "income"),
    largestExpense: largestTransaction(state, "expense"),
    keyDecisions: keyDecisionSummary(state),
    goodSummary: progress.percent >= 75 ? "你已经让被动收入接近或覆盖支出。" : "你已经开始记录资产、支出和现金流变化。",
    improveSummary: liabilitiesTotal > assetsTotal ? "下一局可以更早观察负债和月供。" : "下一局可以尝试提高收入来源的多元性。",
    nextStrategy: "这只是游戏规则摘要，不是真实投资建议。可以试着比较现金、安全垫与现金流。",
    createdAt: new Date().toISOString(),
  };
}

export function addReport(state, report) {
  migrateProgressState(state);
  state.gameReports = [report, ...state.gameReports.filter((item) => item.id !== report.id)].slice(0, 10);
  return report;
}

export function startChallengeState(baseState, challengeId, career) {
  const challengeItem = challengeDefinitions.find((item) => item.id === challengeId) || challengeDefinitions[0];
  const cloned = JSON.parse(JSON.stringify(baseState));
  migrateProgressState(cloned);
  cloned.activeChallenge = {
    id: challengeItem.id,
    startedAtRound: cloned.round || 1,
    roundLimit: challengeItem.roundLimit,
    completed: false,
    timedOut: false,
    reportShown: false,
    startingDebt: totalDebt(cloned),
  };
  cloned.cash = moneyNumber((career?.savings ?? cloned.cash) * 1.05);
  cloned.round = 1;
  cloned.month = 1;
  cloned.position = 0;
  cloned.logs = [`开始挑战「${challengeItem.title}」。`, ...(cloned.logs || [])].slice(0, 9);
  return cloned;
}

export function evaluateChallenge(state) {
  migrateProgressState(state);
  const active = state.activeChallenge;
  if (!active) return { active: false };
  const challengeItem = challengeDefinitions.find((item) => item.id === active.id);
  if (!challengeItem) return { active: false };
  const elapsed = Math.max(0, moneyNumber(state.round) - moneyNumber(active.startedAtRound));
  const completed = challengeComplete(state, active.id);
  const timedOut = elapsed > active.roundLimit && !completed;
  state.activeChallenge = { ...active, completed, timedOut };
  if (completed || timedOut) {
    state.challengeBestResults[active.id] = {
      completed,
      timedOut,
      bestRound: completed ? Math.min(state.challengeBestResults[active.id]?.bestRound || 9999, elapsed) : state.challengeBestResults[active.id]?.bestRound || null,
      lastResult: completed ? "completed" : "timedOut",
      rewardBadge: challengeItem.rewardBadge,
    };
  }
  return { active: true, challenge: challengeItem, elapsed, completed, timedOut };
}

function challengeComplete(state, id) {
  if (id === "starter-cashflow") return calculateMonthlyCashflow(state) > 0;
  if (id === "emergency-fund") return state.cash >= calculateTotalExpenses(state) * 3;
  if (id === "debt-cleanup") return totalDebt(state) <= Math.max(0, moneyNumber(state.activeChallenge?.startingDebt) * 0.75);
  if (id === "property-start") return state.ownedProperties?.some((item) => moneyNumber(item.monthlyCashflow) > 0);
  if (id === "diverse-income") return incomeSourceCount(state) >= 3;
  if (id === "freedom-run") return calculateFinancialFreedomProgress(state).percent >= 100;
  return false;
}

function ensureMissionSlots(state) {
  const activeIds = new Set(state.activeMissions.map((item) => item.id));
  const completedIds = new Set(state.completedMissions.map((item) => item.id));
  for (const template of missionTemplates) {
    if (state.activeMissions.length >= 3) break;
    if (activeIds.has(template.id) || completedIds.has(template.id)) continue;
    state.activeMissions.push(createMissionFromTemplate(template, state));
  }
  updateMissions(state);
}

function updateMissions(state) {
  state.activeMissions = state.activeMissions.map((missionItem) => {
    const template = missionTemplates.find((item) => item.id === missionItem.id);
    if (!template) return missionItem;
    const progress = missionProgress(state, missionItem, template);
    return {
      ...missionItem,
      progress,
      completed: progress >= missionItem.target,
    };
  });
}

function missionProgress(state, missionItem, template) {
  if (template.id === "cash-reserve") return Math.min(template.target, Math.max(0, moneyNumber(state.cash)));
  if (template.id === "stock-trade") return state.stockTransactions?.length ? 1 : 0;
  if (template.id === "property-card") return Math.min(template.target, state.progressStats?.propertyCardsViewed || 0);
  if (template.id === "repay-debt") return Math.min(template.target, state.progressStats?.debtRepaidAmount || 0);
  if (template.id === "business-upgrade") return state.businessTransactions?.some((item) => item.type === "升級") ? 1 : 0;
  if (template.id === "buy-insurance") return activeInsuranceCount(state) > 0 ? 1 : 0;
  if (template.id === "positive-two") return Math.min(template.target, state.progressStats?.positiveCashflowStreak || 0);
  if (template.id === "view-finance") return Math.min(template.target, state.progressStats?.financeViews || 0);
  if (template.id === "learn-event") return Math.min(template.target, state.progressStats?.learningEventsCompleted || 0);
  if (template.id === "passive-500") return Math.min(template.target, Math.max(0, calculatePassiveIncome(state) - moneyNumber(missionItem.startValue)));
  return 0;
}

function createMissionFromTemplate(template, state) {
  return {
    id: template.id,
    title: template.title,
    description: template.description,
    category: template.category,
    target: template.target,
    progress: 0,
    completed: false,
    claimed: false,
    reward: { type: "badgeGlow", label: "徽章光效" },
    expiresAtRound: (state.round || 1) + 20,
    difficulty: template.difficulty,
    startValue: template.id === "passive-500" ? calculatePassiveIncome(state) : 0,
  };
}

function unlockItems(state, key, definitions, type) {
  const unlocked = [];
  state[key] = state[key].map((item) => {
    if (item.unlocked) return item;
    const definition = definitions.find((entry) => entry.id === item.id);
    if (!definition?.condition(state)) return item;
    const next = {
      ...item,
      unlocked: true,
      unlockedAtMonth: state.month || 1,
      unlockedAtRound: state.round || 1,
    };
    unlocked.push({ ...definition, type, unlockedAtMonth: next.unlockedAtMonth, unlockedAtRound: next.unlockedAtRound });
    return next;
  });
  queueUnlocks(state, unlocked);
  return unlocked;
}

function unlockBadges(state) {
  const map = {
    "first-cash": "cash-10k",
    "property-rookie": "property-1",
    "stock-explorer": "stock-first",
    "business-starter": "business-first",
    "insurance-guardian": "insurance-first",
    "debt-manager": "loan-paid",
    "job-resilience": "job-recovered",
    "cashflow-growth": "cashflow-3",
    "passive-master": "freedom-75",
    freedom: "freedom",
  };
  const achievementMap = new Map(state.achievements.map((item) => [item.id, item.unlocked]));
  const unlocked = [];
  state.badges = state.badges.map((item) => {
    if (item.unlocked) return item;
    if (!achievementMap.get(map[item.id])) return item;
    const definition = badgeDefinitions.find((entry) => entry.id === item.id);
    const next = { ...item, unlocked: true, unlockedAtMonth: state.month || 1, unlockedAtRound: state.round || 1 };
    unlocked.push({ ...definition, type: "徽章", unlockedAtMonth: next.unlockedAtMonth, unlockedAtRound: next.unlockedAtRound });
    return next;
  });
  queueUnlocks(state, unlocked);
  return unlocked;
}

function queueUnlocks(state, items) {
  if (!items.length) return;
  const existing = new Set(state.unlockQueue.map((item) => `${item.type}-${item.id}`));
  const fresh = items.filter((item) => !existing.has(`${item.type}-${item.id}`));
  state.unlockQueue = [...state.unlockQueue, ...fresh].slice(-12);
  fresh.forEach((item) => queueProgressNotification(state, {
    id: `${item.type}-${item.id}`,
    type: item.type,
    iconKey: item.iconKey,
    title: item.title,
    description: item.description || item.learningTip || "新的进度已记录。",
    targetTab: item.type === "徽章" ? "badges" : item.type === "里程碑" ? "freedom" : "achievements",
  }));
}

function updateCashflowStreak(state) {
  if (calculateMonthlyCashflow(state) > 0) {
    state.progressStats.positiveCashflowStreak = Math.max(state.progressStats.positiveCashflowStreak || 0, Math.min(99, state.month || 1));
  } else {
    state.progressStats.positiveCashflowStreak = 0;
  }
}

function normalizeUnlocks(existing, definitions) {
  const map = new Map(Array.isArray(existing) ? existing.map((item) => [item.id, item]) : []);
  return definitions.map((definition) => {
    const previous = map.get(definition.id) || {};
    return {
      id: definition.id,
      title: definition.title,
      description: definition.description,
      category: definition.category,
      iconKey: definition.iconKey,
      unlocked: Boolean(previous.unlocked),
      unlockedAtMonth: previous.unlockedAtMonth || null,
      unlockedAtRound: previous.unlockedAtRound || null,
      reward: previous.reward || definition.reward,
      learningTip: previous.learningTip || definition.learningTip,
    };
  });
}

function normalizeMissions(existing) {
  if (!Array.isArray(existing)) return [];
  return existing
    .filter((item) => item && typeof item.id === "string")
    .slice(0, 3)
    .map((item) => ({
      id: item.id,
      title: item.title || item.id,
      description: item.description || "",
      category: item.category || "任务",
      target: Math.max(1, moneyNumber(item.target, 1)),
      progress: Math.max(0, moneyNumber(item.progress)),
      completed: Boolean(item.completed),
      claimed: Boolean(item.claimed),
      reward: item.reward || { type: "badgeGlow", label: "徽章光效" },
      expiresAtRound: Math.max(1, moneyNumber(item.expiresAtRound, 20)),
      difficulty: item.difficulty || "beginner",
      startValue: moneyNumber(item.startValue),
    }));
}

function normalizeProgress(progress) {
  return progress && typeof progress === "object"
    ? {
        passiveIncome: moneyNumber(progress.passiveIncome),
        necessaryExpenses: Math.max(0, moneyNumber(progress.necessaryExpenses)),
        remaining: Math.max(0, moneyNumber(progress.remaining)),
        percent: clampPercent(progress.percent),
        displayPercent: Math.min(150, clampPercent(progress.displayPercent ?? progress.percent)),
        stage: progress.stage || "起步",
        educationTip: progress.educationTip || "这是游戏中的简化模型。",
      }
    : calculateFinancialFreedomProgress({ assets: [], ownedProperties: [], liabilities: [], insurancePolicies: [], lifeActiveEffects: [] });
}

function normalizeVictoryState(value) {
  return {
    triggered: Boolean(value?.triggered),
    continued: Boolean(value?.continued),
    achievedAtMonth: value?.achievedAtMonth || null,
    achievedAtRound: value?.achievedAtRound || null,
    reportId: value?.reportId || null,
  };
}

function normalizeChallengeBestResults(value) {
  const source = value && typeof value === "object" ? value : {};
  return Object.fromEntries(challengeDefinitions.map((item) => [item.id, source[item.id] || { completed: false, bestRound: null, lastResult: null, rewardBadge: item.rewardBadge }]));
}

function normalizeActiveChallenge(value) {
  if (!value || typeof value !== "object" || !challengeDefinitions.some((item) => item.id === value.id)) return null;
  return {
    id: value.id,
    startedAtRound: Math.max(1, moneyNumber(value.startedAtRound, 1)),
    roundLimit: Math.max(1, moneyNumber(value.roundLimit, 20)),
    completed: Boolean(value.completed),
    timedOut: Boolean(value.timedOut),
    reportShown: Boolean(value.reportShown),
    startingDebt: Math.max(0, moneyNumber(value.startingDebt)),
  };
}

function normalizeNotifications(value) {
  return (Array.isArray(value) ? value : [])
    .filter((item) => item && typeof item === "object")
    .slice(-12)
    .map((item) => {
      const id = String(item.id || `${item.type || "progress"}-${item.title || Date.now()}`);
      const type = String(item.type || "进度");
      return {
        notificationId: String(item.notificationId || `${type}-${id}`),
        id,
        type,
        iconKey: String(item.iconKey || "奖").slice(0, 2),
        title: String(item.title || "新的进度"),
        description: String(item.description || item.learningTip || "新的进度已记录。"),
        targetTab: String(item.targetTab || "achievements"),
      };
    });
}

function normalizeProgressHistory(value, previousStage) {
  if (Array.isArray(value) && value.length) {
    return value
      .filter((item) => item && typeof item === "object")
      .slice(0, 20)
      .map((item) => ({
        month: moneyNumber(item.month, 1),
        round: moneyNumber(item.round, 1),
        percent: clampPercent(item.percent),
        stage: item.stage || previousStage || "起步",
        change: moneyNumber(item.change),
      }));
  }
  return [];
}

function normalizeMissionRefresh(value) {
  const source = value && typeof value === "object" ? value : {};
  return {
    count: Math.max(0, moneyNumber(source.count)),
    lastRound: Math.max(0, moneyNumber(source.lastRound)),
    nextAllowedRound: Math.max(1, moneyNumber(source.nextAllowedRound, 1)),
  };
}

function recordProgressHistory(state, previous, progress) {
  const previousPercent = clampPercent(previous?.percent);
  const change = moneyNumber(progress.percent - previousPercent);
  const last = state.progressHistory[0];
  if (last && last.round === state.round && last.month === state.month && last.percent === progress.percent) return;
  if (change === 0 && last?.stage === progress.stage) return;
  state.progressHistory = [
    {
      month: Math.max(1, moneyNumber(state.month, 1)),
      round: Math.max(1, moneyNumber(state.round, 1)),
      percent: progress.percent,
      stage: progress.stage,
      change,
    },
    ...state.progressHistory,
  ].slice(0, 20);
  if (previous?.stage && previous.stage !== progress.stage && progress.percent > previousPercent) {
    queueProgressNotification(state, {
      id: `freedom-stage-${progress.stage}`,
      type: "阶段",
      iconKey: "阶",
      title: `进入「${progress.stage}」`,
      description: `财务自由进度来到 ${progress.percent}%。`,
      targetTab: "freedom",
    });
  }
}

function queueProgressNotification(state, item) {
  const normalized = normalizeNotifications([item])[0];
  if (!normalized) return;
  const existing = new Set([
    ...state.pendingNotifications.map((entry) => entry.notificationId),
    ...state.shownNotificationIds,
  ]);
  if (existing.has(normalized.notificationId)) return;
  state.pendingNotifications = [...state.pendingNotifications, normalized].slice(-12);
}

function nextFreedomStage(percent) {
  if (percent < 25) return { stage: "建立基础", percent: 25 };
  if (percent < 50) return { stage: "现金流成长", percent: 50 };
  if (percent < 75) return { stage: "接近自由", percent: 75 };
  if (percent < 100) return { stage: "财务自由", percent: 100 };
  return { stage: "自由模式", percent: 100 };
}

function passiveIncomeSources(state) {
  return [
    { label: "房产租金", amount: totalRent(state), iconKey: "房" },
    { label: "股票股息", amount: totalDividends(state), iconKey: "股" },
    { label: "小生意利润", amount: totalBusinessProfit(state), iconKey: "店" },
    { label: "其他资产", amount: Math.max(0, calculatePassiveIncome(state) - totalRent(state) - totalDividends(state) - totalBusinessProfit(state)), iconKey: "资" },
  ];
}

function expenseSourcesForProgress(state) {
  const mortgage = Array.isArray(state.ownedProperties) ? state.ownedProperties.reduce((sum, item) => sum + moneyNumber(item.mortgagePayment), 0) : 0;
  const property = Array.isArray(state.ownedProperties) ? state.ownedProperties.reduce((sum, item) => sum + moneyNumber(item.monthlyExpenses), 0) : 0;
  const insurance = Array.isArray(state.insurancePolicies) ? state.insurancePolicies.filter((item) => item.active).reduce((sum, item) => sum + moneyNumber(item.monthlyPremium), 0) : 0;
  const debt = Array.isArray(state.liabilities) ? state.liabilities.reduce((sum, item) => sum + moneyNumber(item.payment), 0) : 0;
  return [
    { label: "生活支出", amount: moneyNumber(state.baseExpenses), iconKey: "家" },
    { label: "贷款月供", amount: debt + mortgage, iconKey: "贷" },
    { label: "房产持有", amount: property, iconKey: "修" },
    { label: "保险保费", amount: insurance, iconKey: "盾" },
  ];
}

function missionStatus(missionItem, round) {
  if (missionItem.claimed) return "已领取";
  if (missionItem.completed) return "已完成待领取";
  if (round > moneyNumber(missionItem.expiresAtRound)) return "已过期";
  if (moneyNumber(missionItem.expiresAtRound) - round <= 3) return "即将到期";
  return "进行中";
}

function missionHelp(id) {
  return {
    "cash-reserve": "少做大额支出，或通过收入事件增加现金。",
    "stock-trade": "落到股票机会格时，可以买入或卖出虚构股票。",
    "property-card": "落到房产机会格，打开机会卡即可推进。",
    "repay-debt": "打开银行中心，选择合适的贷款偿还。",
    "business-upgrade": "拥有小生意后，在详情里购买未完成升级。",
    "buy-insurance": "打开保险中心，购买一张适合当前风险的保单。",
    "positive-two": "让收入大于支出，并连续维持两个月。",
    "view-finance": "打开财务面板查看现金流摘要。",
    "learn-event": "落到学习格并完成学习事件。",
    "passive-500": "通过房产、股息或小生意提高每月被动收入。",
  }[id] || "继续正常游戏即可推进这个任务。";
}

function groupByCategory(items) {
  return items.reduce((groups, item) => {
    const category = item.category || "其他";
    if (!groups[category]) groups[category] = [];
    groups[category].push(item);
    return groups;
  }, {});
}

function achievementProgressLabel(state, item) {
  if (item.unlocked) return "已解锁";
  if (item.id === "round-10") return `${Math.min(10, moneyNumber(state.round))} / 10 回合`;
  if (item.id === "round-30") return `${Math.min(30, moneyNumber(state.round))} / 30 回合`;
  if (item.id === "round-50") return `${Math.min(50, moneyNumber(state.round))} / 50 回合`;
  if (item.id === "cash-10k") return `${moneyText(Math.min(10000, moneyNumber(state.cash)))} / ¥10,000`;
  if (item.id === "cash-50k") return `${moneyText(Math.min(50000, moneyNumber(state.cash)))} / ¥50,000`;
  if (item.id === "property-3") return `${Math.min(3, state.ownedProperties?.length || 0)} / 3 房产`;
  if (item.id === "stock-3") return `${Math.min(3, state.stockHoldings?.length || 0)} / 3 股票`;
  if (item.id === "why-10") return `${Math.min(10, state.progressStats?.whyViews || 0)} / 10 次`;
  return "继续游戏推进";
}

function buildEducationSummary(report) {
  const good = [
    report.freedomPercent >= 50 ? "你已经让被动收入明显接近支出。" : "你开始追踪现金、收入和支出。",
    report.netWorth >= 0 ? "净资产保持为正，说明资产与负债仍可管理。" : "你已经看见负债压力如何影响净资产。",
    report.completedMissions > 0 ? "你完成了短期任务，回合目标更清楚。" : "你愿意打开报告复盘，这是很好的学习习惯。",
  ];
  const improve = [
    report.monthlyCashflow < 0 ? "下局可以先降低固定支出或提高稳定收入。" : "下局可以继续观察现金流是否稳定。",
    report.totalLiabilities > report.totalAssets ? "下局可以更早比较借款月供与资产收入。" : "下局可以练习更多元的收入来源。",
    report.passiveIncome < report.monthlyExpenses ? "下局可以寻找能持续产生现金流的资产。" : "下局可以练习守住成果并管理风险。",
  ];
  const next = [
    "先保留安全现金，再比较机会卡的收入与成本。",
    "不要把分散说成没有风险，重点是减少单一事件影响。",
    "这只是游戏学习规则，不是真实投资建议。",
  ];
  return [...good.slice(0, 3), ...improve.slice(0, 3), ...next.slice(0, 3)];
}

function moneyText(value) {
  const safe = moneyNumber(value);
  const sign = safe < 0 ? "-" : "";
  return `${sign}¥${Math.abs(safe).toLocaleString("zh-CN")}`;
}

function shareCardLine(x, y, label, value) {
  return `<text x="${x}" y="${y}" font-family="system-ui, sans-serif" font-size="24" font-weight="800" fill="#66736d">${escapeSvg(label)}</text><text x="${x + 190}" y="${y}" font-family="system-ui, sans-serif" font-size="30" font-weight="900" fill="#17201d">${escapeSvg(value)}</text>`;
}

function escapeSvg(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function findDifficulty(id) {
  return difficultyModes.find((item) => item.id === id) || difficultyModes[1];
}

function freedomStage(percent) {
  if (percent >= 100) return "财务自由";
  if (percent >= 75) return "接近自由";
  if (percent >= 50) return "现金流成长";
  if (percent >= 25) return "建立基础";
  return "起步";
}

function milestone(id, title, description, category, iconKey, condition) {
  return { id, title, description, category, iconKey, condition, reward: { type: "badgeGlow", label: "徽章光效" }, learningTip: description };
}

function achievement(id, title, category, description, condition) {
  return { id, title, category, description, iconKey: title.slice(0, 1), condition, reward: { type: "badgeGlow", label: "收藏徽章" }, learningTip: description };
}

function badge(id, title, category, description, iconKey) {
  return { id, title, category, description, iconKey, reward: { type: "collection", label: "收藏徽章" }, learningTip: description };
}

function mission(id, title, description, category, target, difficulty) {
  return { id, title, description, category, target, difficulty };
}

function challenge(id, title, description, difficulty, roundLimit, rewardBadge) {
  return { id, title, description, difficulty, roundLimit, startingModifiers: {}, objectives: [description], completed: false, bestResult: null, rewardBadge };
}

function moneyNumber(value, fallback = 0) {
  const number = Number(value);
  if (!Number.isFinite(number)) return fallback;
  const rounded = Math.round(number);
  return Object.is(rounded, -0) ? 0 : rounded;
}

function clampPercent(value) {
  const number = Number(value);
  if (!Number.isFinite(number)) return 0;
  return Math.max(0, Math.round(number));
}

function totalRent(state) {
  return Array.isArray(state.ownedProperties) ? state.ownedProperties.reduce((sum, item) => sum + moneyNumber(item.monthlyRent), 0) : 0;
}

function totalDividends(state) {
  return Array.isArray(state.stockHoldings) ? state.stockHoldings.reduce((sum, item) => sum + moneyNumber(item.dividendsReceived), 0) : 0;
}

function totalBusinessProfit(state) {
  return Array.isArray(state.businessHoldings) ? state.businessHoldings.reduce((sum, item) => sum + moneyNumber(item.cumulativeProfit), 0) : 0;
}

function activeInsuranceCount(state) {
  return Array.isArray(state.insurancePolicies) ? state.insurancePolicies.filter((item) => item.active).length : 0;
}

function totalDebt(state) {
  return Array.isArray(state.liabilities) ? state.liabilities.reduce((sum, item) => sum + moneyNumber(item.balance), 0) : 0;
}

function totalEmergencyDebt(state) {
  return moneyNumber(state.emergencyDebt) + (Array.isArray(state.liabilities) ? state.liabilities.filter((item) => item.type === "emergency" || item.type === "tax").reduce((sum, item) => sum + moneyNumber(item.balance), 0) : 0);
}

function totalAssets(state) {
  const stocks = Array.isArray(state.stockHoldings) ? state.stockHoldings.reduce((sum, item) => sum + moneyNumber(item.currentValue), 0) : 0;
  const properties = Array.isArray(state.ownedProperties) ? state.ownedProperties.reduce((sum, item) => sum + moneyNumber(item.currentValue), 0) : 0;
  const businesses = Array.isArray(state.businessHoldings) ? state.businessHoldings.reduce((sum, item) => sum + moneyNumber(item.currentValue), 0) : 0;
  const assets = Array.isArray(state.assets) ? state.assets.reduce((sum, item) => sum + moneyNumber(item.value), 0) : 0;
  return moneyNumber(state.cash) + stocks + properties + businesses + assets;
}

function incomeSourceCount(state) {
  return [
    moneyNumber(state.salary) > 0,
    totalDividends(state) > 0,
    totalRent(state) > 0,
    totalBusinessProfit(state) > 0,
  ].filter(Boolean).length;
}

function unlockedCount(items) {
  return Array.isArray(items) ? items.filter((item) => item.unlocked).length : 0;
}

function largestTransaction(state, direction) {
  const values = [
    ...(state.propertyTransactions || []),
    ...(state.stockTransactions || []),
    ...(state.businessTransactions || []),
    ...(state.bankTransactions || []),
    ...(state.insuranceTransactions || []),
    ...(state.lifeEventHistory || []),
  ].map((item) => moneyNumber(item.cashChange || item.totalAmount || item.amount || 0));
  const filtered = values.filter((value) => (direction === "income" ? value > 0 : value < 0)).map(Math.abs);
  return filtered.length ? Math.max(...filtered) : 0;
}

function keyDecisionSummary(state) {
  const decisions = [];
  if (state.ownedProperties?.length) decisions.push(`购买 ${state.ownedProperties.length} 项房产`);
  if (state.stockHoldings?.length) decisions.push(`持有 ${state.stockHoldings.length} 种股票`);
  if (state.businessHoldings?.length) decisions.push(`经营 ${state.businessHoldings.length} 个小生意`);
  if (activeInsuranceCount(state)) decisions.push(`购买 ${activeInsuranceCount(state)} 张保单`);
  if (!decisions.length) decisions.push("先观察现金、支出和机会");
  return decisions.slice(0, 3);
}
