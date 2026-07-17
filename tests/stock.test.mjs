import test from "node:test";
import assert from "node:assert/strict";
import { stockDefinitions, stockMarketEvents } from "../stockData.js";
import {
  applyStockMarketEvent,
  buyStock,
  calculateStockPortfolioSummary,
  sellStock,
  settleStockDividends,
  updateStockPrices,
} from "../stockCalculator.js";
import { migrateSavedState } from "../realEstateStorageMigration.js";

function makeState(cash = 50000) {
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

test("现金足够时可买入股票并更新均价、现金和持仓", () => {
  const state = makeState();
  const stock = stockDefinitions[0];
  const result = buyStock(state, stock.id, 5, "buy-1");
  assert.equal(result.ok, true);
  assert.equal(state.cash, 50000 - stock.currentPrice * 5);
  assert.equal(state.stockHoldings.length, 1);
  assert.equal(state.stockHoldings[0].shares, 5);
  assert.equal(state.stockHoldings[0].averageCost, stock.currentPrice);
});

test("现金不足、数量错误和重复事件不会买入", () => {
  const state = makeState(10);
  assert.equal(buyStock(state, stockDefinitions[0].id, 0, "bad-qty").ok, false);
  assert.equal(buyStock(state, stockDefinitions[0].id, 5, "cash-low").ok, false);
  state.cash = 50000;
  assert.equal(buyStock(state, stockDefinitions[0].id, 1, "same-event").ok, true);
  assert.equal(buyStock(state, stockDefinitions[0].id, 1, "same-event").ok, false);
  assert.equal(state.stockHoldings.length, 1);
});

test("卖出股票会增加现金、减少持股并记录已实现损益", () => {
  const state = makeState();
  const stock = stockDefinitions[0];
  buyStock(state, stock.id, 10, "buy-2");
  state.stockMarket[0].currentPrice = stock.currentPrice + 10;
  const beforeCash = state.cash;
  const result = sellStock(state, stock.id, 4, "sell-1");
  assert.equal(result.ok, true);
  assert.equal(state.stockHoldings[0].shares, 6);
  assert.ok(state.cash > beforeCash);
  assert.ok(state.realizedStockGain > 0);
  assert.equal(sellStock(state, stock.id, 99, "sell-too-many").ok, false);
});

test("股票市场事件和自然波动会更新价格且不产生异常数值", () => {
  const state = makeState();
  buyStock(state, stockDefinitions[0].id, 3, "buy-3");
  const before = state.stockMarket[0].currentPrice;
  applyStockMarketEvent(state, stockMarketEvents.find((event) => event.id === "market-up-small"), () => 0);
  assert.ok(state.stockMarket[0].currentPrice > before);
  updateStockPrices(state, "测试波动", () => 0);
  state.stockMarket.forEach((stock) => {
    assert.ok(Number.isFinite(stock.currentPrice));
    assert.ok(stock.currentPrice >= 2);
    assert.ok(stock.priceHistory.length <= 24);
  });
});

test("股息在 Payday 月份结算且同月不会重复", () => {
  const state = makeState();
  const stock = stockDefinitions.find((item) => item.dividendFrequency === 1);
  buyStock(state, stock.id, 10, "buy-dividend");
  const first = settleStockDividends(state);
  const second = settleStockDividends(state);
  assert.ok(first.totalDividend > 0);
  assert.equal(second.totalDividend, 0);
  assert.equal(second.skipped, true);
});

test("组合风险和分散提示可计算", () => {
  const state = makeState(100000);
  buyStock(state, stockDefinitions[0].id, 80, "risk-1");
  const summary = calculateStockPortfolioSummary(state);
  assert.ok(summary.totalValue > 0);
  assert.ok(summary.maxSingleHoldingRatio >= 99);
  assert.ok(summary.warnings.length >= 1);
});

test("旧版股票资产会迁移为新持仓并恢复交易记录", () => {
  const migrated = migrateSavedState({
    career: { id: "old", name: "旧职业" },
    month: 2,
    round: 2,
    cash: 20000,
    salary: 18000,
    baseExpenses: 12000,
    assets: [{ id: "legacy-stock", name: "指数基金定投包", type: "stock", value: 12000, cashflow: 220 }],
    liabilities: [],
    logs: [],
  });
  assert.equal(migrated.assets.length, 0);
  assert.equal(migrated.stockHoldings.length, 1);
  assert.ok(migrated.stockTransactions.some((tx) => tx.type === "迁移"));
});
