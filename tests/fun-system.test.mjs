import assert from "node:assert/strict";
import test from "node:test";
import {
  addCityUpgrade,
  earlyPacePlan,
  estimateOptionImpact,
  funStats,
  funText,
  markPacedTurnDone,
  migrateFunState,
  miniGameDefinitions,
  recordFunOutcome,
  selectPacedEngagement,
  strategyEventDefinitions,
} from "../funSystem.js";

function makeState() {
  return migrateFunState({
    round: 1,
    position: 0,
    cash: 12000,
    salary: 18000,
    baseExpenses: 14500,
    settledEvents: [],
  });
}

test("Sprint 26 provides 12 strategy events across required categories", () => {
  const categories = new Set(strategyEventDefinitions.map((event) => event.category));
  [
    "stock",
    "property",
    "business",
    "learn",
    "expense",
    "medical",
    "insurance",
    "market",
    "job",
    "life",
    "bank",
    "tax",
  ].forEach((category) => assert.ok(categories.has(category), `missing ${category}`));
  assert.equal(strategyEventDefinitions.length, 12);
});

test("strategy events contain real option differences", () => {
  strategyEventDefinitions.forEach((event) => {
    assert.ok(event.options.length >= 2, event.id);
    const signatures = new Set(event.options.map((choice) => JSON.stringify(estimateOptionImpact(choice))));
    assert.ok(signatures.size > 1, `${event.id} options should not resolve to the same impact`);
    assert.ok(event.options.some((choice) => ["low", "medium", "high"].includes(choice.risk)), `${event.id} needs risk labels`);
  });
});

test("three lightweight mini games are available and have correct choices", () => {
  assert.equal(miniGameDefinitions.length, 3);
  miniGameDefinitions.forEach((game) => {
    assert.ok(game.choices.length >= 3, game.id);
    assert.ok(game.choices.some((choice) => choice.correct), `${game.id} should have at least one correct choice`);
    assert.ok(funText(game.title, "en") && !/[\u3400-\u9fff]/.test(funText(game.title, "en")));
  });
});

test("early pacing plan covers first 10 turns with strategy, minigame, ai, and summary", () => {
  assert.deepEqual(earlyPacePlan.map((slot) => slot.turn), [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
  assert.ok(earlyPacePlan.filter((slot) => slot.kind === "strategy").length >= 3);
  assert.ok(earlyPacePlan.filter((slot) => slot.kind === "minigame").length >= 1);
  assert.ok(earlyPacePlan.some((slot) => slot.kind === "ai"));
});

test("paced engagement does not replay completed early turns", () => {
  const state = makeState();
  state.round = 2;
  const first = selectPacedEngagement(state, { type: "businessOpportunity" }, () => 0.1);
  assert.equal(first.kind, "strategy");
  markPacedTurnDone(state, first.turn);
  const replay = selectPacedEngagement(state, { type: "businessOpportunity" }, () => 0.1);
  assert.equal(replay, null);
});

test("fun outcomes unlock goals and city feedback without unbounded growth", () => {
  const state = makeState();
  recordFunOutcome(state, { kind: "strategy", id: "a", success: true });
  recordFunOutcome(state, { kind: "strategy", id: "b", success: true });
  recordFunOutcome(state, { kind: "strategy", id: "c", success: true });
  recordFunOutcome(state, { kind: "minigame", id: "budget-allocation", success: true });
  addCityUpgrade(state, { id: "city-a", icon: "★", label: { zhCN: "城市变化", zhTW: "城市變化", en: "City change" } });
  const stats = funStats(state);
  assert.equal(stats.strategyChoices, 3);
  assert.equal(stats.miniGames, 1);
  assert.equal(stats.cityUpgrades, 1);
  assert.ok(stats.goalCompletions >= 3);
  for (let index = 0; index < 12; index += 1) {
    addCityUpgrade(state, { id: `city-${index}`, icon: "★", label: { zhCN: "城市变化", zhTW: "城市變化", en: "City change" } });
  }
  assert.ok(state.cityUpgrades.length <= 8);
});
