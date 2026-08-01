import assert from "node:assert/strict";
import test from "node:test";
import {
  addCityUpgrade,
  earlyPacePlan,
  estimateOptionImpact,
  funStats,
  funText,
  advanceFunEventChain,
  buildComebackOpportunity,
  buildTurnFunSummary,
  comboDefinitions,
  competitionEventDefinitions,
  educationFeedbackDefinitions,
  eventChainDefinitions,
  luckyCrisisDefinitions,
  markPacedTurnDone,
  migrateFunState,
  miniGameDefinitions,
  recordFunOutcome,
  roleSpecificEventDefinitions,
  selectEventChainStage,
  selectLuckyCrisisEvent,
  selectPacedEngagement,
  selectRoleSpecificEvent,
  simulateFirstFifteenFunTurns,
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

test("Sprint 27 provides at least 16 strategy events across required categories", () => {
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
    "assetSale",
    "reserve",
    "spending",
  ].forEach((category) => assert.ok(categories.has(category), `missing ${category}`));
  assert.ok(strategyEventDefinitions.length >= 16);
});

test("strategy events contain real option differences", () => {
  strategyEventDefinitions.forEach((event) => {
    assert.ok(event.options.length >= 2, event.id);
    const signatures = new Set(event.options.map((choice) => JSON.stringify(estimateOptionImpact(choice))));
    assert.ok(signatures.size > 1, `${event.id} options should not resolve to the same impact`);
    assert.ok(event.options.some((choice) => ["low", "medium", "high"].includes(choice.risk)), `${event.id} needs risk labels`);
  });
});

test("six Sprint 28 lightweight mini game categories are available and have correct choices", () => {
  assert.ok(miniGameDefinitions.length >= 6);
  ["budget", "spotting", "business", "property", "bank", "market"].forEach((category) => {
    assert.ok(miniGameDefinitions.some((game) => game.category === category), `missing ${category}`);
  });
  miniGameDefinitions.forEach((game) => {
    assert.ok(game.choices.length >= 3, game.id);
    assert.ok(game.choices.some((choice) => choice.correct), `${game.id} should have at least one correct choice`);
    assert.ok(funText(game.title, "en") && !/[\u3400-\u9fff]/.test(funText(game.title, "en")));
  });
});

test("early pacing plan covers first 15 turns with strategy, role, chain, minigame, competition, ai, and summary", () => {
  assert.deepEqual(earlyPacePlan.map((slot) => slot.turn), [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]);
  assert.ok(earlyPacePlan.filter((slot) => slot.kind === "strategy").length >= 3);
  assert.ok(earlyPacePlan.filter((slot) => slot.kind === "minigame").length >= 3);
  assert.ok(earlyPacePlan.some((slot) => slot.kind === "roleEvent"));
  assert.ok(earlyPacePlan.some((slot) => slot.kind === "eventChain"));
  assert.ok(earlyPacePlan.some((slot) => slot.kind === "competition"));
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

test("Sprint 28 has 24 role-specific events with distinct role flavor", () => {
  assert.equal(roleSpecificEventDefinitions.length, 24);
  ["teacher", "engineer", "designer", "entrepreneur"].forEach((roleId) => {
    const events = roleSpecificEventDefinitions.filter((event) => event.roleId === roleId);
    assert.equal(events.length, 6, roleId);
    const categories = new Set(events.map((event) => event.category));
    assert.ok(categories.size >= 4, `${roleId} should cover varied categories`);
    events.forEach((event) => {
      assert.ok(event.options.length >= 2, event.id);
      assert.ok(funText(event.title, "en") && !/[\u3400-\u9fff]/.test(funText(event.title, "en")));
      const impacts = new Set(event.options.map((choice) => JSON.stringify(choice.effects)));
      assert.ok(impacts.size > 1, `${event.id} needs different effects`);
    });
  });
  const teacher = selectRoleSpecificEvent(migrateFunState({ career: { id: "teacher" }, round: 3, position: 0 }), () => 0.1);
  const engineer = selectRoleSpecificEvent(migrateFunState({ career: { id: "engineer" }, round: 3, position: 0 }), () => 0.1);
  assert.notEqual(teacher.roleId, engineer.roleId);
});

test("eight event chains can advance, persist, abandon, and complete independently", () => {
  assert.equal(eventChainDefinitions.length, 8);
  const state = migrateFunState({ round: 8, position: 3, currentPlayerId: "player-1" });
  const first = selectEventChainStage(state, () => 0);
  assert.ok(first.chainId);
  let result = advanceFunEventChain(state, first.chainId, "steady");
  assert.equal(result.stageIndex, 1);
  const restored = migrateFunState(JSON.parse(JSON.stringify(state)));
  assert.equal(restored.funEventChains.find((chain) => chain.chainId === first.chainId).stageIndex, 1);
  for (let index = 0; index < 4; index += 1) result = advanceFunEventChain(restored, first.chainId, "bold");
  assert.equal(result.completed, true);
  const second = migrateFunState({ currentPlayerId: "player-2" });
  const chain = selectEventChainStage(second, () => 0.2);
  advanceFunEventChain(second, chain.chainId, "pass");
  assert.equal(second.funEventChains.find((item) => item.chainId === chain.chainId).abandoned, true);
});

test("lucky and crisis events are bounded for early players", () => {
  assert.ok(luckyCrisisDefinitions.filter((event) => event.mood === "lucky").length >= 4);
  assert.ok(luckyCrisisDefinitions.filter((event) => event.mood === "crisis").length >= 4);
  const state = migrateFunState({ round: 3, recentFunEvents: [
    { id: "a", isCrisis: true, round: 1 },
    { id: "b", isCrisis: true, round: 2 },
  ] });
  const event = selectLuckyCrisisEvent(state, { mood: "crisis" }, () => 0);
  assert.ok(event.mood !== "crisis" || event.softCrisis, "new players should avoid a third harsh crisis");
});

test("competition, combos, milestones, comeback and turn summary are rule based", () => {
  assert.ok(competitionEventDefinitions.length >= 4);
  competitionEventDefinitions.forEach((event) => {
    assert.equal(event.competition, true);
    assert.ok(event.options.some((choice) => choice.id === "pass"));
  });
  assert.ok(comboDefinitions.length >= 3);
  assert.ok(educationFeedbackDefinitions.length >= 6);
  const state = makeState();
  state.ownedProperties = [{ id: "p1" }];
  state.businessHoldings = [{ id: "b1" }];
  const first = recordFunOutcome(state, { kind: "strategy", id: "s1", success: true });
  const second = recordFunOutcome(state, { kind: "strategy", id: "s2", success: true, rank: 1 });
  assert.ok(first.milestones.some((item) => item.id === "first-asset"));
  assert.ok(second.comboReward, "second successful choice should unlock a combo");
  const noDuplicate = recordFunOutcome(state, { kind: "strategy", id: "s3", success: true, rank: 1 });
  assert.equal(noDuplicate.milestones.filter((item) => item.id === "first-rank-one").length, 0);
  const comeback = buildComebackOpportunity({ currentPlayerId: "p2" }, [
    { playerId: "p1", freedomPercent: 80, netWorth: 200000 },
    { playerId: "p2", freedomPercent: 20, netWorth: 40000 },
  ]);
  assert.ok(comeback);
  const summary = buildTurnFunSummary(state, { cash: 1000, monthlyCashflow: 100, rank: 2 }, { cash: 1400, monthlyCashflow: 250, rank: 1, assets: 2 });
  assert.equal(summary.cashDelta, 400);
  assert.equal(summary.rankDelta, 1);
});

test("first 15-turn simulation includes replay hooks without locking pacing", () => {
  const { state, kinds, stats } = simulateFirstFifteenFunTurns("designer", () => 0.23);
  assert.ok(kinds.includes("strategy"));
  assert.ok(kinds.includes("minigame"));
  assert.ok(kinds.includes("ai"));
  assert.ok(stats.strategyChoices >= 5);
  assert.ok(stats.miniGames >= 3);
  assert.ok(stats.aiInteractions >= 1);
  assert.ok(stats.firstFifteenComplete);
  assert.ok(state.funPacing.earlyPaceDone.length >= 15);
});

test("new Sprint 28 English fun text has no CJK characters", () => {
  const scanText = (value, path) => {
    if (!value) return;
    if (typeof value === "string") {
      assert.equal(/[\u3400-\u9fff]/.test(value), false, `${path}: ${value}`);
      return;
    }
    if (Array.isArray(value)) value.forEach((item, index) => scanText(item, `${path}[${index}]`));
    if (typeof value === "object") {
      if ("en" in value) scanText(value.en, `${path}.en`);
      else Object.entries(value).forEach(([key, item]) => scanText(item, `${path}.${key}`));
    }
  };
  [
    roleSpecificEventDefinitions,
    eventChainDefinitions,
    luckyCrisisDefinitions,
    competitionEventDefinitions,
    miniGameDefinitions,
    comboDefinitions,
    educationFeedbackDefinitions,
  ].forEach((collection, index) => scanText(collection, `collection-${index}`));
});
