import { calculateInsurancePremiums } from "./insuranceCalculator.js";
import { clampMoney, moneyNumber } from "./realEstateCalculator.js";

export function ensureUnemploymentState(state) {
  if (!state.unemployment || typeof state.unemployment !== "object") {
    state.unemployment = {};
  }
  state.unemployment = {
    unemployed: Boolean(state.unemployment.unemployed),
    unemploymentMonthsRemaining: Math.max(0, Math.round(Number(state.unemployment.unemploymentMonthsRemaining) || 0)),
    unemploymentBenefit: clampMoney(state.unemployment.unemploymentBenefit),
    salarySuspended: Boolean(state.unemployment.salarySuspended),
    jobSearchProgress: Math.max(0, Math.min(100, Math.round(Number(state.unemployment.jobSearchProgress) || 0))),
    reemploymentChance: Math.max(0.05, Math.min(0.95, Number(state.unemployment.reemploymentChance) || 0.25)),
    previousSalary: clampMoney(state.unemployment.previousSalary || state.salary),
    benefitSettledMonths: Array.isArray(state.unemployment.benefitSettledMonths) ? state.unemployment.benefitSettledMonths : [],
  };
}

export function startUnemployment(state, months = 3) {
  ensureUnemploymentState(state);
  if (state.unemployment.unemployed) {
    state.unemployment.unemploymentMonthsRemaining = Math.max(state.unemployment.unemploymentMonthsRemaining, months);
    return { ok: true, alreadyUnemployed: true, unemployment: state.unemployment };
  }
  const policy = state.insurancePolicies?.find((item) => item.active && item.coveredEvents?.includes("unemployment"));
  const benefit = policy ? Math.min(policy.coverageLimit, clampMoney(state.salary * policy.coverageRate)) : 0;
  state.unemployment = {
    unemployed: true,
    unemploymentMonthsRemaining: Math.max(1, Math.round(Number(months) || 1)),
    unemploymentBenefit: benefit,
    salarySuspended: true,
    jobSearchProgress: 0,
    reemploymentChance: 0.28,
    previousSalary: clampMoney(state.salary),
    benefitSettledMonths: [],
  };
  return { ok: true, alreadyUnemployed: false, unemployment: state.unemployment };
}

export function settleUnemploymentMonth(state) {
  ensureUnemploymentState(state);
  if (!state.unemployment.unemployed) return { ok: true, benefit: 0, skipped: true };
  const month = Math.max(1, state.month || 1);
  let benefit = 0;
  if (!state.unemployment.benefitSettledMonths.includes(month) && state.unemployment.unemploymentBenefit > 0) {
    benefit = state.unemployment.unemploymentBenefit;
    state.cash = moneyNumber(state.cash + benefit);
    state.unemployment.benefitSettledMonths.push(month);
  }
  state.unemployment.unemploymentMonthsRemaining = Math.max(0, state.unemployment.unemploymentMonthsRemaining - 1);
  if (state.unemployment.unemploymentMonthsRemaining <= 0 && state.unemployment.jobSearchProgress >= 60) {
    reemploy(state, 1);
  }
  return { ok: true, benefit, skipped: false };
}

export function searchForJob(state, training = false) {
  ensureUnemploymentState(state);
  if (!state.unemployment.unemployed) return { ok: false, reason: "目前没有失业状态。" };
  const cost = training ? 1800 : 0;
  if (cost > 0) state.cash = moneyNumber(state.cash - cost);
  state.unemployment.jobSearchProgress = Math.min(100, state.unemployment.jobSearchProgress + (training ? 34 : 24));
  state.unemployment.reemploymentChance = Math.min(0.9, state.unemployment.reemploymentChance + (training ? 0.18 : 0.1));
  if (state.cash < 0) {
    const shortfall = Math.abs(state.cash);
    state.cash = 0;
    state.emergencyDebt = clampMoney((state.emergencyDebt || 0) + shortfall);
    state.liabilities.push({
      id: `emergency-job-${Date.now()}-${Math.random().toString(16).slice(2)}`,
      type: "emergency",
      name: "找工作紧急负债",
      balance: shortfall,
      payment: Math.ceil(shortfall * 0.04),
    });
  }
  if (state.unemployment.jobSearchProgress >= 100) {
    reemploy(state, training ? 1.04 : 1);
  }
  return { ok: true, cost, unemployment: state.unemployment };
}

export function reemploy(state, salaryMultiplier = 1) {
  ensureUnemploymentState(state);
  const previousSalary = state.unemployment.previousSalary || state.salary;
  state.salary = clampMoney(previousSalary * Math.max(0.75, Math.min(1.25, Number(salaryMultiplier) || 1)));
  state.unemployment.unemployed = false;
  state.unemployment.unemploymentMonthsRemaining = 0;
  state.unemployment.unemploymentBenefit = 0;
  state.unemployment.salarySuspended = false;
  state.unemployment.jobSearchProgress = 100;
  state.unemployment.reemploymentChance = 0.25;
  return { ok: true, salary: state.salary };
}

export function effectiveSalaryIncome(state) {
  ensureUnemploymentState(state);
  if (state.unemployment.unemployed || state.unemployment.salarySuspended) return 0;
  return clampMoney(state.salary);
}

export function calculateRequiredMonthlyExpenses(state) {
  const base = clampMoney(state.baseExpenses);
  const premiums = calculateInsurancePremiums(state);
  const lifeEffects = Array.isArray(state.lifeActiveEffects)
    ? state.lifeActiveEffects.reduce((sum, effect) => sum + clampMoney(effect.monthlyExpenseImpact), 0)
    : 0;
  return clampMoney(base + premiums + lifeEffects);
}
