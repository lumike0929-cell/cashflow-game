import { addBankTransaction, createBankTransaction } from "./bankingTransactions.js";
import { calculateBusinessSummary } from "./businessCalculator.js";
import { calculatePortfolioSummary, clampMoney, moneyNumber } from "./realEstateCalculator.js";

const GAME_TAX_RATE = 0.12;

export function ensureTaxState(state) {
  if (!state.tax || typeof state.tax !== "object") state.tax = {};
  state.tax = {
    taxRate: Number.isFinite(Number(state.tax.taxRate)) ? Number(state.tax.taxRate) : GAME_TAX_RATE,
    taxableIncome: clampMoney(state.tax.taxableIncome),
    estimatedTax: clampMoney(state.tax.estimatedTax),
    taxPaid: clampMoney(state.tax.taxPaid),
    taxBalance: clampMoney(state.tax.taxBalance),
    taxMonth: Math.max(1, Math.round(Number(state.tax.taxMonth) || 12)),
  };
}

export function calculateTaxSummary(state) {
  ensureTaxState(state);
  const business = calculateBusinessSummary(state);
  const property = calculatePortfolioSummary(state.ownedProperties || []);
  const stockDividends = (state.stockHoldings || []).reduce((sum, holding) => sum + clampMoney(holding.dividendsReceived), 0);
  const realizedGain = Math.max(0, moneyNumber(state.realizedStockGain));
  const salaryIncome = clampMoney(state.salary);
  const taxableIncome = clampMoney(salaryIncome + Math.max(0, business.monthlyProfit) * 3 + property.monthlyRent * 3 + stockDividends + realizedGain);
  const estimatedTax = clampMoney(taxableIncome * state.tax.taxRate);
  return {
    taxRate: state.tax.taxRate,
    taxableIncome,
    estimatedTax,
    taxPaid: state.tax.taxPaid,
    taxBalance: Math.max(0, estimatedTax - state.tax.taxPaid),
    sources: {
      salaryIncome,
      businessProfit: Math.max(0, business.monthlyProfit) * 3,
      rentalIncome: property.monthlyRent * 3,
      dividends: stockDividends,
      realizedGain,
    },
  };
}

export function reserveTaxCash(state, amount) {
  ensureTaxState(state);
  const reserve = clampMoney(amount);
  if (state.cash < reserve) return { ok: false, reason: "现金不足，无法预留这么多税款。" };
  state.cash = moneyNumber(state.cash - reserve);
  state.tax.taxPaid = clampMoney(state.tax.taxPaid + reserve);
  return { ok: true, reserve };
}

export function settleTax(state, eventId = "") {
  ensureTaxState(state);
  if (eventId && state.settledLifeEvents?.includes(eventId)) return { ok: false, reason: "本次税务已经结算。" };
  const summary = calculateTaxSummary(state);
  const due = summary.taxBalance;
  let liabilityAdded = 0;
  if (state.cash >= due) {
    state.cash = moneyNumber(state.cash - due);
    state.tax.taxPaid = clampMoney(state.tax.taxPaid + due);
  } else {
    const paid = Math.max(0, state.cash);
    const shortfall = due - paid;
    state.cash = 0;
    state.tax.taxPaid = clampMoney(state.tax.taxPaid + paid);
    state.tax.taxBalance = shortfall;
    liabilityAdded = shortfall;
    state.liabilities.push({
      id: `tax-liability-${Date.now()}-${Math.random().toString(16).slice(2)}`,
      type: "tax",
      name: "游戏税务负债",
      balance: shortfall,
      payment: Math.ceil(shortfall * 0.05),
    });
    if (state.bank?.creditScore) state.bank.creditScore = Math.max(300, state.bank.creditScore - 8);
  }
  state.tax.taxableIncome = summary.taxableIncome;
  state.tax.estimatedTax = summary.estimatedTax;
  if (eventId && Array.isArray(state.settledLifeEvents)) state.settledLifeEvents.push(eventId);
  addBankTransaction(
    state,
    createBankTransaction({
      month: state.month,
      round: state.round || state.month,
      type: "税务结算",
      description: `游戏中的简化税务规则：预估税款 ${summary.estimatedTax}，新增税务负债 ${liabilityAdded}。`,
      cashChange: -Math.min(due, summary.taxPaid + due),
      liabilityChange: liabilityAdded,
      paymentChange: liabilityAdded > 0 ? Math.ceil(liabilityAdded * 0.05) : 0,
    }),
  );
  return { ok: true, summary, paidNow: due - liabilityAdded, liabilityAdded };
}
