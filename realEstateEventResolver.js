import { realEstateMarketEvents, propertyHoldingEvents } from "./realEstateData.js";
import { applyHoldingEvent, applyMarketEventToProperties } from "./realEstateCalculator.js";

export function pickRealEstateMarketEvent(random = Math.random) {
  return pick(realEstateMarketEvents, random);
}

export function pickPropertyHoldingEvent(state, random = Math.random) {
  if (!state?.ownedProperties?.length) return null;
  return pick(propertyHoldingEvents, random);
}

export function resolveRealEstateMarketEvent(state, event) {
  return applyMarketEventToProperties(state, event);
}

export function resolvePropertyHoldingEvent(state, event, propertyId) {
  return applyHoldingEvent(state, event, propertyId);
}

function pick(list, random) {
  return list[Math.floor(random() * list.length)] || list[0];
}
