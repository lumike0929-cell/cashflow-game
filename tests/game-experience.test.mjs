import test from "node:test";
import assert from "node:assert/strict";
import {
  boardPath,
  avatarMarkup,
  atmosphereForRound,
  beginnerMissionTemplates,
  cameraForTile,
  careerGuidance,
  clampCamera,
  contextTipMessages,
  createCitySceneSvg,
  createEnvironmentOverlay,
  diceMarkup,
  effectIconForKind,
  eventIllustrationMarkup,
  firstTenRoundTips,
  glossaryTerms,
  indexAfter,
  loadExperienceSettings,
  mapSize,
  miniMapPoint,
  nextIndices,
  onboardingPages,
  tileVisual,
  tutorialControllerSteps,
  tutorialSteps,
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
    assert.equal(markup.match(/class="dice-side dice-side-/g)?.length || 0, 6);
    assert.match(markup, new RegExp(`data-result="${value}"`));
    assert.match(markup, new RegExp(`dice-pop" aria-hidden="true">${value}`));
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
    getItem: () => JSON.stringify({
      muted: true,
      volume: 0.3,
      effectVolume: 0.4,
      musicVolume: 0.2,
      musicEnabled: false,
      hapticsEnabled: false,
      animationSpeed: "fast",
      atmosphere: "night",
      minimapCollapsed: true,
      onboardingCompleted: true,
      onboardingIndex: 2,
      tutorialSettings: {
        tutorialHints: false,
        childExplanations: true,
        decisionHints: false,
        glossaryTips: true,
      },
      tutorialComplete: true,
      seenTips: { firstStock: true },
      camera: { x: -20, y: -30, scale: 0.8, follow: false },
    }),
  };
  const settings = loadExperienceSettings(fakeStorage);
  assert.equal(settings.muted, true);
  assert.equal(settings.volume, 0.3);
  assert.equal(settings.effectVolume, 0.4);
  assert.equal(settings.musicVolume, 0.2);
  assert.equal(settings.musicEnabled, false);
  assert.equal(settings.hapticsEnabled, false);
  assert.equal(settings.animationSpeed, "fast");
  assert.equal(settings.atmosphere, "night");
  assert.equal(settings.minimapCollapsed, true);
  assert.equal(settings.onboardingCompleted, true);
  assert.equal(settings.onboardingIndex, 2);
  assert.equal(settings.tutorialSettings.tutorialHints, false);
  assert.equal(settings.tutorialSettings.decisionHints, false);
  assert.equal(settings.tutorialSettings.glossaryTips, true);
  assert.equal(settings.visualQuality, "standard");
  assert.equal(settings.tutorialComplete, true);
  assert.equal(settings.seenTips.firstStock, true);
  assert.equal(settings.camera.scale, 0.8);
});

test("角色表情、事件插画与教学提示资料齐全", () => {
  const career = { id: "engineer", icon: "工", name: "软件工程师" };
  for (const mood of ["neutral", "happy", "excited", "worried", "sad", "proud", "surprised", "thinking", "tired", "celebrating"]) {
    const markup = avatarMarkup(career, mood, "left");
    assert.match(markup, new RegExp(`mood-${mood}`));
    assert.match(markup, /facing-left/);
    assert.match(markup, /avatar-mouth/);
    assert.match(markup, /avatar-accessory/);
  }
  assert.ok(tutorialSteps.length >= 9);
  assert.equal(tutorialSteps[0].id, "goal");
  assert.ok(Object.keys(contextTipMessages).length >= 7);
  assert.match(eventIllustrationMarkup("股票机会"), /art-stock/);
  assert.match(eventIllustrationMarkup("保险理赔"), /art-insurance/);
});

test("城市地图包含商业手机游戏级核心地标", () => {
  const city = createCitySceneSvg();
  for (const label of ["住宅区", "金融区", "商业区", "创业区", "教育区", "医疗区", "公园休闲区", "公共服务区"]) {
    assert.match(city, new RegExp(label));
  }
  for (const label of ["银行", "股票", "房产中心", "保险中心", "税务中心", "医院", "创业街", "学校", "商业区", "公寓"]) {
    assert.match(city, new RegExp(label));
  }
  assert.match(city, /小桥|bridge|行情板/);
  for (const detail of ["background-layer", "midground-layer", "building-layer", "foreground-layer", "flower-bed", "foreground-detail", "map-building", "road-directions", "现金流路"]) {
    assert.match(city, new RegExp(detail));
  }
});

test("Sprint 21 新手引导资料完整且适合儿童理解", () => {
  assert.equal(onboardingPages.length, 4);
  assert.match(onboardingPages[0].title, /现金流冒险城/);
  assert.ok(onboardingPages.every((page) => page.text.length <= 42));
  assert.ok(tutorialControllerSteps.length >= 14);
  assert.equal(tutorialControllerSteps[0].id, "welcome");
  assert.equal(tutorialControllerSteps.at(-1).id, "complete");
  assert.ok(tutorialControllerSteps.every((step) => step.id && step.targetKey && step.completionCondition));
  assert.equal(firstTenRoundTips.length, 10);
  assert.deepEqual(firstTenRoundTips.map((tip) => tip.round), [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
  assert.ok(beginnerMissionTemplates.length >= 10);
  assert.equal(new Set(beginnerMissionTemplates.map((mission) => mission.id)).size, beginnerMissionTemplates.length);
  for (const id of ["teacher", "engineer", "designer", "doctor"]) {
    assert.ok(careerGuidance[id].length > 0);
    assert.doesNotMatch(careerGuidance[id], /最强|必然/);
  }
});

test("儿童财务字典覆盖核心名词且不承诺收益", () => {
  const terms = new Set(glossaryTerms.map((term) => term.term));
  for (const term of ["现金", "收入", "支出", "月现金流", "主动收入", "被动收入", "资产", "负债", "净资产", "股息", "租金", "房贷", "利率", "信用分", "保险", "保费", "理赔", "税金", "紧急预备金", "分散风险", "财务自由"]) {
    assert.equal(terms.has(term), true, `missing glossary term ${term}`);
  }
  assert.ok(glossaryTerms.every((term) => term.shortDefinition.length <= 36));
  assert.equal(glossaryTerms.some((term) => /保证赚钱|必然获利|一定会赚钱|完全没有风险/.test(`${term.shortDefinition}${term.childExample}${term.whyItMatters}`)), false);
});

test("城市生命感系统可安全降级并保持可测试状态", () => {
  assert.equal(atmosphereForRound(1, "auto"), "day");
  assert.equal(atmosphereForRound(5, "auto"), "evening");
  assert.equal(atmosphereForRound(7, "auto"), "night");
  assert.equal(atmosphereForRound(22, "day"), "day");
  assert.equal(atmosphereForRound(22, "night"), "night");

  const overlay = createEnvironmentOverlay("evening");
  assert.match(overlay, /environment-overlay atmosphere-evening/);
  assert.match(overlay, /aria-hidden="true"/);
  for (const selector of ["env-cloud", "env-water-shine", "env-ticker", "env-npc", "env-vehicle", "env-bike", "env-lamp"]) {
    assert.match(overlay, new RegExp(selector));
  }

  const center = miniMapPoint({ x: mapSize.width / 2, y: mapSize.height / 2 });
  assert.equal(center.x, 50);
  assert.equal(center.y, 50);

  assert.deepEqual(effectIconForKind("stock-market", 200).label, "股票上涨");
  assert.deepEqual(effectIconForKind("stock-market", -200).label, "股票下跌");
  assert.equal(effectIconForKind("business-upgrade", 100).icon, "★");
  assert.equal(effectIconForKind("insurance-claim", 100).label, "保险保障");
});
