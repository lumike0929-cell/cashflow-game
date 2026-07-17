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
  const roleCount = await page.locator(".career-card").count();
  assert.equal(roleCount, 4);
  for (const roleName of ["小学老师", "软件工程师", "自由设计师", "牙科医生"]) {
    await expectText(page, roleName);
  }
  await page.getByText("牙科医生").click();
  await page.evaluate(() => window.cashflowDebug.closeModal());
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

  const moods = ["happy", "excited", "worried", "sad", "thinking"];
  for (const mood of moods) {
    await page.evaluate((nextMood) => window.cashflowDebug.setEmotion(nextMood, 0), mood);
    const renderedMood = await page.evaluate(() => window.cashflowDebug.getExperience().avatarMood);
    assert.equal(renderedMood, mood);
  }

  await page.evaluate(() => window.cashflowDebug.playIncomeEffect());
  await page.waitForSelector(".finance-effect.positive");
  await page.evaluate(() => window.cashflowDebug.playExpenseEffect());
  await page.waitForSelector(".finance-effect.negative");

  await page.evaluate(() => window.cashflowDebug.toggleMusic());
  await page.evaluate(() => window.cashflowDebug.toggleHaptics());
  await page.evaluate(() => window.cashflowDebug.toggleAnimationSpeed());
  await page.evaluate(() => window.cashflowDebug.dispatchVisibility());
  const settingsAfterToggle = await page.evaluate(() => window.cashflowDebug.getExperience());
  assert.equal(typeof settingsAfterToggle.musicEnabled, "boolean");
  assert.equal(typeof settingsAfterToggle.hapticsEnabled, "boolean");
  assert.equal(settingsAfterToggle.animationSpeed, "fast");

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
  await page.evaluate(() => window.cashflowDebug.closeModal());
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
    await page.evaluate(() => window.cashflowDebug.closeModal());
  }

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
  await page.getByText("读取").click();
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
  assert.equal(result.insurancePolicies, 2);
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
  assert.deepEqual(consoleErrors, []);

  for (const viewport of [
    { width: 390, height: 844 },
    { width: 768, height: 1024 },
    { width: 1440, height: 900 },
  ]) {
    await page.setViewportSize(viewport);
    await page.reload({ waitUntil: "networkidle" });
    await page.getByText("读取").click();
    await page.evaluate(() => window.cashflowDebug.closeModal());
    const overflow = await page.evaluate(() => ({
      width: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
      hasMap: Boolean(document.querySelector(".city-map-viewport")),
      hasHud: Boolean(document.querySelector(".turn-card")),
    }));
    assert.equal(overflow.hasMap, true);
    assert.equal(overflow.hasHud, true);
    assert.ok(overflow.width <= overflow.clientWidth + 1, `${viewport.width}px overflow: ${overflow.width} > ${overflow.clientWidth}`);
  }
  console.log("Browser acceptance passed.");
} finally {
  await browser.close();
  await new Promise((resolve) => server.close(resolve));
}

async function expectText(page, text) {
  await page.getByText(text).first().waitFor({ state: "visible" });
}
