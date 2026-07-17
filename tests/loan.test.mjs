import test from "node:test";
import assert from "node:assert/strict";
import { calculateBankSummary, evaluateBankruptcyProtection, takePersonalLoan } from "../bankingCalculator.js";
import { migrateSavedState } from "../realEstateStorageMigration.js";

function makeState(cash = 12000, creditScore = 680) {
  return migrateSavedState({
    career: { id: "loan", name: "贷款测试员" },
    month: 1,
    round: 1,
    position: 0,
    cash,
    salary: 30000,
    baseExpenses: 18000,
    bank: { creditScore, interestLevel: "normal" },
    assets: [],
    liabilities: [],
    logs: [],
  });
}

test("个人贷款会增加现金、负债、月供并降低信用分", () => {
  const state = makeState();
  const beforeCredit = state.bank.creditScore;
  const result = takePersonalLoan(state, 5000, "loan-1");
  assert.equal(result.ok, true);
  assert.equal(state.cash, 17000);
  assert.equal(state.liabilities.length, 1);
  assert.equal(state.liabilities[0].balance, 5000);
  assert.ok(state.liabilities[0].payment > 0);
  assert.ok(state.bank.creditScore < beforeCredit);
  assert.equal(calculateBankSummary(state).totalDebt, 5000);
});

test("同一贷款事件不会重复结算，超过信用额度不可贷款", () => {
  const state = makeState(1000, 520);
  const first = takePersonalLoan(state, 1000, "same-loan");
  const second = takePersonalLoan(state, 1000, "same-loan");
  const tooLarge = takePersonalLoan(state, 1000000, "too-large");
  assert.equal(first.ok, true);
  assert.equal(second.ok, false);
  assert.equal(tooLarge.ok, false);
  assert.equal(state.liabilities.length, 1);
});

test("现金为负时可进入破产保护判断", () => {
  const state = makeState(0, 700);
  state.cash = -1500;
  const protection = evaluateBankruptcyProtection(state);
  assert.equal(protection.status, "loan");
  state.bank.creditScore = 300;
  state.salary = 0;
  state.cash = -999999;
  const bankrupt = evaluateBankruptcyProtection(state);
  assert.equal(bankrupt.status, "bankrupt");
  assert.equal(state.gameOver, true);
});
