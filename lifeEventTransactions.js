export function createLifeEventRecord({
  month,
  round,
  eventId,
  type,
  category,
  title,
  choice,
  cashChange = 0,
  incomeChange = 0,
  expenseChange = 0,
  liabilityChange = 0,
  insuranceClaim = 0,
  durationMonths = 0,
}) {
  return {
    id: `life-event-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    month: Math.max(1, Math.round(Number(month) || 1)),
    round: Math.max(1, Math.round(Number(round || month) || 1)),
    eventId,
    type,
    category,
    title,
    choice,
    cashChange: Math.round(Number(cashChange) || 0),
    incomeChange: Math.round(Number(incomeChange) || 0),
    expenseChange: Math.round(Number(expenseChange) || 0),
    liabilityChange: Math.round(Number(liabilityChange) || 0),
    insuranceClaim: Math.round(Number(insuranceClaim) || 0),
    durationMonths: Math.max(0, Math.round(Number(durationMonths) || 0)),
    timestamp: new Date().toISOString(),
  };
}

export function addLifeEventRecord(state, record) {
  if (!Array.isArray(state.lifeEventHistory)) state.lifeEventHistory = [];
  state.lifeEventHistory.unshift(record);
  state.lifeEventHistory = state.lifeEventHistory.slice(0, 100);
}
