import { insurancePolicies } from "./insuranceData.js";
import { addInsuranceTransaction, createInsuranceTransaction } from "./insuranceTransactions.js";
import { clampMoney, moneyNumber } from "./realEstateCalculator.js";

export function ensureInsuranceState(state) {
  if (!Array.isArray(state.insurancePolicies)) state.insurancePolicies = [];
  if (!Array.isArray(state.insuranceTransactions)) state.insuranceTransactions = [];
  if (!Array.isArray(state.insuranceClaims)) state.insuranceClaims = [];
  state.insurancePolicies = state.insurancePolicies
    .filter(Boolean)
    .map((policy) => ({
      ...policy,
      monthlyPremium: clampMoney(policy.monthlyPremium),
      deductible: clampMoney(policy.deductible),
      coverageRate: Math.max(0, Math.min(1, Number(policy.coverageRate) || 0)),
      coverageLimit: clampMoney(policy.coverageLimit),
      waitingPeriod: Math.max(0, Math.round(Number(policy.waitingPeriod) || 0)),
      purchasedMonth: Math.max(1, Math.round(Number(policy.purchasedMonth) || state.month || 1)),
      lastClaimMonth: Math.max(0, Math.round(Number(policy.lastClaimMonth) || 0)),
      active: policy.active !== false,
    }));
}

export function findPolicyDefinition(policyId) {
  return insurancePolicies.find((policy) => policy.id === policyId) || null;
}

export function calculateInsurancePremiums(state) {
  ensureInsuranceState(state);
  return moneyNumber(state.insurancePolicies.reduce((sum, policy) => sum + (policy.active ? policy.monthlyPremium : 0), 0));
}

export function purchaseInsurancePolicy(state, policyId, eventId = "") {
  ensureInsuranceState(state);
  const definition = findPolicyDefinition(policyId);
  if (!definition) return { ok: false, reason: "没有找到这张保单。" };
  if (eventId && state.settledLifeEvents?.includes(eventId)) return { ok: false, reason: "这次购买已经处理过了。" };
  if (state.insurancePolicies.some((policy) => policy.id === policyId && policy.active)) return { ok: false, reason: "不能重复购买同一张保单。" };
  if (state.cash < definition.monthlyPremium) return { ok: false, reason: `现金不足，还差 ${definition.monthlyPremium - state.cash}。` };
  const beforePremiums = calculateInsurancePremiums(state);
  state.cash = moneyNumber(state.cash - definition.monthlyPremium);
  const policy = {
    ...definition,
    active: true,
    purchasedMonth: Math.max(1, state.month || 1),
    lastClaimMonth: 0,
  };
  state.insurancePolicies.push(policy);
  if (eventId && Array.isArray(state.settledLifeEvents)) state.settledLifeEvents.push(eventId);
  const afterPremiums = calculateInsurancePremiums(state);
  addInsuranceTransaction(
    state,
    createInsuranceTransaction({
      month: state.month,
      round: state.round || state.month,
      policyId,
      type: "购买保单",
      description: `购买${policy.name}，每月保费 ${policy.monthlyPremium}。`,
      premiumChange: afterPremiums - beforePremiums,
      playerCost: policy.monthlyPremium,
    }),
  );
  return { ok: true, policy, beforePremiums, afterPremiums };
}

export function cancelInsurancePolicy(state, policyId) {
  ensureInsuranceState(state);
  const policy = state.insurancePolicies.find((item) => item.id === policyId && item.active);
  if (!policy) return { ok: false, reason: "没有可取消的保单。" };
  const beforePremiums = calculateInsurancePremiums(state);
  policy.active = false;
  const afterPremiums = calculateInsurancePremiums(state);
  addInsuranceTransaction(
    state,
    createInsuranceTransaction({
      month: state.month,
      round: state.round || state.month,
      policyId,
      type: "取消保单",
      description: `取消${policy.name}，每月保费减少 ${beforePremiums - afterPremiums}。`,
      premiumChange: afterPremiums - beforePremiums,
    }),
  );
  return { ok: true, policy, beforePremiums, afterPremiums };
}

export function calculateClaimForPolicy(policy, event, cost, month) {
  const eligible =
    policy?.active &&
    policy.coveredEvents?.includes(event.type) &&
    month - policy.purchasedMonth >= policy.waitingPeriod;
  if (!eligible) {
    return {
      policy,
      eligible: false,
      deductible: clampMoney(policy?.deductible),
      claimAmount: 0,
      playerCost: clampMoney(cost),
    };
  }
  const deductible = clampMoney(policy.deductible);
  const claimBase = Math.max(0, clampMoney(cost) - deductible);
  const claimAmount = Math.min(clampMoney(claimBase * policy.coverageRate), clampMoney(policy.coverageLimit));
  return {
    policy,
    eligible: true,
    deductible,
    claimAmount,
    playerCost: moneyNumber(clampMoney(cost) - claimAmount),
  };
}

export function findBestInsuranceClaim(state, event, cost) {
  ensureInsuranceState(state);
  const candidates = state.insurancePolicies.map((policy) => calculateClaimForPolicy(policy, event, cost, state.month || 1));
  const eligible = candidates.filter((claim) => claim.eligible);
  if (!eligible.length) {
    return { policy: null, eligible: false, deductible: 0, claimAmount: 0, playerCost: clampMoney(cost) };
  }
  return eligible.sort((a, b) => b.claimAmount - a.claimAmount)[0];
}

export function recordInsuranceClaim(state, event, claim, eventId) {
  ensureInsuranceState(state);
  if (!claim?.eligible || claim.claimAmount <= 0 || !claim.policy) return;
  if (state.insuranceClaims.some((item) => item.eventId === eventId)) return;
  claim.policy.lastClaimMonth = state.month || 1;
  state.insuranceClaims.unshift({
    id: `claim-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    eventId,
    policyId: claim.policy.id,
    month: Math.max(1, state.month || 1),
    eventTitle: event.title,
    originalCost: clampMoney(event.cashImpact),
    deductible: claim.deductible,
    claimAmount: claim.claimAmount,
    playerCost: claim.playerCost,
  });
  state.insuranceClaims = state.insuranceClaims.slice(0, 80);
  addInsuranceTransaction(
    state,
    createInsuranceTransaction({
      month: state.month,
      round: state.round || state.month,
      policyId: claim.policy.id,
      eventId,
      type: "保险理赔",
      description: `${claim.policy.name} 为「${event.title}」理赔 ${claim.claimAmount}。`,
      claimAmount: claim.claimAmount,
      playerCost: claim.playerCost,
    }),
  );
}
