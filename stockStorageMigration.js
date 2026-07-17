import { stockDefinitions } from "./stockData.js";
import { ensureStockState, findStock, stockMoney, stockShares } from "./stockCalculator.js";
import { addStockTransaction, createStockTransaction } from "./stockTransactions.js";

export function migrateStockStatePart(state, candidate = {}) {
  state.stockMarket = Array.isArray(candidate.stockMarket) ? candidate.stockMarket : stockDefinitions;
  state.stockHoldings = Array.isArray(candidate.stockHoldings) ? candidate.stockHoldings : [];
  state.stockTransactions = Array.isArray(candidate.stockTransactions) ? candidate.stockTransactions : [];
  state.stockMarketRecords = Array.isArray(candidate.stockMarketRecords) ? candidate.stockMarketRecords : [];
  state.settledStockEvents = Array.isArray(candidate.settledStockEvents) ? candidate.settledStockEvents : [];
  state.realizedStockGain = stockMoney(candidate.realizedStockGain);

  const legacyStocks = Array.isArray(candidate.assets)
    ? candidate.assets.filter((asset) => asset && asset.type === "stock")
    : [];
  legacyStocks.forEach((asset, index) => {
    const converted = convertLegacyStock(asset, state, index);
    const existing = state.stockHoldings.find((holding) => holding.stockId === converted.stockId);
    if (existing) {
      existing.shares += converted.shares;
      existing.totalCost = stockMoney(existing.totalCost + converted.totalCost);
      existing.averageCost = stockMoney(existing.totalCost / existing.shares);
    } else {
      state.stockHoldings.push(converted);
    }
    addStockTransaction(
      state,
      createStockTransaction({
        month: state.month,
        round: state.round,
        stockId: converted.stockId,
        type: "迁移",
        shares: converted.shares,
        pricePerShare: converted.averageCost,
        totalAmount: converted.totalCost,
        description: `从旧版存档迁移股票资产：${asset.name || converted.symbol}。`,
      }),
    );
  });
  ensureStockState(state);
  return state;
}

function convertLegacyStock(asset, state, index) {
  const stock = findStock(state.stockMarket, pickLegacyStockId(asset, index)) || stockDefinitions[index % stockDefinitions.length];
  const value = Math.max(1, stockMoney(asset.value || asset.cost || asset.downPayment || stock.currentPrice));
  const shares = Math.max(1, stockShares(value / stock.currentPrice));
  const totalCost = stockMoney(shares * stock.currentPrice);
  return {
    stockId: stock.id,
    symbol: stock.symbol,
    shares,
    averageCost: stock.currentPrice,
    totalCost,
    currentPrice: stock.currentPrice,
    currentValue: totalCost,
    unrealizedGain: 0,
    unrealizedGainPercent: 0,
    dividendsReceived: 0,
    purchasedMonth: Math.max(1, Math.round(Number(state.month) || 1)),
    lastTransactionMonth: Math.max(1, Math.round(Number(state.month) || 1)),
  };
}

function pickLegacyStockId(asset, index) {
  const name = asset.name || "";
  if (name.includes("基金")) return "steady-market-fund";
  if (name.includes("债券")) return "safe-bank";
  if (name.includes("科技")) return "star-tech";
  return stockDefinitions[index % stockDefinitions.length].id;
}
