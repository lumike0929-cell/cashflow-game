import { ensureEconomyState } from "./economyCycleEngine.js";
import { ensureInsuranceState } from "./insuranceCalculator.js";
import { ensureLifeEventState } from "./lifeEventCalculator.js";
import { ensureTaxState } from "./taxCalculator.js";
import { ensureUnemploymentState } from "./unemploymentEngine.js";

export function migrateLifeEventStatePart(state, candidate) {
  state.insurancePolicies = Array.isArray(candidate?.insurancePolicies) ? candidate.insurancePolicies : [];
  state.insuranceTransactions = Array.isArray(candidate?.insuranceTransactions) ? candidate.insuranceTransactions : [];
  state.insuranceClaims = Array.isArray(candidate?.insuranceClaims) ? candidate.insuranceClaims : [];
  state.lifeEventHistory = Array.isArray(candidate?.lifeEventHistory) ? candidate.lifeEventHistory : [];
  state.lifeActiveEffects = Array.isArray(candidate?.lifeActiveEffects) ? candidate.lifeActiveEffects : [];
  state.settledLifeEvents = Array.isArray(candidate?.settledLifeEvents) ? candidate.settledLifeEvents : [];
  state.unemployment = candidate?.unemployment && typeof candidate.unemployment === "object" ? candidate.unemployment : {};
  state.tax = candidate?.tax && typeof candidate.tax === "object" ? candidate.tax : {};
  state.economy = candidate?.economy && typeof candidate.economy === "object" ? candidate.economy : {};
  state.job = candidate?.job && typeof candidate.job === "object" ? candidate.job : {};
  ensureInsuranceState(state);
  ensureUnemploymentState(state);
  ensureTaxState(state);
  ensureEconomyState(state);
  ensureLifeEventState(state);
  return state;
}
