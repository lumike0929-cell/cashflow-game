import { stockDefinitions } from "./stockData.js";
import { addStockTransaction, createStockTransaction } from "./stockTransactions.js";

const MIN_PRICE = 2;
const MAX_HISTORY = 24;

export function stockMoney(value, fallback = 0) {
  const number = Number(value);
  if (!Number.isFinite(number)) return fallback;
  const rounded = Math.round(number * 100) / 100;
  return Object.is(rounded, -0) ? 0 : rounded;
}

export function stockShares(value) {
  const number = Number(value);
  if (!Number.isFinite(number)) return 0;
  return Math.max(0, Math.round(number));
}

export function clampStockPrice(value) {
  return Math.max(MIN_PRICE, stockMoney(value, MIN_PRICE));
}

export function normalizeStock(stock) {
  const currentPrice = clampStockPrice(stock.currentPrice);
  const previousPrice = clampStockPrice(stock.previousPrice || currentPrice);
  const basePrice = clampStockPrice(stock.basePrice || currentPrice);
  const priceHistory = normalizeHistory(stock.priceHistory, currentPrice);
  return {
    ...stock,
    currentPrice,
    previousPrice,
    basePrice,
    priceHistory,
    dividendPerShare: Math.max(0, stockMoney(stock.dividendPerShare)),
    dividendFrequency: Math.max(0, Math.round(Number(stock.dividendFrequency) || 0)),
    volatility: Math.max(0.01, Number.isFinite(Number(stock.volatility)) ? Number(stock.volatility) : 0.04),
    eventSensitivity: Math.max(0.2, Number.isFinite(Number(stock.eventSensitivity)) ? Number(stock.eventSensitivity) : 1),
    minimumPurchase: Math.max(1, Math.round(Number(stock.minimumPurchase) || 1)),
    maximumPurchase: Math.max(1, Math.round(Number(stock.maximumPurchase) || 100)),
    status: stock.status || "active",
  };
}

export function normalizeStockMarket(stockMarket) {
  const source = Array.isArray(stockMarket) && stockMarket.length ? stockMarket : stockDefinitions;
  const seen = new Set();
  return source
    .map((stock) => normalizeStock(stock))
    .filter((stock) => {
      if (seen.has(stock.id)) return false;
      seen.add(stock.id);
      return true;
    });
}

export function ensureStockState(state) {
  if (!Array.isArray(state.stockMarket)) state.stockMarket = normalizeStockMarket();
  state.stockMarket = normalizeStockMarket(state.stockMarket);
  if (!Array.isArray(state.stockHoldings)) state.stockHoldings = [];
  if (!Array.isArray(state.stockTransactions)) state.stockTransactions = [];
  if (!Array.isArray(state.stockMarketRecords)) state.stockMarketRecords = [];
  if (!Array.isArray(state.settledStockEvents)) state.settledStockEvents = [];
  state.realizedStockGain = stockMoney(state.realizedStockGain);
  state.stockHoldings = normalizeHoldings(state.stockHoldings, state.stockMarket);
}

export function normalizeHoldings(holdings, market) {
  if (!Array.isArray(holdings)) return [];
  return holdings
    .map((holding) => recalculateHolding(holding, market))
    .filter((holding) => holding.shares > 0);
}

export function recalculateHolding(holding, market) {
  const stock = findStock(market, holding.stockId || holding.id || holding.symbol);
  const shares = stockShares(holding.shares);
  const averageCost = stockMoney(holding.averageCost || holding.price || holding.currentPrice || stock?.currentPrice || 0);
  const currentPrice = clampStockPrice(stock?.currentPrice || holding.currentPrice || averageCost);
  const totalCost = stockMoney(holding.totalCost || shares * averageCost);
  const currentValue = stockMoney(shares * currentPrice);
  const unrealizedGain = stockMoney(currentValue - totalCost);
  const unrealizedGainPercent = totalCost > 0 ? stockMoney((unrealizedGain / totalCost) * 100) : 0;
  return {
    stockId: stock?.id || holding.stockId || `stock-${holding.symbol || "unknown"}`,
    symbol: stock?.symbol || holding.symbol || "STK",
    shares,
    averageCost,
    totalCost,
    currentPrice,
    currentValue,
    unrealizedGain,
    unrealizedGainPercent,
    dividendsReceived: stockMoney(holding.dividendsReceived),
    purchasedMonth: Math.max(1, Math.round(Number(holding.purchasedMonth) || 1)),
    lastTransactionMonth: Math.max(1, Math.round(Number(holding.lastTransactionMonth) || holding.purchasedMonth || 1)),
  };
}

export function calculateStockPortfolioSummary(state) {
  ensureStockState(state);
  const holdings = state.stockHoldings.map((holding) => recalculateHolding(holding, state.stockMarket));
  const totalValue = stockMoney(holdings.reduce((sum, holding) => sum + holding.currentValue, 0));
  const totalCost = stockMoney(holdings.reduce((sum, holding) => sum + holding.totalCost, 0));
  const unrealizedGain = stockMoney(totalValue - totalCost);
  const dividendsReceived = stockMoney(holdings.reduce((sum, holding) => sum + holding.dividendsReceived, 0));
  const maxSingleHoldingRatio = totalValue > 0 ? stockMoney(Math.max(...holdings.map((holding) => holding.currentValue / totalValue), 0) * 100) : 0;
  const highRiskValue = holdings.reduce((sum, holding) => {
    const stock = findStock(state.stockMarket, holding.stockId);
    return sum + (stock?.riskLevel === "高" ? holding.currentValue : 0);
  }, 0);
  const highRiskRatio = totalValue > 0 ? stockMoney((highRiskValue / totalValue) * 100) : 0;
  const sectorRatios = calculateSectorRatios(holdings, state.stockMarket, totalValue);
  const largestSectorRatio = sectorRatios.length ? Math.max(...sectorRatios.map((item) => item.ratio)) : 0;
  const totalAssets = Math.max(1, stockMoney((state.cash || 0) + totalValue + getOtherAssetValue(state)));
  const stockAssetRatio = stockMoney((totalValue / totalAssets) * 100);
  return {
    totalValue,
    totalCost,
    unrealizedGain,
    unrealizedGainPercent: totalCost > 0 ? stockMoney((unrealizedGain / totalCost) * 100) : 0,
    realizedGain: stockMoney(state.realizedStockGain),
    dividendsReceived,
    holdingCount: holdings.length,
    maxSingleHoldingRatio,
    sectorRatios,
    largestSectorRatio,
    highRiskRatio,
    stockAssetRatio,
    riskLevel: calculatePortfolioRiskLevel({ highRiskRatio, maxSingleHoldingRatio, largestSectorRatio, stockAssetRatio }),
    warnings: createRiskWarnings({ maxSingleHoldingRatio, largestSectorRatio }),
  };
}

export function buyStock(state, stockId, quantity, eventId) {
  ensureStockState(state);
  if (state.settledStockEvents.includes(eventId)) return { ok: false, reason: "这次股票交易已经结算过了。" };
  const stock = findStock(state.stockMarket, stockId);
  if (!stock) return { ok: false, reason: "没有找到这支虚构股票。" };
  const shares = stockShares(quantity);
  if (shares <= 0) return { ok: false, reason: "买入数量必须是正整数。" };
  if (shares < stock.minimumPurchase) return { ok: false, reason: `最低买入 ${stock.minimumPurchase} 股。` };
  const existing = state.stockHoldings.find((holding) => holding.stockId === stock.id);
  const currentShares = existing?.shares || 0;
  if (currentShares + shares > stock.maximumPurchase) return { ok: false, reason: `这支股票最多持有 ${stock.maximumPurchase} 股。` };
  const totalAmount = stockMoney(shares * stock.currentPrice);
  if (state.cash < totalAmount) return { ok: false, reason: `现金不足，还差 ${stockMoney(totalAmount - state.cash)}。` };

  state.cash = stockMoney(state.cash - totalAmount);
  if (existing) {
    const nextTotalCost = stockMoney(existing.totalCost + totalAmount);
    const nextShares = existing.shares + shares;
    existing.shares = nextShares;
    existing.totalCost = nextTotalCost;
    existing.averageCost = stockMoney(nextTotalCost / nextShares);
    existing.currentPrice = stock.currentPrice;
    existing.lastTransactionMonth = state.month;
  } else {
    state.stockHoldings.push({
      stockId: stock.id,
      symbol: stock.symbol,
      shares,
      averageCost: stock.currentPrice,
      totalCost: totalAmount,
      currentPrice: stock.currentPrice,
      currentValue: totalAmount,
      unrealizedGain: 0,
      unrealizedGainPercent: 0,
      dividendsReceived: 0,
      purchasedMonth: state.month,
      lastTransactionMonth: state.month,
    });
  }
  state.stockHoldings = normalizeHoldings(state.stockHoldings, state.stockMarket);
  state.settledStockEvents.push(eventId);
  addStockTransaction(
    state,
    createStockTransaction({
      month: state.month,
      round: state.round || state.month,
      stockId: stock.id,
      type: "买入",
      shares,
      pricePerShare: stock.currentPrice,
      totalAmount,
      description: `买入 ${stock.name} ${shares} 股。买股票代表你拥有公司的一小部分，但价格会随着表现和市场改变。`,
    }),
  );
  return { ok: true, stock, shares, totalAmount };
}

export function calculateSellPreview(state, stockId, quantity) {
  ensureStockState(state);
  const holding = state.stockHoldings.find((item) => item.stockId === stockId);
  const stock = findStock(state.stockMarket, stockId);
  const shares = stockShares(quantity);
  const price = clampStockPrice(stock?.currentPrice || holding?.currentPrice || 0);
  const totalAmount = stockMoney(shares * price);
  const costBasis = stockMoney(shares * (holding?.averageCost || 0));
  return {
    stock,
    holding,
    shares,
    pricePerShare: price,
    totalAmount,
    averageCost: stockMoney(holding?.averageCost || 0),
    realizedGain: stockMoney(totalAmount - costBasis),
  };
}

export function sellStock(state, stockId, quantity, eventId) {
  ensureStockState(state);
  if (state.settledStockEvents.includes(eventId)) return { ok: false, reason: "这次卖出已经结算过了。" };
  const preview = calculateSellPreview(state, stockId, quantity);
  if (!preview.holding || !preview.stock) return { ok: false, reason: "没有这支股票持仓。" };
  if (preview.shares <= 0) return { ok: false, reason: "卖出数量必须是正整数。" };
  if (preview.shares > preview.holding.shares) return { ok: false, reason: "不能卖出超过持有数量。" };

  state.cash = stockMoney(state.cash + preview.totalAmount);
  state.realizedStockGain = stockMoney((state.realizedStockGain || 0) + preview.realizedGain);
  preview.holding.shares -= preview.shares;
  preview.holding.totalCost = stockMoney(preview.holding.shares * preview.holding.averageCost);
  preview.holding.lastTransactionMonth = state.month;
  state.stockHoldings = normalizeHoldings(state.stockHoldings, state.stockMarket);
  state.settledStockEvents.push(eventId);
  addStockTransaction(
    state,
    createStockTransaction({
      month: state.month,
      round: state.round || state.month,
      stockId: preview.stock.id,
      type: "卖出",
      shares: preview.shares,
      pricePerShare: preview.pricePerShare,
      totalAmount: preview.totalAmount,
      realizedGain: preview.realizedGain,
      description: `卖出 ${preview.stock.name} ${preview.shares} 股。价格上涨不代表已经赚钱，真正卖出后，损益才会变成实际结果。`,
    }),
  );
  return { ok: true, ...preview };
}

export function updateStockPrices(state, reason = "市场自然波动", random = Math.random) {
  ensureStockState(state);
  const affected = [];
  state.stockMarket = state.stockMarket.map((stock) => {
    const before = normalizeStock(stock);
    const direction = trendBias(before.trend);
    const randomMove = (random() - 0.5 + direction) * before.volatility;
    const limitedMove = limitChange(randomMove, before.riskLevel);
    const afterPrice = clampStockPrice(before.currentPrice * (1 + limitedMove));
    const next = withPrice(before, afterPrice);
    affected.push(priceChangeRecord(before, next));
    return next;
  });
  state.stockHoldings = normalizeHoldings(state.stockHoldings, state.stockMarket);
  addMarketRecord(state, reason, affected);
  return { affected };
}

export function applyStockMarketEvent(state, event, random = Math.random) {
  ensureStockState(state);
  const targets = selectEventTargets(state.stockMarket, event, random);
  const targetIds = new Set(targets.map((stock) => stock.id));
  const affected = [];
  state.stockMarket = state.stockMarket.map((stock) => {
    const before = normalizeStock(stock);
    if (!targetIds.has(before.id)) return before;
    const sensitivity = before.eventSensitivity || 1;
    const eventMove = (event.factor - 1) * sensitivity;
    const afterPrice = clampStockPrice(before.currentPrice * (1 + limitChange(eventMove, before.riskLevel)));
    const next = withPrice(before, afterPrice);
    affected.push(priceChangeRecord(before, next));
    return next;
  });
  state.stockHoldings = normalizeHoldings(state.stockHoldings, state.stockMarket);
  addMarketRecord(state, event.title, affected);
  return {
    ok: true,
    affected,
    heldAffected: affected.filter((item) => state.stockHoldings.some((holding) => holding.stockId === item.stockId)),
    message: event.text,
  };
}

export function settleStockDividends(state) {
  ensureStockState(state);
  const alreadySettled = state.stockTransactions.some((tx) => tx.type === "股息" && tx.month === state.month);
  if (alreadySettled) return { totalDividend: 0, details: [], skipped: true };
  const details = [];
  let totalDividend = 0;
  state.stockHoldings.forEach((holding) => {
    const stock = findStock(state.stockMarket, holding.stockId);
    if (!stock || stock.dividendPerShare <= 0 || stock.dividendFrequency <= 0) return;
    if (state.month % stock.dividendFrequency !== 0) return;
    const amount = stockMoney(holding.shares * stock.dividendPerShare);
    if (amount <= 0) return;
    holding.dividendsReceived = stockMoney(holding.dividendsReceived + amount);
    totalDividend = stockMoney(totalDividend + amount);
    details.push({ stockId: stock.id, symbol: stock.symbol, name: stock.name, shares: holding.shares, amount });
    addStockTransaction(
      state,
      createStockTransaction({
        month: state.month,
        round: state.round || state.month,
        stockId: stock.id,
        type: "股息",
        shares: holding.shares,
        pricePerShare: stock.dividendPerShare,
        totalAmount: amount,
        description: `${stock.name} 发放股息 ${amount}。股息是部分公司把一部分成果分享给股东，但并不是每家公司都会发放。`,
      }),
    );
  });
  if (totalDividend > 0) {
    state.cash = stockMoney(state.cash + totalDividend);
  }
  state.stockHoldings = normalizeHoldings(state.stockHoldings, state.stockMarket);
  return { totalDividend, details, skipped: false };
}

export function findStock(market, stockIdOrSymbol) {
  const stocks = Array.isArray(market) ? market : stockDefinitions;
  return stocks.find((stock) => stock.id === stockIdOrSymbol || stock.symbol === stockIdOrSymbol) || null;
}

function normalizeHistory(history, currentPrice) {
  const values = Array.isArray(history) ? history.map((price) => clampStockPrice(price)) : [];
  const nextValues = values.length ? values : [currentPrice];
  return nextValues.slice(-MAX_HISTORY);
}

function withPrice(stock, nextPrice) {
  const currentPrice = clampStockPrice(nextPrice);
  return {
    ...stock,
    previousPrice: stock.currentPrice,
    currentPrice,
    priceHistory: [...stock.priceHistory, currentPrice].slice(-MAX_HISTORY),
  };
}

function priceChangeRecord(before, after) {
  const change = stockMoney(after.currentPrice - before.currentPrice);
  const percent = before.currentPrice > 0 ? stockMoney((change / before.currentPrice) * 100) : 0;
  return {
    stockId: after.id,
    symbol: after.symbol,
    name: after.name,
    sector: after.sector,
    beforePrice: before.currentPrice,
    afterPrice: after.currentPrice,
    change,
    percent,
    direction: change >= 0 ? "上涨" : "下跌",
  };
}

function addMarketRecord(state, title, affected) {
  const records = Array.isArray(state.stockMarketRecords) ? state.stockMarketRecords : [];
  state.stockMarketRecords = [
    {
      id: `stock-market-${Date.now()}-${Math.random().toString(16).slice(2)}`,
      month: Math.max(1, Math.round(Number(state.month) || 1)),
      round: Math.max(1, Math.round(Number(state.round || state.month) || 1)),
      title,
      affected: affected.slice(0, 12),
      description: affected.length ? `${title} 影响了 ${affected.length} 支虚构股票。` : `${title} 没有直接影响持仓。`,
    },
    ...records,
  ].slice(0, 80);
}

function selectEventTargets(market, event, random) {
  if (event.scope === "market") return market;
  if (event.scope === "sector") return market.filter((stock) => stock.sector === event.sector);
  const index = Math.floor(random() * market.length);
  return [market[index] || market[0]].filter(Boolean);
}

function limitChange(change, riskLevel) {
  const cap = riskLevel === "高" ? 0.18 : riskLevel === "中" ? 0.12 : 0.07;
  return Math.max(-cap, Math.min(cap, change));
}

function trendBias(trend) {
  if (trend === "成长") return 0.08;
  if (trend === "稳定") return 0.02;
  if (trend === "循环") return 0;
  return 0.01;
}

function calculateSectorRatios(holdings, market, totalValue) {
  const sectorTotals = new Map();
  holdings.forEach((holding) => {
    const stock = findStock(market, holding.stockId);
    const sector = stock?.sector || "其他";
    sectorTotals.set(sector, stockMoney((sectorTotals.get(sector) || 0) + holding.currentValue));
  });
  return [...sectorTotals.entries()]
    .map(([sector, value]) => ({
      sector,
      value,
      ratio: totalValue > 0 ? stockMoney((value / totalValue) * 100) : 0,
    }))
    .sort((left, right) => right.ratio - left.ratio);
}

function calculatePortfolioRiskLevel({ highRiskRatio, maxSingleHoldingRatio, largestSectorRatio, stockAssetRatio }) {
  const score = highRiskRatio * 0.35 + maxSingleHoldingRatio * 0.28 + largestSectorRatio * 0.22 + stockAssetRatio * 0.15;
  if (score >= 55) return "高";
  if (score >= 30) return "中";
  return "低";
}

function createRiskWarnings({ maxSingleHoldingRatio, largestSectorRatio }) {
  const warnings = [];
  if (maxSingleHoldingRatio > 45) {
    warnings.push("把太多钱放在同一个选择里，价格下跌时可能受到较大影响。");
  }
  if (largestSectorRatio > 60) {
    warnings.push("不同产业可能遇到不同问题，分散可以减少一次事件带来的影响。");
  }
  return warnings;
}

function getOtherAssetValue(state) {
  const otherAssets = Array.isArray(state.assets)
    ? state.assets.reduce((sum, asset) => sum + (asset.type === "property" || asset.type === "stock" ? 0 : stockMoney(asset.value)), 0)
    : 0;
  const realEstate = Array.isArray(state.ownedProperties)
    ? state.ownedProperties.reduce((sum, property) => sum + stockMoney(property.currentValue), 0)
    : 0;
  return stockMoney(otherAssets + realEstate);
}
