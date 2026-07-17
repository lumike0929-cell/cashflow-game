import test from "node:test";
import assert from "node:assert/strict";
import { businessDefinitions, businessMarketEvents, businessRiskEvents } from "../businessData.js";
import {
  applyBusinessMarketEvent,
  applyBusinessRiskEvent,
  calculateBusinessSummary,
  investBusiness,
  sellBusiness,
  settleBusinessPayday,
  upgradeBusiness,
} from "../businessCalculator.js";
import { migrateSavedState } from "../realEstateStorageMigration.js";

function makeState(cash = 100000) {
  return migrateSavedState({
    career: { id: "tester", name: "測試員" },
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

test("現金足夠時可投資，現金、收入、成本與淨資產正確", () => {
  const state = makeState();
  const definition = businessDefinitions[0];
  const result = investBusiness(state, definition, "biz-1");
  assert.equal(result.ok, true);
  assert.equal(state.cash, 100000 - definition.startupCost);
  assert.equal(state.businessHoldings.length, 1);
  assert.equal(state.businessHoldings[0].monthlyRevenue, definition.monthlyRevenue);
  assert.equal(state.businessHoldings[0].monthlyExpenses, definition.monthlyFixedCost + definition.monthlyVariableCost);
  assert.ok(calculateBusinessSummary(state).totalValue > 0);
});

test("現金不足與重複點擊不會重複投資", () => {
  const state = makeState(100);
  assert.equal(investBusiness(state, businessDefinitions[0], "biz-low").ok, false);
  state.cash = 100000;
  assert.equal(investBusiness(state, businessDefinitions[0], "same-biz").ok, true);
  assert.equal(investBusiness(state, businessDefinitions[0], "same-biz").ok, false);
  assert.equal(state.businessHoldings.length, 1);
});

test("升級後收入、成本與淨利正確，同一升級不可重複", () => {
  const state = makeState();
  const definition = businessDefinitions[0];
  investBusiness(state, definition, "biz-2");
  const upgrade = definition.upgradeOptions[0];
  const before = state.businessHoldings[0].monthlyProfit;
  const result = upgradeBusiness(state, definition.id, upgrade.id, "up-1");
  assert.equal(result.ok, true);
  assert.notEqual(state.businessHoldings[0].monthlyProfit, before);
  assert.equal(upgradeBusiness(state, definition.id, upgrade.id, "up-2").ok, false);
});

test("Payday 每月只結算一次，虧損時正確扣款並可產生緊急負債", () => {
  const state = makeState(3000);
  investBusiness(state, businessDefinitions[0], "biz-3");
  state.businessHoldings[0].monthlyRevenue = 100;
  state.businessHoldings[0].monthlyExpenses = 5000;
  state.businessHoldings[0].monthlyProfit = -4900;
  const first = settleBusinessPayday(state);
  const second = settleBusinessPayday(state);
  assert.equal(first.skipped, false);
  assert.equal(second.skipped, true);
  assert.ok(state.emergencyDebt > 0);
});

test("風險事件只作用於持有生意，市場需求只影響相關類型", () => {
  const empty = makeState();
  const event = businessRiskEvents.find((item) => item.id === "more-customers");
  assert.equal(applyBusinessRiskEvent(empty, event, "none", "risk-empty").ok, false);

  const state = makeState();
  investBusiness(state, businessDefinitions.find((item) => item.category === "教育"), "edu");
  investBusiness(state, businessDefinitions.find((item) => item.category === "自動化"), "auto");
  const market = businessMarketEvents.find((item) => item.id === "school-start");
  const result = applyBusinessMarketEvent(state, market, "market-1");
  assert.equal(result.ok, true);
  assert.equal(result.affected.length, 1);
  assert.equal(result.affected[0].after.category, "教育");
});

test("出售後資產與收入正確移除", () => {
  const state = makeState();
  investBusiness(state, businessDefinitions[0], "biz-4");
  const beforeCash = state.cash;
  const result = sellBusiness(state, businessDefinitions[0].id, "sell-1");
  assert.equal(result.ok, true);
  assert.equal(state.businessHoldings.length, 0);
  assert.ok(state.cash > beforeCash);
});

test("刷新後持有生意、升級與交易記錄正確恢復，舊版存檔可遷移", () => {
  const state = makeState();
  investBusiness(state, businessDefinitions[0], "biz-5");
  upgradeBusiness(state, businessDefinitions[0].id, businessDefinitions[0].upgradeOptions[0].id, "up-legacy");
  const restored = migrateSavedState(JSON.parse(JSON.stringify(state)));
  assert.equal(restored.businessHoldings.length, 1);
  assert.equal(restored.businessHoldings[0].purchasedUpgrades.length, 1);
  assert.ok(restored.businessTransactions.length >= 2);

  const legacy = migrateSavedState({
    career: { id: "old", name: "舊職業" },
    month: 2,
    round: 2,
    cash: 20000,
    salary: 18000,
    baseExpenses: 12000,
    assets: [{ id: "legacy-business", name: "自動售貨機點位", type: "business", value: 18000, cashflow: 850 }],
    liabilities: [],
    logs: [],
  });
  assert.equal(legacy.assets.length, 0);
  assert.equal(legacy.businessHoldings.length, 1);
  assert.ok(legacy.businessTransactions.some((tx) => tx.type === "投資"));
});
