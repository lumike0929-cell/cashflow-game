import test from "node:test";
import assert from "node:assert/strict";
import {
  boardPath,
  cameraForTile,
  clampCamera,
  diceMarkup,
  indexAfter,
  loadExperienceSettings,
  mapSize,
  nextIndices,
  tileVisual,
} from "../gameExperience.js";

test("城市棋盘维持 40 格循环，经过末尾会回到第 1 格", () => {
  assert.equal(boardPath.length, 40);
  assert.equal(indexAfter(38, 1, 40), 39);
  assert.equal(indexAfter(39, 1, 40), 0);
  assert.equal(indexAfter(37, 5, 40), 2);
  assert.deepEqual(nextIndices(38, 4, 40), [39, 0, 1, 2]);
});

test("角色路径不穿越中央城市核心区域", () => {
  const central = { left: 380, right: 1300, top: 330, bottom: 790 };
  const inside = boardPath.filter((point) => point.x > central.left && point.x < central.right && point.y > central.top && point.y < central.bottom);
  assert.equal(inside.length, 0);
  assert.ok(mapSize.width >= 1600);
  assert.ok(mapSize.height >= 1000);
});

test("骰子显示正确点数，格子视觉类别可取得", () => {
  for (let value = 1; value <= 6; value += 1) {
    const markup = diceMarkup(value, false);
    const activeDots = markup.match(/class="active"/g)?.length || 0;
    assert.equal(activeDots, value);
  }
  assert.equal(tileVisual("payday").category, "薪水日");
  assert.equal(tileVisual("insurance").category, "保险");
});

test("镜头可缩放、拖曳并回到玩家，偏好可恢复", () => {
  const camera = clampCamera({ x: -9999, y: 9999, scale: 2, follow: false }, 390, 620);
  assert.equal(camera.scale, 1.45);
  assert.equal(camera.follow, false);
  const focused = cameraForTile(5, 390, 620, 0.9);
  assert.equal(focused.follow, true);
  assert.ok(Number.isFinite(focused.x));
  assert.ok(Number.isFinite(focused.y));
  const fakeStorage = {
    getItem: () => JSON.stringify({ muted: true, volume: 0.3, camera: { x: -20, y: -30, scale: 0.8, follow: false } }),
  };
  const settings = loadExperienceSettings(fakeStorage);
  assert.equal(settings.muted, true);
  assert.equal(settings.volume, 0.3);
  assert.equal(settings.camera.scale, 0.8);
});
