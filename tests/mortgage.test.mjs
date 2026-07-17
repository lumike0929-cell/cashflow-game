import test from "node:test";
import assert from "node:assert/strict";
import { calculateMortgagePurchasePlan, refinancePropertyMortgage } from "../bankingCalculator.js";
import { realEstateOpportunities } from "../realEstateData.js";
import { buyProperty, calculatePortfolioSummary } from "../realEstateCalculator.js";
import { migrateSavedState } from "../realEstateStorageMigration.js";

function makeState(cash = 300000, interestLevel = "normal") {
  return migrateSavedState({
    career: { id: "mortgage", name: "房贷测试员" },
    month: 1,
    round: 1,
    position: 0,
    cash,
    salary: 42000,
    baseExpenses: 22000,
    bank: { creditScore: 720, interestLevel },
    assets: [],
    liabilities: [],
    logs: [],
  });
}

test("房地产可用现金购买或房贷购买，房贷会自动计算贷款金额、首付和月供", () => {
  const mortgageState = makeState();
  const cashState = makeState(1000000);
  const card = realEstateOpportunities[0];
  const mortgagePlan = calculateMortgagePurchasePlan(mortgageState, card, "mortgage");
  const cashPlan = calculateMortgagePurchasePlan(cashState, card, "cash");
  const mortgageResult = buyProperty(mortgageState, card, "mortgage-buy", mortgagePlan);
  const cashResult = buyProperty(cashState, card, "cash-buy", cashPlan);
  assert.equal(mortgageResult.ok, true);
  assert.equal(cashResult.ok, true);
  assert.equal(mortgageState.ownedProperties[0].mortgageBalance, card.purchasePrice - card.downPayment);
  assert.ok(mortgageState.ownedProperties[0].mortgagePayment > 0);
  assert.equal(cashState.ownedProperties[0].mortgageBalance, 0);
  assert.equal(cashState.ownedProperties[0].mortgagePayment, 0);
  assert.equal(cashState.liabilities.some((item) => item.type === "mortgage"), false);
});

test("利率下降后再融资会降低房贷月供并更新现金流", () => {
  const state = makeState(400000, "high");
  const card = realEstateOpportunities[1];
  const highPlan = calculateMortgagePurchasePlan(state, card, "mortgage");
  buyProperty(state, card, "high-rate-buy", highPlan);
  const beforePayment = state.ownedProperties[0].mortgagePayment;
  const beforeCashflow = calculatePortfolioSummary(state.ownedProperties).monthlyCashflow;
  state.bank.interestLevel = "low";
  const result = refinancePropertyMortgage(state, state.ownedProperties[0].id, "refi-1");
  assert.equal(result.ok, true);
  assert.ok(state.ownedProperties[0].mortgagePayment < beforePayment);
  assert.ok(calculatePortfolioSummary(state.ownedProperties).monthlyCashflow > beforeCashflow);
  assert.ok(state.bankTransactions.some((tx) => tx.type === "再融资"));
});
