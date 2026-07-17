import test from "node:test";
import assert from "node:assert/strict";
import { insurancePolicies } from "../insuranceData.js";
import {
  calculateClaimForPolicy,
  calculateInsurancePremiums,
  purchaseInsurancePolicy,
} from "../insuranceCalculator.js";
import { lifeEvents } from "../lifeEventData.js";
import { applyLifeEvent } from "../lifeEventCalculator.js";
import { calculateTotalExpenses } from "../realEstateCalculator.js";
import { migrateSavedState } from "../realEstateStorageMigration.js";

function makeState(cash = 50000) {
  return migrateSavedState({
    career: { id: "life", name: "人生测试员" },
    month: 1,
    round: 1,
    position: 0,
    cash,
    salary: 30000,
    baseExpenses: 15000,
    assets: [],
    liabilities: [],
    logs: [],
  });
}

test("医疗事件无保险时支付正确，现金不足产生紧急负债", () => {
  const state = makeState(1000);
  const event = lifeEvents.find((item) => item.id === "dental-care");
  const result = applyLifeEvent(state, event, "full-care", "medical-no-cover");
  assert.equal(result.ok, true);
  assert.equal(result.claim.claimAmount, 0);
  assert.equal(state.cash, 0);
  assert.ok(state.emergencyDebt > 0);
  assert.ok(state.liabilities.some((item) => item.type === "emergency"));
});

test("有保险时理赔正确，自付额与上限生效，同一事件不重复理赔", () => {
  const state = makeState();
  const policy = insurancePolicies.find((item) => item.id === "basic-medical");
  purchaseInsurancePolicy(state, policy.id, "policy-1");
  const event = lifeEvents.find((item) => item.id === "emergency-care");
  const claimPreview = calculateClaimForPolicy(state.insurancePolicies[0], event, event.cashImpact, state.month);
  assert.equal(claimPreview.claimAmount, Math.min(Math.round((event.cashImpact - policy.deductible) * policy.coverageRate), policy.coverageLimit));
  const result = applyLifeEvent(state, event, "full-care", "medical-covered");
  const duplicate = applyLifeEvent(state, event, "full-care", "medical-covered");
  assert.equal(result.ok, true);
  assert.equal(duplicate.ok, false);
  assert.equal(state.insuranceClaims.length, 1);
  assert.equal(result.playerCost, event.cashImpact - result.claim.claimAmount);
});

test("保费正确计入月支出", () => {
  const state = makeState();
  const before = calculateTotalExpenses(state);
  purchaseInsurancePolicy(state, "basic-medical", "policy-2");
  purchaseInsurancePolicy(state, "auto-protection", "policy-3");
  assert.equal(calculateInsurancePremiums(state), 470);
  assert.equal(calculateTotalExpenses(state), before + 470);
});
