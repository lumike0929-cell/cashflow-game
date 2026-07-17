import { stockMarketEvents } from "./stockData.js";
import { applyStockMarketEvent, updateStockPrices } from "./stockCalculator.js";

export function pickStockMarketEvent(random = Math.random) {
  return pick(stockMarketEvents, random);
}

export function resolveStockMarketEvent(state, event, random = Math.random) {
  return applyStockMarketEvent(state, event, random);
}

export function resolveStockPriceTick(state, reason = "股票市场自然波动", random = Math.random) {
  return updateStockPrices(state, reason, random);
}

function pick(list, random) {
  return list[Math.floor(random() * list.length)] || list[0];
}
