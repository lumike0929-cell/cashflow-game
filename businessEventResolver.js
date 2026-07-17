import { businessMarketEvents, businessRiskEvents } from "./businessData.js";
import { applyBusinessMarketEvent, applyBusinessRiskEvent } from "./businessCalculator.js";

export function pickBusinessRiskEvent(positive = null, random = Math.random) {
  const candidates = positive === null ? businessRiskEvents : businessRiskEvents.filter((event) => event.positive === positive);
  return pick(candidates, random);
}

export function pickBusinessMarketEvent(random = Math.random) {
  return pick(businessMarketEvents, random);
}

export function resolveBusinessRiskEvent(state, event, businessId, eventId) {
  return applyBusinessRiskEvent(state, event, businessId, eventId);
}

export function resolveBusinessMarketEvent(state, event, eventId) {
  return applyBusinessMarketEvent(state, event, eventId);
}

function pick(list, random) {
  return list[Math.floor(random() * list.length)] || list[0];
}
