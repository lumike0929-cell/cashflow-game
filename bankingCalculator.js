import { interestProfiles } from "./bankingData.js";
import { addBankTransaction, createBankTransaction } from "./bankingTransactions.js";
import {
  calculateNetWorth,
  calculateTotalExpenses,
  clampMoney,
  moneyNumber,
  recalculateProperty,
  syncMortgageLiabilities,
} from "./realEstateCalculator.js";
import { addPropertyTransaction, createPropertyTransaction } from "./realEstateTransactions.js";

const CREDIT_MIN = 300;
const CREDIT_MAX = 850;
const PERSONAL_LOAN_MONTHS = 24;
const MORTGAGE_MONTHS = 360;

export function ensureBankingState(state) {
  if (!state || typeof state !== "object") return;
  if (!state.bank || typeof state.bank !== "object") state.bank = {};
  state.bank.creditScore = clampCreditScore(state.bank.creditScore ?? state.creditScore ?? 650);
  state.bank.interestLevel = normalizeInterestLevel(state.bank.interestLevel || state.interestLevel || "normal");
  state.bank.bankruptcyWarning = Boolean(state.bank.bankruptcyWarning);
  if (!Array.isArray(state.bankTransactions)) state.bankTransactions = [];
  if (!Array.isArray(state.settledBankEvents)) state.settledBankEvents = [];
}

export function clampCreditScore(value) {
  const score = Math.round(Number(value) || 650);
  return Math.max(CREDIT_MIN, Math.min(CREDIT_MAX, score));
}

export function normalizeInterestLevel(level) {
  return interestProfiles[level] ? level : "normal";
}

export function getInterestProfile(state) {
  ensureBankingState(state);
  return interestProfiles[state.bank.interestLevel] || interestProfiles.normal;
}

export function calculateCreditTier(scoreInput) {
  const score = clampCreditScore(scoreInput);
  if (score >= 760) return { label: "优秀", rateModifier: -0.003, limitMultiplier: 2.4 };
  if (score >= 700) return { label: "良好", rateModifier: -0.0015, limitMultiplier: 1.8 };
  if (score >= 620) return { label: "普通", rateModifier: 0, limitMultiplier: 1.25 };
  if (score >= 540) return { label: "偏低", rateModifier: 0.004, limitMultiplier: 0.7 };
  return { label: "危险", rateModifier: 0.008, limitMultiplier: 0.35 };
}

export function calculatePersonalLoanRate(state) {
  const profile = getInterestProfile(state);
  const tier = calculateCreditTier(state.bank.creditScore);
  return Math.max(0.006, profile.monthlyPersonalRate + tier.rateModifier);
}

export function calculateMortgageRate(state) {
  const profile = getInterestProfile(state);
  const tier = calculateCreditTier(state.bank.creditScore);
  return Math.max(0.0025, profile.monthlyMortgageRate + tier.rateModifier * 0.45);
}

export function calculateLoanPayment(balance, monthlyRate, months) {
  const principal = clampMoney(balance);
  const safeRate = Math.max(0, Number(monthlyRate) || 0);
  const safeMonths = Math.max(1, Math.round(Number(months) || 1));
  if (principal <= 0) return 0;
  if (safeRate <= 0) return moneyNumber(principal / safeMonths);
  const factor = Math.pow(1 + safeRate, safeMonths);
  return moneyNumber((principal * safeRate * factor) / (factor - 1));
}

export function calculateDebtTotals(state) {
  const liabilities = Array.isArray(state.liabilities) ? state.liabilities : [];
  return liabilities.reduce(
    (totals, item) => {
      const balance = clampMoney(item?.balance);
      const payment = clampMoney(item?.payment);
      totals.totalDebt += balance;
      totals.monthlyPayment += payment;
      if (item?.type === "mortgage") {
        totals.mortgageDebt += balance;
        totals.mortgagePayment += payment;
      } else {
        totals.personalDebt += balance;
        totals.personalPayment += payment;
      }
      return totals;
    },
    {
      totalDebt: 0,
      monthlyPayment: 0,
      mortgageDebt: 0,
      mortgagePayment: 0,
      personalDebt: 0,
      personalPayment: 0,
    },
  );
}

export function calculateCreditLimit(state) {
  ensureBankingState(state);
  const tier = calculateCreditTier(state.bank.creditScore);
  const incomeBase = clampMoney(state.salary) * 0.45;
  const netWorthBase = Math.max(0, calculateNetWorth(state)) * 0.08;
  const rawLimit = (incomeBase + netWorthBase + 5000) * tier.limitMultiplier;
  const outstanding = calculateDebtTotals(state).personalDebt;
  return {
    totalLimit: clampMoney(rawLimit),
    available: Math.max(0, clampMoney(rawLimit) - outstanding),
    tier: tier.label,
  };
}

export function calculateBankSummary(state) {
  ensureBankingState(state);
  const debt = calculateDebtTotals(state);
  const credit = calculateCreditLimit(state);
  const profile = getInterestProfile(state);
  return {
    cash: moneyNumber(state.cash),
    netWorth: calculateNetWorth(state),
    totalDebt: debt.totalDebt,
    monthlyPayment: debt.monthlyPayment,
    personalDebt: debt.personalDebt,
    mortgageDebt: debt.mortgageDebt,
    creditScore: state.bank.creditScore,
    creditTier: credit.tier,
    creditLimit: credit.totalLimit,
    availableCredit: credit.available,
    interestLevel: profile.label,
    personalLoanMonthlyRate: calculatePersonalLoanRate(state),
    mortgageMonthlyRate: calculateMortgageRate(state),
    bankruptcyRisk: moneyNumber(state.cash) < 0,
    monthlyExpenses: calculateTotalExpenses(state),
  };
}

export function takePersonalLoan(state, amount, eventId = "") {
  ensureBankingState(state);
  const loanAmount = clampMoney(amount);
  if (loanAmount <= 0) return { ok: false, reason: "贷款金额不正确。" };
  if (eventId && state.settledBankEvents.includes(eventId)) return { ok: false, reason: "这笔贷款已经处理过了。" };
  const credit = calculateCreditLimit(state);
  if (loanAmount > credit.available) return { ok: false, reason: `超过可用信用额度，还差 ${loanAmount - credit.available}。` };
  const rate = calculatePersonalLoanRate(state);
  const payment = calculateLoanPayment(loanAmount, rate, PERSONAL_LOAN_MONTHS);
  state.cash = moneyNumber(state.cash + loanAmount);
  state.liabilities.push({
    id: `personal-loan-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    type: "personalLoan",
    name: `个人贷款 ${loanAmount}`,
    balance: loanAmount,
    payment,
    interestRate: rate,
    creditScoreAtLoan: state.bank.creditScore,
  });
  state.bank.creditScore = clampCreditScore(state.bank.creditScore - Math.max(3, Math.round(loanAmount / 2500)));
  if (eventId) state.settledBankEvents.push(eventId);
  addBankTransaction(
    state,
    createBankTransaction({
      month: state.month,
      round: state.round || state.month,
      type: "个人贷款",
      description: `借入个人贷款 ${loanAmount}，每月还款 ${payment}。`,
      cashChange: loanAmount,
      liabilityChange: loanAmount,
      paymentChange: payment,
      creditChange: state.bank.creditScore - (state.bank.creditScore + Math.max(3, Math.round(loanAmount / 2500))),
    }),
  );
  return { ok: true, amount: loanAmount, payment, rate };
}

export function calculateMortgagePurchasePlan(state, opportunity, mode = "mortgage") {
  ensureBankingState(state);
  const purchasePrice = clampMoney(opportunity?.purchasePrice);
  const operatingExpenses = clampMoney((opportunity?.managementFee || 0) + (opportunity?.repairReserve || 0));
  if (mode === "cash") {
    return {
      mode: "cash",
      label: "现金购买",
      cashRequired: purchasePrice,
      downPayment: purchasePrice,
      loanAmount: 0,
      monthlyPayment: 0,
      interestRate: 0,
      monthlyCashflow: moneyNumber((opportunity?.monthlyRent || 0) - operatingExpenses),
      projectedEquity: purchasePrice,
    };
  }
  const downPayment = clampMoney(opportunity?.downPayment);
  const loanAmount = Math.max(0, purchasePrice - downPayment);
  const rate = calculateMortgageRate(state);
  const payment = calculateLoanPayment(loanAmount, rate, MORTGAGE_MONTHS);
  return {
    mode: "mortgage",
    label: "房贷购买",
    cashRequired: downPayment,
    downPayment,
    loanAmount,
    monthlyPayment: payment,
    interestRate: rate,
    monthlyCashflow: moneyNumber((opportunity?.monthlyRent || 0) - payment - operatingExpenses),
    projectedEquity: downPayment,
  };
}

export function applyInterestEvent(state, event, eventId = "") {
  ensureBankingState(state);
  if (!event) return { ok: false, reason: "没有利率事件。" };
  if (eventId && state.settledBankEvents.includes(eventId)) return { ok: false, reason: "这个利率事件已经结算过了。" };
  const before = getInterestProfile(state);
  state.bank.interestLevel = normalizeInterestLevel(event.level);
  const after = getInterestProfile(state);
  if (eventId) state.settledBankEvents.push(eventId);
  addBankTransaction(
    state,
    createBankTransaction({
      month: state.month,
      round: state.round || state.month,
      type: "利率变化",
      description: `${event.title}：${before.label} -> ${after.label}。`,
    }),
  );
  return { ok: true, before, after };
}

export function canRefinanceProperty(state, property) {
  ensureBankingState(state);
  const safeProperty = recalculateProperty(property);
  if (safeProperty.mortgageBalance <= 0 || safeProperty.mortgagePayment <= 0) return false;
  const newPayment = calculateLoanPayment(safeProperty.mortgageBalance, calculateMortgageRate(state), MORTGAGE_MONTHS);
  return newPayment < safeProperty.mortgagePayment;
}

export function calculateRefinancePreview(state, property) {
  ensureBankingState(state);
  const safeProperty = recalculateProperty(property);
  const newRate = calculateMortgageRate(state);
  const newPayment = safeProperty.mortgageBalance > 0 ? calculateLoanPayment(safeProperty.mortgageBalance, newRate, MORTGAGE_MONTHS) : 0;
  return {
    property: safeProperty,
    oldPayment: safeProperty.mortgagePayment,
    newPayment,
    paymentSavings: moneyNumber(safeProperty.mortgagePayment - newPayment),
    oldRate: Number(safeProperty.interestRate || 0),
    newRate,
    canRefinance: safeProperty.mortgageBalance > 0 && newPayment < safeProperty.mortgagePayment,
  };
}

export function refinancePropertyMortgage(state, propertyId, eventId = "") {
  ensureBankingState(state);
  if (eventId && state.settledBankEvents.includes(eventId)) return { ok: false, reason: "这次再融资已经处理过了。" };
  const property = state.ownedProperties.find((item) => item.id === propertyId);
  if (!property) return { ok: false, reason: "没有找到这项房产。" };
  const preview = calculateRefinancePreview(state, property);
  if (!preview.canRefinance) return { ok: false, reason: "目前新月供没有更低，不适合再融资。" };
  const before = recalculateProperty(property);
  const after = recalculateProperty({
    ...before,
    mortgagePayment: preview.newPayment,
    interestRate: preview.newRate,
    lastMarketChange: `再融资：月供 ${before.mortgagePayment} -> ${preview.newPayment}`,
  });
  state.ownedProperties = state.ownedProperties.map((item) => (item.id === propertyId ? after : item));
  syncMortgageLiabilities(state);
  if (eventId) state.settledBankEvents.push(eventId);
  addBankTransaction(
    state,
    createBankTransaction({
      month: state.month,
      round: state.round || state.month,
      type: "再融资",
      description: `${after.name} 再融资，月供减少 ${preview.paymentSavings}。`,
      paymentChange: -preview.paymentSavings,
    }),
  );
  addPropertyTransaction(
    state,
    createPropertyTransaction({
      month: state.month,
      round: state.round || state.month,
      propertyId,
      type: "再融资",
      description: `${after.name} 在较低利率下再融资，房贷月供 ${before.mortgagePayment} -> ${after.mortgagePayment}。`,
      cashflowChange: after.monthlyCashflow - before.monthlyCashflow,
    }),
  );
  return { ok: true, before, after, preview };
}

export function evaluateBankruptcyProtection(state) {
  ensureBankingState(state);
  if (moneyNumber(state.cash) >= 0) return { status: "safe", message: "现金仍为正数。" };
  const needed = Math.abs(moneyNumber(state.cash));
  const credit = calculateCreditLimit(state);
  const sellableAssets =
    (Array.isArray(state.ownedProperties) ? state.ownedProperties.length : 0) +
    (Array.isArray(state.stockHoldings) ? state.stockHoldings.length : 0) +
    (Array.isArray(state.businessHoldings) ? state.businessHoldings.length : 0);
  if (credit.available >= needed) {
    state.bank.bankruptcyWarning = true;
    return { status: "loan", needed, message: "现金为负，可以申请贷款保护。" };
  }
  if (sellableAssets > 0) {
    state.bank.bankruptcyWarning = true;
    return { status: "sellAssets", needed, message: "现金为负，可以先出售资产筹钱。" };
  }
  state.gameOver = true;
  addBankTransaction(
    state,
    createBankTransaction({
      month: state.month,
      round: state.round || state.month,
      type: "破产",
      description: "现金为负，信用额度不足，也没有可出售资产。",
    }),
  );
  return { status: "bankrupt", needed, message: "现金为负，信用额度不足，也没有可出售资产，进入破产。" };
}
