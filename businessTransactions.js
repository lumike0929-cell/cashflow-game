export function createBusinessTransaction({
  month,
  round,
  businessId,
  type,
  description,
  cashChange = 0,
  valueChange = 0,
  incomeChange = 0,
  expenseChange = 0,
}) {
  return {
    id: `business-tx-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    month: safeInteger(month),
    round: safeInteger(round),
    businessId,
    type,
    description,
    cashChange: safeMoney(cashChange),
    valueChange: safeMoney(valueChange),
    incomeChange: safeMoney(incomeChange),
    expenseChange: safeMoney(expenseChange),
    timestamp: new Date().toISOString(),
  };
}

export function addBusinessTransaction(state, transaction) {
  const transactions = Array.isArray(state.businessTransactions) ? state.businessTransactions : [];
  state.businessTransactions = [transaction, ...transactions].slice(0, 140);
}

function safeInteger(value) {
  const number = Number(value);
  return Number.isFinite(number) ? Math.max(1, Math.round(number)) : 1;
}

function safeMoney(value) {
  const number = Number(value);
  if (!Number.isFinite(number)) return 0;
  const rounded = Math.round(number);
  return Object.is(rounded, -0) ? 0 : rounded;
}
