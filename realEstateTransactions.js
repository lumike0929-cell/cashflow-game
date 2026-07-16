export function createPropertyTransaction({
  month,
  round,
  propertyId,
  type,
  description,
  cashChange = 0,
  valueChange = 0,
  liabilityChange = 0,
  cashflowChange = 0,
}) {
  return {
    id: `tx-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    month: safeInteger(month, 1),
    round: safeInteger(round, 1),
    propertyId,
    type,
    description,
    cashChange: safeMoney(cashChange),
    valueChange: safeMoney(valueChange),
    liabilityChange: safeMoney(liabilityChange),
    cashflowChange: safeMoney(cashflowChange),
  };
}

export function addPropertyTransaction(state, transaction) {
  const transactions = Array.isArray(state.propertyTransactions) ? state.propertyTransactions : [];
  state.propertyTransactions = [transaction, ...transactions].slice(0, 80);
}

function safeInteger(value, fallback) {
  const number = Number(value);
  return Number.isFinite(number) ? Math.max(1, Math.round(number)) : fallback;
}

function safeMoney(value) {
  const number = Number(value);
  if (!Number.isFinite(number)) return 0;
  const rounded = Math.round(number);
  return Object.is(rounded, -0) ? 0 : rounded;
}
