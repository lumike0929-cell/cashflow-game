import test from "node:test";
import assert from "node:assert/strict";
import { calculateTaxSummary, reserveTaxCash, settleTax } from "../taxCalculator.js";
import { migrateSavedState } from "../realEstateStorageMigration.js";

function makeState(cash = 100000) {
  return migrateSavedState({
    career: { id: "tax", name: "税务测试员" },
    month: 12,
    round: 4,
    position: 0,
    cash,
    salary: 50000,
    baseExpenses: 22000,
    realizedStockGain: 5000,
    assets: [],
    liabilities: [],
    logs: [],
  });
}

test("税务结算按游戏简化规则计算", () => {
  const state = makeState();
  const summary = calculateTaxSummary(state);
  assert.equal(summary.taxRate, 0.12);
  assert.ok(summary.taxableIncome >= 55000);
  assert.equal(summary.estimatedTax, Math.round(summary.taxableIncome * 0.12));
  const result = settleTax(state, "tax-settle");
  assert.equal(result.ok, true);
  assert.equal(result.liabilityAdded, 0);
  assert.ok(state.cash < 100000);
});

test("税款不足时产生税务负债并影响月供", () => {
  const state = makeState(100);
  const result = settleTax(state, "tax-short");
  assert.equal(result.ok, true);
  assert.ok(result.liabilityAdded > 0);
  assert.ok(state.liabilities.some((item) => item.type === "tax"));
});

test("可提前预留税款", () => {
  const state = makeState();
  const result = reserveTaxCash(state, 3000);
  assert.equal(result.ok, true);
  assert.equal(state.tax.taxPaid, 3000);
  assert.equal(state.cash, 97000);
});
