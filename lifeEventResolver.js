import { lifeEvents } from "./lifeEventData.js";
import { getEconomyProfile } from "./economyCycleEngine.js";

export function pickLifeEvent(state, type = "", random = Math.random) {
  const economy = getEconomyProfile(state);
  const list = lifeEvents.filter((event) => !type || event.type === type || event.category === type);
  const source = list.length ? list : lifeEvents;
  const weighted = source.map((event) => {
    let probability = event.probability || 0.2;
    if (event.type === "unemployment") probability += economy.unemploymentModifier;
    if (event.type === "promotion" || event.type === "salaryRaise" || event.type === "bonus") probability += economy.raiseModifier;
    return { event, probability: Math.max(0.03, probability) };
  });
  const total = weighted.reduce((sum, item) => sum + item.probability, 0);
  let cursor = random() * total;
  for (const item of weighted) {
    cursor -= item.probability;
    if (cursor <= 0) return item.event;
  }
  return weighted[0]?.event || lifeEvents[0];
}
