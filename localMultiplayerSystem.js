export const LOCAL_MULTIPLAYER_VERSION = 1;

export const playerColors = ["#f97316", "#2563eb", "#16a34a", "#c026d3"];

export const localGameModes = [
  {
    id: "teaching",
    title: { zhCN: "教学模式", zhTW: "教學模式", en: "Teaching Mode" },
    description: {
      zhCN: "解释更多、风险较低，适合第一次一起玩。",
      zhTW: "解釋更多、風險較低，適合第一次一起玩。",
      en: "More guidance and lower risk, good for a first shared game.",
    },
    riskScale: 0.82,
    pace: "guided",
  },
  {
    id: "standard",
    title: { zhCN: "标准模式", zhTW: "標準模式", en: "Standard Mode" },
    description: {
      zhCN: "正常事件节奏，目标是让被动收入覆盖支出。",
      zhTW: "正常事件節奏，目標是讓被動收入覆蓋支出。",
      en: "Normal pacing. Aim to cover expenses with passive income.",
    },
    riskScale: 1,
    pace: "normal",
  },
  {
    id: "party",
    title: { zhCN: "派对模式", zhTW: "派對模式", en: "Party Mode" },
    description: {
      zhCN: "回合更快、惊喜更多，排行榜变化更明显。",
      zhTW: "回合更快、驚喜更多，排行榜變化更明顯。",
      en: "Faster turns, more surprises, and livelier leaderboard changes.",
    },
    riskScale: 1.14,
    pace: "fast",
  },
];

export const localVictoryConditions = [
  {
    id: "financialFreedom",
    title: { zhCN: "财务自由", zhTW: "財務自由", en: "Financial Freedom" },
    description: {
      zhCN: "任一玩家的被动收入达到每月必要支出。",
      zhTW: "任一玩家的被動收入達到每月必要支出。",
      en: "A player reaches passive income equal to monthly essential expenses.",
    },
  },
  {
    id: "netWorth",
    title: { zhCN: "资产目标", zhTW: "資產目標", en: "Net Worth Goal" },
    description: {
      zhCN: "先达到指定净资产的玩家获胜。",
      zhTW: "先達到指定淨資產的玩家獲勝。",
      en: "First player to reach the net worth target wins.",
    },
    target: 300000,
  },
  {
    id: "roundLimit",
    title: { zhCN: "限定回合排名", zhTW: "限定回合排名", en: "Round-Limit Ranking" },
    description: {
      zhCN: "到达回合上限时，用排行榜决定胜者。",
      zhTW: "到達回合上限時，用排行榜決定勝者。",
      en: "At the round limit, the leaderboard decides the winner.",
    },
    roundLimit: 20,
  },
];

export const careerStrategyProfiles = {
  teacher: {
    riskTolerance: 0.32,
    learning: 1.18,
    business: 0.82,
    property: 1.05,
    stock: 0.86,
    reserveMonths: 4,
    tags: {
      zhCN: ["稳健", "学习快", "安全垫"],
      zhTW: ["穩健", "學習快", "安全墊"],
      en: ["Steady", "Learns Fast", "Cash Cushion"],
    },
  },
  engineer: {
    riskTolerance: 0.58,
    learning: 1.08,
    business: 0.92,
    property: 0.95,
    stock: 1.22,
    reserveMonths: 3,
    tags: {
      zhCN: ["高收入", "股票倾向", "技能成长"],
      zhTW: ["高收入", "股票傾向", "技能成長"],
      en: ["High Income", "Stock Lean", "Skill Growth"],
    },
  },
  designer: {
    riskTolerance: 0.64,
    learning: 1,
    business: 1.16,
    property: 0.86,
    stock: 0.98,
    reserveMonths: 3.5,
    tags: {
      zhCN: ["机会型", "创意收入", "波动"],
      zhTW: ["機會型", "創意收入", "波動"],
      en: ["Opportunity", "Creative Income", "Volatile"],
    },
  },
  entrepreneur: {
    riskTolerance: 0.7,
    learning: 0.96,
    business: 1.32,
    property: 0.82,
    stock: 0.88,
    reserveMonths: 4.5,
    tags: {
      zhCN: ["创业潜力", "高压力", "现金储备"],
      zhTW: ["創業潛力", "高壓力", "現金儲備"],
      en: ["Business Upside", "High Pressure", "Cash Reserve"],
    },
  },
  doctor: {
    riskTolerance: 0.46,
    learning: 1,
    business: 0.9,
    property: 1.08,
    stock: 0.98,
    reserveMonths: 4,
    tags: {
      zhCN: ["高收入", "高支出", "控负债"],
      zhTW: ["高收入", "高支出", "控負債"],
      en: ["High Income", "High Expenses", "Debt Control"],
    },
  },
};

export function localText(value, locale = "zh-CN") {
  if (!value || typeof value !== "object") return String(value ?? "");
  if (locale === "zh-TW") return value.zhTW || value.zhCN || value.en || "";
  if (locale === "en") return value.en || value.zhCN || value.zhTW || "";
  return value.zhCN || value.zhTW || value.en || "";
}

export function normalizeLocalSetup(input = {}) {
  const count = Math.max(1, Math.min(4, Math.round(Number(input.playerCount || 1))));
  const mode = localGameModes.some((item) => item.id === input.mode) ? input.mode : "standard";
  const victoryCondition = localVictoryConditions.some((item) => item.id === input.victoryCondition) ? input.victoryCondition : "financialFreedom";
  const players = Array.from({ length: count }, (_, index) => {
    const saved = Array.isArray(input.players) ? input.players[index] || {} : {};
    return {
      playerId: saved.playerId || `player-${index + 1}`,
      name: safeName(saved.name, index),
      careerId: normalizeCareerId(saved.careerId, index),
      color: normalizeColor(saved.color, index),
    };
  });
  return { playerCount: count, mode, victoryCondition, players };
}

export function configureLocalMultiplayer(state, setup, snapshotsByPlayerId = {}) {
  const normalized = normalizeLocalSetup(setup);
  state.localMultiplayerVersion = LOCAL_MULTIPLAYER_VERSION;
  state.localMultiplayer = {
    enabled: normalized.playerCount > 1,
    playerCount: normalized.playerCount,
    mode: normalized.mode,
    victoryCondition: normalized.victoryCondition,
    currentPlayerIndex: 0,
    pendingTurnSwitch: false,
    winnerId: null,
    victoryTriggered: false,
    turnHistory: [],
    lastRanking: [],
  };
  state.localPlayers = normalized.players.map((player, index) => ({
    ...player,
    order: index + 1,
    strategyProfile: careerStrategyProfiles[player.careerId] || careerStrategyProfiles.teacher,
    snapshot: sanitizePlayerSnapshot(snapshotsByPlayerId[player.playerId] || {}),
  }));
  return state;
}

export function migrateLocalMultiplayerState(state) {
  if (!state || typeof state !== "object") return state;
  state.localMultiplayerVersion = LOCAL_MULTIPLAYER_VERSION;
  const saved = state.localMultiplayer && typeof state.localMultiplayer === "object" ? state.localMultiplayer : {};
  const enabled = Boolean(saved.enabled);
  const playerCount = enabled ? Math.max(2, Math.min(4, Math.round(Number(saved.playerCount || 2)))) : 1;
  state.localMultiplayer = {
    enabled,
    playerCount,
    mode: localGameModes.some((item) => item.id === saved.mode) ? saved.mode : "standard",
    victoryCondition: localVictoryConditions.some((item) => item.id === saved.victoryCondition) ? saved.victoryCondition : "financialFreedom",
    currentPlayerIndex: Math.max(0, Math.min(playerCount - 1, Math.round(Number(saved.currentPlayerIndex || 0)))),
    pendingTurnSwitch: Boolean(saved.pendingTurnSwitch),
    winnerId: saved.winnerId || null,
    victoryTriggered: Boolean(saved.victoryTriggered),
    turnHistory: Array.isArray(saved.turnHistory) ? saved.turnHistory.slice(-40) : [],
    lastRanking: Array.isArray(saved.lastRanking) ? saved.lastRanking.slice(0, 4) : [],
  };
  const existingPlayers = Array.isArray(state.localPlayers) ? state.localPlayers : [];
  if (!existingPlayers.length) {
    state.localPlayers = [{
      playerId: "player-1",
      name: "Player 1",
      careerId: state.career?.id || "teacher",
      color: playerColors[0],
      order: 1,
      strategyProfile: careerStrategyProfiles[state.career?.id || "teacher"] || careerStrategyProfiles.teacher,
      snapshot: snapshotFromState(state),
    }];
  } else {
    state.localPlayers = existingPlayers.slice(0, playerCount).map((player, index) => ({
      playerId: player.playerId || `player-${index + 1}`,
      name: safeName(player.name, index),
      careerId: normalizeCareerId(player.careerId || player.career?.id, index),
      color: normalizeColor(player.color, index),
      order: index + 1,
      strategyProfile: careerStrategyProfiles[player.careerId || player.career?.id] || careerStrategyProfiles.teacher,
      snapshot: sanitizePlayerSnapshot(player.snapshot || {}),
    }));
  }
  return state;
}

export function isLocalMultiplayer(state) {
  return Boolean(state?.localMultiplayer?.enabled && Array.isArray(state.localPlayers) && state.localPlayers.length > 1);
}

export function currentLocalPlayer(state) {
  if (!state?.localPlayers?.length) return null;
  const index = Math.max(0, Math.min(state.localPlayers.length - 1, Math.round(Number(state.localMultiplayer?.currentPlayerIndex || 0))));
  return state.localPlayers[index] || state.localPlayers[0];
}

export function nextLocalPlayer(state) {
  if (!isLocalMultiplayer(state)) return null;
  const index = (Math.round(Number(state.localMultiplayer.currentPlayerIndex || 0)) + 1) % state.localPlayers.length;
  return state.localPlayers[index] || state.localPlayers[0];
}

export function snapshotFromState(state) {
  const snapshot = {};
  snapshotFields.forEach((field) => {
    snapshot[field] = cloneValue(state?.[field]);
  });
  return sanitizePlayerSnapshot(snapshot);
}

export function saveActivePlayerSnapshot(state) {
  const player = currentLocalPlayer(state);
  if (!player) return null;
  player.snapshot = snapshotFromState(state);
  player.careerId = state.career?.id || player.careerId;
  return player;
}

export function applyPlayerSnapshotToState(state, player) {
  if (!state || !player) return state;
  const snapshot = sanitizePlayerSnapshot(player.snapshot || {});
  snapshotFields.forEach((field) => {
    if (field in snapshot) state[field] = cloneValue(snapshot[field]);
  });
  state.career = snapshot.career || state.career;
  state.currentPlayerId = player.playerId;
  state.currentPlayerName = player.name;
  state.currentPlayerColor = player.color;
  return state;
}

export function advanceLocalTurn(state) {
  if (!isLocalMultiplayer(state)) return null;
  const from = currentLocalPlayer(state);
  saveActivePlayerSnapshot(state);
  state.localMultiplayer.currentPlayerIndex = (state.localMultiplayer.currentPlayerIndex + 1) % state.localPlayers.length;
  state.localMultiplayer.pendingTurnSwitch = false;
  const to = currentLocalPlayer(state);
  applyPlayerSnapshotToState(state, to);
  state.localMultiplayer.turnHistory = [{
    id: `local-turn-${Date.now()}-${from?.playerId || "player"}`,
    fromPlayerId: from?.playerId || null,
    toPlayerId: to?.playerId || null,
    round: Number(state.round || 1),
  }, ...state.localMultiplayer.turnHistory].slice(0, 40);
  return { from, to };
}

export function calculateLocalLeaderboard(state, metricsForSnapshot) {
  const players = Array.isArray(state?.localPlayers) ? state.localPlayers : [];
  return players.map((player, index) => {
    const snapshot = currentLocalPlayer(state)?.playerId === player.playerId ? snapshotFromState(state) : sanitizePlayerSnapshot(player.snapshot || {});
    const metrics = metricsForSnapshot(snapshot);
    return {
      rank: 0,
      playerId: player.playerId,
      name: player.name,
      color: player.color,
      careerId: player.careerId,
      order: index + 1,
      isCurrent: currentLocalPlayer(state)?.playerId === player.playerId,
      ...metrics,
    };
  }).sort((a, b) => {
    const score = b.freedomPercent - a.freedomPercent || b.netWorth - a.netWorth || b.monthlyCashflow - a.monthlyCashflow || a.order - b.order;
    return score;
  }).map((item, index) => ({ ...item, rank: index + 1 }));
}

export function markLocalTurnPendingSwitch(state) {
  if (isLocalMultiplayer(state)) state.localMultiplayer.pendingTurnSwitch = true;
}

export function evaluateLocalVictory(state, leaderboard = []) {
  if (!isLocalMultiplayer(state) || state.localMultiplayer.victoryTriggered) return null;
  const condition = localVictoryConditions.find((item) => item.id === state.localMultiplayer.victoryCondition) || localVictoryConditions[0];
  const leader = pickVictoryLeader(condition, leaderboard);
  if (!leader) return null;
  let won = false;
  if (condition.id === "financialFreedom") won = leader.freedomPercent >= 100;
  if (condition.id === "netWorth") won = leader.netWorth >= (condition.target || 300000);
  if (condition.id === "roundLimit") won = Math.max(...leaderboard.map((item) => item.round || 1)) >= (condition.roundLimit || 20);
  if (!won) return null;
  state.localMultiplayer.victoryTriggered = true;
  state.localMultiplayer.winnerId = leader.playerId;
  return { condition, winner: leader };
}

function pickVictoryLeader(condition, leaderboard) {
  if (!Array.isArray(leaderboard) || !leaderboard.length) return null;
  const sorted = [...leaderboard];
  if (condition.id === "netWorth") {
    return sorted.sort((a, b) => b.netWorth - a.netWorth || b.freedomPercent - a.freedomPercent || a.order - b.order)[0];
  }
  if (condition.id === "roundLimit") return leaderboard[0];
  return sorted.sort((a, b) => b.freedomPercent - a.freedomPercent || b.netWorth - a.netWorth || a.order - b.order)[0];
}

function sanitizePlayerSnapshot(snapshot) {
  const source = snapshot && typeof snapshot === "object" ? snapshot : {};
  const clean = {};
  snapshotFields.forEach((field) => {
    if (field in source) clean[field] = cloneValue(source[field]);
  });
  clean.round = Math.max(1, Math.round(Number(clean.round || 1)));
  clean.month = Math.max(1, Math.round(Number(clean.month || 1)));
  clean.position = Math.max(0, Math.round(Number(clean.position || 0)));
  clean.cash = safeMoney(clean.cash);
  clean.salary = safeMoney(clean.salary);
  clean.baseExpenses = safeMoney(clean.baseExpenses);
  clean.financialIq = Math.max(0, Math.round(Number(clean.financialIq || 0)));
  return clean;
}

const snapshotFields = [
  "career",
  "month",
  "round",
  "position",
  "cash",
  "salary",
  "baseExpenses",
  "assets",
  "liabilities",
  "ownedProperties",
  "propertyTransactions",
  "stockMarket",
  "stockHoldings",
  "stockTransactions",
  "stockMarketRecords",
  "settledStockEvents",
  "realizedStockGain",
  "businessHoldings",
  "businessTransactions",
  "businessMarketRecords",
  "settledBusinessEvents",
  "settledBusinessMonths",
  "bank",
  "bankTransactions",
  "settledBankEvents",
  "insurancePolicies",
  "insuranceTransactions",
  "insuranceClaims",
  "lifeEventHistory",
  "lifeActiveEffects",
  "settledLifeEvents",
  "unemployment",
  "tax",
  "economy",
  "job",
  "settledEvents",
  "emergencyDebt",
  "financialIq",
  "lastRoll",
  "logs",
  "funPacing",
  "shortTermFunGoals",
  "cityUpgrades",
];

function normalizeCareerId(id, index = 0) {
  const ids = ["teacher", "engineer", "designer", "entrepreneur"];
  return ids.includes(id) ? id : ids[index % ids.length];
}

function normalizeColor(color, index = 0) {
  return typeof color === "string" && /^#[0-9a-f]{6}$/i.test(color) ? color : playerColors[index % playerColors.length];
}

function safeName(name, index = 0) {
  const text = String(name || "").trim().slice(0, 16);
  return text || `Player ${index + 1}`;
}

function safeMoney(value) {
  const number = Math.round(Number(value || 0));
  return Number.isFinite(number) && !Object.is(number, -0) ? number : 0;
}

function cloneValue(value) {
  if (value === undefined) return undefined;
  return JSON.parse(JSON.stringify(value));
}
