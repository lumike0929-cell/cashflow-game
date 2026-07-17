import test from "node:test";
import assert from "node:assert/strict";
import {
  calculateCreditLimit,
  calculateCreditTier,
  calculatePersonalLoanRate,
  clampCreditScore,
} from "../bankingCalculator.js";
import { migrateSavedState } from "../realEstateStorageMigration.js";

function makeState(score) {
  return migrateSavedState({
    career: { id: "credit", name: "信用测试员" },
    month: 1,
    round: 1,
    position: 0,
    cash: 20000,
    salary: 30000,
    baseExpenses: 16000,
    bank: { creditScore: score, interestLevel: "normal" },
    assets: [],
    liabilities: [],
    logs: [],
  });
}

test("信用分会限制在 300 到 850 之间", () => {
  assert.equal(clampCreditScore(100), 300);
  assert.equal(clampCreditScore(920), 850);
  assert.equal(clampCreditScore(705), 705);
});

test("信用分影响贷款额度和贷款利率", () => {
  const lowState = makeState(520);
  const highState = makeState(790);
  assert.equal(calculateCreditTier(lowState.bank.creditScore).label, "危险");
  assert.equal(calculateCreditTier(highState.bank.creditScore).label, "优秀");
  assert.ok(calculateCreditLimit(highState).totalLimit > calculateCreditLimit(lowState).totalLimit);
  assert.ok(calculatePersonalLoanRate(highState) < calculatePersonalLoanRate(lowState));
});
