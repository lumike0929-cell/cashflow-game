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
  await runEnglishI18nSmoke(page);
  await page.evaluate(() => localStorage.clear());
  await page.reload({ waitUntil: "networkidle" });
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
  for (const viewport of [
    { width: 375, height: 667 },
    { width: 390, height: 844 },
    { width: 430, height: 932 },
    { width: 768, height: 1024 },
    { width: 1024, height: 768 },
    { width: 1440, height: 900 },
  ]) {
    await verifyStartAdventureEntry(page, viewport);
  }
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
  for (const roleName of ["小学老师", "软件工程师", "自由设计师", "小生意创业者"]) {
    await expectText(page, roleName);
  }
  await page.locator('[data-difficulty="beginner"]').click();
  assert.equal(await page.locator(".difficulty-picker button.selected").innerText(), "新手");
  await page.locator('[data-career="entrepreneur"]').click();
  await page.locator('[data-local-count="4"]').click();
  await page.locator('[data-local-player-index="1"][data-local-career="engineer"]').click();
  await page.locator('[data-local-player-index="2"][data-local-career="designer"]').click();
  await page.locator('[data-local-player-index="3"][data-local-career="entrepreneur"]').click();
  await page.locator('[data-local-name="1"]').fill("贝贝");
  await page.locator('[data-local-name="2"]').fill("琪琪");
  await page.locator('[data-local-name="3"]').fill("豆豆");
  const localSetupUi = await page.evaluate(() => ({
    countButtons: document.querySelectorAll("[data-local-count]").length,
    cards: document.querySelectorAll(".local-player-card").length,
    selectedCareers: [...document.querySelectorAll(".local-player-card")].map((card) => card.querySelector(".local-career-row .selected")?.getAttribute("data-local-career")),
    width: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
  }));
  assert.equal(localSetupUi.countButtons, 4);
  assert.equal(localSetupUi.cards, 4);
  assert.deepEqual(localSetupUi.selectedCareers, ["entrepreneur", "engineer", "designer", "entrepreneur"]);
  assert.ok(localSetupUi.width <= localSetupUi.clientWidth + 1, `local setup overflow: ${localSetupUi.width} > ${localSetupUi.clientWidth}`);
  await page.locator("#startSelectedCareer").click();
  await page.evaluate(() => window.cashflowDebug.closeModal());
  let beginnerSnapshot = await page.evaluate(() => window.cashflowDebug.getExperience());
  assert.equal(beginnerSnapshot.onboardingCompleted, true);
  assert.equal(beginnerSnapshot.beginnerMissions.some((mission) => mission.id === "choose-character" && mission.completed), true);
  assert.equal(beginnerSnapshot.nextBeginnerMission, "first-roll");
  assert.equal(beginnerSnapshot.localMultiplayer.enabled, true);
  assert.equal(beginnerSnapshot.localMultiplayer.playerCount, 4);
  assert.equal(await page.locator(".local-player-strip").count(), 1);
  assert.equal(await page.locator(".local-map-avatar").count(), 3);
  const localDebug = await page.evaluate(() => {
    const before = window.cashflowDebug.getExperience().localMultiplayer;
    const states = [before.currentPlayerId];
    for (let index = 0; index < 20; index += 1) {
      states.push(window.cashflowDebug.advanceLocalTurnDebug().currentPlayerId);
    }
    const after = window.cashflowDebug.getExperience().localMultiplayer;
    const rootState = window.cashflowDebug.getState();
    return {
      states,
      currentPlayerId: after.currentPlayerId,
      playerCount: after.playerCount,
      pendingTurnSwitch: after.pendingTurnSwitch,
      leaderboard: after.leaderboard.length,
      snapshots: rootState.localPlayers.map((player) => ({
        id: player.playerId,
        careerId: player.careerId,
        cash: player.snapshot.cash,
        position: player.snapshot.position,
      })),
      localAvatars: document.querySelectorAll(".local-map-avatar").length,
      stripVisible: Boolean(document.querySelector(".local-player-strip")),
      rollDisabled: document.querySelector("#rollDice")?.disabled,
    };
  });
  assert.equal(localDebug.playerCount, 4);
  assert.equal(new Set(localDebug.states).size, 4);
  assert.equal(localDebug.pendingTurnSwitch, false);
  assert.equal(localDebug.leaderboard, 4);
  assert.equal(localDebug.localAvatars, 3);
  assert.equal(localDebug.stripVisible, true);
  assert.equal(localDebug.rollDisabled, false);
  assert.deepEqual(localDebug.snapshots.map((item) => item.careerId), ["entrepreneur", "engineer", "designer", "entrepreneur"]);
  await page.evaluate(() => {
    const career = { id: "entrepreneur", icon: "创", name: "小生意创业者", salary: 24000, expenses: 20500, savings: 14500 };
    window.cashflowDebug.setState({
      career,
      month: 1,
      round: 1,
      position: 0,
      cash: 420000,
      salary: 24000,
      baseExpenses: 20500,
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
    const iconResponse = await fetch("./icons/app-icon-192.svg");
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
      iconOk: iconResponse.ok,
      workerHasCache: (await workerResponse.text()).includes("cashflow-game-shell-startflow-p0-20260731"),
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
  assert.equal(pwaSnapshot.iconOk, true);
  assert.equal(pwaSnapshot.workerHasCache, true);
  assert.equal(typeof pwaSnapshot.serviceWorkerSupported, "boolean");
  assert.equal(pwaSnapshot.exportedOk, true);
  assert.equal(pwaSnapshot.parsedOk, true);
  assert.equal(pwaSnapshot.importedSlotOk, true);
  assert.equal(pwaSnapshot.unsafeRejected, true);
  assert.equal(pwaSnapshot.backups, 5);
  assert.ok(pwaSnapshot.storageBytes > 0);
  const funSnapshot = await page.evaluate(() => window.cashflowDebug.runFunPacingPreview(11));
  assert.ok(funSnapshot.strategyChoices >= 3, `expected at least 3 strategy choices, got ${funSnapshot.strategyChoices}`);
  assert.ok(funSnapshot.miniGames >= 1, `expected a mini game, got ${funSnapshot.miniGames}`);
  assert.ok(funSnapshot.goalCompletions >= 1, `expected a short goal completion, got ${funSnapshot.goalCompletions}`);
  assert.ok(funSnapshot.successRewards >= 1, `expected a success reward, got ${funSnapshot.successRewards}`);
  assert.ok(funSnapshot.riskEvents >= 1, `expected a risk event, got ${funSnapshot.riskEvents}`);
  assert.ok(funSnapshot.aiInteractions >= 1, `expected an AI interaction, got ${funSnapshot.aiInteractions}`);
  assert.ok(funSnapshot.cityUpgrades >= 1, `expected a city feedback marker, got ${funSnapshot.cityUpgrades}`);
  assert.ok(funSnapshot.bestCombo >= 1, `expected combo feedback, got ${funSnapshot.bestCombo}`);
  assert.ok((await page.locator(".map-asset-marker.status-fun").count()) >= 1);
  await page.evaluate(() => window.cashflowDebug.showReleaseNotes());
  await expectText(page, "公开测试版说明");
  await expectText(page, "1.24.3-startflow-p0");
  assert.match(await page.locator("#cardModal").innerText(), /Public Beta/);
  await page.evaluate(() => window.cashflowDebug.closeModal());
  await page.evaluate(() => window.cashflowDebug.showFeedbackPanel());
  await expectText(page, "回报 Cashflow 问题");
  await expectText(page, "问题类型");
  await page.locator("#feedbackSummary").fill("按钮在小屏幕上看起来太挤。");
  const feedbackSnapshot = await page.evaluate(() => {
    const diagnostics = window.cashflowDebug.buildDiagnostics();
    const summary = window.cashflowDebug.buildGameSummary(false);
    const report = window.cashflowDebug.buildFeedbackReportDebug({
      issueType: "layout",
      screen: "browser acceptance",
      summary: "按钮在小屏幕上看起来太挤。",
      frequency: "once",
      includeDiagnostics: true,
      includeGameSummary: true,
    });
    return {
      channel: diagnostics.releaseChannel,
      hasFullStorage: JSON.stringify(diagnostics).includes("localStorage"),
      hasSaveDump: JSON.stringify(diagnostics).includes("stockTransactions"),
      cashIsBand: typeof summary.cash === "string",
      reportType: report.issueType,
      reportHasDiagnostics: Boolean(report.diagnostics),
    };
  });
  assert.equal(feedbackSnapshot.channel, "Public Beta");
  assert.equal(feedbackSnapshot.hasFullStorage, false);
  assert.equal(feedbackSnapshot.hasSaveDump, false);
  assert.equal(feedbackSnapshot.cashIsBand, true);
  assert.equal(feedbackSnapshot.reportType, "layout");
  assert.equal(feedbackSnapshot.reportHasDiagnostics, true);
  await page.evaluate(() => window.cashflowDebug.showKnownIssues());
  await expectText(page, "尚未列出重大已知问题");
  await page.evaluate(() => window.cashflowDebug.showPrivacyNotice());
  await expectText(page, "不自动上传游戏资料");
  await page.evaluate(() => window.cashflowDebug.closeModal());
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

  const performanceRolls = Array.from({ length: 50 }, (_, index) => (index % 6) + 1);
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
  await page.setViewportSize({ width: 390, height: 844 });
  await page.evaluate(() => {
    window.cashflowDebug.closeModal();
    window.cashflowDebug.focusPlayer();
  });
  const gestureBefore = await page.evaluate(() => window.cashflowDebug.getExperience().camera);
  const viewportRect = await page.locator("#cityMapViewport").boundingBox();
  assert.ok(viewportRect, "city map viewport missing before gesture test");
  await page.mouse.move(viewportRect.x + viewportRect.width * 0.5, viewportRect.y + viewportRect.height * 0.5);
  await page.mouse.down();
  await page.mouse.move(viewportRect.x + viewportRect.width * 0.34, viewportRect.y + viewportRect.height * 0.62, { steps: 8 });
  await page.mouse.up();
  const gestureDragged = await page.evaluate(() => window.cashflowDebug.getExperience().camera);
  assert.equal(gestureDragged.follow, false, "manual board drag should pause camera follow");
  assert.ok(
    Math.abs(gestureDragged.x - gestureBefore.x) + Math.abs(gestureDragged.y - gestureBefore.y) > 18,
    `manual board drag did not move camera: ${JSON.stringify({ gestureBefore, gestureDragged })}`,
  );
  await page.evaluate(() => window.cashflowDebug.zoomMap(-0.22));
  const wheelBase = await page.evaluate(() => window.cashflowDebug.getExperience().camera);
  await page.mouse.move(viewportRect.x + viewportRect.width * 0.5, viewportRect.y + viewportRect.height * 0.5);
  await page.mouse.wheel(0, -320);
  const gestureZoomed = await page.evaluate(() => window.cashflowDebug.getExperience().camera);
  assert.ok(gestureZoomed.scale > wheelBase.scale, `wheel zoom did not increase scale: ${JSON.stringify({ gestureDragged, wheelBase, gestureZoomed })}`);
  await page.locator("#focusPlayer").click();
  const gestureFocused = await page.evaluate(() => window.cashflowDebug.getExperience().camera);
  assert.equal(gestureFocused.follow, true, "Find Player should restore camera follow");
  await page.evaluate(() => window.cashflowDebug.rollFixed(1));
  await page.waitForFunction(() => {
    const experience = window.cashflowDebug.getExperience();
    return !experience.isRolling && !experience.isMoving;
  });
  await page.evaluate(() => window.cashflowDebug.closeModal());
  const cameraAfterManualMove = await page.evaluate(() => window.cashflowDebug.getExperience().camera);
  assert.equal(cameraAfterManualMove.follow, true);
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
  await page.evaluate(() => window.cashflowDebug.closeModal());
  assert.deepEqual(consoleErrors, []);

  for (const viewport of [
    { width: 320, height: 568 },
    { width: 375, height: 667 },
    { width: 390, height: 844 },
    { width: 430, height: 932 },
    { width: 768, height: 1024 },
    { width: 1024, height: 768 },
    { width: 1280, height: 720 },
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
      diceBox: document.querySelector(".turn-card .dice-box")?.getBoundingClientRect().toJSON(),
      rollText: document.querySelector("#rollDice")?.textContent,
      writingMode: getComputedStyle(document.querySelector("#rollDice")).writingMode,
      whiteSpace: getComputedStyle(document.querySelector("#rollDice")).whiteSpace,
      wordBreak: getComputedStyle(document.querySelector("#rollDice")).wordBreak,
      toolbar: document.querySelector(".map-toolbar")?.getBoundingClientRect().toJSON(),
      player: document.querySelector("#avatarAnchor")?.getBoundingClientRect().toJSON(),
    }));
    assert.equal(overflow.hasMap, true);
    assert.equal(overflow.hasHud, true);
    assert.equal(overflow.writingMode, "horizontal-tb");
    assert.equal(overflow.whiteSpace, "nowrap");
    assert.equal(overflow.wordBreak, "keep-all");
    assert.ok(overflow.roll.width > overflow.roll.height, `${viewport.width}px roll button became vertical`);
    assert.ok(overflow.board.height >= viewport.height * 0.45, `${viewport.width}px board too short`);
    assert.ok(overflow.hud.height <= Math.max(230, viewport.height * 0.28), `${viewport.width}px HUD too tall`);
    assert.ok(overflow.hud.top >= overflow.board.top + overflow.board.height * 0.58 || overflow.hud.top >= viewport.height - 180, `${viewport.width}px HUD covers board center`);
    assert.ok(
      overflow.roll.bottom <= viewport.height - 4,
      `${viewport.width}px roll button too close to bottom: ${JSON.stringify({ roll: overflow.roll, diceBox: overflow.diceBox, hud: overflow.hud, viewport })}`,
    );
    assert.ok(overflow.toolbar.height <= (viewport.width < 761 ? 46 : 64), `${viewport.width}px map toolbar too tall`);
    assert.ok(overflow.toolbar.width <= Math.min(viewport.width - 16, viewport.width < 761 ? 190 : 260), `${viewport.width}px map toolbar too wide`);
    assert.ok(overflow.player.bottom < overflow.hud.top - 6 || viewport.width >= 761, `${viewport.width}px HUD covers player: ${JSON.stringify({ player: overflow.player, hud: overflow.hud, board: overflow.board })}`);
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

  await page.emulateMedia({ reducedMotion: "no-preference" });
  for (const viewport of [
    { width: 320, height: 568 },
    { width: 390, height: 844 },
    { width: 768, height: 1024 },
    { width: 1024, height: 768 },
  ]) {
    await page.setViewportSize(viewport);
    await page.evaluate(() => {
      window.cashflowDebug.closeModal();
      window.cashflowDebug.setState({
        career: { id: "teacher", icon: "师", name: "小学老师", salary: 32000, expenses: 23000, savings: 30000 },
        month: 1,
        round: 1,
        position: 0,
        cash: 60000,
        salary: 32000,
        baseExpenses: 23000,
        assets: [],
        liabilities: [],
        logs: [],
      });
      window.scrollTo(0, document.body.scrollHeight);
      window.__rollDone = false;
      window.cashflowDebug.rollFixed(6).then(() => {
        window.__rollDone = true;
      });
    });
    await page.waitForFunction(() => window.cashflowDebug.getExperience().turnPhase === "moving", null, { timeout: 5000 });
    const movingLayout = await page.evaluate(() => {
      const board = document.querySelector(".board")?.getBoundingClientRect();
      const player = document.querySelector("#avatarAnchor")?.getBoundingClientRect();
      const hud = document.querySelector(".turn-card")?.getBoundingClientRect();
      const roll = document.querySelector("#rollDice")?.getBoundingClientRect();
      return {
        phase: window.cashflowDebug.getExperience().turnPhase,
        camera: window.cashflowDebug.getExperience().camera,
        stageTransform: getComputedStyle(document.querySelector("#cityMapStage")).transform,
        stageTransforms: [...document.querySelectorAll("#cityMapStage")].map((stage) => ({
          inline: stage.style.transform,
          computed: getComputedStyle(stage).transform,
          rect: stage.getBoundingClientRect().toJSON(),
        })),
        modalHidden: document.querySelector("#cardModal").classList.contains("hidden"),
        scrollY: window.scrollY,
        boardTop: board?.top || 0,
        boardBottom: board?.bottom || 0,
        playerTop: player?.top || 0,
        playerBottom: player?.bottom || 0,
        playerLeft: player?.left || 0,
        playerRight: player?.right || 0,
        hudTop: hud?.top || 0,
        rollWidth: roll?.width || 0,
        rollHeight: roll?.height || 0,
        text: document.querySelector("#rollDice")?.textContent || "",
        writingMode: getComputedStyle(document.querySelector("#rollDice")).writingMode,
      };
    });
    assert.equal(movingLayout.phase, "moving");
    assert.equal(movingLayout.modalHidden, true, `${viewport.width}px event opened before movement finished: ${JSON.stringify(movingLayout)}`);
    assert.ok(movingLayout.boardTop < viewport.height * 0.45, `${viewport.width}px board not brought into view`);
    assert.ok(movingLayout.playerTop >= 0 && movingLayout.playerBottom <= Math.min(viewport.height, movingLayout.hudTop - 4), `${viewport.width}px moving player not visible: ${JSON.stringify(movingLayout)}`);
    assert.ok(
      movingLayout.playerLeft >= -8 && movingLayout.playerRight <= viewport.width + 8,
      `${viewport.width}px player outside horizontal viewport: ${JSON.stringify(movingLayout)}`,
    );
    assert.ok(movingLayout.rollWidth > movingLayout.rollHeight, `${viewport.width}px moving roll text became vertical`);
    assert.equal(movingLayout.writingMode, "horizontal-tb");
    assert.match(movingLayout.text, /前进|前進|Moving/);
    await page.waitForFunction(() => window.__rollDone === true, null, { timeout: 8000 });
    const afterRoll = await page.evaluate(() => ({
      modalHidden: document.querySelector("#cardModal").classList.contains("hidden"),
      phase: window.cashflowDebug.getExperience().turnPhase,
      playerVisible: (() => {
        const player = document.querySelector("#avatarAnchor")?.getBoundingClientRect();
        const hud = document.querySelector(".turn-card")?.getBoundingClientRect();
        return Boolean(player && hud && player.top >= 0 && player.bottom <= hud.top - 4);
      })(),
    }));
    assert.equal(afterRoll.modalHidden, false, `${viewport.width}px event did not open after movement`);
    assert.equal(afterRoll.playerVisible, true, `${viewport.width}px player hidden after arrival`);
    await page.evaluate(() => window.cashflowDebug.closeModal());
  }
  await page.emulateMedia({ reducedMotion: "reduce" });

  for (const viewport of [
    { width: 320, height: 568 },
    { width: 375, height: 667 },
    { width: 390, height: 844 },
    { width: 430, height: 932 },
    { width: 768, height: 1024 },
    { width: 1024, height: 768 },
  ]) {
    await page.setViewportSize(viewport);
    await page.evaluate(() => {
      window.cashflowDebug.closeModal();
      window.cashflowDebug.setState({
        career: { id: "teacher", icon: "师", name: "小学老师", salary: 32000, expenses: 23000, savings: 30000 },
        month: 2,
        round: 11,
        position: 0,
        cash: 120000,
        salary: 32000,
        baseExpenses: 23000,
        assets: [],
        liabilities: [],
        logs: [],
      });
    });
    const rolls = [1, 2, 3, 4, 5, 6, 1, 2, 3, 4];
    for (const [index, roll] of rolls.entries()) {
      await page.waitForFunction(() => {
        const experience = window.cashflowDebug.getExperience();
        return experience.canRoll && !experience.rollDisabled && experience.modalHidden;
      }, null, { timeout: 5000 });
      const beforeClick = await page.evaluate(() => {
        const button = document.querySelector("#rollDice");
        const rect = button.getBoundingClientRect();
        const blocker = document.elementFromPoint(rect.left + rect.width / 2, rect.top + rect.height / 2);
        return {
          disabled: button.disabled,
          pointerEvents: getComputedStyle(button).pointerEvents,
          writingMode: getComputedStyle(button).writingMode,
          width: rect.width,
          height: rect.height,
          blockedBy: blocker?.id || blocker?.className || blocker?.tagName || "",
          buttonAtPoint: Boolean(blocker?.closest?.("#rollDice")),
          diceNodes: document.querySelectorAll(".dice3d").length,
          modalOpen: !document.querySelector("#cardModal").classList.contains("hidden"),
        };
      });
      assert.equal(beforeClick.disabled, false, `${viewport.width}px roll ${index + 1} disabled before click`);
      assert.equal(beforeClick.pointerEvents, "auto", `${viewport.width}px roll ${index + 1} pointer-events blocked`);
      assert.equal(beforeClick.writingMode, "horizontal-tb", `${viewport.width}px roll ${index + 1} writing mode`);
      assert.ok(beforeClick.width > beforeClick.height, `${viewport.width}px roll ${index + 1} became vertical`);
      assert.equal(beforeClick.buttonAtPoint, true, `${viewport.width}px roll ${index + 1} blocked by ${beforeClick.blockedBy}`);
      assert.ok(beforeClick.diceNodes <= 1, `${viewport.width}px dice DOM accumulated before roll ${index + 1}`);
      assert.equal(beforeClick.modalOpen, false, `${viewport.width}px modal still open before roll ${index + 1}`);

      await page.evaluate((nextRoll) => {
        window.__rollDone = false;
        window.cashflowDebug.rollFixed(nextRoll).then(() => {
          window.__rollDone = true;
        });
        window.cashflowDebug.rollFixed(nextRoll);
      }, roll);
      await page.waitForFunction(() => window.__rollDone === true, null, { timeout: 8000 });
      const afterMovement = await page.evaluate(() => window.cashflowDebug.getExperience());
      assert.equal(afterMovement.isRolling, false, `${viewport.width}px roll ${index + 1} still rolling`);
      assert.equal(afterMovement.isMoving, false, `${viewport.width}px roll ${index + 1} still moving`);
      await page.evaluate(() => {
        if (!document.querySelector("#cardModal").classList.contains("hidden")) window.cashflowDebug.closeModal();
      });
      await page.waitForFunction(() => {
        const experience = window.cashflowDebug.getExperience();
        return experience.canRoll && !experience.rollDisabled && experience.turnPhase === "idle" && experience.modalHidden;
      }, null, { timeout: 5000 });
      const afterClose = await page.evaluate(() => {
        const button = document.querySelector("#rollDice");
        return {
          experience: window.cashflowDebug.getExperience(),
          disabled: button.disabled,
          text: button.textContent,
          diceNodes: document.querySelectorAll(".dice3d").length,
          overlays: [...document.querySelectorAll(".modal, .tutorial-overlay, .finance-effect")]
            .filter((node) => getComputedStyle(node).pointerEvents !== "none" && !node.classList.contains("hidden")).length,
        };
      });
      assert.equal(afterClose.disabled, false, `${viewport.width}px roll ${index + 1} did not recover`);
      assert.equal(afterClose.experience.canRoll, true, `${viewport.width}px state did not recover after roll ${index + 1}`);
      assert.match(afterClose.text, /掷骰|擲骰|Roll/i, `${viewport.width}px roll ${index + 1} text not ready`);
      assert.ok(afterClose.diceNodes <= 1, `${viewport.width}px dice DOM accumulated after roll ${index + 1}`);
      assert.equal(afterClose.overlays, 0, `${viewport.width}px transparent overlay remained after roll ${index + 1}`);
    }
  }

  const iphoneRealTurns = await playRealRollSequence(page, {
    viewport: { width: 390, height: 844 },
    label: "iPhone 390",
    rolls: Array.from({ length: 15 }, () => 1),
    actionMode: "mixed",
  });
  assert.equal(iphoneRealTurns.turns.length, 15);
  assert.equal(iphoneRealTurns.rejectedOpportunity, true, "iPhone flow did not cover reject / keep-cash path");
  assert.equal(iphoneRealTurns.purchaseCompleted, true, "iPhone flow did not cover a normal purchase path");
  assert.equal(iphoneRealTurns.maxDiceNodes <= 1, true, "iPhone flow accumulated dice DOM");

  const ipadRealTurns = await playRealRollSequence(page, {
    viewport: { width: 768, height: 1024 },
    label: "iPad 768",
    rolls: Array.from({ length: 15 }, () => 1),
    actionMode: "mixed",
  });
  assert.equal(ipadRealTurns.turns.length, 15);
  assert.equal(ipadRealTurns.rejectedOpportunity, true, "iPad flow did not cover reject / keep-cash path");
  assert.equal(ipadRealTurns.purchaseCompleted, true, "iPad flow did not cover a normal purchase path");
  assert.equal(ipadRealTurns.maxDiceNodes <= 1, true, "iPad flow accumulated dice DOM");

  const desktopRealTurns = await playRealRollSequence(page, {
    viewport: { width: 1440, height: 900 },
    label: "Desktop 1440",
    rolls: Array.from({ length: 15 }, () => 1),
    actionMode: "mixed",
  });
  assert.equal(desktopRealTurns.turns.length, 15);
  assert.equal(desktopRealTurns.maxDiceNodes <= 1, true, "Desktop flow accumulated dice DOM");

  const saveFailureRecovery = await playSingleTurnWithSaveFailure(page, { width: 390, height: 844 });
  assert.equal(saveFailureRecovery.disabled, false, `Save failure left roll disabled: ${JSON.stringify(saveFailureRecovery)}`);
  assert.equal(saveFailureRecovery.experience.canRoll, true, `Save failure left canRoll false: ${JSON.stringify(saveFailureRecovery)}`);
  assert.equal(saveFailureRecovery.experience.turnPhase, "idle", `Save failure left phase stuck: ${JSON.stringify(saveFailureRecovery)}`);

  for (const viewport of [
    { width: 320, height: 568 },
    { width: 375, height: 667 },
    { width: 390, height: 844 },
    { width: 430, height: 932 },
    { width: 768, height: 1024 },
    { width: 1024, height: 768 },
    { width: 1280, height: 720 },
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

async function expectModalText(page, text) {
  await page.locator("#cardModal").getByText(text).first().waitFor({ state: "visible" });
}

async function runEnglishI18nSmoke(page) {
  await assertEnglishUiClean(page, "English home");
  await page.locator("#startAdventure").click();
  await expectModalText(page, "Choose Players");
  await assertEnglishUiClean(page, "English player count setup modal");
  await page.locator("[data-start-player-count='1']").click();
  await expectText(page, "Hot-seat");
  assert.equal(await page.locator(".local-player-card").count(), 1);
  await assertEnglishUiClean(page, "English new adventure setup");
  await page.locator('[data-career="designer"]').click();
  await expectText(page, "Freelance Designer");
  await expectText(page, "Difficulty: Standard");
  await expectText(page, "Mode: Single Player Learning");
  await assertEnglishUiClean(page, "English character selection");

  await page.locator("#startSelectedCareer").click();
  await expectText(page, "You are playing as a Freelance Designer on Standard difficulty in Single Player Learning mode.");
  await assertEnglishUiClean(page, "English start modal");
  await page.selectOption("#topLocaleSelect", "zh-CN");
  await page.selectOption("#topLocaleSelect", "en");
  await expectText(page, "You are playing as a Freelance Designer on Standard difficulty in Single Player Learning mode.");
  await assertEnglishUiClean(page, "English start modal after locale switch");
  await page.evaluate(() => window.cashflowDebug.closeModal());

  await page.evaluate(() => window.cashflowDebug.showGlossary());
  await expectModalText(page, "Monthly Cash Flow");
  await assertEnglishUiClean(page, "English glossary list");
  await assertNoInternalGlossaryTokens(page, "English glossary list");
  await page.evaluate(() => window.cashflowDebug.showGlossary("passiveIncome"));
  await expectModalText(page, "Income that may continue without constant work.");
  await assertEnglishUiClean(page, "English glossary detail");
  await assertNoInternalGlossaryTokens(page, "English glossary detail");
  await page.evaluate(() => window.cashflowDebug.closeModal());

  await page.evaluate(() => window.cashflowDebug.showSoundSettings());
  await expectText(page, "Sound Settings");
  await assertEnglishUiClean(page, "English sound settings");
  await page.evaluate(() => window.cashflowDebug.closeModal());

  await page.evaluate(() => window.cashflowDebug.showFeedbackPanel());
  await expectText(page, "Report a Cashflow Issue");
  await assertEnglishUiClean(page, "English bug report");
  await page.locator("#feedbackSummary").fill("The roll button stayed disabled.");
  await page.selectOption("#topLocaleSelect", "zh-TW");
  await page.selectOption("#topLocaleSelect", "en");
  await assert.equal(await page.locator("#feedbackSummary").inputValue(), "The roll button stayed disabled.");
  await assertEnglishUiClean(page, "English bug report after locale switch");
  await page.evaluate(() => window.cashflowDebug.closeModal());

  await page.evaluate(() => window.cashflowDebug.showReleaseNotes());
  await expectText(page, "Public Beta Notes");
  await assertEnglishUiClean(page, "English release notes");
  await page.evaluate(() => window.cashflowDebug.closeModal());

  await page.evaluate(() => window.cashflowDebug.showParentGuide());
  await expectText(page, "Parent / Teacher Guide");
  await assertEnglishUiClean(page, "English parent guide");
  await page.evaluate(() => window.cashflowDebug.closeModal());

  await page.waitForTimeout(360);
  await assertEnglishUiClean(page, "English pre-roll tutorial");
  await resolveModalUntilReady(page, "reject");
  await installDeterministicRoll(page, 1);
  await waitForRollReady(page, "English smoke before roll");
  await assertEnglishFinancialSurfaces(page);
  const before = await rollButtonSnapshot(page);
  await page.mouse.click(before.center.x, before.center.y);
  await page.waitForFunction(() => {
    const experience = window.cashflowDebug.getExperience();
    return !experience.isRolling && !experience.isMoving && !["rolling", "diceResult", "preparingMove", "moving", "arriving"].includes(experience.turnPhase);
  }, null, { timeout: 12000 });
  await assertEnglishUiClean(page, "English event card");
  await resolveModalUntilReady(page, "reject");
  await waitForRollReady(page, "English smoke after event");
  await restoreRandom(page);
}

async function verifyStartAdventureEntry(page, viewport) {
  await page.setViewportSize(viewport);
  await page.evaluate(() => {
    localStorage.clear();
    window.__cashflowStartTrace = [];
  });
  await page.reload({ waitUntil: "networkidle" });
  await page.evaluate(() => { window.__cashflowStartTrace = []; });
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.selectOption("#topLocaleSelect", "zh-CN");
  await page.selectOption("#topLocaleSelect", "en");
  await page.selectOption("#topLocaleSelect", "zh-CN");
  await page.evaluate(() => window.scrollTo(0, 0));
  const before = await page.evaluate(() => {
    const button = document.querySelector("#startAdventure");
    const rect = button?.getBoundingClientRect();
    const points = rect ? {
      center: { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 },
      topLeft: { x: rect.left + 5, y: rect.top + 5 },
      topRight: { x: rect.right - 5, y: rect.top + 5 },
      bottomLeft: { x: rect.left + 5, y: rect.bottom - 5 },
      bottomRight: { x: rect.right - 5, y: rect.bottom - 5 },
    } : {};
    const pointTargets = Object.fromEntries(Object.entries(points).map(([key, point]) => {
      const target = document.elementFromPoint(point.x, point.y);
      return [key, {
        id: target?.id || "",
        className: typeof target?.className === "string" ? target.className : "",
        tag: target?.tagName || "",
        closestStart: Boolean(target?.closest?.("#startAdventure")),
      }];
    }));
    const top = points.center ? document.elementFromPoint(points.center.x, points.center.y) : null;
    const heroTitle = document.querySelector(".home-hero h1")?.getBoundingClientRect();
    const actions = document.querySelector(".intro-actions")?.getBoundingClientRect();
    const secondary = document.querySelector(".intro-secondary-actions")?.getBoundingClientRect();
    const logo = document.querySelector(".game-logo")?.getBoundingClientRect();
    const overlaps = (a, b) => Boolean(a && b && a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top);
    return {
      exists: Boolean(button),
      disabled: Boolean(button?.disabled),
      pointerEvents: button ? getComputedStyle(button).pointerEvents : "",
      rect: rect?.toJSON(),
      pointTargets,
      topId: top?.id || "",
      topClass: typeof top?.className === "string" ? top.className : "",
      topClosestStart: Boolean(top?.closest?.("#startAdventure")),
      modalHidden: document.querySelector("#cardModal")?.classList.contains("hidden"),
      hiddenModalDisplay: getComputedStyle(document.querySelector("#cardModal")).display,
      titleActionOverlap: overlaps(heroTitle, actions),
      titleSecondaryOverlap: overlaps(heroTitle, secondary),
      logoActionOverlap: overlaps(logo, actions),
      logoSecondaryOverlap: overlaps(logo, secondary),
      width: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
    };
  });
  assert.equal(before.exists, true, `${viewport.width}px start button missing`);
  assert.equal(before.disabled, false, `${viewport.width}px start button disabled`);
  assert.equal(before.pointerEvents, "auto", `${viewport.width}px start button pointer-events`);
  assert.equal(before.topClosestStart, true, `${viewport.width}px start button blocked by ${before.topId || before.topClass}`);
  for (const [point, target] of Object.entries(before.pointTargets)) {
    assert.equal(target.closestStart, true, `${viewport.width}px start button ${point} blocked by ${target.tag}#${target.id}.${target.className}`);
  }
  assert.equal(before.modalHidden, true, `${viewport.width}px hidden modal is open before start`);
  assert.equal(before.hiddenModalDisplay, "none", `${viewport.width}px hidden modal still captures layout`);
  assert.equal(before.titleActionOverlap, false, `${viewport.width}px start actions overlap title`);
  assert.equal(before.titleSecondaryOverlap, false, `${viewport.width}px secondary actions overlap title`);
  assert.equal(before.logoActionOverlap, false, `${viewport.width}px start actions overlap logo`);
  assert.equal(before.logoSecondaryOverlap, false, `${viewport.width}px secondary actions overlap logo`);
  assert.ok(before.width <= before.clientWidth + 1, `${viewport.width}px home overflow before start`);

  await page.locator("#startAdventure").tap();
  await page.waitForFunction(() => {
    const modal = document.querySelector("#cardModal");
    const card = modal?.querySelector(".modal-card");
    return modal && card && !modal.classList.contains("hidden") && card.dataset.panel === "start-setup" && card.getBoundingClientRect().width > 0;
  });
  const modalState = await page.evaluate(() => ({
    modalHidden: document.querySelector("#cardModal")?.classList.contains("hidden"),
    panel: document.querySelector("#cardModal .modal-card")?.dataset.panel || "",
    title: document.querySelector("#modalTitle")?.textContent || "",
    actionButtons: document.querySelectorAll("[data-start-player-count]").length,
    firstActionVisible: document.querySelector("[data-start-player-count='1']")?.getBoundingClientRect().width > 0,
    trace: window.__cashflowStartTrace || [],
    width: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
  }));
  assert.equal(modalState.modalHidden, false, `${viewport.width}px start setup modal did not open`);
  assert.equal(modalState.panel, "start-setup", `${viewport.width}px wrong start setup panel`);
  assert.equal(modalState.actionButtons, 4, `${viewport.width}px player count actions missing`);
  assert.equal(modalState.firstActionVisible, true, `${viewport.width}px first player count action hidden`);
  assert.ok(modalState.trace.some((item) => item.code === "START_BUTTON_CLICK"), `${viewport.width}px start click trace missing`);
  assert.ok(modalState.trace.some((item) => item.code === "BEGIN_ADVENTURE_ENTER"), `${viewport.width}px begin adventure trace missing`);
  assert.ok(modalState.trace.some((item) => item.code === "PLAYER_SETUP_VISIBLE"), `${viewport.width}px setup visible trace missing`);
  assert.ok(modalState.width <= modalState.clientWidth + 1, `${viewport.width}px modal overflow after start`);

  await page.locator("[data-start-player-count='1']").click();
  await page.waitForFunction(() => document.querySelector(".local-setup-panel") && document.querySelectorAll(".career-thumb").length === 4);
  const after = await page.evaluate(() => ({
    modalHidden: document.querySelector("#cardModal")?.classList.contains("hidden"),
    localCards: document.querySelectorAll(".local-player-card").length,
    careerThumbs: document.querySelectorAll(".career-thumb").length,
    focusedSelection: document.body.classList.contains("selection-active"),
    trace: window.__cashflowStartTrace || [],
    width: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
  }));
  assert.equal(after.modalHidden, true, `${viewport.width}px start opened blocking modal`);
  assert.equal(after.localCards, 1, `${viewport.width}px default start should show 1 player`);
  assert.equal(after.careerThumbs, 4, `${viewport.width}px career setup missing`);
  assert.equal(after.focusedSelection, true, `${viewport.width}px start did not enter setup`);
  assert.ok(after.trace.some((item) => item.code === "PLAYER_SETUP_RENDER_DONE" && item.count === 1), `${viewport.width}px 1P setup render trace missing`);
  assert.ok(after.width <= after.clientWidth + 1, `${viewport.width}px setup overflow after start`);

  await page.locator("[data-local-count='2']").click();
  assert.equal(await page.locator(".local-player-card").count(), 2, `${viewport.width}px 2P setup did not render`);
  await page.locator("[data-local-count='4']").click();
  assert.equal(await page.locator(".local-player-card").count(), 4, `${viewport.width}px 4P setup did not render`);
}

async function assertEnglishFinancialSurfaces(page) {
  for (const [selector, label] of [
    [".turn-card", "English HUD"],
    [".finance-grid", "English finance grid"],
    ["#bankSection", "English bank panel"],
    ["#lifeSection", "English life and insurance panel"],
    ["#realEstateSection", "English real estate panel"],
    ["#stockSection", "English stock panel"],
    ["#businessSection", "English business panel"],
  ]) {
    await page.locator(selector).scrollIntoViewIfNeeded();
    await assertEnglishUiClean(page, label);
  }
  await page.locator("#openBankCenter").click();
  await expectModalText(page, "Banking & Loans");
  await assertEnglishUiClean(page, "English bank center modal");
  await page.evaluate(() => window.cashflowDebug.closeModal());
}

async function assertEnglishUiClean(page, label) {
  const scan = await page.evaluate(() => {
    const isVisible = (node) => {
      if (!node?.parentElement) return false;
      const parent = node.parentElement;
      if (parent.closest("script, style, select, option, template")) return false;
      if (parent.closest("[aria-hidden='true']")) return false;
      const style = getComputedStyle(parent);
      if (style.display === "none" || style.visibility === "hidden") return false;
      const rect = parent.getBoundingClientRect();
      return rect.width > 0 && rect.height > 0;
    };
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    const describe = (element) => {
      const parts = [];
      let node = element;
      while (node && node !== document.body && parts.length < 4) {
        const id = node.id ? `#${node.id}` : "";
        const classes = typeof node.className === "string" && node.className.trim()
          ? `.${node.className.trim().split(/\s+/).slice(0, 3).join(".")}`
          : "";
        parts.unshift(`${node.tagName.toLowerCase()}${id}${classes}`);
        node = node.parentElement;
      }
      return parts.join(" > ");
    };
    const snippets = [];
    let current;
    while ((current = walker.nextNode())) {
      const text = current.textContent.replace(/\s+/g, " ").trim();
      if (!text || !isVisible(current)) continue;
      if (/[\u3400-\u9fff]/.test(text) || /(?:undefined|\[object Object\]|Translation unavailable)/i.test(text) || /\b(?:ui|home|hud|finance|setup|glossary|settings|feedback|release|pwa|modal)\.[a-z0-9_.-]+/i.test(text)) {
        snippets.push(`${describe(current.parentElement)} :: ${text.slice(0, 180)}`);
      }
    }
    return {
      snippets,
      missingEnglish: window.__cashflowMissingEnglishText || [],
      overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
      width: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
    };
  });
  assert.deepEqual(scan.snippets, [], `${label} has untranslated or mixed text: ${JSON.stringify(scan.snippets.slice(0, 12))}; missing=${JSON.stringify(scan.missingEnglish.slice(-20))}`);
  assert.equal(scan.overflow, false, `${label} horizontal overflow: ${scan.width} > ${scan.clientWidth}`);
}

async function assertNoInternalGlossaryTokens(page, label) {
  const text = await page.locator("#cardModal").innerText();
  assert.doesNotMatch(text, /(?:^|\n|\s)(?:¥ Cash|In Income|Ex Expenses|Flow Monthly Cash Flow)(?:\n|\s|$)/, `${label} exposes glossary internals: ${text}`);
}

async function playRealRollSequence(page, { viewport, label, rolls, actionMode = "reject" }) {
  await page.setViewportSize(viewport);
  await page.evaluate(() => {
    localStorage.clear();
    window.cashflowDebug.closeModal();
    window.cashflowDebug.setState({
      career: { id: "teacher", icon: "师", name: "小学老师", salary: 32000, expenses: 23000, savings: 30000 },
      month: 1,
      round: 1,
      position: 0,
      cash: 180000,
      salary: 32000,
      baseExpenses: 23000,
      assets: [],
      liabilities: [],
      logs: [],
    });
    window.scrollTo(0, 0);
  });

  const result = {
    turns: [],
    rejectedOpportunity: false,
    purchaseCompleted: false,
    maxDiceNodes: 0,
  };

  try {
    for (const [index, roll] of rolls.entries()) {
      await waitForRollReady(page, `${label} turn ${index + 1} before click`);
      await installDeterministicRoll(page, roll);
      const before = await rollButtonSnapshot(page);
      assert.equal(before.disabled, false, `${label} turn ${index + 1} disabled before click: ${JSON.stringify(before)}`);
      assert.equal(before.pointerEvents, "auto", `${label} turn ${index + 1} pointer-events blocked: ${JSON.stringify(before)}`);
      assert.equal(before.writingMode, "horizontal-tb", `${label} turn ${index + 1} writing mode: ${JSON.stringify(before)}`);
      assert.ok(before.width > before.height, `${label} turn ${index + 1} roll button became vertical: ${JSON.stringify(before)}`);
      assert.equal(before.buttonAtPoint, true, `${label} turn ${index + 1} roll button blocked by ${before.blockedBy}`);

      const clickPoint = before.center;
      await page.mouse.click(clickPoint.x, clickPoint.y);
      if (index === 0) {
        await page.mouse.click(clickPoint.x, clickPoint.y);
      }

      await page.waitForFunction(() => {
        const experience = window.cashflowDebug.getExperience();
        return !experience.isRolling && !experience.isMoving && !["rolling", "diceResult", "preparingMove", "moving", "arriving"].includes(experience.turnPhase);
      }, null, { timeout: 12000 });

      const modalActions = await resolveModalUntilReady(page, actionMode);
      result.rejectedOpportunity = result.rejectedOpportunity || modalActions.some((action) => /放弃|放棄|保留|先不买|先不買|Pass|Keep/i.test(action));
      result.purchaseCompleted = result.purchaseCompleted || modalActions.some((action) => /买入|買入|投资|投資|购买|購買|Purchase|Invest|Buy/i.test(action));

      await waitForRollReady(page, `${label} turn ${index + 1} after modal`);
      const after = await turnRecoverySnapshot(page);
      result.maxDiceNodes = Math.max(result.maxDiceNodes, after.diceNodes);
      assert.equal(after.disabled, false, `${label} turn ${index + 1} did not recover: ${JSON.stringify(after)}`);
      assert.equal(after.experience.canRoll, true, `${label} turn ${index + 1} canRoll stayed false: ${JSON.stringify(after)}`);
      assert.equal(after.experience.turnPhase, "idle", `${label} turn ${index + 1} phase stuck: ${JSON.stringify(after)}`);
      assert.equal(after.experience.isRolling, false, `${label} turn ${index + 1} rolling flag stuck`);
      assert.equal(after.experience.isMoving, false, `${label} turn ${index + 1} moving flag stuck`);
      assert.equal(after.modalHidden, true, `${label} turn ${index + 1} modal still visible`);
      assert.ok(after.diceNodes <= 1, `${label} turn ${index + 1} dice DOM accumulated: ${JSON.stringify(after)}`);
      assert.equal(after.overlayBlockers.length, 0, `${label} turn ${index + 1} overlay blocked interaction: ${JSON.stringify(after.overlayBlockers)}`);
      assert.ok(after.playerVisible, `${label} turn ${index + 1} player not visible after roll: ${JSON.stringify(after)}`);
      result.turns.push(after);
    }
  } finally {
    await restoreRandom(page);
  }
  return result;
}

async function installDeterministicRoll(page, roll) {
  await page.evaluate((rollValue) => {
    const normalizedRoll = Math.max(0.01, Math.min(0.98, (Math.max(1, Math.min(6, rollValue)) - 1) / 6 + 0.01));
    if (!window.__cashflowOriginalRandom) window.__cashflowOriginalRandom = Math.random;
    window.__cashflowRandomQueue = [normalizedRoll, 0.02, 0.04, 0.06, 0.08, 0.1, 0.12, 0.14];
    Math.random = () => (window.__cashflowRandomQueue.length ? window.__cashflowRandomQueue.shift() : 0.02);
  }, roll);
}

async function restoreRandom(page) {
  await page.evaluate(() => {
    if (window.__cashflowOriginalRandom) {
      Math.random = window.__cashflowOriginalRandom;
      delete window.__cashflowOriginalRandom;
    }
    delete window.__cashflowRandomQueue;
  });
}

async function playSingleTurnWithSaveFailure(page, viewport) {
  await page.setViewportSize(viewport);
  await page.evaluate(() => {
    localStorage.clear();
    window.cashflowDebug.closeModal();
    window.cashflowDebug.setState({
      career: { id: "teacher", icon: "师", name: "小学老师", salary: 32000, expenses: 23000, savings: 30000 },
      month: 1,
      round: 1,
      position: 0,
      cash: 180000,
      salary: 32000,
      baseExpenses: 23000,
      assets: [],
      liabilities: [],
      logs: [],
    });
    if (!window.__cashflowOriginalSetItem) window.__cashflowOriginalSetItem = Storage.prototype.setItem;
    let shouldFail = true;
    Storage.prototype.setItem = function setItemWithOneFailure(key, value) {
      if (shouldFail && String(key).includes("cashflow-game-save")) {
        shouldFail = false;
        throw new Error("simulated quota failure");
      }
      return window.__cashflowOriginalSetItem.call(this, key, value);
    };
  });
  try {
    await waitForRollReady(page, "save failure before click");
    await installDeterministicRoll(page, 1);
    const before = await rollButtonSnapshot(page);
    await page.mouse.click(before.center.x, before.center.y);
    await page.waitForFunction(() => {
      const experience = window.cashflowDebug.getExperience();
      return !experience.isRolling && !experience.isMoving && !["rolling", "diceResult", "preparingMove", "moving", "arriving"].includes(experience.turnPhase);
    }, null, { timeout: 12000 });
    await resolveModalUntilReady(page, "reject");
    await waitForRollReady(page, "save failure after modal");
    return await turnRecoverySnapshot(page);
  } finally {
    await restoreRandom(page);
    await page.evaluate(() => {
      if (window.__cashflowOriginalSetItem) {
        Storage.prototype.setItem = window.__cashflowOriginalSetItem;
        delete window.__cashflowOriginalSetItem;
      }
    });
  }
}

async function waitForRollReady(page, label) {
  await page.waitForFunction(() => {
    const experience = window.cashflowDebug.getExperience();
    return experience.canRoll && !experience.rollDisabled && experience.turnPhase === "idle" && experience.modalHidden;
  }, null, { timeout: 8000 }).catch(async (error) => {
    const snapshot = await turnRecoverySnapshot(page);
    throw new Error(`${label} did not become ready: ${error.message}; ${JSON.stringify(snapshot)}`);
  });
}

async function rollButtonSnapshot(page) {
  return page.evaluate(() => {
    const button = document.querySelector("#rollDice");
    const rect = button.getBoundingClientRect();
    const center = { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
    const blocker = document.elementFromPoint(center.x, center.y);
    return {
      disabled: button.disabled,
      text: button.textContent,
      pointerEvents: getComputedStyle(button).pointerEvents,
      writingMode: getComputedStyle(button).writingMode,
      width: rect.width,
      height: rect.height,
      center,
      blockedBy: blocker?.id || blocker?.className || blocker?.tagName || "",
      buttonAtPoint: Boolean(blocker?.closest?.("#rollDice")),
      experience: window.cashflowDebug.getExperience(),
    };
  });
}

async function turnRecoverySnapshot(page) {
  return page.evaluate(() => {
    const button = document.querySelector("#rollDice");
    const player = document.querySelector("#avatarAnchor")?.getBoundingClientRect();
    const hud = document.querySelector(".turn-card")?.getBoundingClientRect();
    const blockers = [...document.querySelectorAll(".modal, .tutorial-overlay, .finance-effect, .dice-flight-trail")]
      .filter((node) => {
        const style = getComputedStyle(node);
        return style.pointerEvents !== "none" && style.display !== "none" && style.visibility !== "hidden" && !node.classList.contains("hidden");
      })
      .map((node) => node.id || node.className || node.tagName);
    return {
      experience: window.cashflowDebug.getExperience(),
      disabled: button.disabled,
      text: button.textContent,
      modalHidden: document.querySelector("#cardModal").classList.contains("hidden"),
      modalTitle: document.querySelector("#modalTitle")?.textContent || "",
      modalType: document.querySelector("#modalType")?.textContent || "",
      modalActions: [...document.querySelectorAll("#modalActions button")].map((button) => button.textContent || ""),
      diceNodes: document.querySelectorAll(".dice3d").length,
      overlayBlockers: blockers,
      playerVisible: Boolean(player && player.top >= -8 && player.left >= -8 && player.right <= window.innerWidth + 8 && (!hud || player.bottom <= hud.top + 8 || player.bottom <= window.innerHeight)),
      scroll: { x: window.scrollX, y: window.scrollY },
      viewport: { width: window.innerWidth, height: window.innerHeight },
    };
  });
}

async function resolveModalUntilReady(page, actionMode) {
  const actionsTaken = [];
  for (let attempt = 0; attempt < 8; attempt += 1) {
    const modal = await page.evaluate(() => {
      const root = document.querySelector("#cardModal");
      const hidden = root.classList.contains("hidden");
      return {
        hidden,
        title: document.querySelector("#modalTitle")?.textContent || "",
        type: document.querySelector("#modalType")?.textContent || "",
        text: document.querySelector("#modalText")?.textContent || "",
        buttons: [...document.querySelectorAll("#modalActions button")].map((button, index) => ({
          index,
          text: button.textContent || "",
          disabled: button.disabled,
        })),
      };
    });
    if (modal.hidden) break;

    const choice = chooseModalAction(modal, actionMode);
    if (choice?.index >= 0) {
      actionsTaken.push(choice.text);
      await page.locator("#modalActions button").nth(choice.index).click({ timeout: 2500 });
    } else {
      actionsTaken.push("close");
      await page.locator("#closeModal").click({ timeout: 2500 });
    }
    await page.waitForTimeout(260);
    const ready = await page.evaluate(() => {
      const experience = window.cashflowDebug.getExperience();
      return experience.canRoll && !experience.rollDisabled && experience.modalHidden;
    });
    if (ready) break;
  }
  return actionsTaken;
}

function chooseModalAction(modal, actionMode) {
  const enabled = modal.buttons.filter((button) => !button.disabled);
  const avoid = /为什么|為什麼|why|提示|hint|词典|詞典|查看|詳情|详情|打开|開啟|Open/i;
  const safeEnabled = enabled.filter((button) => !avoid.test(button.text));
  if (actionMode === "mixed") {
    const buy = safeEnabled.find((button) => /买入|買入|投资|投資|购买|購買|Purchase|Invest|Buy/i.test(button.text));
    if (buy && /股票|股|Stock/i.test(`${modal.type} ${modal.title} ${modal.text} ${buy.text}`)) return buy;
  }
  return (
    safeEnabled.find((button) => /放弃|放棄|保留|先不买|先不買|不买|不買|Pass|Keep/i.test(button.text)) ||
    safeEnabled.find((button) => /支付|完成|知道了|太好了|关闭|關閉|确认|確認|继续|繼續|Done|Close|OK|Continue/i.test(button.text)) ||
    safeEnabled[0] ||
    null
  );
}
