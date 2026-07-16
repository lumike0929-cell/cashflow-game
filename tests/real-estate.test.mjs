import test from "node:test";
import assert from "node:assert/strict";
import { realEstateMarketEvents, realEstateOpportunities, propertyHoldingEvents } from "../realEstateData.js";
import {
  applyHoldingEvent,
  applyMarketEventToProperties,
  applyMortgagePayday,
  buyProperty,
  calculateMonthlyCashflow,
  calculateNetWorth,
  calculateOpportunity,
  calculatePortfolioSummary,
  sellProperty,
} from "../realEstateCalculator.js";
import { migrateSavedState } from "../realEstateStorageMigration.js";

function makeState(cash = 250000) {
  return migrateSavedState({
    career: { id: "tester", name: "测试员" },
    month: 1,
    round: 1,
    position: 0,
    cash,
    salary: 30000,
    baseExpenses: 18000,
    assets: [],
    liabilities: [],
    logs: [],
  });
}

test("现金足够时可购买，现金、资产、负债、现金流正确", () => {
  const state = makeState();
  const card = realEstateOpportunities[0];
  const expected = calculateOpportunity(card);
  const result = buyProperty(state, card, "event-1");
  assert.equal(result.ok, true);
  assert.equal(state.cash, 250000 - card.downPayment);
  assert.equal(state.ownedProperties.length, 1);
  assert.equal(state.liabilities.length, 1);
  assert.equal(state.liabilities[0].balance, expected.loanAmount);
  assert.equal(calculatePortfolioSummary(state.ownedProperties).monthlyCashflow, expected.monthlyCashflow);
  assert.equal(calculateMonthlyCashflow(state), 30000 + card.monthlyRent - 18000 - card.mortgagePayment - expected.monthlyExpenses);
  assert.ok(calculateNetWorth(state) > 0);
});

test("现金不足时不可购买", () => {
  const state = makeState(1000);
  const result = buyProperty(state, realEstateOpportunities[0], "event-2");
  assert.equal(result.ok, false);
  assert.equal(state.ownedProperties.length, 0);
  assert.equal(state.liabilities.length, 0);
});

test("连续点击不会重复购买", () => {
  const state = makeState();
  const first = buyProperty(state, realEstateOpportunities[0], "same-event");
  const second = buyProperty(state, realEstateOpportunities[0], "same-event");
  assert.equal(first.ok, true);
  assert.equal(second.ok, false);
  assert.equal(state.ownedProperties.length, 1);
});

test("出售后资料正确", () => {
  const state = makeState();
  buyProperty(state, realEstateOpportunities[0], "event-3");
  const propertyId = state.ownedProperties[0].id;
  const beforeCash = state.cash;
  const result = sellProperty(state, propertyId);
  assert.equal(result.ok, true);
  assert.equal(state.ownedProperties.length, 0);
  assert.equal(state.liabilities.some((item) => item.propertyId === propertyId), false);
  assert.ok(state.cash > beforeCash);
});

test("房价上涨提高资产值，房价下跌不会产生异常数值", () => {
  const state = makeState();
  buyProperty(state, realEstateOpportunities[0], "event-4");
  const before = state.ownedProperties[0].currentValue;
  applyMarketEventToProperties(state, realEstateMarketEvents.find((event) => event.id === "value-up-small"));
  assert.ok(state.ownedProperties[0].currentValue > before);
  applyMarketEventToProperties(state, realEstateMarketEvents.find((event) => event.id === "value-down"));
  const property = state.ownedProperties[0];
  assert.ok(Number.isFinite(property.currentValue));
  assert.ok(Number.isFinite(property.equity));
  assert.ok(property.currentValue >= 0);
});

test("租金变化会影响被动收入", () => {
  const state = makeState();
  buyProperty(state, realEstateOpportunities[0], "event-5");
  const before = calculatePortfolioSummary(state.ownedProperties).monthlyRent;
  applyMarketEventToProperties(state, realEstateMarketEvents.find((event) => event.id === "rent-up"));
  assert.ok(calculatePortfolioSummary(state.ownedProperties).monthlyRent > before);
});

test("Payday 会偿还本金且贷款不会变负", () => {
  const state = makeState();
  buyProperty(state, realEstateOpportunities[5], "event-6");
  const before = state.ownedProperties[0].mortgageBalance;
  applyMortgagePayday(state);
  assert.ok(state.ownedProperties[0].mortgageBalance < before);
  for (let index = 0; index < 500; index += 1) applyMortgagePayday(state);
  assert.equal(state.ownedProperties[0].mortgageBalance, 0);
  assert.equal(state.ownedProperties[0].mortgagePayment, 0);
  assert.equal(state.liabilities.some((item) => item.type === "mortgage"), false);
});

test("维修支出现金不足时产生紧急负债", () => {
  const state = makeState();
  buyProperty(state, realEstateOpportunities[0], "event-7");
  state.cash = 100;
  const event = propertyHoldingEvents.find((item) => item.id === "roof-repair");
  const result = applyHoldingEvent(state, event, state.ownedProperties[0].id);
  assert.equal(result.ok, true);
  assert.ok(state.emergencyDebt > 0);
  assert.ok(state.liabilities.some((item) => item.type === "emergency"));
});

test("刷新后房产和交易记录可恢复，旧版存档可安全迁移", () => {
  const state = makeState();
  buyProperty(state, realEstateOpportunities[0], "event-8");
  const restored = migrateSavedState(JSON.parse(JSON.stringify(state)));
  assert.equal(restored.ownedProperties.length, 1);
  assert.ok(restored.propertyTransactions.length >= 1);

  const legacy = migrateSavedState({
    career: { id: "old", name: "旧职业" },
    month: 3,
    cash: 50000,
    salary: 20000,
    baseExpenses: 12000,
    assets: [{ id: "legacy-1", name: "车位出租", type: "property", value: 52000, cashflow: 1200 }],
    liabilities: [],
  });
  assert.equal(legacy.assets.length, 0);
  assert.equal(legacy.ownedProperties.length, 1);
  assert.ok(legacy.ownedProperties[0].mortgageBalance >= 0);
});
