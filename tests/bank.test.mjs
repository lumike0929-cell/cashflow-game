import test from "node:test";
import assert from "node:assert/strict";
import { interestEvents } from "../bankingData.js";
import {
  applyInterestEvent,
  calculateBankSummary,
  calculateCreditLimit,
  ensureBankingState,
} from "../bankingCalculator.js";
import { migrateSavedState } from "../realEstateStorageMigration.js";

function makeState(cash = 30000) {
  return migrateSavedState({
    career: { id: "banker", name: "银行测试员" },
    month: 1,
    round: 1,
    position: 0,
    cash,
    salary: 32000,
    baseExpenses: 18000,
    assets: [],
    liabilities: [],
    logs: [],
  });
}

test("银行中心可计算现金、净资产、贷款、信用额度与利率", () => {
  const state = makeState();
  const summary = calculateBankSummary(state);
  assert.equal(summary.cash, 30000);
  assert.equal(summary.creditScore, 650);
  assert.equal(summary.interestLevel, "普通");
  assert.ok(summary.creditLimit > 0);
  assert.ok(summary.availableCredit > 0);
  assert.equal(summary.totalDebt, 0);
});

test("利率事件会切换低利率、普通和高利率并记录", () => {
  const state = makeState();
  const low = interestEvents.find((event) => event.level === "low");
  const high = interestEvents.find((event) => event.level === "high");
  const before = calculateBankSummary(state).personalLoanMonthlyRate;
  const lowResult = applyInterestEvent(state, low, "rate-low");
  const lowRate = calculateBankSummary(state).personalLoanMonthlyRate;
  const highResult = applyInterestEvent(state, high, "rate-high");
  const highRate = calculateBankSummary(state).personalLoanMonthlyRate;
  assert.equal(lowResult.ok, true);
  assert.equal(highResult.ok, true);
  assert.ok(lowRate < before);
  assert.ok(highRate > lowRate);
  assert.ok(state.bankTransactions.some((tx) => tx.type === "利率变化"));
});

test("旧存档会安全迁移银行状态与旧贷款类型", () => {
  const migrated = migrateSavedState({
    career: { id: "old", name: "旧职业" },
    month: 2,
    cash: 15000,
    salary: 22000,
    baseExpenses: 13000,
    creditScore: 720,
    interestLevel: "low",
    liabilities: [{ id: "loan-old", type: "loan", name: "旧贷款", balance: 3000, payment: 150 }],
  });
  ensureBankingState(migrated);
  assert.equal(migrated.bank.creditScore, 720);
  assert.equal(migrated.bank.interestLevel, "low");
  assert.equal(migrated.liabilities[0].type, "personalLoan");
  assert.ok(calculateCreditLimit(migrated).totalLimit > 0);
});
