import test from "node:test";
import assert from "node:assert/strict";
import { purchaseInsurancePolicy } from "../insuranceCalculator.js";
import { calculateMonthlyCashflow } from "../realEstateCalculator.js";
import { migrateSavedState } from "../realEstateStorageMigration.js";
import {
  reemploy,
  searchForJob,
  settleUnemploymentMonth,
  startUnemployment,
} from "../unemploymentEngine.js";

function makeState() {
  return migrateSavedState({
    career: { id: "job", name: "工作测试员" },
    month: 1,
    round: 1,
    position: 0,
    cash: 60000,
    salary: 36000,
    baseExpenses: 18000,
    assets: [],
    liabilities: [],
    logs: [],
  });
}

test("失业时工资停止，失业保险补助同月只结算一次", () => {
  const state = makeState();
  purchaseInsurancePolicy(state, "unemployment-cover", "unemployment-policy");
  startUnemployment(state, 3);
  assert.equal(state.unemployment.unemployed, true);
  assert.equal(calculateMonthlyCashflow(state) < 0, true);
  const first = settleUnemploymentMonth(state);
  const cashAfterFirst = state.cash;
  const second = settleUnemploymentMonth(state);
  assert.ok(first.benefit > 0);
  assert.equal(second.benefit, 0);
  assert.equal(state.cash, cashAfterFirst);
});

test("寻找工作与重新就业后薪资恢复", () => {
  const state = makeState();
  startUnemployment(state, 3);
  searchForJob(state, true);
  searchForJob(state, true);
  searchForJob(state, true);
  assert.equal(state.unemployment.unemployed, false);
  assert.ok(state.salary >= 36000);
  const improvedSalary = state.salary;
  startUnemployment(state, 2);
  reemploy(state, 0.9);
  assert.equal(state.unemployment.unemployed, false);
  assert.equal(state.salary, Math.round(improvedSalary * 0.9));
});
