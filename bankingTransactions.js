export function createBankTransaction({
  month,
  round,
  type,
  description,
  cashChange = 0,
  liabilityChange = 0,
  paymentChange = 0,
  creditChange = 0,
}) {
  return {
    id: `bank-tx-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    month: Math.max(1, Math.round(Number(month) || 1)),
    round: Math.max(1, Math.round(Number(round || month) || 1)),
    type,
    description,
    cashChange: Math.round(Number(cashChange) || 0),
    liabilityChange: Math.round(Number(liabilityChange) || 0),
    paymentChange: Math.round(Number(paymentChange) || 0),
    creditChange: Math.round(Number(creditChange) || 0),
    timestamp: new Date().toISOString(),
  };
}

export function addBankTransaction(state, transaction) {
  if (!Array.isArray(state.bankTransactions)) state.bankTransactions = [];
  state.bankTransactions.unshift(transaction);
  state.bankTransactions = state.bankTransactions.slice(0, 80);
}
