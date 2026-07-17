import {
  clampMoney,
  ensureRealEstateState,
  recalculateProperty,
  syncMortgageLiabilities,
} from "./realEstateCalculator.js";
import { createPropertyTransaction } from "./realEstateTransactions.js";
import { migrateStockStatePart } from "./stockStorageMigration.js";
import { migrateBusinessStatePart } from "./businessStorageMigration.js";
import { migrateBankingStatePart } from "./bankingStorageMigration.js";
import { migrateLifeEventStatePart } from "./lifeEventStorageMigration.js";

export const CURRENT_SAVE_VERSION = 4;

export function migrateSavedState(candidate) {
  if (!candidate || typeof candidate !== "object") return null;
  const state = {
    ...candidate,
    saveVersion: CURRENT_SAVE_VERSION,
    month: Math.max(1, Math.round(Number(candidate.month) || 1)),
    round: Math.max(1, Math.round(Number(candidate.round || candidate.month) || 1)),
    position: Math.max(0, Math.round(Number(candidate.position) || 0)),
    cash: clampMoney(candidate.cash),
    salary: clampMoney(candidate.salary),
    baseExpenses: clampMoney(candidate.baseExpenses),
    financialIq: Math.max(0, Math.round(Number(candidate.financialIq) || 0)),
    assets: Array.isArray(candidate.assets)
      ? candidate.assets.filter((asset) => asset && asset.type !== "property" && asset.type !== "stock" && asset.type !== "business")
      : [],
    liabilities: Array.isArray(candidate.liabilities) ? candidate.liabilities.filter(Boolean) : [],
    logs: Array.isArray(candidate.logs) ? candidate.logs.slice(0, 9) : ["读取了旧存档。"],
    ownedProperties: Array.isArray(candidate.ownedProperties) ? candidate.ownedProperties : [],
    propertyTransactions: Array.isArray(candidate.propertyTransactions) ? candidate.propertyTransactions : [],
    settledEvents: Array.isArray(candidate.settledEvents) ? candidate.settledEvents : [],
    emergencyDebt: clampMoney(candidate.emergencyDebt),
  };

  const legacyProperties = Array.isArray(candidate.assets)
    ? candidate.assets.filter((asset) => asset && asset.type === "property")
    : [];
  legacyProperties.forEach((asset, index) => {
    const converted = convertLegacyProperty(asset, state.month, index);
    state.ownedProperties.push(converted);
    state.propertyTransactions.unshift(
      createPropertyTransaction({
        month: state.month,
        round: state.round,
        propertyId: converted.id,
        type: "购买",
        description: `从旧版存档迁移房产：${converted.name}。`,
        valueChange: converted.currentValue,
        liabilityChange: converted.mortgageBalance,
        cashflowChange: converted.monthlyCashflow,
      }),
    );
  });

  ensureRealEstateState(state);
  syncMortgageLiabilities(state);
  migrateStockStatePart(state, candidate);
  migrateBusinessStatePart(state, candidate);
  migrateBankingStatePart(state, candidate);
  migrateLifeEventStatePart(state, candidate);
  return state;
}

export function parseSavedState(raw) {
  if (!raw) return null;
  try {
    return migrateSavedState(JSON.parse(raw));
  } catch {
    return null;
  }
}

function convertLegacyProperty(asset, month, index) {
  const value = clampMoney(asset.value || asset.cost || asset.purchasePrice || 120000);
  const cashflow = Math.round(Number(asset.cashflow) || 0);
  const mortgageBalance = clampMoney(value * 0.72);
  const mortgagePayment = Math.max(0, Math.round(Math.abs(cashflow) * 0.45 + mortgageBalance * 0.008));
  const monthlyExpenses = Math.max(120, Math.round(value * 0.003));
  const monthlyRent = Math.max(0, cashflow + mortgagePayment + monthlyExpenses);
  return recalculateProperty({
    id: asset.id || `legacy-property-${Date.now()}-${index}`,
    name: asset.name || "旧版房产",
    category: legacyCategory(asset.name),
    description: asset.text || "由旧版普通房产资产安全迁移而来。",
    illustrationKey: "legacy-property",
    purchasePrice: value,
    downPayment: clampMoney(value - mortgageBalance),
    originalMortgage: mortgageBalance,
    mortgageBalance,
    mortgagePayment,
    principalPaid: 0,
    monthlyRent,
    monthlyExpenses,
    managementFee: Math.round(monthlyExpenses * 0.45),
    repairReserve: Math.round(monthlyExpenses * 0.55),
    monthlyCashflow: cashflow,
    currentValue: value,
    equity: 0,
    riskLevel: "中",
    locationQuality: "B",
    condition: "普通",
    units: 1,
    purchasedMonth: Math.max(1, month),
    appreciationRate: 0.002,
    status: "owned",
    lastMarketChange: "旧存档迁移",
  });
}

function legacyCategory(name = "") {
  if (name.includes("车位")) return "停车位";
  if (name.includes("套房")) return "小套房";
  if (name.includes("公寓")) return "学生公寓";
  return "郊区住宅";
}
