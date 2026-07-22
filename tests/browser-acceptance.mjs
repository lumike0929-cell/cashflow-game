import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { extname, join } from "node:path";
import { chromium } from "@playwright/test";
import assert from "node:assert/strict";

const mimeTypes = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".webmanifest": "application/manifest+json; charset=utf-8",
  ".svg": "image/svg+xml; charset=utf-8",
};

const server = createServer(async (request, response) => {
  const pathname = request.url === "/" ? "/index.html" : new URL(request.url, "http://localhost").pathname;
  const filePath = join(process.cwd(), pathname);
  try {
    const body = await readFile(filePath);
    response.writeHead(200, { "content-type": mimeTypes[extname(filePath)] || "text/plain" });
    response.end(body);
  } catch {
    response.writeHead(404);
    response.end("Not found");
  }
});

await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
const { port } = server.address();
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
await page.emulateMedia({ reducedMotion: "reduce" });
const consoleErrors = [];
page.on("console", (message) => {
  if (message.type() === "error") consoleErrors.push(message.text());
});
page.on("pageerror", (error) => consoleErrors.push(error.message));

try {
  await page.goto(`http://127.0.0.1:${port}/`, { waitUntil: "networkidle" });
  await page.evaluate(() => localStorage.clear());
  await page.selectOption("#topLocaleSelect", "en");
  await expectText(page, "Cashflow Adventure City");
  await expectText(page, "Build assets until passive income is higher than monthly expenses.");
  await page.selectOption("#topLocaleSelect", "zh-TW");
  await expectText(page, "現金流冒險城");
  await page.selectOption("#topLocaleSelect", "zh-CN");
  await expectText(page, "现金流冒险城");
  await expectText(page, "建立资产，让被动收入超过每月支出。");
  const heroCheck = await page.evaluate(() => {
    const logo = document.querySelector(".game-logo")?.getBoundingClientRect();
    const hero = document.querySelector("#heroCharacter")?.getBoundingClientRect();
    const start = document.querySelector("#startAdventure")?.getBoundingClientRect();
    return {
      logoVisible: Boolean(logo && logo.top >= 0 && logo.bottom <= window.innerHeight),
      heroVisible: Boolean(hero && hero.top < window.innerHeight && hero.bottom > 0),
      startVisible: Boolean(start && start.top >= 0 && start.bottom <= window.innerHeight),
      width: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
    };
  });
  assert.equal(heroCheck.logoVisible, true);
  assert.equal(heroCheck.heroVisible, true);
  assert.equal(heroCheck.startVisible, true);
  assert.ok(heroCheck.width <= heroCheck.clientWidth + 1, `home overflow: ${heroCheck.width} > ${heroCheck.clientWidth}`);
  await page.evaluate(() => window.cashflowDebug.showOnboarding(0));
  await expectText(page, "欢迎来到现金流冒险城");
  await page.getByText("家长／老师说明").click();
  await expectText(page, "这款游戏在练习什么？");
  await page.evaluate(() => window.cashflowDebug.closeModal());
  await page.evaluate(() => window.cashflowDebug.showOnboarding(0));
  for (let index = 0; index < 3; index += 1) {
    await page.getByText("下一步").click();
  }
  await page.getByText("新手教学").click();
  const roleCount = await page.locator(".career-thumb").count();
  assert.equal(roleCount, 4);
  for (const roleName of ["小学老师", "软件工程师", "自由设计师", "牙科医生"]) {
    await expectText(page, roleName);
  }
  await page.locator('[data-difficulty="beginner"]').click();
  assert.equal(await page.locator(".difficulty-picker button.selected").innerText(), "新手");
  await page.locator('[data-career="doctor"]').click();
  await page.locator("#startSelectedCareer").click();
  await page.evaluate(() => window.cashflowDebug.closeModal());
  let beginnerSnapshot = await page.evaluate(() => window.cashflowDebug.getExperience());
  assert.equal(beginnerSnapshot.onboardingCompleted, true);
  assert.equal(beginnerSnapshot.beginnerMissions.some((mission) => mission.id === "choose-character" && mission.completed), true);
  assert.equal(beginnerSnapshot.nextBeginnerMission, "first-roll");
  await page.evaluate(() => {
    const career = { id: "doctor", icon: "医", name: "牙科医生", salary: 52000, expenses: 42000, savings: 36000 };
    window.cashflowDebug.setState({
      career,
      month: 1,
      round: 1,
      position: 0,
      cash: 420000,
      salary: 52000,
      baseExpenses: 42000,
      assets: [],
      liabilities: [],
      logs: [],
    });
  });
  assert.equal(await page.locator(".map-asset-marker").count(), 0);
  const pwaSnapshot = await page.evaluate(async () => {
    const manifestResponse = await fetch("./manifest.webmanifest");
    const manifest = await manifestResponse.json();
    const workerResponse = await fetch("./sw.js");
    const exported = window.cashflowDebug.exportBackupText();
    const parsed = exported.ok ? window.cashflowDebug.parseImportText(exported.text) : { ok: false };
    const unsafe = window.cashflowDebug.parseImportText('{"schemaVersion":1,"__proto__":{"polluted":true}}');
    const importedSlot = exported.ok ? window.cashflowDebug.importBackupText(exported.text, false) : { ok: false };
    for (let index = 0; index < 7; index += 1) window.cashflowDebug.createAutoBackup(`browser-${index}`);
    return {
      manifestOk: manifestResponse.ok,
      display: manifest.display,
      iconCount: manifest.icons.length,
      workerOk: workerResponse.ok,
      workerHasCache: (await workerResponse.text()).includes("cashflow-game-shell-v23"),
      serviceWorkerSupported: "serviceWorker" in navigator,
      exportedOk: exported.ok,
      parsedOk: parsed.ok,
      importedSlotOk: importedSlot.ok,
      unsafeRejected: unsafe.ok === false && unsafe.errors.includes("unsafeKey"),
      backups: window.cashflowDebug.listAutoBackups().length,
      storageBytes: window.cashflowDebug.estimateStorage().totalBytes,
    };
  });
  assert.equal(pwaSnapshot.manifestOk, true);
  assert.equal(pwaSnapshot.display, "standalone");
  assert.ok(pwaSnapshot.iconCount >= 4);
  assert.equal(pwaSnapshot.workerOk, true);
  assert.equal(pwaSnapshot.workerHasCache, true);
  assert.equal(typeof pwaSnapshot.serviceWorkerSupported, "boolean");
  assert.equal(pwaSnapshot.exportedOk, true);
  assert.equal(pwaSnapshot.parsedOk, true);
  assert.equal(pwaSnapshot.importedSlotOk, true);
  assert.equal(pwaSnapshot.unsafeRejected, true);
  assert.equal(pwaSnapshot.backups, 5);
  assert.ok(pwaSnapshot.storageBytes > 0);
  await page.evaluate(() => window.cashflowDebug.showStorageManager());
  await expectText(page, "存储空间");
  await page.evaluate(() => window.cashflowDebug.closeModal());
  const offlineNotice = await page.evaluate(() => {
    window.cashflowDebug.simulateNetworkStatus(false);
    return {
      live: window.cashflowDebug.getExperience().liveMessage,
      text: document.body.innerText,
    };
  });
  assert.match(`${offlineNotice.live}\n${offlineNotice.text}`, /目前离线|目前離線|Offline Mode/);
  await page.evaluate(() => window.cashflowDebug.closeModal());
  const onlineNotice = await page.evaluate(() => {
    window.cashflowDebug.simulateNetworkStatus(true);
    return {
      live: window.cashflowDebug.getExperience().liveMessage,
      text: document.body.innerText,
    };
  });
  assert.match(`${onlineNotice.live}\n${onlineNotice.text}`, /已恢复连接|已恢復連線|Back Online/);
  await page.evaluate(() => window.cashflowDebug.closeModal());
  await page.evaluate(() => window.cashflowDebug.showGlossary("passiveIncome"));
  await expectText(page, "即使你没有一直工作");
  await page.evaluate(() => window.cashflowDebug.closeModal());
  assert.equal(await page.evaluate(() => window.cashflowDebug.getExperience().glossaryViewedTerms >= 1), true);
  await page.evaluate(() => window.cashflowDebug.showTutorialSettings());
  assert.match(await page.locator("#cardModal").innerText(), /新手引导与儿童解说|新手引導與兒童解說|Beginner Guide/);
  await page.evaluate(() => window.cashflowDebug.closeModal());
  await page.evaluate(() => window.cashflowDebug.showRecoverableTip("现在还不能掷骰", "当前事件还没处理完，完成或关闭事件卡后就能继续。"));
  await expectText(page, "当前事件还没处理完");
  await page.evaluate(() => window.cashflowDebug.closeModal());
  const cityLife = await page.evaluate(() => window.cashflowDebug.getExperience());
  assert.equal(cityLife.effectiveAtmosphere, "day");
  assert.equal(cityLife.minimapVisible, true);
  assert.ok(cityLife.environmentNodes >= 10);
  assert.equal(await page.locator(".environment-overlay").count(), 1);
  assert.equal(await page.locator(".city-minimap").count(), 1);
  await page.evaluate(() => window.cashflowDebug.cycleAtmosphere());
  const atmosphereAfterCycle = await page.evaluate(() => window.cashflowDebug.getExperience());
  assert.equal(atmosphereAfterCycle.atmosphere, "day");
  assert.equal(atmosphereAfterCycle.effectiveAtmosphere, "day");
  await page.evaluate(() => window.cashflowDebug.toggleMiniMap());
  assert.equal(await page.evaluate(() => window.cashflowDebug.getExperience().minimapVisible), false);
  await page.evaluate(() => window.cashflowDebug.toggleMiniMap());
  assert.equal(await page.evaluate(() => window.cashflowDebug.getExperience().minimapVisible), true);

  const aiModeSnapshot = await page.evaluate(() => window.cashflowDebug.configureAiRace(1, "standard"));
  assert.equal(aiModeSnapshot.gameMode, "ai-race");
  assert.equal(aiModeSnapshot.aiCount, 1);
  assert.equal(await page.locator(".ai-map-avatar").count(), 1);
  await page.evaluate(() => window.cashflowDebug.showLeaderboardPanel());
  await expectText(page, "本局排名");
  await page.evaluate(() => window.cashflowDebug.showAiFinance());
  await expectText(page, "公开财务摘要");
  await page.evaluate(() => window.cashflowDebug.closeModal());
  const aiCycle = await page.evaluate(() => window.cashflowDebug.runAiCycle());
  assert.equal(aiCycle.skipped, false);
  assert.equal(aiCycle.summaries, 1);
  assert.ok(aiCycle.marketTitle.length > 0);
  await page.evaluate(() => window.cashflowDebug.showMarketPanel());
  await expectText(page, "市场新闻");
  assert.equal(await page.locator(".market-dashboard .mini-chart").count() >= 1, true);
  await page.evaluate(() => window.cashflowDebug.closeModal());
  const aiAfterCycle = await page.evaluate(() => window.cashflowDebug.getExperience().ai);
  assert.equal(aiAfterCycle.leaderboard, 2);
  assert.equal(aiAfterCycle.marketNews >= 1, true);
  assert.equal(aiAfterCycle.actionSummaries >= 1, true);
  await page.evaluate(() => window.cashflowDebug.toggleAiSpeed());
  const aiAfterSpeed = await page.evaluate(() => window.cashflowDebug.getExperience().ai.aiAnimationSpeed);
  assert.match(aiAfterSpeed, /watch|fast|skip/);
  const multiAi = await page.evaluate(() => {
    window.cashflowDebug.configureAiRace(3, "expert");
    return window.cashflowDebug.runAiCycles(10, 31);
  });
  assert.equal(multiAi.leaderboard, 4);
  assert.equal(multiAi.summaries, 30);
  assert.equal(multiAi.marketNews <= 12, true);
  assert.equal(multiAi.roundHistory <= 20, true);
  const stressResult = await page.evaluate(() => window.cashflowDebug.runAiStressDebug(3, 10, 33));
  assert.equal(stressResult.invalidNumbers, false);
  assert.equal(stressResult.leaderboard.length, 4);

  await page.evaluate(() => window.cashflowDebug.showProgressCenter("freedom"));
  await expectText(page, "进度中心");
  await expectText(page, "目前阶段");
  for (const tab of ["missions", "achievements", "badges", "challenges", "reports", "freedom"]) {
    await page.evaluate((nextTab) => window.cashflowDebug.showProgressCenter(nextTab), tab);
    const modalText = await page.locator("#cardModal").innerText();
    assert.match(modalText, /进度中心/);
  }
  await page.evaluate(() => window.cashflowDebug.closeModal());
  await page.evaluate(() => window.cashflowDebug.completeProgressMissions());
  await page.evaluate(() => window.cashflowDebug.unlockProgressSamples());
  const progressSnapshot = await page.evaluate(() => window.cashflowDebug.getExperience().progress);
  assert.ok(progressSnapshot.completedMissions >= 1);
  assert.ok(progressSnapshot.achievements >= 3);
  assert.ok(progressSnapshot.badges >= 1);
  assert.ok(progressSnapshot.pendingNotifications >= 0);
  await page.evaluate(() => window.cashflowDebug.showProgressCenter("missions"));
  await expectText(page, "领取完成任务");
  assert.equal(await page.locator(".mission-card").count() <= 3, true);
  await page.locator("[data-mission-help]").first().click();
  assert.equal(await page.locator(".mission-help:not(.hidden)").count() >= 1, true);
  await page.evaluate(() => window.cashflowDebug.closeModal());
  await page.evaluate(() => window.cashflowDebug.showProgressCenter("achievements"));
  await page.locator("[data-achievement-filter='unlocked']").click();
  assert.equal(await page.locator(".achievement-card.unlocked").count() >= 1, true);
  await page.evaluate(() => window.cashflowDebug.showProgressCenter("badges"));
  assert.equal(await page.locator(".badge-card").count() >= 10, true);
  await page.evaluate(() => window.cashflowDebug.showProgressCenter("challenges"));
  assert.equal(await page.locator("[data-start-challenge]").count() >= 6, true);
  await page.evaluate(() => window.cashflowDebug.showProgressCenter("reports"));
  await page.getByText("生成当前报告").click();
  await expectText(page, "当前结算报告");
  await page.getByText("分享卡片").click();
  await expectText(page, "本地分享卡片");
  assert.equal(await page.locator(".share-card-panel img").count(), 1);
  await page.evaluate(() => window.cashflowDebug.closeModal());

  await page.evaluate(() => window.cashflowDebug.startTutorial(true));
  let tutorialState = await page.evaluate(() => window.cashflowDebug.getExperience());
  assert.equal(tutorialState.tutorialActive, true);
  while ((await page.evaluate(() => window.cashflowDebug.getExperience().tutorialActive))) {
    await page.evaluate(() => window.cashflowDebug.nextTutorialStep());
  }
  tutorialState = await page.evaluate(() => window.cashflowDebug.getExperience());
  assert.equal(tutorialState.tutorialComplete, true);
  await page.evaluate(() => window.cashflowDebug.startTutorial(true));
  await page.evaluate(() => window.cashflowDebug.skipTutorial());
  assert.equal(await page.evaluate(() => window.cashflowDebug.getExperience().tutorialActive), false);
  await page.evaluate(() => window.cashflowDebug.startTutorial(true));
  await page.evaluate(() => window.cashflowDebug.closeModal());
  assert.equal(await page.evaluate(() => window.cashflowDebug.getExperience().tutorialActive), true);
  await page.evaluate(() => window.cashflowDebug.completeTutorial());
  const cashBeforeTutorialReset = await page.evaluate(() => window.cashflowDebug.getState().cash);
  await page.evaluate(() => window.cashflowDebug.resetTutorialProgress());
  await expectText(page, "教学进度已重置");
  assert.equal(await page.evaluate(() => window.cashflowDebug.getState().cash), cashBeforeTutorialReset);
  assert.equal(await page.evaluate(() => window.cashflowDebug.getExperience().tutorialComplete), false);
  await page.evaluate(() => window.cashflowDebug.closeModal());
  await page.evaluate(() => window.cashflowDebug.startTutorial(true));
  await page.evaluate(() => window.cashflowDebug.completeTutorial());

  const moods = ["happy", "excited", "worried", "sad", "thinking"];
  for (const mood of moods) {
    await page.evaluate((nextMood) => window.cashflowDebug.setEmotion(nextMood, 0), mood);
    const renderedMood = await page.evaluate(() => window.cashflowDebug.getExperience().avatarMood);
    assert.equal(renderedMood, mood);
  }
  await page.evaluate(() => window.cashflowDebug.setEmotion("happy", 180));
  await page.waitForFunction(() => window.cashflowDebug.getExperience().avatarState === "idle");
  assert.equal(await page.evaluate(() => window.cashflowDebug.getExperience().avatarMood), "neutral");

  await page.evaluate(() => window.cashflowDebug.playIncomeEffect());
  await page.waitForSelector(".finance-effect.positive");
  await page.evaluate(() => window.cashflowDebug.playExpenseEffect());
  await page.waitForSelector(".finance-effect.negative");

  await page.evaluate(() => window.cashflowDebug.toggleMusic());
  await page.evaluate(() => window.cashflowDebug.toggleHaptics());
  await page.evaluate(() => window.cashflowDebug.toggleAnimationSpeed());
  await page.evaluate(() => window.cashflowDebug.cycleVisualQuality());
  await page.evaluate(() => window.cashflowDebug.dispatchVisibility());
  const settingsAfterToggle = await page.evaluate(() => window.cashflowDebug.getExperience());
  assert.equal(typeof settingsAfterToggle.musicEnabled, "boolean");
  assert.equal(typeof settingsAfterToggle.hapticsEnabled, "boolean");
  assert.equal(settingsAfterToggle.animationSpeed, "fast");
  assert.equal(settingsAfterToggle.visualQuality, "battery");
  assert.equal(await page.locator(".env-npc").first().evaluate((item) => getComputedStyle(item).display), "none");
  await page.evaluate(() => window.cashflowDebug.cycleVisualQuality());
  assert.equal(await page.evaluate(() => window.cashflowDebug.getExperience().visualQuality), "high");

  await page.evaluate(() => window.cashflowDebug.showContextTip("firstDebt", true));
  await page.locator("#cardModal").click({ position: { x: 4, y: 4 } });
  assert.equal(await page.locator("#cardModal").evaluate((modal) => modal.classList.contains("hidden")), false);
  await page.evaluate(() => window.cashflowDebug.closeModal());

  const initialExperience = await page.evaluate(() => window.cashflowDebug.getExperience());
  assert.equal(initialExperience.boardTiles, 40);
  const rapidBefore = await page.evaluate(() => {
    const state = window.cashflowDebug.getState();
    return { position: state.position, round: state.round };
  });
  await page.evaluate(() => {
    window.cashflowDebug.rollFixed(3);
    window.cashflowDebug.rollFixed(3);
  });
  await page.waitForFunction(() => {
    const experience = window.cashflowDebug.getExperience();
    return !experience.isRolling && !experience.isMoving;
  });
  const rapidExperience = await page.evaluate(() => window.cashflowDebug.getExperience());
  assert.equal(rapidExperience.isRolling && rapidExperience.isMoving, false);
  for (const phase of ["rolling", "diceResult", "preparingMove", "moving", "arriving", "openingEvent"]) {
    assert.ok(rapidExperience.turnPhaseHistory.includes(phase), `missing turn phase ${phase}`);
  }
  assert.ok(rapidExperience.turnPhaseHistory.indexOf("rolling") < rapidExperience.turnPhaseHistory.indexOf("moving"));
  await page.evaluate(() => window.cashflowDebug.closeModal());
  assert.equal(await page.evaluate(() => window.cashflowDebug.getExperience().turnPhase), "idle");
  const rapidAfter = await page.evaluate(() => {
    const state = window.cashflowDebug.getState();
    return { position: state.position, round: state.round, lastRoll: state.lastRoll };
  });
  assert.equal(rapidAfter.position, (rapidBefore.position + 3) % 40);
  assert.equal(rapidAfter.round, rapidBefore.round + 1);
  assert.equal(rapidAfter.lastRoll, 3);

  const rolls = [1, 2, 3, 4, 5, 6, 1, 2, 3];
  for (const roll of rolls) {
    const before = await page.evaluate(() => window.cashflowDebug.getState().position);
    await page.evaluate((value) => window.cashflowDebug.rollFixed(value), roll);
    await page.waitForFunction(() => {
      const experience = window.cashflowDebug.getExperience();
      return !experience.isRolling && !experience.isMoving;
    });
    const after = await page.evaluate(() => window.cashflowDebug.getState().position);
    assert.equal(after, (before + roll) % 40);
    assert.equal(await page.evaluate(() => window.cashflowDebug.getExperience().lastRoll), roll);
    await page.evaluate(() => window.cashflowDebug.closeModal());
    assert.equal(await page.evaluate(() => window.cashflowDebug.getExperience().turnPhase), "idle");
  }

  const performanceRolls = Array.from({ length: 30 }, (_, index) => (index % 6) + 1);
  for (const roll of performanceRolls) {
    const before = await page.evaluate(() => window.cashflowDebug.getState().position);
    await page.evaluate((value) => window.cashflowDebug.rollFixed(value), roll);
    await page.waitForFunction(() => {
      const experience = window.cashflowDebug.getExperience();
      return !experience.isRolling && !experience.isMoving;
    });
    const after = await page.evaluate(() => window.cashflowDebug.getState().position);
    assert.equal(after, (before + roll) % 40);
    await page.evaluate(() => window.cashflowDebug.closeModal());
    assert.equal(await page.evaluate(() => window.cashflowDebug.getExperience().turnPhase), "idle");
  }
  await page.waitForTimeout(420);
  assert.equal(await page.locator(".finance-effect").count(), 0);
  await page.evaluate(() => window.cashflowDebug.playDuplicateEffect());
  await page.waitForSelector(".finance-effect.debug-duplicate");
  assert.equal(await page.locator(".finance-effect.debug-duplicate").count(), 1);
  await page.waitForTimeout(420);
  assert.equal(await page.locator(".finance-effect").count(), 0);

  const cameraBefore = await page.evaluate(() => window.cashflowDebug.getExperience().camera);
  await page.evaluate(() => window.cashflowDebug.zoomMap(0.18));
  const cameraZoomed = await page.evaluate(() => window.cashflowDebug.getExperience().camera);
  assert.ok(cameraZoomed.scale > cameraBefore.scale);
  assert.equal(cameraZoomed.follow, false);
  await page.evaluate(() => window.cashflowDebug.rollFixed(1));
  await page.waitForFunction(() => {
    const experience = window.cashflowDebug.getExperience();
    return !experience.isRolling && !experience.isMoving;
  });
  await page.evaluate(() => window.cashflowDebug.closeModal());
  const cameraAfterManualMove = await page.evaluate(() => window.cashflowDebug.getExperience().camera);
  assert.equal(cameraAfterManualMove.follow, false);
  await page.evaluate(() => window.cashflowDebug.focusPlayer());
  const cameraFocused = await page.evaluate(() => window.cashflowDebug.getExperience().camera);
  assert.equal(cameraFocused.follow, true);
  await page.evaluate(() => window.cashflowDebug.toggleSound());
  const mutedAfterToggle = await page.evaluate(() => window.cashflowDebug.getExperience().muted);
  assert.equal(typeof mutedAfterToggle, "boolean");
  const soundBeforeInteraction = await page.evaluate(() => window.cashflowDebug.getExperience().sound.musicPlaying);
  assert.equal(typeof soundBeforeInteraction, "boolean");

  await page.evaluate(() => window.cashflowDebug.buyFirstProperty());
  assert.equal(await page.locator(".decision-coach").count() >= 1, true);
  assert.equal(await page.locator(".glossary-chip-row").count() >= 1, true);
  await page.evaluate(() => window.cashflowDebug.closeModal());
  assert.equal(await page.locator(".map-asset-marker").count() >= 1, true);
  await page.evaluate(() => window.cashflowDebug.buyFirstProperty());
  await page.evaluate(() => window.cashflowDebug.closeModal());
  await page.evaluate(() => window.cashflowDebug.payday());
  await page.evaluate(() => window.cashflowDebug.closeModal());
  await page.evaluate(() => window.cashflowDebug.payday());
  await page.evaluate(() => window.cashflowDebug.closeModal());
  await page.evaluate(() => window.cashflowDebug.payday());
  await page.evaluate(() => window.cashflowDebug.closeModal());
  await page.evaluate(() => window.cashflowDebug.triggerMarket());
  await page.evaluate(() => window.cashflowDebug.triggerHoldingEvent());
  await page.evaluate(() => window.cashflowDebug.closeModal());
  await page.evaluate(() => window.cashflowDebug.buyFirstStock());
  await page.evaluate(() => window.cashflowDebug.closeModal());
  assert.equal(await page.locator(".map-asset-marker").count() >= 3, true);
  await page.evaluate(() => window.cashflowDebug.triggerStockMarket());
  await page.evaluate(() => window.cashflowDebug.payday());
  await page.evaluate(() => window.cashflowDebug.closeModal());
  await page.evaluate(() => window.cashflowDebug.sellFirstStock());
  await page.evaluate(() => window.cashflowDebug.closeModal());
  await page.evaluate(() => window.cashflowDebug.buyFirstBusiness());
  await page.evaluate(() => window.cashflowDebug.closeModal());
  assert.equal(await page.locator(".map-asset-marker").count() >= 4, true);
  await page.evaluate(() => window.cashflowDebug.buySecondBusiness());
  await page.evaluate(() => window.cashflowDebug.closeModal());
  await page.evaluate(() => window.cashflowDebug.upgradeFirstBusiness());
  await page.evaluate(() => window.cashflowDebug.closeModal());
  await page.evaluate(() => window.cashflowDebug.payday());
  await page.evaluate(() => window.cashflowDebug.closeModal());
  await page.evaluate(() => window.cashflowDebug.payday());
  await page.evaluate(() => window.cashflowDebug.closeModal());
  await page.evaluate(() => window.cashflowDebug.triggerPositiveBusinessEvent());
  await page.evaluate(() => window.cashflowDebug.closeModal());
  await page.evaluate(() => window.cashflowDebug.triggerNegativeBusinessEvent());
  await page.evaluate(() => window.cashflowDebug.closeModal());
  await page.evaluate(() => window.cashflowDebug.triggerBusinessMarket());
  await page.evaluate(() => window.cashflowDebug.closeModal());
  await page.evaluate(() => window.cashflowDebug.sellFirstBusiness());
  await page.evaluate(() => window.cashflowDebug.closeModal());
  await page.evaluate(() => window.cashflowDebug.buyBasicInsurance());
  await page.evaluate(() => window.cashflowDebug.closeModal());
  await page.evaluate(() => window.cashflowDebug.buyAccidentInsurance());
  await page.evaluate(() => window.cashflowDebug.closeModal());
  assert.equal(await page.locator('.map-asset-marker[data-map-asset="insurance"]').count() >= 1, true);
  await page.evaluate(() => window.cashflowDebug.triggerCoveredMedicalEvent());
  await page.evaluate(() => window.cashflowDebug.closeModal());
  await page.evaluate(() => window.cashflowDebug.triggerUncoveredEvent());
  await page.evaluate(() => window.cashflowDebug.closeModal());
  await page.evaluate(() => window.cashflowDebug.triggerUnemployment());
  await page.evaluate(() => window.cashflowDebug.closeModal());
  await page.evaluate(() => window.cashflowDebug.searchJob());
  await page.evaluate(() => window.cashflowDebug.closeModal());
  await page.evaluate(() => window.cashflowDebug.searchJob());
  await page.evaluate(() => window.cashflowDebug.closeModal());
  await page.evaluate(() => window.cashflowDebug.searchJob());
  await page.evaluate(() => window.cashflowDebug.closeModal());
  await page.evaluate(() => window.cashflowDebug.triggerPromotion());
  await page.evaluate(() => window.cashflowDebug.closeModal());
  await page.evaluate(() => window.cashflowDebug.settleTax());
  await page.evaluate(() => window.cashflowDebug.closeModal());
  await page.evaluate(() => window.cashflowDebug.triggerFamilyEvent());
  await page.evaluate(() => window.cashflowDebug.closeModal());

  const beforeSaleCount = await page.evaluate(() => window.cashflowDebug.getState().ownedProperties.length);
  assert.equal(beforeSaleCount, 2);
  await page.locator("[data-property]").first().click();
  await page.getByText("出售房产").click();
  await page.getByText("确认出售").click();
  await page.evaluate(() => window.cashflowDebug.closeModal());

  await page.reload({ waitUntil: "networkidle" });
  await page.locator("#gameMenu").click();
  await page.getByText("读取存档").click();
  await page.evaluate(() => window.cashflowDebug.closeModal());

  const result = await page.evaluate(() => {
    const state = window.cashflowDebug.getState();
    return {
      properties: state.ownedProperties.length,
      transactions: state.propertyTransactions.length,
      stockHoldings: state.stockHoldings.length,
      stockTransactions: state.stockTransactions.length,
      businessHoldings: state.businessHoldings.length,
      businessTransactions: state.businessTransactions.length,
      hasBusinessUpgrade: state.businessTransactions.some((item) => item.type === "升級"),
      insurancePolicies: state.insurancePolicies.filter((item) => item.active).length,
      insuranceClaims: state.insuranceClaims.length,
      lifeEvents: state.lifeEventHistory.length,
      unemployed: state.unemployment.unemployed,
      taxLiabilities: state.liabilities.filter((item) => item.type === "tax").length,
      hasMortgage: state.liabilities.some((item) => item.type === "mortgage"),
      tutorialComplete: window.cashflowDebug.getExperience().tutorialComplete,
      seenFirstStockTip: Boolean(window.cashflowDebug.getExperience().seenTips.firstStock),
      width: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
      text: document.body.innerText,
    };
  });

  assert.equal(result.properties, 1);
  assert.ok(result.transactions >= 6);
  assert.equal(result.stockHoldings, 1);
  assert.ok(result.stockTransactions >= 3);
  assert.equal(result.businessHoldings, 1);
  assert.ok(result.businessTransactions >= 7);
  assert.equal(result.hasBusinessUpgrade, true);
  assert.ok(result.insurancePolicies >= 2);
  assert.ok(result.insuranceClaims >= 1);
  assert.ok(result.lifeEvents >= 5);
  assert.equal(result.unemployed, false);
  assert.ok(result.taxLiabilities >= 0);
  assert.equal(result.hasMortgage, true);
  assert.equal(result.tutorialComplete, true);
  assert.equal(result.seenFirstStockTip, true);
  assert.ok(result.width <= result.clientWidth + 1, `horizontal overflow: ${result.width} > ${result.clientWidth}`);
  assert.match(result.text, /房地产/);
  assert.match(result.text, /小生意/);
  assert.match(result.text, /人生与保障/);
  assert.match(result.text, /预备金/);

  await page.evaluate(() => window.cashflowDebug.simulateVictory());
  await expectText(page, "财务自由达成");
  let postVictory = await page.evaluate(() => window.cashflowDebug.getExperience().progress);
  assert.equal(postVictory.victory.triggered, true);
  assert.ok(postVictory.reports >= 1);
  await page.evaluate(() => window.cashflowDebug.continueFreedom());
  postVictory = await page.evaluate(() => window.cashflowDebug.getExperience().progress);
  assert.equal(postVictory.victory.continued, true);

  await page.evaluate(() => window.cashflowDebug.simulatePressure());
  await expectText(page, "需要重新规划");
  await page.evaluate(() => window.cashflowDebug.closeModal());

  await page.evaluate(() => window.cashflowDebug.startChallengeDebug());
  const challengeState = await page.evaluate(() => window.cashflowDebug.getExperience().progress.challenge);
  assert.equal(challengeState.id, "starter-cashflow");
  await page.evaluate(() => window.cashflowDebug.showProgressCenter("challenges"));
  assert.match(await page.locator("#cardModal").innerText(), /新手现金流/);
  await page.evaluate(() => window.cashflowDebug.closeModal());
  assert.deepEqual(consoleErrors, []);

  for (const viewport of [
    { width: 390, height: 844 },
    { width: 768, height: 1024 },
    { width: 1024, height: 768 },
    { width: 1440, height: 900 },
  ]) {
    await page.setViewportSize(viewport);
    await page.reload({ waitUntil: "networkidle" });
    await page.locator("#gameMenu").click();
    await page.getByText("读取存档").click();
    await page.evaluate(() => window.cashflowDebug.closeModal());
    const overflow = await page.evaluate(() => ({
      width: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
      hasMap: Boolean(document.querySelector(".city-map-viewport")),
      hasHud: Boolean(document.querySelector(".turn-card")),
      hud: document.querySelector(".turn-card")?.getBoundingClientRect().toJSON(),
      board: document.querySelector(".board")?.getBoundingClientRect().toJSON(),
      roll: document.querySelector("#rollDice")?.getBoundingClientRect().toJSON(),
      rollText: document.querySelector("#rollDice")?.textContent,
      writingMode: getComputedStyle(document.querySelector("#rollDice")).writingMode,
      whiteSpace: getComputedStyle(document.querySelector("#rollDice")).whiteSpace,
      wordBreak: getComputedStyle(document.querySelector("#rollDice")).wordBreak,
    }));
    assert.equal(overflow.hasMap, true);
    assert.equal(overflow.hasHud, true);
    assert.equal(overflow.writingMode, "horizontal-tb");
    assert.equal(overflow.whiteSpace, "nowrap");
    assert.equal(overflow.wordBreak, "keep-all");
    assert.ok(overflow.roll.width > overflow.roll.height, `${viewport.width}px roll button became vertical`);
    assert.ok(overflow.board.height >= viewport.height * 0.45, `${viewport.width}px board too short`);
    assert.ok(overflow.hud.height <= Math.max(230, viewport.height * 0.28), `${viewport.width}px HUD too tall`);
    assert.ok(overflow.width <= overflow.clientWidth + 1, `${viewport.width}px overflow: ${overflow.width} > ${overflow.clientWidth}`);
    await page.evaluate(() => window.cashflowDebug.showProgressCenter("freedom"));
    const progressLayout = await page.evaluate(() => ({
      width: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
      tabs: document.querySelectorAll(".progress-tab-rail button").length,
      bodyLocked: document.body.classList.contains("modal-open"),
      modalWidth: document.querySelector(".modal-card")?.getBoundingClientRect().width || 0,
    }));
    assert.equal(progressLayout.tabs, 6);
    assert.equal(progressLayout.bodyLocked, true);
    assert.ok(progressLayout.modalWidth <= viewport.width + 1, `${viewport.width}px progress modal too wide`);
    assert.ok(progressLayout.width <= progressLayout.clientWidth + 1, `${viewport.width}px progress overflow`);
    await page.evaluate(() => window.cashflowDebug.closeModal());
    assert.equal(await page.evaluate(() => document.body.classList.contains("modal-open")), false);
  }

  for (const viewport of [
    { width: 390, height: 844 },
    { width: 768, height: 1024 },
    { width: 1024, height: 768 },
    { width: 1440, height: 900 },
  ]) {
    await page.setViewportSize(viewport);
    await page.evaluate(() => localStorage.clear());
    await page.reload({ waitUntil: "networkidle" });
    await page.evaluate(() => window.scrollTo(0, 0));
    const homeLayout = await page.evaluate(() => {
      const logo = document.querySelector(".game-logo")?.getBoundingClientRect();
      const hero = document.querySelector("#heroCharacter")?.getBoundingClientRect();
      const start = document.querySelector("#startAdventure")?.getBoundingClientRect();
      return {
        logoVisible: Boolean(logo && logo.top >= 0 && logo.bottom <= window.innerHeight),
        heroVisible: Boolean(hero && hero.top < window.innerHeight && hero.bottom > 0),
        startVisible: Boolean(start && start.top >= 0 && start.bottom <= window.innerHeight),
        width: document.documentElement.scrollWidth,
        clientWidth: document.documentElement.clientWidth,
      };
    });
    assert.equal(homeLayout.logoVisible, true);
    assert.equal(homeLayout.heroVisible, true, `${viewport.width}px hero hidden: ${JSON.stringify(homeLayout)}`);
    assert.equal(homeLayout.startVisible, true);
    assert.ok(homeLayout.width <= homeLayout.clientWidth + 1, `${viewport.width}px home overflow: ${homeLayout.width} > ${homeLayout.clientWidth}`);
    await page.evaluate(() => {
      window.cashflowDebug.closeModal();
      window.cashflowDebug.showCharacterSelection?.();
    });
    const selectionLayout = await page.evaluate(() => {
      const start = document.querySelector("#startSelectedCareer")?.getBoundingClientRect();
      const stage = document.querySelector(".character-select-stage")?.getBoundingClientRect();
      const preview = document.querySelector(".character-preview-scene")?.getBoundingClientRect();
      const panel = document.querySelector(".selected-career-panel")?.getBoundingClientRect();
      return {
        thumbs: document.querySelectorAll(".career-thumb").length,
        selected: Boolean(document.querySelector(".career-thumb.selected")),
        startVisible: Boolean(start && start.top < window.innerHeight && start.bottom <= window.innerHeight),
        startTop: start?.top || 0,
        startBottom: start?.bottom || 0,
        innerHeight: window.innerHeight,
        position: document.querySelector("#startSelectedCareer") ? getComputedStyle(document.querySelector("#startSelectedCareer")).position : "",
        stageWidth: stage?.width || 0,
        previewLeft: preview?.left || 0,
        panelLeft: panel?.left || 0,
        width: document.documentElement.scrollWidth,
        clientWidth: document.documentElement.clientWidth,
      };
    });
    assert.equal(selectionLayout.thumbs, 4);
    assert.equal(selectionLayout.selected, true);
    assert.equal(selectionLayout.startVisible, true, `${viewport.width}px start button hidden: ${JSON.stringify(selectionLayout)}`);
    assert.ok(selectionLayout.stageWidth >= viewport.width * 0.72, `${viewport.width}px selection uses too little width`);
    if (viewport.width >= 768) {
      assert.ok(selectionLayout.panelLeft > selectionLayout.previewLeft, `${viewport.width}px selection is not two-column`);
    }
    assert.ok(selectionLayout.width <= selectionLayout.clientWidth + 1, `${viewport.width}px selection overflow: ${selectionLayout.width} > ${selectionLayout.clientWidth}`);
  }
  console.log("Browser acceptance passed.");
} finally {
  await browser.close();
  await new Promise((resolve) => server.close(resolve));
}

async function expectText(page, text) {
  await page.getByText(text).first().waitFor({ state: "visible" });
}
