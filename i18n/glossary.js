export const glossaryIds = [
  "cash",
  "income",
  "expense",
  "monthlyCashflow",
  "activeIncome",
  "passiveIncome",
  "asset",
  "liability",
  "netWorth",
  "dividend",
  "rent",
  "mortgage",
  "loan",
  "interest",
  "creditScore",
  "insurance",
  "premium",
  "claim",
  "tax",
  "emergencyFund",
  "diversification",
  "financialFreedom",
  "essentialExpenses",
];

export function buildGlossary(localePack) {
  return glossaryIds.map((id) => ({
    id,
    ...(localePack.glossary?.[id] || localePack.glossary?.cash),
  }));
}
