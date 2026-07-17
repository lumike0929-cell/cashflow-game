import { createPropertyTransaction, addPropertyTransaction } from "./realEstateTransactions.js";

const SELLING_FEE_RATE = 0.035;
const PRINCIPAL_RATE = 0.32;

export function moneyNumber(value, fallback = 0) {
  const number = Number(value);
  if (!Number.isFinite(number)) return fallback;
  const rounded = Math.round(number);
  return Object.is(rounded, -0) ? 0 : rounded;
}

export function clampMoney(value, fallback = 0) {
  return Math.max(0, moneyNumber(value, fallback));
}

export function calculatePropertyCashflow(property) {
  return moneyNumber(property.monthlyRent - property.mortgagePayment - property.monthlyExpenses);
}

export function calculatePropertyEquity(property) {
  return clampMoney(property.currentValue - property.mortgageBalance);
}

export function recalculateProperty(property) {
  const currentValue = clampMoney(property.currentValue);
  const mortgageBalance = clampMoney(property.mortgageBalance);
  const originalMortgage = clampMoney(property.originalMortgage);
  const monthlyRent = clampMoney(property.monthlyRent);
  const mortgagePayment = mortgageBalance > 0 ? clampMoney(property.mortgagePayment) : 0;
  const monthlyExpenses = clampMoney(property.monthlyExpenses);
  const principalPaid = clampMoney(originalMortgage - mortgageBalance);
  const updated = {
    ...property,
    currentValue,
    mortgageBalance,
    originalMortgage,
    monthlyRent,
    mortgagePayment,
    monthlyExpenses,
    principalPaid,
    monthlyCashflow: moneyNumber(monthlyRent - mortgagePayment - monthlyExpenses),
  };
  return {
    ...updated,
    equity: calculatePropertyEquity(updated),
    status: mortgageBalance <= 0 ? "paidOff" : property.status || "owned",
  };
}

export function createPropertyFromOpportunity(opportunity, month, round) {
  const originalMortgage = clampMoney(opportunity.purchasePrice - opportunity.downPayment);
  return recalculateProperty({
    id: `property-${opportunity.id}-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    opportunityId: opportunity.id,
    name: opportunity.name,
    category: opportunity.category,
    description: opportunity.description,
    illustrationKey: opportunity.illustrationKey,
    purchasePrice: clampMoney(opportunity.purchasePrice),
    downPayment: clampMoney(opportunity.downPayment),
    originalMortgage,
    mortgageBalance: originalMortgage,
    mortgagePayment: clampMoney(opportunity.mortgagePayment),
    principalPaid: 0,
    monthlyRent: clampMoney(opportunity.monthlyRent),
    monthlyExpenses: clampMoney(opportunity.managementFee + opportunity.repairReserve),
    managementFee: clampMoney(opportunity.managementFee),
    repairReserve: clampMoney(opportunity.repairReserve),
    monthlyCashflow: 0,
    currentValue: clampMoney(opportunity.purchasePrice),
    equity: 0,
    riskLevel: opportunity.riskLevel,
    locationQuality: opportunity.locationQuality,
    condition: opportunity.condition,
    units: Math.max(1, Math.round(Number(opportunity.units) || 1)),
    purchasedMonth: Math.max(1, Math.round(Number(month) || 1)),
    purchasedRound: Math.max(1, Math.round(Number(round) || 1)),
    appreciationRate: Number.isFinite(Number(opportunity.appreciationRate)) ? Number(opportunity.appreciationRate) : 0,
    status: "owned",
    lastMarketChange: "刚买入",
  });
}

export function calculateOpportunity(opportunity) {
  const loanAmount = clampMoney(opportunity.purchasePrice - opportunity.downPayment);
  const monthlyExpenses = clampMoney(opportunity.managementFee + opportunity.repairReserve);
  const monthlyCashflow = moneyNumber(opportunity.monthlyRent - opportunity.mortgagePayment - monthlyExpenses);
  const projectedEquity = clampMoney(opportunity.purchasePrice - loanAmount);
  return {
    loanAmount,
    monthlyExpenses,
    monthlyCashflow,
    projectedEquity,
  };
}

export function calculatePortfolioSummary(properties) {
  const safeProperties = normalizeProperties(properties);
  return safeProperties.reduce(
    (summary, property) => {
      summary.count += 1;
      summary.totalValue += property.currentValue;
      summary.totalMortgage += property.mortgageBalance;
      summary.totalEquity += property.equity;
      summary.monthlyRent += property.monthlyRent;
      summary.monthlyMortgage += property.mortgagePayment;
      summary.monthlyExpenses += property.monthlyExpenses;
      summary.monthlyCashflow += property.monthlyCashflow;
      return summary;
    },
    {
      count: 0,
      totalValue: 0,
      totalMortgage: 0,
      totalEquity: 0,
      monthlyRent: 0,
      monthlyMortgage: 0,
      monthlyExpenses: 0,
      monthlyCashflow: 0,
    },
  );
}

export function normalizeProperties(properties) {
  if (!Array.isArray(properties)) return [];
  return properties.map((property) => recalculateProperty(property));
}

export function calculateEmergencyReserveMonths(state, cashAfterPurchase) {
  const monthlyExpenses = calculateTotalExpenses(state);
  if (monthlyExpenses <= 0) return 99;
  return moneyNumber(cashAfterPurchase / monthlyExpenses);
}

export function emergencyReserveRequiredMonths(riskLevel) {
  if (riskLevel === "高") return 3;
  if (riskLevel === "中") return 2;
  return 1;
}

export function buyProperty(state, opportunity, eventId) {
  if (!state || !opportunity) return { ok: false, reason: "没有可购买的房地产机会。" };
  ensureRealEstateState(state);
  if (state.settledEvents.includes(eventId)) return { ok: false, reason: "这个机会已经结算过了。" };
  if (state.cash < opportunity.downPayment) {
    return { ok: false, reason: `现金不足，还差 ${opportunity.downPayment - state.cash}。` };
  }

  const property = createPropertyFromOpportunity(opportunity, state.month, state.round || state.month);
  const previousCashflow = calculatePortfolioSummary(state.ownedProperties).monthlyCashflow;
  state.cash = moneyNumber(state.cash - property.downPayment);
  state.ownedProperties.push(property);
  state.liabilities.push({
    id: `mortgage-${property.id}`,
    propertyId: property.id,
    type: "mortgage",
    name: `${property.name} 房贷`,
    balance: property.mortgageBalance,
    payment: property.mortgagePayment,
  });
  state.settledEvents.push(eventId);
  syncMortgageLiabilities(state);
  const nextCashflow = calculatePortfolioSummary(state.ownedProperties).monthlyCashflow;
  addPropertyTransaction(
    state,
    createPropertyTransaction({
      month: state.month,
      round: state.round || state.month,
      propertyId: property.id,
      type: "购买",
      description: `买入${property.name}，首付 ${property.downPayment}，新增房贷 ${property.originalMortgage}。`,
      cashChange: -property.downPayment,
      valueChange: property.currentValue,
      liabilityChange: property.originalMortgage,
      cashflowChange: nextCashflow - previousCashflow,
    }),
  );
  return { ok: true, property };
}

export function calculateSellPreview(property) {
  const safeProperty = recalculateProperty(property);
  const sellingFee = clampMoney(safeProperty.currentValue * SELLING_FEE_RATE);
  const cashReceived = moneyNumber(safeProperty.currentValue - safeProperty.mortgageBalance - sellingFee);
  const profitLoss = moneyNumber(cashReceived - safeProperty.downPayment - safeProperty.principalPaid);
  return {
    currentValue: safeProperty.currentValue,
    mortgageBalance: safeProperty.mortgageBalance,
    sellingFee,
    cashReceived,
    profitLoss,
  };
}

export function sellProperty(state, propertyId) {
  ensureRealEstateState(state);
  const property = state.ownedProperties.find((item) => item.id === propertyId);
  if (!property || property.status === "sold") return { ok: false, reason: "这项房产已经不在持有列表中。" };
  const previousCashflow = calculatePortfolioSummary(state.ownedProperties).monthlyCashflow;
  const preview = calculateSellPreview(property);
  state.cash = moneyNumber(state.cash + preview.cashReceived);
  state.ownedProperties = state.ownedProperties.filter((item) => item.id !== propertyId);
  state.liabilities = state.liabilities.filter((item) => item.propertyId !== propertyId);
  const nextCashflow = calculatePortfolioSummary(state.ownedProperties).monthlyCashflow;
  addPropertyTransaction(
    state,
    createPropertyTransaction({
      month: state.month,
      round: state.round || state.month,
      propertyId,
      type: "出售",
      description: `卖出${property.name}，实际收到 ${preview.cashReceived}。卖价不是你真正拿到的钱，还要先还贷款和支付出售费用。`,
      cashChange: preview.cashReceived,
      valueChange: -property.currentValue,
      liabilityChange: -property.mortgageBalance,
      cashflowChange: nextCashflow - previousCashflow,
    }),
  );
  return { ok: true, property, preview };
}

export function applyMortgagePayday(state) {
  ensureRealEstateState(state);
  const results = [];
  state.ownedProperties = state.ownedProperties.map((property) => {
    const before = recalculateProperty(property);
    if (before.mortgageBalance <= 0 || before.mortgagePayment <= 0) return before;
    const principal = Math.min(before.mortgageBalance, Math.max(1, moneyNumber(before.mortgagePayment * PRINCIPAL_RATE)));
    const after = recalculateProperty({
      ...before,
      mortgageBalance: before.mortgageBalance - principal,
    });
    results.push({
      propertyId: after.id,
      propertyName: after.name,
      principal,
      paidOff: after.mortgageBalance <= 0,
      beforeBalance: before.mortgageBalance,
      afterBalance: after.mortgageBalance,
    });
    addPropertyTransaction(
      state,
      createPropertyTransaction({
        month: state.month,
        round: state.round || state.month,
        propertyId: after.id,
        type: after.mortgageBalance <= 0 ? "房贷还清" : "房贷偿还",
        description:
          after.mortgageBalance <= 0
            ? `${after.name} 房贷还清，每月现金流提高。`
            : `${after.name} 偿还本金 ${principal}。每次偿还一部分本金，你真正拥有的房产比例就会增加。`,
        liabilityChange: -principal,
        cashflowChange: after.monthlyCashflow - before.monthlyCashflow,
      }),
    );
    return after;
  });
  syncMortgageLiabilities(state);
  return results;
}

export function applyMarketEventToProperties(state, event) {
  ensureRealEstateState(state);
  const beforeSummary = calculatePortfolioSummary(state.ownedProperties);
  if (!state.ownedProperties.length) {
    return { ok: true, affected: [], message: "你还没有持有房产，所以这次房地产市场变化没有影响。" };
  }
  const affected = [];
  state.ownedProperties = state.ownedProperties.map((property) => {
    const before = recalculateProperty(property);
    let next = { ...before };
    if (event.kind === "value") {
      next.currentValue = clampMoney(before.currentValue * event.factor);
      next.lastMarketChange = `${event.title}：${before.currentValue} -> ${next.currentValue}`;
    }
    if (event.kind === "rent") {
      next.monthlyRent = clampMoney(before.monthlyRent * event.factor);
      next.lastMarketChange = `${event.title}：租金 ${before.monthlyRent} -> ${next.monthlyRent}`;
    }
    if (event.kind === "expense") {
      next.repairReserve = clampMoney(before.repairReserve * event.factor);
      next.monthlyExpenses = clampMoney(before.managementFee + next.repairReserve);
      next.lastMarketChange = `${event.title}：支出 ${before.monthlyExpenses} -> ${next.monthlyExpenses}`;
    }
    if (event.kind === "location") {
      next.currentValue = clampMoney(before.currentValue * event.valueFactor);
      next.monthlyRent = clampMoney(before.monthlyRent * event.rentFactor);
      next.locationQuality = improveLocation(before.locationQuality);
      next.lastMarketChange = `${event.title}：价值和租金同时改善`;
    }
    next = recalculateProperty(next);
    affected.push({
      id: next.id,
      name: next.name,
      beforeValue: before.currentValue,
      afterValue: next.currentValue,
      beforeRent: before.monthlyRent,
      afterRent: next.monthlyRent,
      beforeExpenses: before.monthlyExpenses,
      afterExpenses: next.monthlyExpenses,
      beforeCashflow: before.monthlyCashflow,
      afterCashflow: next.monthlyCashflow,
    });
    return next;
  });
  syncMortgageLiabilities(state);
  const afterSummary = calculatePortfolioSummary(state.ownedProperties);
  addPropertyTransaction(
    state,
    createPropertyTransaction({
      month: state.month,
      round: state.round || state.month,
      propertyId: "portfolio",
      type: event.kind === "rent" ? "租金变化" : "房价变化",
      description: `${event.title}：${event.text}`,
      valueChange: afterSummary.totalValue - beforeSummary.totalValue,
      cashflowChange: afterSummary.monthlyCashflow - beforeSummary.monthlyCashflow,
    }),
  );
  return { ok: true, affected, message: event.text };
}

export function applyHoldingEvent(state, event, propertyId) {
  ensureRealEstateState(state);
  const property = state.ownedProperties.find((item) => item.id === propertyId) || state.ownedProperties[0];
  if (!property) return { ok: false, reason: "没有持有房产，不会抽取房地产维修或持有事件。" };
  const before = recalculateProperty(property);
  const previousSummary = calculatePortfolioSummary(state.ownedProperties);
  let cashCost = 0;
  let next = { ...before };
  let description = event.text;

  if (event.kind === "repair") {
    cashCost = Math.max(event.minCost, clampMoney(before.currentValue * event.costRate));
    description = `${event.title}：支付维修 ${cashCost}。`;
  }
  if (event.kind === "vacancy") {
    cashCost = before.monthlyRent;
    description = `${event.title}：本月少收租金 ${cashCost}。`;
  }
  if (event.kind === "rent") {
    next.monthlyRent = clampMoney(before.monthlyRent * event.factor);
    description = `${event.title}：租金 ${before.monthlyRent} -> ${next.monthlyRent}。`;
  }
  if (event.kind === "expense") {
    next.managementFee = clampMoney(before.managementFee * event.factor);
    next.monthlyExpenses = clampMoney(next.managementFee + before.repairReserve);
    description = `${event.title}：每月支出 ${before.monthlyExpenses} -> ${next.monthlyExpenses}。`;
  }
  if (event.kind === "renovation") {
    cashCost = clampMoney(before.currentValue * event.costRate);
    next.currentValue = clampMoney(before.currentValue * event.valueFactor);
    next.monthlyRent = clampMoney(before.monthlyRent * event.rentFactor);
    next.condition = "改善";
    description = `${event.title}：花费 ${cashCost}，价值 ${before.currentValue} -> ${next.currentValue}。`;
  }

  if (cashCost > 0) {
    payPropertyCost(state, cashCost, event.title);
  }
  next = recalculateProperty(next);
  state.ownedProperties = state.ownedProperties.map((item) => (item.id === before.id ? next : item));
  syncMortgageLiabilities(state);
  const nextSummary = calculatePortfolioSummary(state.ownedProperties);
  addPropertyTransaction(
    state,
    createPropertyTransaction({
      month: state.month,
      round: state.round || state.month,
      propertyId: before.id,
      type: event.kind === "renovation" ? "翻修" : event.kind === "repair" || event.kind === "vacancy" ? "维修" : "租金变化",
      description,
      cashChange: -cashCost,
      valueChange: next.currentValue - before.currentValue,
      liabilityChange: 0,
      cashflowChange: nextSummary.monthlyCashflow - previousSummary.monthlyCashflow,
    }),
  );
  return {
    ok: true,
    property: next,
    before,
    after: next,
    cashCost,
    description,
  };
}

export function payPropertyCost(state, cost, reason) {
  const amount = clampMoney(cost);
  state.cash = moneyNumber(state.cash - amount);
  if (state.cash < 0) {
    const emergencyAmount = Math.abs(state.cash);
    state.cash = 0;
    state.emergencyDebt = clampMoney((state.emergencyDebt || 0) + emergencyAmount);
    state.liabilities.push({
      id: `emergency-${Date.now()}-${Math.random().toString(16).slice(2)}`,
      type: "emergency",
      name: `${reason} 紧急负债`,
      balance: emergencyAmount,
      payment: Math.ceil(emergencyAmount * 0.04),
    });
  }
}

export function syncMortgageLiabilities(state) {
  ensureRealEstateState(state);
  const mortgagesById = new Map(state.ownedProperties.map((property) => [property.id, recalculateProperty(property)]));
  const nonMortgageLiabilities = state.liabilities.filter((item) => item.type !== "mortgage");
  const mortgageLiabilities = [...mortgagesById.values()]
    .filter((property) => property.mortgageBalance > 0)
    .map((property) => ({
      id: `mortgage-${property.id}`,
      propertyId: property.id,
      type: "mortgage",
      name: `${property.name} 房贷`,
      balance: property.mortgageBalance,
      payment: property.mortgagePayment,
    }));
  state.ownedProperties = [...mortgagesById.values()];
  state.liabilities = [...nonMortgageLiabilities, ...mortgageLiabilities];
}

export function calculatePassiveIncome(state) {
  const nonPropertyIncome = Array.isArray(state.assets)
    ? state.assets.reduce((sum, asset) => sum + (asset.type === "property" ? 0 : moneyNumber(asset.cashflow)), 0)
    : 0;
  return moneyNumber(nonPropertyIncome + calculatePortfolioSummary(state.ownedProperties).monthlyRent);
}

export function calculateLiabilityPayments(state) {
  if (!Array.isArray(state.liabilities)) return 0;
  return moneyNumber(state.liabilities.reduce((sum, item) => sum + moneyNumber(item.payment), 0));
}

export function calculatePropertyOperatingExpenses(state) {
  return calculatePortfolioSummary(state.ownedProperties).monthlyExpenses;
}

export function calculateTotalExpenses(state) {
  return moneyNumber((state.baseExpenses || 0) + calculateLiabilityPayments(state) + calculatePropertyOperatingExpenses(state));
}

export function calculateMonthlyCashflow(state) {
  return moneyNumber((state.salary || 0) + calculatePassiveIncome(state) - calculateTotalExpenses(state));
}

export function calculateNetWorth(state) {
  const assets = Array.isArray(state.assets) ? state.assets.reduce((sum, asset) => sum + moneyNumber(asset.value), 0) : 0;
  const stocks = Array.isArray(state.stockHoldings)
    ? state.stockHoldings.reduce((sum, holding) => sum + moneyNumber(holding.currentValue), 0)
    : 0;
  const businesses = Array.isArray(state.businessHoldings)
    ? state.businessHoldings.reduce((sum, business) => sum + moneyNumber(business.currentValue), 0)
    : 0;
  const liabilities = Array.isArray(state.liabilities)
    ? state.liabilities.reduce((sum, item) => sum + moneyNumber(item.balance), 0)
    : 0;
  return moneyNumber((state.cash || 0) + assets + stocks + businesses + calculatePortfolioSummary(state.ownedProperties).totalValue - liabilities);
}

export function ensureRealEstateState(state) {
  if (!Array.isArray(state.ownedProperties)) state.ownedProperties = [];
  if (!Array.isArray(state.propertyTransactions)) state.propertyTransactions = [];
  if (!Array.isArray(state.settledEvents)) state.settledEvents = [];
  if (!Array.isArray(state.liabilities)) state.liabilities = [];
  if (!Array.isArray(state.assets)) state.assets = [];
  state.cash = moneyNumber(state.cash);
  state.emergencyDebt = clampMoney(state.emergencyDebt || 0);
  state.ownedProperties = normalizeProperties(state.ownedProperties);
}

function improveLocation(locationQuality) {
  if (locationQuality === "C") return "B";
  if (locationQuality === "B") return "A";
  return "A+";
}
