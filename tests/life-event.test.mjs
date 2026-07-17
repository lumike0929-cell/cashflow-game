import test from "node:test";
import assert from "node:assert/strict";
import { advanceEconomyCycle, getEconomyProfile } from "../economyCycleEngine.js";
import { lifeEvents } from "../lifeEventData.js";
import {
  applyLifeEvent,
  calculateEmergencyFundStatus,
  settleLifeEffectsMonth,
} from "../lifeEventCalculator.js";
import { migrateSavedState } from "../realEstateStorageMigration.js";

function makeState(cash = 50000) {
  return migrateSavedState({
    career: { id: "event", name: "事件测试员" },
    month: 1,
    round: 1,
    position: 0,
    cash,
    salary: 32000,
    baseExpenses: 16000,
    assets: [],
    liabilities: [],
    logs: [],
  });
}

test("加薪与升职正确更新收入和工作状态", () => {
  const state = makeState();
  const raise = lifeEvents.find((item) => item.id === "performance-raise");
  const promotion = lifeEvents.find((item) => item.id === "promotion");
  applyLifeEvent(state, raise, "accept", "raise-1");
  applyLifeEvent(state, promotion, "accept", "promotion-1");
  assert.equal(state.salary, 38000);
  assert.equal(state.job.jobLevel, 2);
  assert.ok(state.baseExpenses > 16000);
});

test("家庭持续支出能保存并逐月结束", () => {
  const state = makeState();
  const family = lifeEvents.find((item) => item.id === "child-education");
  const result = applyLifeEvent(state, family, "basic", "family-1");
  assert.equal(result.ok, true);
  assert.equal(state.lifeActiveEffects.length, 1);
  const restored = migrateSavedState(JSON.parse(JSON.stringify(state)));
  assert.equal(restored.lifeActiveEffects.length, 1);
  for (let index = 0; index < family.durationMonths; index += 1) settleLifeEffectsMonth(restored);
  assert.equal(restored.lifeActiveEffects.length, 0);
});

test("景气变化不产生异常数值", () => {
  const state = makeState();
  for (let index = 0; index < 10; index += 1) {
    advanceEconomyCycle(state);
    const profile = getEconomyProfile(state);
    assert.ok(profile.label.length > 0);
    assert.ok(Number.isFinite(profile.unemploymentModifier));
  }
});

test("紧急预备金提示可计算，旧存档安全迁移", () => {
  const state = migrateSavedState({
    career: { id: "old", name: "旧职业" },
    month: 2,
    cash: 5000,
    salary: 20000,
    baseExpenses: 12000,
    assets: [],
    liabilities: [],
  });
  const emergency = calculateEmergencyFundStatus(state, 12000);
  assert.equal(emergency.status, "高度警告");
  assert.equal(Array.isArray(state.lifeEventHistory), true);
  assert.equal(Array.isArray(state.insurancePolicies), true);
  assert.equal(typeof state.unemployment, "object");
  assert.equal(typeof state.tax, "object");
});
