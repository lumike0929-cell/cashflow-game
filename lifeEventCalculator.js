import { getLifeEventById } from "./lifeEventData.js";
import { findBestInsuranceClaim, recordInsuranceClaim } from "./insuranceCalculator.js";
import { addLifeEventRecord, createLifeEventRecord } from "./lifeEventTransactions.js";
import { advanceEconomyCycle, ensureEconomyState } from "./economyCycleEngine.js";
import { reemploy, startUnemployment } from "./unemploymentEngine.js";
import { reserveTaxCash, settleTax } from "./taxCalculator.js";
import { clampMoney, moneyNumber } from "./realEstateCalculator.js";

export function ensureLifeEventState(state) {
  if (!Array.isArray(state.lifeEventHistory)) state.lifeEventHistory = [];
  if (!Array.isArray(state.lifeActiveEffects)) state.lifeActiveEffects = [];
  if (!Array.isArray(state.settledLifeEvents)) state.settledLifeEvents = [];
  if (!state.job || typeof state.job !== "object") {
    state.job = {};
  }
  state.job = {
    jobLevel: Math.max(1, Math.round(Number(state.job.jobLevel) || 1)),
    skillLevel: Math.max(0, Math.round(Number(state.job.skillLevel) || 0)),
    workStress: Math.max(0, Math.round(Number(state.job.workStress) || 0)),
    futurePromotionChance: Math.max(0.05, Math.min(0.9, Number(state.job.futurePromotionChance) || 0.2)),
  };
  state.lifeActiveEffects = state.lifeActiveEffects
    .filter(Boolean)
    .map((effect) => ({
      ...effect,
      monthsRemaining: Math.max(0, Math.round(Number(effect.monthsRemaining) || 0)),
      monthlyIncomeImpact: moneyNumber(effect.monthlyIncomeImpact),
      monthlyExpenseImpact: moneyNumber(effect.monthlyExpenseImpact),
    }))
    .filter((effect) => effect.monthsRemaining > 0);
  ensureEconomyState(state);
}

export function calculateLifeEffectsSummary(state) {
  ensureLifeEventState(state);
  return state.lifeActiveEffects.reduce(
    (summary, effect) => {
      summary.monthlyIncomeImpact += moneyNumber(effect.monthlyIncomeImpact);
      summary.monthlyExpenseImpact += moneyNumber(effect.monthlyExpenseImpact);
      return summary;
    },
    { monthlyIncomeImpact: 0, monthlyExpenseImpact: 0 },
  );
}

export function calculateEmergencyFundStatus(state, monthlyExpenses) {
  const expenses = Math.max(1, clampMoney(monthlyExpenses));
  const months = Math.max(0, Math.round((moneyNumber(state.cash) / expenses) * 10) / 10);
  let status = "较稳定";
  if (months < 1) status = "高度警告";
  else if (months < 3) status = "需要注意";
  return {
    suggestedReserve: clampMoney(expenses * 3),
    cash: moneyNumber(state.cash),
    months,
    status,
    note: "保险和预备金不同：保险分担特定风险，预备金是随时可用的现金。",
  };
}

export function payLifeEventCost(state, amount, reason) {
  const cost = clampMoney(amount);
  state.cash = moneyNumber(state.cash - cost);
  let liabilityAdded = 0;
  if (state.cash < 0) {
    liabilityAdded = Math.abs(state.cash);
    state.cash = 0;
    state.emergencyDebt = clampMoney((state.emergencyDebt || 0) + liabilityAdded);
    state.liabilities.push({
      id: `life-emergency-${Date.now()}-${Math.random().toString(16).slice(2)}`,
      type: "emergency",
      name: `${reason} 紧急负债`,
      balance: liabilityAdded,
      payment: Math.ceil(liabilityAdded * 0.04),
    });
  }
  return { cost, liabilityAdded };
}

export function applyLifeEvent(state, eventInput, optionId = "", eventId = "") {
  ensureLifeEventState(state);
  const event = typeof eventInput === "string" ? getLifeEventById(eventInput) : eventInput;
  if (!event) return { ok: false, reason: "没有找到人生事件。" };
  const settledId = eventId || `life-${state.round || state.month}-${event.id}`;
  if (state.settledLifeEvents.includes(settledId)) return { ok: false, reason: "这个人生事件已经结算过了。" };
  const option = event.options?.find((item) => item.id === optionId) || event.options?.[0] || { id: "default", label: "结算", cashMultiplier: 1 };
  const cashMultiplier = Number.isFinite(Number(option.cashMultiplier)) ? Number(option.cashMultiplier) : 1;
  const rawCash = moneyNumber(event.cashImpact * cashMultiplier);
  let playerCost = Math.max(0, rawCash);
  let claim = { claimAmount: 0, deductible: 0, playerCost };
  let cashChange = 0;
  let liabilityAdded = 0;
  let incomeChange = moneyNumber(event.monthlyIncomeImpact);
  let expenseChange = moneyNumber(event.monthlyExpenseImpact);

  if (event.resultRules?.kind === "taxSettlement") {
    const tax = settleTax(state, settledId);
    addLifeEventRecordFromResult(state, event, option, {
      cashChange: -tax.paidNow,
      liabilityChange: tax.liabilityAdded,
      insuranceClaim: 0,
      incomeChange: 0,
      expenseChange: 0,
    });
    return { ok: true, event, option, tax, claim, playerCost: tax.paidNow, liabilityAdded: tax.liabilityAdded };
  }

  if (event.resultRules?.kind === "taxReserve") {
    const reserved = reserveTaxCash(state, Math.max(0, rawCash));
    if (!reserved.ok) return reserved;
    playerCost = reserved.reserve;
    cashChange = -reserved.reserve;
  } else if (event.resultRules?.kind === "bonus" || rawCash < 0) {
    const bonus = Math.abs(rawCash);
    state.cash = moneyNumber(state.cash + bonus);
    cashChange = bonus;
    playerCost = 0;
  } else if (event.resultRules?.kind === "startUnemployment") {
    startUnemployment(state, event.resultRules.months || event.durationMonths || 3);
  } else if (event.resultRules?.kind === "reemploy") {
    reemploy(state, option.salaryMultiplier || event.resultRules.salaryMultiplier || 1);
  } else if (event.resultRules?.kind === "economyCycle") {
    advanceEconomyCycle(state);
  } else if (event.insuranceEligible && rawCash > 0) {
    claim = findBestInsuranceClaim(state, event, rawCash);
    playerCost = claim.playerCost;
    const paid = payLifeEventCost(state, playerCost, event.title);
    liabilityAdded = paid.liabilityAdded;
    cashChange = -playerCost;
    recordInsuranceClaim(state, event, claim, settledId);
  } else if (rawCash > 0) {
    const paid = payLifeEventCost(state, rawCash, event.title);
    playerCost = rawCash;
    liabilityAdded = paid.liabilityAdded;
    cashChange = -rawCash;
  }

  applyResultRules(state, event, option);
  if (event.durationMonths > 0 && (incomeChange !== 0 || expenseChange !== 0)) {
    state.lifeActiveEffects.push({
      id: `effect-${settledId}`,
      sourceEventId: event.id,
      title: event.title,
      monthsRemaining: event.durationMonths,
      monthlyIncomeImpact: incomeChange,
      monthlyExpenseImpact: expenseChange,
    });
  }
  if (event.durationMonths <= 0 && expenseChange !== 0) {
    state.baseExpenses = clampMoney(state.baseExpenses + expenseChange);
  }
  state.settledLifeEvents.push(settledId);
  addLifeEventRecordFromResult(state, event, option, {
    cashChange,
    liabilityChange: liabilityAdded,
    insuranceClaim: claim.claimAmount,
    incomeChange,
    expenseChange,
    durationMonths: event.durationMonths,
  });
  return { ok: true, event, option, claim, playerCost, liabilityAdded, cashChange, incomeChange, expenseChange };
}

export function settleLifeEffectsMonth(state) {
  ensureLifeEventState(state);
  const expired = [];
  state.lifeActiveEffects = state.lifeActiveEffects
    .map((effect) => ({ ...effect, monthsRemaining: effect.monthsRemaining - 1 }))
    .filter((effect) => {
      if (effect.monthsRemaining <= 0) {
        expired.push(effect);
        return false;
      }
      return true;
    });
  return expired;
}

function applyResultRules(state, event, option) {
  const rules = event.resultRules || {};
  if (rules.kind === "salaryChange" || rules.kind === "promotion" || rules.kind === "skillSalary") {
    state.salary = clampMoney(state.salary + event.monthlyIncomeImpact);
    state.job.skillLevel += rules.skillChange || 1;
    state.job.jobLevel += rules.jobLevelChange || 0;
    state.job.workStress += rules.stressChange || 0;
    state.job.futurePromotionChance = Math.min(0.9, state.job.futurePromotionChance + 0.04);
  }
  if (rules.kind === "salaryMultiplier") {
    state.salary = clampMoney(state.salary * (rules.multiplier || option.salaryMultiplier || 1));
    state.baseExpenses = clampMoney(state.baseExpenses + event.monthlyExpenseImpact);
  }
  if (rules.kind === "jobSearch") {
    if (state.unemployment) {
      state.unemployment.jobSearchProgress = Math.min(100, (state.unemployment.jobSearchProgress || 0) + (rules.progress || 20));
    }
  }
  if (rules.kind === "stressExpense") {
    state.job.workStress += rules.stressChange || 1;
  }
}

function addLifeEventRecordFromResult(state, event, option, result) {
  addLifeEventRecord(
    state,
    createLifeEventRecord({
      month: state.month,
      round: state.round || state.month,
      eventId: event.id,
      type: event.type,
      category: event.category,
      title: event.title,
      choice: option.label,
      cashChange: result.cashChange,
      incomeChange: result.incomeChange,
      expenseChange: result.expenseChange,
      liabilityChange: result.liabilityChange,
      insuranceClaim: result.insuranceClaim,
      durationMonths: result.durationMonths || 0,
    }),
  );
}
