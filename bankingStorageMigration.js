import { ensureBankingState } from "./bankingCalculator.js";

export function migrateBankingStatePart(state, candidate) {
  const sourceBank = candidate && typeof candidate.bank === "object" ? candidate.bank : {};
  state.bank = {
    creditScore: sourceBank.creditScore ?? candidate?.creditScore ?? 650,
    interestLevel: sourceBank.interestLevel ?? candidate?.interestLevel ?? "normal",
    bankruptcyWarning: Boolean(sourceBank.bankruptcyWarning),
  };
  state.bankTransactions = Array.isArray(candidate?.bankTransactions) ? candidate.bankTransactions : [];
  state.settledBankEvents = Array.isArray(candidate?.settledBankEvents) ? candidate.settledBankEvents : [];
  state.liabilities = Array.isArray(state.liabilities)
    ? state.liabilities.map((item) => ({
        ...item,
        type: item.type === "loan" ? "personalLoan" : item.type,
      }))
    : [];
  ensureBankingState(state);
  return state;
}
