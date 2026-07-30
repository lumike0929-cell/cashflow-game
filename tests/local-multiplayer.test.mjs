import assert from "node:assert/strict";
import test from "node:test";
import {
  advanceLocalTurn,
  applyPlayerSnapshotToState,
  calculateLocalLeaderboard,
  careerStrategyProfiles,
  configureLocalMultiplayer,
  currentLocalPlayer,
  evaluateLocalVictory,
  isLocalMultiplayer,
  localGameModes,
  localVictoryConditions,
  markLocalTurnPendingSwitch,
  migrateLocalMultiplayerState,
  normalizeLocalSetup,
  playerColors,
  saveActivePlayerSnapshot,
  snapshotFromState,
} from "../localMultiplayerSystem.js";

function makeSnapshot(careerId, cash, monthlyCashflow, position = 0) {
  return {
    career: { id: careerId, icon: careerId.slice(0, 1), name: careerId, salary: monthlyCashflow + 10000, expenses: 10000, savings: cash },
    month: 1,
    round: 1,
    position,
    cash,
    salary: monthlyCashflow + 10000,
    baseExpenses: 10000,
    assets: [],
    liabilities: [],
    ownedProperties: [],
    stockHoldings: [],
    businessHoldings: [],
    insurancePolicies: [],
    logs: [],
  };
}

function metricsFor(snapshot) {
  const passiveIncome = (snapshot.ownedProperties?.length || 0) * 400 + (snapshot.businessHoldings?.length || 0) * 650;
  const expenses = Number(snapshot.baseExpenses || 1);
  return {
    cash: Number(snapshot.cash || 0),
    monthlyCashflow: Number(snapshot.salary || 0) - expenses + passiveIncome,
    passiveIncome,
    expenses,
    netWorth: Number(snapshot.cash || 0) + passiveIncome * 20,
    freedomPercent: Math.round((passiveIncome / Math.max(1, expenses)) * 100),
    round: Number(snapshot.round || 1),
  };
}

test("local setup supports 1-4 players and clamps invalid input", () => {
  assert.equal(normalizeLocalSetup({ playerCount: 0 }).playerCount, 1);
  assert.equal(normalizeLocalSetup({ playerCount: 9 }).playerCount, 4);
  const setup = normalizeLocalSetup({
    playerCount: 4,
    mode: "party",
    victoryCondition: "roundLimit",
    players: [
      { name: "Ada", careerId: "teacher", color: playerColors[0] },
      { name: "Ben", careerId: "engineer", color: playerColors[1] },
      { name: "Cy", careerId: "designer", color: playerColors[2] },
      { name: "Dee", careerId: "entrepreneur", color: playerColors[3] },
    ],
  });
  assert.equal(setup.playerCount, 4);
  assert.deepEqual(setup.players.map((player) => player.careerId), ["teacher", "engineer", "designer", "entrepreneur"]);
  assert.equal(setup.mode, "party");
  assert.equal(setup.victoryCondition, "roundLimit");
});

test("four Sprint 27 careers have distinct strategy profiles", () => {
  const ids = ["teacher", "engineer", "designer", "entrepreneur"];
  const signatures = new Set(ids.map((id) => JSON.stringify({
    riskTolerance: careerStrategyProfiles[id].riskTolerance,
    business: careerStrategyProfiles[id].business,
    property: careerStrategyProfiles[id].property,
    stock: careerStrategyProfiles[id].stock,
    reserveMonths: careerStrategyProfiles[id].reserveMonths,
  })));
  assert.equal(signatures.size, 4);
  assert.ok(careerStrategyProfiles.teacher.learning > careerStrategyProfiles.entrepreneur.learning);
  assert.ok(careerStrategyProfiles.engineer.stock > careerStrategyProfiles.teacher.stock);
  assert.ok(careerStrategyProfiles.entrepreneur.business > careerStrategyProfiles.designer.business);
});

test("multiplayer players keep independent financial snapshots", () => {
  const setup = normalizeLocalSetup({ playerCount: 3 });
  const state = {
    cash: 100,
    salary: 10000,
    baseExpenses: 8000,
    career: { id: "teacher" },
    month: 1,
    round: 1,
    position: 0,
  };
  configureLocalMultiplayer(state, setup, {
    "player-1": makeSnapshot("teacher", 12000, 3500, 0),
    "player-2": makeSnapshot("engineer", 42000, 9000, 4),
    "player-3": makeSnapshot("designer", 18000, 4500, 8),
  });
  assert.equal(isLocalMultiplayer(state), true);
  applyPlayerSnapshotToState(state, state.localPlayers[0]);
  state.cash += 777;
  saveActivePlayerSnapshot(state);
  assert.equal(state.localPlayers[0].snapshot.cash, 12777);
  assert.equal(state.localPlayers[1].snapshot.cash, 42000);
  state.localPlayers[0].snapshot.assets = [{ id: "owned-by-1" }];
  assert.deepEqual(state.localPlayers[1].snapshot.assets || [], []);
});

test("local turn order cycles and applies each player's state", () => {
  const setup = normalizeLocalSetup({ playerCount: 4 });
  const state = {};
  configureLocalMultiplayer(state, setup, {
    "player-1": makeSnapshot("teacher", 10000, 3000, 0),
    "player-2": makeSnapshot("engineer", 20000, 6000, 3),
    "player-3": makeSnapshot("designer", 30000, 5000, 7),
    "player-4": makeSnapshot("entrepreneur", 40000, 3500, 11),
  });
  applyPlayerSnapshotToState(state, state.localPlayers[0]);
  const visited = [];
  for (let index = 0; index < 5; index += 1) {
    visited.push(currentLocalPlayer(state).playerId);
    markLocalTurnPendingSwitch(state);
    const result = advanceLocalTurn(state);
    assert.ok(result.from.playerId);
    assert.equal(state.localMultiplayer.pendingTurnSwitch, false);
  }
  assert.deepEqual(visited, ["player-1", "player-2", "player-3", "player-4", "player-1"]);
  assert.equal(state.currentPlayerId, "player-2");
  assert.equal(state.position, 3);
  assert.equal(state.cash, 20000);
});

test("leaderboard uses real snapshot metrics with stable tie sorting", () => {
  const setup = normalizeLocalSetup({ playerCount: 3 });
  const state = {};
  configureLocalMultiplayer(state, setup, {
    "player-1": { ...makeSnapshot("teacher", 20000, 3000, 0), ownedProperties: [{ id: "home-a" }] },
    "player-2": { ...makeSnapshot("engineer", 50000, 3000, 0), businessHoldings: [{ id: "biz-a" }] },
    "player-3": makeSnapshot("designer", 16000, 3000, 0),
  });
  applyPlayerSnapshotToState(state, state.localPlayers[0]);
  const ranking = calculateLocalLeaderboard(state, metricsFor);
  assert.deepEqual(ranking.map((item) => item.rank), [1, 2, 3]);
  assert.equal(ranking[0].playerId, "player-2");
  assert.equal(ranking[2].playerId, "player-3");
});

test("old single-player save migrates into a safe one-player structure", () => {
  const state = migrateLocalMultiplayerState({
    career: { id: "designer", icon: "设", name: "自由设计师" },
    month: 4,
    round: 7,
    position: 9,
    cash: 24680,
    salary: 26000,
    baseExpenses: 19000,
    ownedProperties: [{ id: "legacy-home" }],
    stockHoldings: [{ stockId: "mock-stock", shares: 10 }],
    businessHoldings: [],
    liabilities: [],
  });
  assert.equal(state.localMultiplayer.enabled, false);
  assert.equal(state.localPlayers.length, 1);
  assert.equal(state.localPlayers[0].careerId, "designer");
  assert.equal(state.localPlayers[0].snapshot.cash, 24680);
  assert.equal(state.localPlayers[0].snapshot.ownedProperties.length, 1);
});

test("local victory conditions trigger once", () => {
  const setup = normalizeLocalSetup({ playerCount: 2, victoryCondition: "netWorth" });
  const state = {};
  configureLocalMultiplayer(state, setup, {
    "player-1": makeSnapshot("teacher", 350000, 3000, 0),
    "player-2": makeSnapshot("engineer", 10000, 9000, 4),
  });
  applyPlayerSnapshotToState(state, state.localPlayers[0]);
  const ranking = calculateLocalLeaderboard(state, metricsFor);
  const first = evaluateLocalVictory(state, ranking);
  assert.equal(first.winner.playerId, "player-1");
  assert.equal(first.condition.id, "netWorth");
  assert.equal(evaluateLocalVictory(state, ranking), null);
  assert.equal(localGameModes.length, 3);
  assert.equal(localVictoryConditions.length, 3);
});

test("snapshot cloning avoids shared arrays across turns", () => {
  const state = {
    career: { id: "teacher" },
    month: 1,
    round: 1,
    position: 0,
    cash: 10000,
    salary: 18000,
    baseExpenses: 14500,
    assets: [{ id: "a" }],
    liabilities: [],
  };
  const snapshot = snapshotFromState(state);
  snapshot.assets.push({ id: "b" });
  assert.equal(state.assets.length, 1);
  assert.equal(snapshot.assets.length, 2);
});
