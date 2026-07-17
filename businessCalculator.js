import { businessDefinitions } from "./businessData.js";
import { addBusinessTransaction, createBusinessTransaction } from "./businessTransactions.js";

const SELLING_FEE_RATE = 0.06;

export function businessMoney(value, fallback = 0) {
  const number = Number(value);
  if (!Number.isFinite(number)) return fallback;
  const rounded = Math.round(number);
  return Object.is(rounded, -0) ? 0 : rounded;
}

export function clampBusinessMoney(value, fallback = 0) {
  return Math.max(0, businessMoney(value, fallback));
}

export function ensureBusinessState(state) {
  if (!Array.isArray(state.businessHoldings)) state.businessHoldings = [];
  if (!Array.isArray(state.businessTransactions)) state.businessTransactions = [];
  if (!Array.isArray(state.businessMarketRecords)) state.businessMarketRecords = [];
  if (!Array.isArray(state.settledBusinessEvents)) state.settledBusinessEvents = [];
  if (!Array.isArray(state.settledBusinessMonths)) state.settledBusinessMonths = [];
  if (!Array.isArray(state.liabilities)) state.liabilities = [];
  if (!Array.isArray(state.assets)) state.assets = [];
  state.businessHoldings = normalizeBusinessHoldings(state.businessHoldings);
  state.emergencyDebt = clampBusinessMoney(state.emergencyDebt || 0);
}

export function createBusinessFromDefinition(definition, month) {
  return recalculateBusiness({
    businessId: definition.id,
    name: definition.name,
    category: definition.category,
    description: definition.description,
    illustrationKey: definition.illustrationKey,
    level: 1,
    totalInvested: definition.startupCost,
    currentValue: definition.currentValue,
    monthlyRevenue: definition.monthlyRevenue,
    monthlyFixedCost: definition.monthlyFixedCost,
    monthlyVariableCost: definition.monthlyVariableCost,
    monthlyExpenses: definition.monthlyFixedCost + definition.monthlyVariableCost,
    monthlyProfit: definition.monthlyProfit,
    cumulativeProfit: 0,
    condition: definition.condition,
    demandModifier: 1,
    riskModifier: 1,
    staffCount: definition.staffCount,
    ownerTimeRequired: definition.ownerTimeRequired,
    passiveRatio: definition.passiveRatio,
    failureRisk: definition.failureRisk,
    riskLevel: definition.riskLevel,
    growthLevel: definition.growthLevel,
    maxLevel: definition.maxLevel,
    customerDemand: definition.customerDemand,
    eventSensitivity: definition.eventSensitivity,
    purchasedMonth: Math.max(1, Math.round(Number(month) || 1)),
    lastEventMonth: 0,
    purchasedUpgrades: [],
    activeEffects: [],
    status: "owned",
    recentEvent: "剛投資",
  });
}

export function recalculateBusiness(business) {
  const monthlyRevenue = clampBusinessMoney(business.monthlyRevenue);
  const monthlyFixedCost = clampBusinessMoney(business.monthlyFixedCost);
  const monthlyVariableCost = clampBusinessMoney(business.monthlyVariableCost);
  const monthlyExpenses = clampBusinessMoney(business.monthlyExpenses || monthlyFixedCost + monthlyVariableCost);
  const monthlyProfit = businessMoney(monthlyRevenue - monthlyExpenses);
  const currentValue = clampBusinessMoney(business.currentValue);
  const totalInvested = clampBusinessMoney(business.totalInvested);
  const passiveRatio = Math.max(0, Math.min(1, Number(business.passiveRatio) || 0));
  return {
    ...business,
    level: Math.max(1, Math.round(Number(business.level) || 1)),
    totalInvested,
    currentValue,
    monthlyRevenue,
    monthlyFixedCost,
    monthlyVariableCost,
    monthlyExpenses,
    monthlyProfit,
    cumulativeProfit: businessMoney(business.cumulativeProfit),
    demandModifier: Math.max(0.4, Number(business.demandModifier) || 1),
    riskModifier: Math.max(0.4, Number(business.riskModifier) || 1),
    staffCount: Math.max(0, Math.round(Number(business.staffCount) || 0)),
    ownerTimeRequired: Math.max(0, Math.round(Number(business.ownerTimeRequired) || 0)),
    passiveRatio,
    purchasedUpgrades: Array.isArray(business.purchasedUpgrades) ? business.purchasedUpgrades : [],
    activeEffects: Array.isArray(business.activeEffects) ? business.activeEffects : [],
    status: business.status || "owned",
  };
}

export function normalizeBusinessHoldings(holdings) {
  if (!Array.isArray(holdings)) return [];
  return holdings.map((business) => recalculateBusiness(business)).filter((business) => business.status !== "sold");
}

export function calculateBusinessDefinition(definition) {
  const monthlyExpenses = clampBusinessMoney(definition.monthlyFixedCost + definition.monthlyVariableCost);
  return {
    monthlyExpenses,
    monthlyProfit: businessMoney(definition.monthlyRevenue - monthlyExpenses),
  };
}

export function investBusiness(state, definition, eventId) {
  ensureBusinessState(state);
  if (state.settledBusinessEvents.includes(eventId)) return { ok: false, reason: "這次小生意機會已經結算過了。" };
  if (!definition) return { ok: false, reason: "沒有找到小生意機會。" };
  if (state.cash < definition.startupCost) return { ok: false, reason: `現金不足，還差 ${definition.startupCost - state.cash}。` };
  const business = createBusinessFromDefinition(definition, state.month);
  state.cash = businessMoney(state.cash - definition.startupCost);
  state.businessHoldings.push(business);
  state.settledBusinessEvents.push(eventId);
  addBusinessTransaction(
    state,
    createBusinessTransaction({
      month: state.month,
      round: state.round || state.month,
      businessId: business.businessId,
      type: "投資",
      description: `投資 ${business.name}，每月預估淨利 ${business.monthlyProfit}。`,
      cashChange: -definition.startupCost,
      valueChange: business.currentValue,
      incomeChange: business.monthlyRevenue,
      expenseChange: business.monthlyExpenses,
    }),
  );
  return { ok: true, business };
}

export function calculateBusinessSummary(state) {
  ensureBusinessState(state);
  const businesses = state.businessHoldings;
  const totalValue = businessMoney(businesses.reduce((sum, item) => sum + item.currentValue, 0));
  const monthlyRevenue = businessMoney(businesses.reduce((sum, item) => sum + item.monthlyRevenue, 0));
  const monthlyExpenses = businessMoney(businesses.reduce((sum, item) => sum + item.monthlyExpenses, 0));
  const monthlyProfit = businessMoney(businesses.reduce((sum, item) => sum + item.monthlyProfit, 0));
  const cumulativeProfit = businessMoney(businesses.reduce((sum, item) => sum + item.cumulativeProfit, 0));
  const passiveIncome = businessMoney(businesses.reduce((sum, item) => sum + Math.max(0, item.monthlyProfit) * item.passiveRatio, 0));
  const activeIncome = businessMoney(businesses.reduce((sum, item) => sum + Math.max(0, item.monthlyProfit) * (1 - item.passiveRatio), 0));
  const highRiskValue = businesses.reduce((sum, item) => sum + (item.riskLevel === "高" ? item.currentValue : 0), 0);
  const maxSingleRatio = totalValue > 0 ? businessMoney((Math.max(...businesses.map((item) => item.currentValue), 0) / totalValue) * 100) : 0;
  const categoryRatios = calculateCategoryRatios(businesses, totalValue);
  const largestCategoryRatio = categoryRatios.length ? Math.max(...categoryRatios.map((item) => item.ratio)) : 0;
  const totalAssets = Math.max(1, businessMoney((state.cash || 0) + totalValue + getOtherAssetValue(state)));
  const businessAssetRatio = businessMoney((totalValue / totalAssets) * 100);
  const activeDependency = monthlyProfit > 0 ? businessMoney((activeIncome / monthlyProfit) * 100) : 0;
  return {
    count: businesses.length,
    totalValue,
    monthlyRevenue,
    monthlyExpenses,
    monthlyProfit,
    cumulativeProfit,
    passiveIncome,
    activeIncome,
    passiveRatio: monthlyProfit > 0 ? businessMoney((passiveIncome / monthlyProfit) * 100) : 0,
    averageRisk: calculateAverageRisk(businesses),
    maxSingleRatio,
    categoryRatios,
    largestCategoryRatio,
    highRiskRatio: totalValue > 0 ? businessMoney((highRiskValue / totalValue) * 100) : 0,
    businessAssetRatio,
    activeDependency,
    warnings: createBusinessWarnings({ maxSingleRatio, largestCategoryRatio, activeDependency }),
  };
}

export function settleBusinessPayday(state) {
  ensureBusinessState(state);
  if (state.settledBusinessMonths.includes(state.month)) return { skipped: true, totalRevenue: 0, totalExpenses: 0, totalProfit: 0, details: [] };
  let totalRevenue = 0;
  let totalExpenses = 0;
  let totalProfit = 0;
  const details = [];
  state.businessHoldings = state.businessHoldings.map((item) => {
    let business = applyActiveEffects(recalculateBusiness(item));
    const revenue = business.monthlyRevenue;
    const expenses = business.monthlyExpenses;
    const profit = business.monthlyProfit;
    business.cumulativeProfit = businessMoney(business.cumulativeProfit + profit);
    business.currentValue = clampBusinessMoney(business.currentValue + profit * 0.35);
    business = recalculateBusiness(business);
    totalRevenue += revenue;
    totalExpenses += expenses;
    totalProfit += profit;
    details.push({ businessId: business.businessId, name: business.name, revenue, expenses, profit });
    addBusinessTransaction(
      state,
      createBusinessTransaction({
        month: state.month,
        round: state.round || state.month,
        businessId: business.businessId,
        type: profit >= 0 ? "收入" : "支出",
        description: `${business.name} 月結：營收 ${revenue}，成本 ${expenses}，淨利 ${profit}。營收不是全部賺到的錢，扣除成本後留下的才是淨利。`,
        cashChange: profit,
        incomeChange: revenue,
        expenseChange: expenses,
      }),
    );
    return business;
  });
  state.cash = businessMoney(state.cash + totalProfit);
  if (state.cash < 0) {
    const emergencyAmount = Math.abs(state.cash);
    state.cash = 0;
    state.emergencyDebt = clampBusinessMoney((state.emergencyDebt || 0) + emergencyAmount);
    state.liabilities.push({
      id: `business-emergency-${Date.now()}-${Math.random().toString(16).slice(2)}`,
      type: "emergency",
      name: "小生意虧損緊急負債",
      balance: emergencyAmount,
      payment: Math.ceil(emergencyAmount * 0.04),
    });
  }
  state.settledBusinessMonths.push(state.month);
  return { skipped: false, totalRevenue: businessMoney(totalRevenue), totalExpenses: businessMoney(totalExpenses), totalProfit: businessMoney(totalProfit), details };
}

export function upgradeBusiness(state, businessId, upgradeId, eventId) {
  ensureBusinessState(state);
  if (state.settledBusinessEvents.includes(eventId)) return { ok: false, reason: "這次升級已經結算過了。" };
  const business = state.businessHoldings.find((item) => item.businessId === businessId);
  const definition = businessDefinitions.find((item) => item.id === businessId);
  const upgrade = definition?.upgradeOptions.find((item) => item.id === upgradeId);
  if (!business || !upgrade) return { ok: false, reason: "沒有找到可用升級。" };
  if (business.purchasedUpgrades.includes(upgrade.id)) return { ok: false, reason: "同一升級不可重複購買。" };
  if (state.cash < upgrade.cost) return { ok: false, reason: `現金不足，還差 ${upgrade.cost - state.cash}。` };
  const before = recalculateBusiness(business);
  state.cash = businessMoney(state.cash - upgrade.cost);
  Object.assign(business, {
    level: Math.min(before.maxLevel, before.level + 1),
    totalInvested: before.totalInvested + upgrade.cost,
    monthlyRevenue: before.monthlyRevenue + upgrade.revenueChange,
    monthlyVariableCost: Math.max(0, before.monthlyVariableCost + Math.round(upgrade.costChange * 0.45)),
    monthlyFixedCost: Math.max(0, before.monthlyFixedCost + Math.round(upgrade.costChange * 0.55)),
    monthlyExpenses: Math.max(0, before.monthlyExpenses + upgrade.costChange),
    currentValue: before.currentValue + upgrade.valueChange,
    passiveRatio: Math.max(0, Math.min(0.95, before.passiveRatio + upgrade.passiveChange)),
    failureRisk: Math.max(0.01, before.failureRisk + upgrade.riskChange),
    purchasedUpgrades: [...before.purchasedUpgrades, upgrade.id],
    recentEvent: `升級：${upgrade.name}`,
  });
  const after = recalculateBusiness(business);
  state.businessHoldings = state.businessHoldings.map((item) => (item.businessId === businessId ? after : item));
  state.settledBusinessEvents.push(eventId);
  addBusinessTransaction(
    state,
    createBusinessTransaction({
      month: state.month,
      round: state.round || state.month,
      businessId,
      type: "升級",
      description: `${after.name} 完成升級「${upgrade.name}」。升級可以增加收入，但也可能增加成本，所以要看最後留下多少。`,
      cashChange: -upgrade.cost,
      valueChange: after.currentValue - before.currentValue,
      incomeChange: after.monthlyRevenue - before.monthlyRevenue,
      expenseChange: after.monthlyExpenses - before.monthlyExpenses,
    }),
  );
  return { ok: true, business: after, before, after, upgrade };
}

export function applyBusinessRiskEvent(state, event, businessId, eventId) {
  ensureBusinessState(state);
  if (state.settledBusinessEvents.includes(eventId)) return { ok: false, reason: "這次事件已經結算過了。" };
  const business = state.businessHoldings.find((item) => item.businessId === businessId) || state.businessHoldings[0];
  if (!business) return { ok: false, reason: "還沒有持有小生意，不會抽取小生意事件。" };
  const before = recalculateBusiness(business);
  let after = { ...before, recentEvent: event.title, lastEventMonth: state.month };
  let cashCost = 0;
  if (event.kind === "oneTimeCost") {
    cashCost = Math.max(event.minCost, clampBusinessMoney(before.currentValue * event.costRate));
    payBusinessCost(state, cashCost, event.title);
  } else {
    after.activeEffects = [
      ...before.activeEffects,
      {
        id: event.id,
        title: event.title,
        kind: event.kind,
        factor: event.factor,
        passiveChange: event.passiveChange || 0,
        remainingMonths: Math.max(1, Math.min(3, Math.round(event.duration || 1))),
      },
    ];
  }
  if (event.kind === "demand") after.demandModifier = Math.max(0.5, Math.min(1.8, before.demandModifier * event.factor));
  if (event.kind === "cost") after.monthlyExpenses = Math.max(0, Math.round(before.monthlyExpenses * event.factor));
  if (event.kind === "revenue") after.monthlyRevenue = Math.max(0, Math.round(before.monthlyRevenue * event.factor));
  if (event.kind === "passive") after.passiveRatio = Math.max(0, Math.min(0.95, before.passiveRatio + event.passiveChange));
  after = recalculateBusiness(after);
  state.businessHoldings = state.businessHoldings.map((item) => (item.businessId === before.businessId ? after : item));
  state.settledBusinessEvents.push(eventId);
  addBusinessTransaction(
    state,
    createBusinessTransaction({
      month: state.month,
      round: state.round || state.month,
      businessId: before.businessId,
      type: event.positive ? "市場變化" : event.kind === "oneTimeCost" ? "維修" : "風險事件",
      description: `${after.name}：${event.title}。${event.text}`,
      cashChange: -cashCost,
      valueChange: after.currentValue - before.currentValue,
      incomeChange: after.monthlyRevenue - before.monthlyRevenue,
      expenseChange: after.monthlyExpenses - before.monthlyExpenses,
    }),
  );
  return { ok: true, before, after, event, cashCost };
}

export function applyBusinessMarketEvent(state, event, eventId) {
  ensureBusinessState(state);
  if (state.settledBusinessEvents.includes(eventId)) return { ok: false, reason: "這次市場事件已經結算過了。" };
  const affected = [];
  state.businessHoldings = state.businessHoldings.map((item) => {
    const before = recalculateBusiness(item);
    if (!event.categories.includes(before.category)) return before;
    const after = recalculateBusiness({
      ...before,
      demandModifier: Math.max(0.5, Math.min(1.8, before.demandModifier * event.factor)),
      monthlyRevenue: Math.max(0, Math.round(before.monthlyRevenue * event.factor)),
      monthlyVariableCost: Math.max(0, Math.round(before.monthlyVariableCost * (event.costFactor || 1))),
      monthlyExpenses: Math.max(0, Math.round(before.monthlyFixedCost + before.monthlyVariableCost * (event.costFactor || 1))),
      currentValue: Math.max(0, Math.round(before.currentValue * (1 + (event.factor - 1) * 0.6))),
      recentEvent: event.title,
      lastEventMonth: state.month,
    });
    affected.push({ before, after });
    return after;
  });
  state.settledBusinessEvents.push(eventId);
  state.businessMarketRecords = [
    {
      id: `business-market-${Date.now()}-${Math.random().toString(16).slice(2)}`,
      month: state.month,
      round: state.round || state.month,
      title: event.title,
      affected: affected.map((item) => ({
        businessId: item.after.businessId,
        name: item.after.name,
        beforeRevenue: item.before.monthlyRevenue,
        afterRevenue: item.after.monthlyRevenue,
        beforeProfit: item.before.monthlyProfit,
        afterProfit: item.after.monthlyProfit,
      })),
    },
    ...state.businessMarketRecords,
  ].slice(0, 80);
  addBusinessTransaction(
    state,
    createBusinessTransaction({
      month: state.month,
      round: state.round || state.month,
      businessId: "portfolio",
      type: "市場變化",
      description: `${event.title}：${event.text}`,
      incomeChange: affected.reduce((sum, item) => sum + item.after.monthlyRevenue - item.before.monthlyRevenue, 0),
      expenseChange: affected.reduce((sum, item) => sum + item.after.monthlyExpenses - item.before.monthlyExpenses, 0),
    }),
  );
  return { ok: true, affected, event };
}

export function calculateBusinessSellPreview(business) {
  const safeBusiness = recalculateBusiness(business);
  const sellingFee = clampBusinessMoney(safeBusiness.currentValue * SELLING_FEE_RATE);
  const cashReceived = businessMoney(safeBusiness.currentValue - sellingFee);
  const totalResult = businessMoney(cashReceived + safeBusiness.cumulativeProfit - safeBusiness.totalInvested);
  return { currentValue: safeBusiness.currentValue, sellingFee, cashReceived, totalInvested: safeBusiness.totalInvested, cumulativeProfit: safeBusiness.cumulativeProfit, totalResult };
}

export function sellBusiness(state, businessId, eventId) {
  ensureBusinessState(state);
  if (state.settledBusinessEvents.includes(eventId)) return { ok: false, reason: "這次出售已經結算過了。" };
  const business = state.businessHoldings.find((item) => item.businessId === businessId);
  if (!business) return { ok: false, reason: "沒有找到這個小生意。" };
  const preview = calculateBusinessSellPreview(business);
  state.cash = businessMoney(state.cash + preview.cashReceived);
  state.businessHoldings = state.businessHoldings.filter((item) => item.businessId !== businessId);
  state.settledBusinessEvents.push(eventId);
  addBusinessTransaction(
    state,
    createBusinessTransaction({
      month: state.month,
      round: state.round || state.month,
      businessId,
      type: "出售",
      description: `出售 ${business.name}，實際收到 ${preview.cashReceived}。賣出生意時，要看收到的錢、之前投入的錢，以及經營期間已經賺到的錢。`,
      cashChange: preview.cashReceived,
      valueChange: -business.currentValue,
      incomeChange: -business.monthlyRevenue,
      expenseChange: -business.monthlyExpenses,
    }),
  );
  return { ok: true, business, preview };
}

export function payBusinessCost(state, cost, reason) {
  const amount = clampBusinessMoney(cost);
  state.cash = businessMoney(state.cash - amount);
  if (state.cash < 0) {
    const emergencyAmount = Math.abs(state.cash);
    state.cash = 0;
    state.emergencyDebt = clampBusinessMoney((state.emergencyDebt || 0) + emergencyAmount);
    state.liabilities.push({
      id: `business-emergency-${Date.now()}-${Math.random().toString(16).slice(2)}`,
      type: "emergency",
      name: `${reason} 緊急負債`,
      balance: emergencyAmount,
      payment: Math.ceil(emergencyAmount * 0.04),
    });
  }
}

export function findBusinessDefinition(businessId) {
  return businessDefinitions.find((item) => item.id === businessId) || null;
}

function applyActiveEffects(business) {
  let next = { ...business, activeEffects: [] };
  business.activeEffects.forEach((effect) => {
    if (effect.kind === "demand") next.monthlyRevenue = Math.max(0, Math.round(next.monthlyRevenue * effect.factor));
    if (effect.kind === "revenue") next.monthlyRevenue = Math.max(0, Math.round(next.monthlyRevenue * effect.factor));
    if (effect.kind === "cost") next.monthlyExpenses = Math.max(0, Math.round(next.monthlyExpenses * effect.factor));
    if (effect.kind === "passive") next.passiveRatio = Math.max(0, Math.min(0.95, next.passiveRatio + effect.passiveChange));
    if (effect.remainingMonths > 1) next.activeEffects.push({ ...effect, remainingMonths: effect.remainingMonths - 1 });
  });
  return recalculateBusiness(next);
}

function calculateAverageRisk(businesses) {
  if (!businesses.length) return "低";
  const score = businesses.reduce((sum, item) => sum + (item.riskLevel === "高" ? 3 : item.riskLevel === "中" ? 2 : 1), 0) / businesses.length;
  if (score >= 2.4) return "高";
  if (score >= 1.6) return "中";
  return "低";
}

function calculateCategoryRatios(businesses, totalValue) {
  const map = new Map();
  businesses.forEach((item) => map.set(item.category, businessMoney((map.get(item.category) || 0) + item.currentValue)));
  return [...map.entries()].map(([category, value]) => ({ category, value, ratio: totalValue > 0 ? businessMoney((value / totalValue) * 100) : 0 }));
}

function createBusinessWarnings({ maxSingleRatio, largestCategoryRatio, activeDependency }) {
  const warnings = [];
  if (maxSingleRatio > 50) warnings.push("如果太多收入來自同一個生意，市場改變時可能受到較大影響。");
  if (largestCategoryRatio > 60) warnings.push("如果太多收入來自同一種生意，市場改變時可能受到較大影響。");
  if (activeDependency > 70) warnings.push("收入很高，但如果需要很多時間，你可能無法同時管理太多生意。");
  return warnings;
}

function getOtherAssetValue(state) {
  const otherAssets = Array.isArray(state.assets)
    ? state.assets.reduce((sum, asset) => sum + (asset.type === "property" || asset.type === "stock" || asset.type === "business" ? 0 : businessMoney(asset.value)), 0)
    : 0;
  const realEstate = Array.isArray(state.ownedProperties) ? state.ownedProperties.reduce((sum, item) => sum + businessMoney(item.currentValue), 0) : 0;
  const stocks = Array.isArray(state.stockHoldings) ? state.stockHoldings.reduce((sum, item) => sum + businessMoney(item.currentValue), 0) : 0;
  return businessMoney(otherAssets + realEstate + stocks);
}
