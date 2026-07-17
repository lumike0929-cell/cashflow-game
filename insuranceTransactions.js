export function createInsuranceTransaction({
  month,
  round,
  policyId = "",
  eventId = "",
  type,
  description,
  premiumChange = 0,
  claimAmount = 0,
  playerCost = 0,
}) {
  return {
    id: `insurance-tx-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    month: Math.max(1, Math.round(Number(month) || 1)),
    round: Math.max(1, Math.round(Number(round || month) || 1)),
    policyId,
    eventId,
    type,
    description,
    premiumChange: Math.round(Number(premiumChange) || 0),
    claimAmount: Math.round(Number(claimAmount) || 0),
    playerCost: Math.round(Number(playerCost) || 0),
    timestamp: new Date().toISOString(),
  };
}

export function addInsuranceTransaction(state, transaction) {
  if (!Array.isArray(state.insuranceTransactions)) state.insuranceTransactions = [];
  state.insuranceTransactions.unshift(transaction);
  state.insuranceTransactions = state.insuranceTransactions.slice(0, 80);
}
