export const economyStates = {
  expansion: {
    id: "expansion",
    label: "扩张",
    description: "工作和加薪机会较好，但价格也可能偏热。",
    unemploymentModifier: -0.05,
    raiseModifier: 0.08,
  },
  stable: {
    id: "stable",
    label: "稳定",
    description: "市场和工作机会都比较平稳。",
    unemploymentModifier: 0,
    raiseModifier: 0,
  },
  slowdown: {
    id: "slowdown",
    label: "放缓",
    description: "消费和招聘变谨慎，要注意现金安全垫。",
    unemploymentModifier: 0.06,
    raiseModifier: -0.04,
  },
  recession: {
    id: "recession",
    label: "衰退",
    description: "失业风险较高，投资和生意需求可能承压。",
    unemploymentModifier: 0.12,
    raiseModifier: -0.08,
  },
  recovery: {
    id: "recovery",
    label: "复苏",
    description: "情况开始改善，但仍要谨慎管理现金。",
    unemploymentModifier: 0.02,
    raiseModifier: 0.04,
  },
};

const cycleOrder = ["stable", "expansion", "slowdown", "recession", "recovery"];

export function ensureEconomyState(state) {
  if (!state.economy || typeof state.economy !== "object") state.economy = {};
  const current = economyStates[state.economy.status] ? state.economy.status : "stable";
  state.economy = {
    status: current,
    monthsRemaining: Math.max(1, Math.round(Number(state.economy.monthsRemaining) || 3)),
    lastChangeMonth: Math.max(0, Math.round(Number(state.economy.lastChangeMonth) || 0)),
  };
}

export function getEconomyProfile(state) {
  ensureEconomyState(state);
  return economyStates[state.economy.status];
}

export function advanceEconomyCycle(state) {
  ensureEconomyState(state);
  state.economy.monthsRemaining -= 1;
  if (state.economy.monthsRemaining > 0) return { changed: false, profile: getEconomyProfile(state) };
  const index = cycleOrder.indexOf(state.economy.status);
  const next = cycleOrder[(index + 1 + cycleOrder.length) % cycleOrder.length];
  state.economy.status = next;
  state.economy.monthsRemaining = next === "recession" ? 2 : 3;
  state.economy.lastChangeMonth = state.month || 1;
  return { changed: true, profile: getEconomyProfile(state) };
}
