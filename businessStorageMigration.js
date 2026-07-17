import { businessDefinitions } from "./businessData.js";
import { createBusinessFromDefinition, ensureBusinessState } from "./businessCalculator.js";
import { addBusinessTransaction, createBusinessTransaction } from "./businessTransactions.js";

export function migrateBusinessStatePart(state, candidate = {}) {
  state.businessHoldings = Array.isArray(candidate.businessHoldings) ? candidate.businessHoldings : [];
  state.businessTransactions = Array.isArray(candidate.businessTransactions) ? candidate.businessTransactions : [];
  state.businessMarketRecords = Array.isArray(candidate.businessMarketRecords) ? candidate.businessMarketRecords : [];
  state.settledBusinessEvents = Array.isArray(candidate.settledBusinessEvents) ? candidate.settledBusinessEvents : [];
  state.settledBusinessMonths = Array.isArray(candidate.settledBusinessMonths) ? candidate.settledBusinessMonths : [];

  const legacyBusinesses = Array.isArray(candidate.assets)
    ? candidate.assets.filter((asset) => asset && asset.type === "business")
    : [];
  legacyBusinesses.forEach((asset, index) => {
    const definition = pickDefinition(asset, index);
    const business = createBusinessFromDefinition(definition, state.month);
    business.name = asset.name || business.name;
    business.currentValue = Math.max(business.currentValue, Math.round(Number(asset.value) || business.currentValue));
    business.monthlyProfit = Math.round(Number(asset.cashflow) || business.monthlyProfit);
    business.monthlyRevenue = Math.max(business.monthlyProfit + business.monthlyExpenses, business.monthlyRevenue);
    business.recentEvent = "舊存檔遷移";
    state.businessHoldings.push(business);
    addBusinessTransaction(
      state,
      createBusinessTransaction({
        month: state.month,
        round: state.round,
        businessId: business.businessId,
        type: "投資",
        description: `從舊版存檔遷移小生意：${business.name}。`,
        valueChange: business.currentValue,
        incomeChange: business.monthlyRevenue,
        expenseChange: business.monthlyExpenses,
      }),
    );
  });
  ensureBusinessState(state);
  return state;
}

function pickDefinition(asset, index) {
  const name = asset.name || "";
  if (name.includes("售貨") || name.includes("販賣")) return businessDefinitions.find((item) => item.id === "vending");
  if (name.includes("課")) return businessDefinitions.find((item) => item.id === "kids-code");
  if (name.includes("洗衣")) return businessDefinitions.find((item) => item.id === "laundry");
  return businessDefinitions[index % businessDefinitions.length];
}
