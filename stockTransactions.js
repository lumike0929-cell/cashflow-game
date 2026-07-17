export function createStockTransaction({
  month,
  round,
  stockId,
  type,
  shares = 0,
  pricePerShare = 0,
  totalAmount = 0,
  realizedGain = 0,
  description,
}) {
  return {
    id: `stock-tx-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    month: safeInteger(month),
    round: safeInteger(round),
    stockId,
    type,
    shares: safeShares(shares),
    pricePerShare: safeMoney(pricePerShare),
    totalAmount: safeMoney(totalAmount),
    realizedGain: safeMoney(realizedGain),
    description,
    timestamp: new Date().toISOString(),
  };
}

export function addStockTransaction(state, transaction) {
  const transactions = Array.isArray(state.stockTransactions) ? state.stockTransactions : [];
  state.stockTransactions = [transaction, ...transactions].slice(0, 120);
}

function safeInteger(value) {
  const number = Number(value);
  return Number.isFinite(number) ? Math.max(1, Math.round(number)) : 1;
}

function safeShares(value) {
  const number = Number(value);
  return Number.isFinite(number) ? Math.max(0, Math.round(number)) : 0;
}

function safeMoney(value) {
  const number = Number(value);
  if (!Number.isFinite(number)) return 0;
  const rounded = Math.round(number * 100) / 100;
  return Object.is(rounded, -0) ? 0 : rounded;
}
