import { realEstateOpportunities } from "./realEstateData.js";
import {
  applyMortgagePayday,
  buyProperty,
  calculateEmergencyReserveMonths,
  calculateMonthlyCashflow,
  calculateNetWorth,
  calculateOpportunity,
  calculateOpportunityWithFinancing,
  calculatePassiveIncome,
  calculatePortfolioSummary,
  calculatePropertyCashflow,
  calculateSellPreview,
  calculateTotalExpenses,
  emergencyReserveRequiredMonths,
  ensureRealEstateState,
  sellProperty,
  syncMortgageLiabilities,
} from "./realEstateCalculator.js";
import { migrateSavedState, parseSavedState, CURRENT_SAVE_VERSION } from "./realEstateStorageMigration.js";
import {
  pickPropertyHoldingEvent,
  pickRealEstateMarketEvent,
  resolvePropertyHoldingEvent,
  resolveRealEstateMarketEvent,
} from "./realEstateEventResolver.js";
import { stockDefinitions, stockLearningNotes } from "./stockData.js";
import {
  buyStock,
  calculateSellPreview as calculateStockSellPreview,
  calculateStockPortfolioSummary,
  ensureStockState,
  findStock,
  sellStock,
  settleStockDividends,
  stockMoney,
  stockShares,
} from "./stockCalculator.js";
import {
  pickStockMarketEvent,
  resolveStockMarketEvent,
  resolveStockPriceTick,
} from "./stockEventResolver.js";
import { businessDefinitions, businessLearningNotes } from "./businessData.js";
import {
  businessMoney,
  calculateBusinessDefinition,
  calculateBusinessSellPreview,
  calculateBusinessSummary,
  ensureBusinessState,
  findBusinessDefinition,
  investBusiness,
  sellBusiness,
  settleBusinessPayday,
  upgradeBusiness,
} from "./businessCalculator.js";
import {
  pickBusinessMarketEvent,
  pickBusinessRiskEvent,
  resolveBusinessMarketEvent,
  resolveBusinessRiskEvent,
} from "./businessEventResolver.js";
import { bankingLearningNotes, interestEvents, personalLoanProducts } from "./bankingData.js";
import {
  applyInterestEvent,
  calculateBankSummary,
  calculateCreditLimit,
  calculateDebtTotals,
  calculateMortgagePurchasePlan,
  calculateRefinancePreview,
  ensureBankingState,
  evaluateBankruptcyProtection,
  refinancePropertyMortgage,
  takePersonalLoan,
} from "./bankingCalculator.js";
import { insurancePolicies } from "./insuranceData.js";
import {
  calculateClaimForPolicy,
  calculateInsurancePremiums,
  cancelInsurancePolicy,
  ensureInsuranceState,
  purchaseInsurancePolicy,
} from "./insuranceCalculator.js";
import { lifeEvents } from "./lifeEventData.js";
import {
  applyLifeEvent,
  calculateEmergencyFundStatus,
  calculateLifeEffectsSummary,
  ensureLifeEventState,
  settleLifeEffectsMonth,
} from "./lifeEventCalculator.js";
import { pickLifeEvent } from "./lifeEventResolver.js";
import { advanceEconomyCycle, getEconomyProfile, ensureEconomyState } from "./economyCycleEngine.js";
import { calculateTaxSummary, ensureTaxState, settleTax } from "./taxCalculator.js";
import {
  ensureUnemploymentState,
  reemploy,
  searchForJob,
  settleUnemploymentMonth,
  startUnemployment,
} from "./unemploymentEngine.js";
import {
  boardPath,
  cameraForTile,
  clampCamera,
  createCitySceneSvg,
  createSoundManager,
  diceMarkup,
  eventIllustrationMarkup,
  haptic,
  indexAfter,
  loadExperienceSettings,
  nextIndices,
  saveExperienceSettings,
  tileVisual,
  tutorialSteps,
  contextTipMessages,
  avatarMarkup,
} from "./gameExperience.js";
import {
  aiDifficultyModes,
  aiTemplates,
  buildAiPublicSummary,
  calculateLeaderboard,
  configureAiMode,
  gameModes,
  migrateAiCompetitionState,
  runAiTurnCycle,
} from "./aiCompetitionSystem.js";
import {
  achievementDefinitions,
  addReport,
  badgeDefinitions,
  buildAchievementGroups,
  buildBadgeCollection,
  buildChallengeCards,
  buildMilestoneTimeline,
  buildMissionCards,
  buildProgressDashboard,
  buildReportSections,
  calculateFinancialFreedomProgress,
  challengeDefinitions,
  claimCompletedMissions,
  continueFreedomMode,
  createDifficultyAdjustedCareer,
  createGameReport,
  createShareCard,
  difficultyModes,
  evaluateFinancialPressure,
  evaluateProgress,
  migrateProgressState,
  milestoneDefinitions,
  nextProgressNotification,
  recordProgressEvent,
  refreshActiveMissions,
  startChallengeState,
} from "./progressSystem.js";

const STORAGE_KEY = "cashflow-freedom-game-v1";
const CHALLENGE_STORAGE_KEY = "cashflow-freedom-challenge-v1";

const careers = [
  {
    id: "teacher",
    icon: "师",
    name: "小学老师",
    salary: 18000,
    expenses: 14500,
    savings: 12000,
    note: "工资稳定，现金不多，适合练习从小机会开始累积资产。",
  },
  {
    id: "engineer",
    icon: "工",
    name: "软件工程师",
    salary: 36000,
    expenses: 25500,
    savings: 28000,
    note: "现金流较宽裕，但生活支出高，容易被大额消费拖慢。",
  },
  {
    id: "designer",
    icon: "设",
    name: "自由设计师",
    salary: 26000,
    expenses: 19000,
    savings: 18000,
    note: "收入中等，适合用小生意和版权收入建立被动收入。",
  },
  {
    id: "doctor",
    icon: "医",
    name: "牙科医生",
    salary: 52000,
    expenses: 42000,
    savings: 36000,
    note: "收入高但开销也高，需要控制负债和现金安全垫。",
  },
];

let selectedCareerId = "teacher";
let selectedDifficultyId = "standard";
let selectedGameMode = "solo";
let selectedAiDifficulty = "standard";
let selectedAiCount = 2;

const boardTiles = [
  { type: "payday", icon: "月", title: "月结日", text: "领取工资与被动收入，支付全部支出。" },
  { type: "opportunity", icon: "机", title: "房地产机会", text: "评估租金、房贷和净现金流。" },
  { type: "doodad", icon: "花", title: "额外支出", text: "生活消费会考验现金储备。" },
  { type: "stockMarket", icon: "市", title: "股票市场", text: "虚构股票会随市场波动。" },
  { type: "learn", icon: "学", title: "学习", text: "提升财商，降低之后的犯错成本。" },
  { type: "lifeEvent", icon: "医", title: "人生事件", text: "医疗、家庭、工作和责任会影响现金。" },
  { type: "stockOpportunity", icon: "股", title: "股票机会", text: "买入虚构公司的一小部分。" },
  { type: "bank", icon: "银", title: "银行", text: "可以借钱，也可以提前还债。" },
  { type: "doodad", icon: "账", title: "账单", text: "突发开销直接扣现金。" },
  { type: "opportunity", icon: "租", title: "租赁机会", text: "找到能产生租金的资产。" },
  { type: "market", icon: "价", title: "市场", text: "持有资产会被市场影响。" },
  { type: "businessOpportunity", icon: "店", title: "小生意机会", text: "投资能产生收入的小系统。" },
  { type: "insurance", icon: "保", title: "保险", text: "用固定保费分担特定风险。" },
  { type: "learn", icon: "课", title: "课程", text: "用知识换取更好的判断力。" },
  { type: "propertyEvent", icon: "修", title: "房产持有", text: "维修、空置、续约或翻修。" },
  { type: "stockOpportunity", icon: "投", title: "基金机会", text: "练习分散和价格波动。" },
  { type: "bank", icon: "贷", title: "银行", text: "借贷能加速，也会增加月支出。" },
  { type: "stockMarket", icon: "涨", title: "市场消息", text: "产业和公司事件影响价格。" },
  { type: "doodad", icon: "购", title: "消费", text: "想要和需要不总是一回事。" },
  { type: "businessEvent", icon: "营", title: "生意事件", text: "生意可能遇到机会或风险。" },
  { type: "tax", icon: "税", title: "税务", text: "游戏中的简化税务责任。" },
  { type: "businessMarket", icon: "需", title: "需求变化", text: "不同类型生意需求会改变。" },
  { type: "jobEvent", icon: "职", title: "工作发展", text: "加薪、升职、失业或再就业。" },
  { type: "propertyEvent", icon: "管", title: "持有管理", text: "房产赚钱也需要维护。" },
  { type: "family", icon: "家", title: "家庭责任", text: "家庭选择会影响现金与幸福。" },
  { type: "lifeEvent", icon: "急", title: "医疗意外", text: "检查保险和预备金是否够用。" },
  { type: "opportunity", icon: "房", title: "置产机会", text: "比较现金购买与房贷购买。" },
  { type: "charity", icon: "善", title: "慈善分享", text: "练习在预算中安排分享。" },
  { type: "businessOpportunity", icon: "铺", title: "小店机会", text: "评估营收、成本与时间投入。" },
  { type: "market", icon: "风", title: "房市风向", text: "地段与租金可能改变。" },
  { type: "insurance", icon: "险", title: "保障检查", text: "看保费是否适合月现金流。" },
  { type: "stockOpportunity", icon: "券", title: "股票机会", text: "买入前先看风险和分散。" },
  { type: "learn", icon: "书", title: "财商课堂", text: "知识会改善之后的选择。" },
  { type: "tax", icon: "票", title: "税务整理", text: "用游戏规则练习预留税款。" },
  { type: "bank", icon: "信", title: "信用柜台", text: "信用分影响额度和利率。" },
  { type: "stockMarket", icon: "讯", title: "市场新闻", text: "价格波动不是最终结果。" },
  { type: "businessEvent", icon: "客", title: "客流事件", text: "需求会影响小生意利润。" },
  { type: "jobEvent", icon: "工", title: "工作机会", text: "收入可能提高，也可能中断。" },
  { type: "doodad", icon: "修", title: "生活维修", text: "小支出也会考验现金垫。" },
  { type: "payday", icon: "薪", title: "月结日", text: "再次结算现金流与房贷本金。" },
];

const doodadCards = [
  { name: "手机摔坏", cost: 2800, text: "换屏和维修费必须今天支付。" },
  { name: "朋友婚礼红包", cost: 1800, text: "人情支出没有现金流，但现金会减少。" },
  { name: "冲动购买新电脑", cost: 7600, text: "提高体验，但不会带来被动收入。" },
  { name: "车辆保养", cost: 4200, text: "长期忽略维护会让之后花更多钱。" },
  { name: "家庭旅游", cost: 9800, text: "快乐是真的，现金减少也是真的。" },
  { name: "保险补缴", cost: 3600, text: "必要支出，不能跳过。" },
];

const learningCards = [
  { name: "读完一本财商书", cost: 0, iq: 1, text: "你更会区分资产、负债和房产净值。" },
  { name: "参加房地产现金流课", cost: 3200, iq: 2, text: "你学会先看净现金流，而不是只看价格。" },
  { name: "复盘失败交易", cost: 1200, iq: 1, text: "一次错误如果被复盘，就不算白亏。" },
  { name: "请教会计朋友", cost: 1800, iq: 1, text: "你学会把房贷、维修和空置都算进支出。" },
];

let state = null;
const soundManager = createSoundManager();
const savedExperience = loadExperienceSettings(localStorage);
const uiState = {
  turnPhase: "idle",
  turnPhaseHistory: ["idle"],
  isRolling: false,
  isMoving: false,
  diceRolling: false,
  hudStatus: "准备中",
  movingStep: 0,
  movingTotal: 0,
  avatarMood: "neutral",
  avatarDirection: "right",
  avatarTimer: null,
  previewIndices: [],
  camera: savedExperience.camera,
  muted: savedExperience.muted,
  volume: savedExperience.volume,
  effectVolume: savedExperience.effectVolume,
  musicVolume: savedExperience.musicVolume,
  musicEnabled: savedExperience.musicEnabled,
  hapticsEnabled: savedExperience.hapticsEnabled,
  animationSpeed: savedExperience.animationSpeed,
  visualQuality: savedExperience.visualQuality,
  tutorialComplete: savedExperience.tutorialComplete,
  seenTips: savedExperience.seenTips,
  tutorial: {
    active: false,
    index: 0,
    replay: false,
  },
  pendingTips: [],
  draggingCamera: false,
  playedEffectIds: new Set(),
  avatarState: "idle",
};
soundManager.setMuted(uiState.muted);
soundManager.setVolume(uiState.volume);
soundManager.setEffectVolume(uiState.effectVolume);
soundManager.setMusicVolume(uiState.musicVolume);
soundManager.setMusicEnabled(uiState.musicEnabled);

const el = {
  setupPanel: document.querySelector("#setupPanel"),
  careerGrid: document.querySelector("#careerGrid"),
  gamePanel: document.querySelector("#gamePanel"),
  careerLabel: document.querySelector("#careerLabel"),
  gameTitle: document.querySelector("#gameTitle"),
  gameSubtitle: document.querySelector("#gameSubtitle"),
  freedomPercent: document.querySelector("#freedomPercent"),
  freedomBar: document.querySelector("#freedomBar"),
  roundLabel: document.querySelector("#roundLabel"),
  board: document.querySelector("#board"),
  diceValue: document.querySelector("#diceValue"),
  rollDice: document.querySelector("#rollDice"),
  actionStack: document.querySelector("#actionStack"),
  logList: document.querySelector("#logList"),
  incomeStatement: document.querySelector("#incomeStatement"),
  assetList: document.querySelector("#assetList"),
  liabilityList: document.querySelector("#liabilityList"),
  bankPanel: document.querySelector("#bankPanel"),
  lifePanel: document.querySelector("#lifePanel"),
  realEstatePortfolio: document.querySelector("#realEstatePortfolio"),
  stockPortfolio: document.querySelector("#stockPortfolio"),
  businessPortfolio: document.querySelector("#businessPortfolio"),
  saveGame: document.querySelector("#saveGame"),
  loadGame: document.querySelector("#loadGame"),
  resetGame: document.querySelector("#resetGame"),
  gameMenu: document.querySelector("#gameMenu"),
  modal: document.querySelector("#cardModal"),
  modalType: document.querySelector("#modalType"),
  modalTitle: document.querySelector("#modalTitle"),
  modalText: document.querySelector("#modalText"),
  dealMetrics: document.querySelector("#dealMetrics"),
  modalActions: document.querySelector("#modalActions"),
  closeModal: document.querySelector("#closeModal"),
  continueGameHome: document.querySelector("#continueGameHome"),
  startAdventure: document.querySelector("#startAdventure"),
  heroCharacter: document.querySelector("#heroCharacter"),
  rulesHome: document.querySelector("#rulesHome"),
  progressHome: document.querySelector("#progressHome"),
  soundHome: document.querySelector("#soundHome"),
  clearSaveHome: document.querySelector("#clearSaveHome"),
};

function createState(career) {
  return migrateSavedState({
    saveVersion: CURRENT_SAVE_VERSION,
    career,
    month: 1,
    round: 1,
    position: 0,
    cash: career.savings,
    salary: career.salary,
    baseExpenses: career.expenses,
    assets: [],
    liabilities: [],
    ownedProperties: [],
    propertyTransactions: [],
    stockMarket: stockDefinitions,
    stockHoldings: [],
    stockTransactions: [],
    stockMarketRecords: [],
    settledStockEvents: [],
    realizedStockGain: 0,
    businessHoldings: [],
    businessTransactions: [],
    businessMarketRecords: [],
    settledBusinessEvents: [],
    settledBusinessMonths: [],
    bank: {
      creditScore: 650,
      interestLevel: "normal",
      bankruptcyWarning: false,
    },
    bankTransactions: [],
    settledBankEvents: [],
    insurancePolicies: [],
    insuranceTransactions: [],
    insuranceClaims: [],
    lifeEventHistory: [],
    lifeActiveEffects: [],
    settledLifeEvents: [],
    unemployment: {},
    tax: {},
    economy: {},
    job: {},
    settledEvents: [],
    emergencyDebt: 0,
    financialIq: 0,
    lastRoll: null,
    gameOver: false,
    logs: [
      `你选择了${career.name}，初始现金 ${money(career.savings)}。`,
      "目标：让被动收入大于或等于总支出，同时理解房地产和股票风险。",
    ],
  });
}

function createNewGameState(career, difficultyId = "standard") {
  const adjustedCareer = createDifficultyAdjustedCareer(career, difficultyId);
  const nextState = createState(adjustedCareer);
  nextState.gameDifficulty = difficultyId;
  configureAiMode(nextState, { mode: selectedGameMode, aiCount: selectedAiCount, difficulty: selectedAiDifficulty });
  migrateProgressState(nextState);
  migrateAiCompetitionState(nextState);
  return nextState;
}

function passiveIncome() {
  return state ? calculatePassiveIncome(state) : 0;
}

function totalExpenses() {
  return state ? calculateTotalExpenses(state) : 0;
}

function liabilityPayments() {
  return state?.liabilities?.reduce((sum, item) => sum + moneyValue(item.payment), 0) || 0;
}

function netMonthlyCashflow() {
  return state ? calculateMonthlyCashflow(state) : 0;
}

function freedomRatio() {
  if (!state) return 0;
  return Math.min(150, calculateFinancialFreedomProgress(state).percent);
}

function money(value) {
  const safeValue = moneyValue(value);
  const sign = safeValue < 0 ? "-" : "";
  return `${sign}¥${Math.abs(safeValue).toLocaleString("zh-CN")}`;
}

function moneyValue(value) {
  const number = Number(value);
  if (!Number.isFinite(number)) return 0;
  const rounded = Math.round(number);
  return Object.is(rounded, -0) ? 0 : rounded;
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function pick(list) {
  return list[Math.floor(Math.random() * list.length)] || list[0];
}

function addLog(message) {
  state.logs.unshift(message);
  state.logs = state.logs.slice(0, 9);
}

function persistQuietly() {
  if (!state) return;
  migrateProgressState(state);
  migrateAiCompetitionState(state);
  localStorage.setItem(state.activeChallenge ? CHALLENGE_STORAGE_KEY : STORAGE_KEY, JSON.stringify(state));
}

function renderSetup() {
  const selected = careers.find((item) => item.id === selectedCareerId) || careers[0];
  const adjusted = createDifficultyAdjustedCareer(selected, selectedDifficultyId);
  const difficulty = difficultyModes.find((item) => item.id === selectedDifficultyId) || difficultyModes[1];
  const monthlyBalance = adjusted.salary - adjusted.expenses;
  const savedState = parseSavedState(localStorage.getItem(STORAGE_KEY));
  const homeProgress = savedState ? calculateFinancialFreedomProgress(savedState) : null;
  const recentBadge = savedState?.badges?.find((item) => item.unlocked);
  const currentMission = savedState ? buildMissionCards(savedState)[0] : null;
  if (el.heroCharacter) {
    el.heroCharacter.innerHTML = avatarMarkup(selected, "happy", "right");
  }
  if (el.startAdventure) {
    el.startAdventure.textContent = localStorage.getItem(STORAGE_KEY) ? "开始新冒险" : "开始冒险";
  }
  el.careerGrid.innerHTML = `
    <section class="character-select-stage motion-pop">
      <div class="character-preview-scene">
        <div class="preview-city" aria-hidden="true">
          <span class="preview-building bank"></span>
          <span class="preview-building shop"></span>
          <span class="preview-tree"></span>
          <span class="preview-road"></span>
        </div>
        <div class="large-character-preview">${avatarMarkup(selected, "celebrating", "right")}</div>
      </div>
      <div class="selected-career-panel">
        <span class="eyebrow">选择角色</span>
        <h2>${selected.name}</h2>
        <strong class="career-role">${careerPersonality(selected.id)}</strong>
        <p>${careerShortNote(selected.id)}</p>
        <div class="career-stat-pills">
          <span>工资 <strong>${money(adjusted.salary)}</strong></span>
          <span>月支出 <strong>${money(adjusted.expenses)}</strong></span>
          <span>现金 <strong>${money(adjusted.savings)}</strong></span>
          <span>月结余 <strong>${money(monthlyBalance)}</strong></span>
        </div>
        <div class="difficulty-picker" aria-label="选择难度">
          <span>难度：${difficulty.title}</span>
          <div>
            ${difficultyModes
              .map(
                (mode) => `
                  <button type="button" class="${mode.id === selectedDifficultyId ? "selected" : ""}" data-difficulty="${mode.id}" aria-pressed="${mode.id === selectedDifficultyId}">
                    ${mode.title}
                  </button>
                `,
              )
              .join("")}
          </div>
          <small>${difficulty.description}</small>
        </div>
        <div class="mode-picker" aria-label="选择游戏模式">
          <span>模式：${gameModes.find((item) => item.id === selectedGameMode)?.title || "单人学习"}</span>
          <div>
            ${gameModes
              .map(
                (mode) => `
                  <button type="button" class="${mode.id === selectedGameMode ? "selected" : ""}" data-game-mode="${mode.id}" aria-pressed="${mode.id === selectedGameMode}">
                    ${mode.title}
                  </button>
                `,
              )
              .join("")}
          </div>
          <small>${gameModes.find((item) => item.id === selectedGameMode)?.description || "保持目前体验。"}</small>
          ${
            selectedGameMode === "solo"
              ? ""
              : `
                <div class="ai-mode-options">
                  <label>AI 数量
                    <select id="aiCountSelect">
                      ${[1, 2, 3].map((count) => `<option value="${count}" ${count === selectedAiCount ? "selected" : ""}>${count} 名</option>`).join("")}
                    </select>
                  </label>
                  <label>AI 难度
                    <select id="aiDifficultySelect">
                      ${aiDifficultyModes.map((mode) => `<option value="${mode.id}" ${mode.id === selectedAiDifficulty ? "selected" : ""}>${mode.title}</option>`).join("")}
                    </select>
                  </label>
                </div>
              `
          }
        </div>
        ${homeProgress ? `
          <aside class="home-progress-summary" aria-label="继续游戏进度摘要">
            <span>当前进度</span>
            <strong>${Math.round(homeProgress.percent)}% · ${homeProgress.stage}</strong>
            <small>${currentMission ? `任务：${currentMission.title} ${moneyValue(currentMission.progress)} / ${moneyValue(currentMission.target)}` : "暂无当前任务"}</small>
            ${recentBadge ? `<em>最近徽章：${recentBadge.iconKey} ${recentBadge.title}</em>` : ""}
            <button type="button" id="homeProgressSummary">查看进度中心</button>
          </aside>
        ` : ""}
      </div>
      <div class="career-thumb-rail" aria-label="角色缩图">
        ${careers
          .map(
            (career) => `
              <button class="career-thumb ${career.id === selected.id ? "selected" : ""}" type="button" data-career="${career.id}" aria-pressed="${career.id === selected.id}">
                <span class="career-icon">${avatarMarkup(career, career.id === selected.id ? "happy" : "neutral", "right")}</span>
                <strong>${career.name}</strong>
                <small>${careerPersonality(career.id)}</small>
              </button>
            `,
          )
          .join("")}
      </div>
      <button class="primary select-start-button" id="startSelectedCareer" type="button">选择并开始</button>
    </section>
  `;

  el.careerGrid.querySelectorAll("[data-career]").forEach((button) => {
    button.addEventListener("click", () => {
      selectedCareerId = button.dataset.career || selectedCareerId;
      soundManager.play("tap");
      renderSetup();
    });
  });
  el.careerGrid.querySelectorAll("[data-difficulty]").forEach((button) => {
    button.addEventListener("click", () => {
      selectedDifficultyId = button.dataset.difficulty || selectedDifficultyId;
      soundManager.play("tap");
      renderSetup();
    });
  });
  el.careerGrid.querySelectorAll("[data-game-mode]").forEach((button) => {
    button.addEventListener("click", () => {
      selectedGameMode = button.dataset.gameMode || selectedGameMode;
      if (selectedGameMode === "quick-race") selectedAiCount = 2;
      soundManager.play("tap");
      renderSetup();
    });
  });
  document.querySelector("#aiCountSelect")?.addEventListener("change", (event) => {
    selectedAiCount = Math.max(1, Math.min(3, moneyValue(event.target.value)));
    renderSetup();
  });
  document.querySelector("#aiDifficultySelect")?.addEventListener("change", (event) => {
    selectedAiDifficulty = event.target.value || "standard";
    renderSetup();
  });
  document.querySelector("#startSelectedCareer")?.addEventListener("click", startSelectedCareer);
  document.querySelector("#homeProgressSummary")?.addEventListener("click", () => {
    state = savedState;
    showProgressCenter("freedom");
  });
}

function careerPersonality(id) {
  return {
    teacher: "探险型老师",
    engineer: "系统发明家",
    designer: "创意小店长",
    doctor: "稳健规划师",
  }[id] || "城市冒险家";
}

function careerShortNote(id) {
  return {
    teacher: "稳定起步，适合练习小额机会。",
    engineer: "现金流较宽，适合比较不同资产。",
    designer: "灵活经营，适合尝试小生意。",
    doctor: "收入高，也要管理高支出。",
  }[id] || "在城市中学习现金流选择。";
}

function startSelectedCareer() {
  const career = careers.find((item) => item.id === selectedCareerId) || careers[0];
  state = createNewGameState(career, selectedDifficultyId);
  const mode = gameModes.find((item) => item.id === state.gameMode) || gameModes[0];
  showGame();
  render();
  openSimpleModal({
    type: "开始",
    title: "现金流挑战开始",
    text: `你现在是${career.name}，难度为${difficultyModes.find((item) => item.id === selectedDifficultyId)?.title || "标准"}，模式为${mode.title}。这座城市会陪你练习收入、支出、投资、保险、银行和人生事件。`,
    actions: [{ label: "开始掷骰", className: "primary", onClick: () => { closeModal(); maybeStartTutorial(); } }],
  });
}

function showCharacterSelection() {
  document.body.classList.add("selection-active");
  el.careerGrid?.scrollIntoView({ behavior: prefersReducedMotion() ? "auto" : "smooth", block: "start" });
  const selectedThumb = el.careerGrid?.querySelector(".career-thumb.selected");
  if (selectedThumb instanceof HTMLElement) {
    selectedThumb.focus({ preventScroll: true });
  }
}

function showGame() {
  document.body.classList.add("in-game");
  document.body.classList.remove("selection-active");
  el.setupPanel.classList.add("hidden");
  el.gamePanel.classList.remove("hidden");
}

function showSetup() {
  document.body.classList.remove("in-game");
  document.body.classList.remove("selection-active");
  el.gamePanel.classList.add("hidden");
  el.setupPanel.classList.remove("hidden");
}

function unlockAudio() {
  if (!uiState.muted && uiState.musicEnabled) {
    soundManager.startMusic(state ? "board" : "home");
  }
}

function render() {
  applyExperienceMode();
  if (!state) {
    showSetup();
    return;
  }
  ensureRealEstateState(state);
  ensureStockState(state);
  ensureBusinessState(state);
  ensureBankingState(state);
  ensureInsuranceState(state);
  ensureUnemploymentState(state);
  ensureTaxState(state);
  ensureEconomyState(state);
  ensureLifeEventState(state);
  migrateProgressState(state);
  migrateAiCompetitionState(state);
  state.financialFreedomProgress = calculateFinancialFreedomProgress(state);
  syncMortgageLiabilities(state);
  showGame();
  const freedom = Math.min(150, state.financialFreedomProgress.percent);
  el.careerLabel.textContent = state.career.name;
  el.gameTitle.textContent = state.victoryState?.triggered ? "财务自由模式" : "现金流资产挑战";
  el.gameSubtitle.textContent = state.victoryState?.triggered
    ? `被动收入 ${money(state.financialFreedomProgress.passiveIncome)} 已覆盖必要支出 ${money(state.financialFreedomProgress.necessaryExpenses)}。`
    : `现金 ${money(state.cash)}，净月现金流 ${money(netMonthlyCashflow())}，净资产 ${money(calculateNetWorth(state))}。`;
  el.freedomPercent.textContent = `${freedom}%`;
  el.freedomBar.style.width = `${Math.min(100, freedom)}%`;
  el.roundLabel.textContent = `第 ${state.month} 月`;
  el.diceValue.innerHTML = diceMarkup(state.lastRoll || 1, uiState.diceRolling);
  el.rollDice.disabled = !canRoll();
  el.rollDice.textContent = uiState.turnPhase === "moving" ? `前进 ${uiState.movingStep} / ${uiState.movingTotal}` : uiState.turnPhase === "rolling" ? "骰子旋转中" : uiState.turnPhase === "diceResult" ? `前进 ${state.lastRoll || 1} 格` : "掷骰前进";
  el.rollDice.setAttribute("aria-label", el.rollDice.textContent);
  renderBoard();
  renderActions();
  renderStatements();
  renderBankPanel();
  renderLifePanel();
  renderRealEstatePortfolio();
  renderStockPortfolio();
  renderBusinessPortfolio();
  renderLogs();
  renderTutorial();
}

function phaseLabel(phase = uiState.turnPhase) {
  return {
    idle: "准备掷骰",
    rolling: "骰子旋转中",
    diceResult: "显示骰点",
    preparingMove: "准备前进",
    moving: `正在前进 ${uiState.movingStep} / ${uiState.movingTotal}`,
    arriving: "已到达",
    openingEvent: "打开事件",
    resolvingEvent: "处理事件中",
    showingResult: "结算结果",
    turnComplete: "结算完成",
    paused: "已暂停",
  }[phase] || "准备掷骰";
}

function setTurnPhase(phase) {
  if (uiState.turnPhase === phase && uiState.turnPhaseHistory.at(-1) === phase) {
    uiState.hudStatus = phaseLabel(phase);
    return;
  }
  uiState.turnPhase = phase;
  uiState.isRolling = phase === "rolling" || phase === "diceResult";
  uiState.isMoving = phase === "moving" || phase === "preparingMove" || phase === "arriving";
  uiState.diceRolling = phase === "rolling";
  uiState.hudStatus = phaseLabel(phase);
  uiState.turnPhaseHistory = [...uiState.turnPhaseHistory, phase].slice(-16);
}

function canRoll() {
  return Boolean(state && !state.gameOver && uiState.turnPhase === "idle" && !uiState.isRolling && !uiState.isMoving);
}

function setAvatarState(nextState, duration = 0) {
  uiState.avatarState = nextState;
  setAvatarMood(nextState === "walk" ? "walking" : nextState, duration);
}

function finishTurnSoon(delay = 220) {
  window.setTimeout(() => {
    if (["turnComplete", "showingResult", "openingEvent"].includes(uiState.turnPhase)) {
      setTurnPhase("idle");
      render();
      maybeRunAiTurns();
    }
  }, animationMs(delay, Math.min(delay, 120)));
}

function renderBoard() {
  const playerPoint = boardPath[state.position % boardPath.length] || boardPath[0];
  el.board.innerHTML = `
    <div class="city-map-viewport" id="cityMapViewport" aria-label="可拖曳缩放的现金流城市地图">
      <div class="city-map-stage" id="cityMapStage">
        ${createCitySceneSvg()}
        <div class="board-route" aria-hidden="true"></div>
        ${renderMapAssetMarkers()}
        ${boardTiles
          .map((tile, index) => {
            const point = boardPath[index % boardPath.length] || boardPath[0];
            const visual = tileVisual(tile.type);
            const isActive = state.position === index;
            const previewOrder = uiState.previewIndices.indexOf(index);
            const isPreview = previewOrder >= 0;
            const isPassed = uiState.isMoving && previewOrder >= 0 && previewOrder < uiState.movingStep - 1;
            const isUpcoming = isPreview && !isPassed;
            return `
              <button
                class="tile map-tile ${tile.type} tone-${visual.tone} ${isActive ? "active arrived" : ""} ${isPassed ? "path-passed" : ""} ${isUpcoming ? "preview-glow" : ""}"
                type="button"
                data-tile-index="${index}"
                style="left:${point.x}px; top:${point.y}px"
                aria-label="${tile.title}，${visual.category}"
              >
                <span class="tile-icon">${tile.icon}</span>
                <span class="tile-copy">
                  <strong>${shortTileTitle(tile)}</strong>
                  <small>${visual.category}</small>
                  <em>${visual.badge}</em>
                </span>
                <span class="tile-particle one"></span>
                <span class="tile-particle two"></span>
              </button>
            `;
          })
          .join("")}
        <div class="avatar-anchor" id="avatarAnchor" style="left:${playerPoint.x}px; top:${playerPoint.y}px">
          ${avatarMarkup(state.career, uiState.avatarMood, uiState.avatarDirection)}
        </div>
        ${renderAiMapAvatars()}
      </div>
    </div>
    <div class="map-toolbar" aria-label="地图控制">
      <button type="button" id="zoomOutMap" aria-label="缩小地图">−</button>
      <button type="button" id="focusPlayer" aria-label="回到玩家">回到玩家</button>
      <button type="button" id="zoomInMap" aria-label="放大地图">＋</button>
    </div>
  `;
  setupMapControls();
  el.board.querySelectorAll("[data-tile-index]").forEach((button) => {
    button.addEventListener("click", () => {
      if (uiState.draggingCamera || uiState.isMoving || uiState.isRolling) return;
      showTilePreview(Number(button.dataset.tileIndex));
    });
  });
  el.board.querySelectorAll("[data-map-asset]").forEach((button) => {
    button.addEventListener("click", (event) => {
      event.stopPropagation();
      if (uiState.draggingCamera || uiState.isMoving || uiState.isRolling) return;
      const assetType = button.dataset.mapAsset;
      const assetId = button.dataset.mapId;
      if (assetType === "property") showPropertyDetail(assetId);
      if (assetType === "stock") showStockDetail(assetId);
      if (assetType === "business") showBusinessDetail(assetId);
      if (assetType === "bank") showBankCenter();
      if (assetType === "insurance") showInsuranceCenter();
    });
  });
  el.board.querySelectorAll("[data-ai-finance]").forEach((button) => {
    button.addEventListener("click", (event) => {
      event.stopPropagation();
      showAiFinance(button.dataset.aiFinance || "");
    });
  });
  requestAnimationFrame(() => {
    if (uiState.camera.follow) focusCameraOnPlayer(false);
    else applyCamera();
  });
}

function renderAiMapAvatars() {
  if (!state?.aiPlayers?.length) return "";
  return state.aiPlayers
    .map((ai, index) => {
      const point = boardPath[(ai.currentPosition || ai.position || 0) % boardPath.length] || boardPath[0];
      const offset = (index + 1) * 12;
      return `
        <button class="ai-map-avatar" type="button" data-ai-finance="${ai.id}" style="left:${point.x + offset}px; top:${point.y + offset}px" aria-label="${ai.name} AI 对手">
          <span>${ai.avatarKey}</span>
        </button>
      `;
    })
    .join("");
}

function shortTileTitle(tile) {
  return {
    payday: "月结",
    opportunity: "房产",
    propertyEvent: "持有",
    stockOpportunity: "股票",
    stockMarket: "行情",
    businessOpportunity: "小店",
    businessEvent: "经营",
    businessMarket: "需求",
    bank: "银行",
    insurance: "保险",
    lifeEvent: "医疗",
    tax: "税务",
    jobEvent: "工作",
    market: "市场",
    doodad: "账单",
    learn: "学习",
    family: "家庭",
    charity: "慈善",
  }[tile.type] || tile.title.slice(0, 4);
}

function renderMapAssetMarkers() {
  if (!state) return "";
  const markers = [
    ...state.ownedProperties.slice(0, 4).map((item, index) => ({
      x: 450 + index * 48,
      y: 392 + (index % 2) * 38,
      icon: propertyIcon(item.category),
      label: "房产",
      tone: "green",
      id: item.id,
      type: "property",
      status: item.mortgageBalance <= 0 ? "owned" : "mortgage",
    })),
    ...state.stockHoldings.slice(0, 4).map((item, index) => ({
      x: 920 + index * 46,
      y: 360 + (index % 2) * 36,
      icon: stockIcon(item.sector),
      label: "股票",
      tone: "violet",
      id: item.stockId,
      type: "stock",
      status: item.unrealizedGain >= 0 ? "up" : "down",
    })),
    ...state.businessHoldings.slice(0, 4).map((item, index) => ({
      x: 560 + index * 48,
      y: 665 + (index % 2) * 36,
      icon: businessIcon(item.category),
      label: "生意",
      tone: "amber",
      id: item.businessId,
      type: "business",
      status: item.level > 1 ? "upgraded" : "base",
    })),
    ...state.insurancePolicies.filter((item) => item.active).slice(0, 2).map((item, index) => ({
      x: 1195 + index * 42,
      y: 570 + index * 32,
      icon: "盾",
      label: "保险",
      tone: "blue",
      id: item.id,
      type: "insurance",
      status: "owned",
    })),
    ...state.liabilities.filter((item) => item.type !== "mortgage" && moneyValue(item.balance) > 0).slice(0, 2).map((item, index) => ({
      x: 712 + index * 42,
      y: 340 + index * 34,
      icon: "贷",
      label: "贷款",
      tone: "slate",
      id: item.id,
      type: "bank",
      status: "mortgage",
    })),
  ];
  return markers
    .map(
      (marker) => `
        <button class="map-asset-marker tone-${marker.tone} status-${marker.status}" type="button" data-map-asset="${marker.type}" data-map-id="${marker.id}" style="left:${marker.x}px; top:${marker.y}px" aria-label="${marker.label}">
          <span>${marker.icon}</span>
        </button>
      `,
    )
    .join("");
}

function setupMapControls() {
  const viewport = document.querySelector("#cityMapViewport");
  const zoomOut = document.querySelector("#zoomOutMap");
  const zoomIn = document.querySelector("#zoomInMap");
  const focus = document.querySelector("#focusPlayer");
  if (!viewport) return;
  let startX = 0;
  let startY = 0;
  let cameraStart = { ...uiState.camera };
  let moved = false;

  viewport.addEventListener("pointerdown", (event) => {
    if (event.target.closest("[data-tile-index]")) return;
    viewport.setPointerCapture(event.pointerId);
    startX = event.clientX;
    startY = event.clientY;
    cameraStart = { ...uiState.camera };
    moved = false;
  });

  viewport.addEventListener("pointermove", (event) => {
    if (!viewport.hasPointerCapture(event.pointerId)) return;
    const dx = event.clientX - startX;
    const dy = event.clientY - startY;
    if (Math.abs(dx) + Math.abs(dy) > 4) moved = true;
    uiState.draggingCamera = moved;
    uiState.camera = clampCamera(
      {
        ...cameraStart,
        x: cameraStart.x + dx,
        y: cameraStart.y + dy,
        follow: false,
      },
      viewport.clientWidth,
      viewport.clientHeight,
    );
    saveExperience();
    applyCamera();
  });

  viewport.addEventListener("pointerup", (event) => {
    if (viewport.hasPointerCapture(event.pointerId)) viewport.releasePointerCapture(event.pointerId);
    setTimeout(() => {
      uiState.draggingCamera = false;
    }, 120);
  });

  viewport.addEventListener(
    "wheel",
    (event) => {
      event.preventDefault();
      zoomCamera(event.deltaY > 0 ? -0.08 : 0.08);
    },
    { passive: false },
  );
  zoomOut?.addEventListener("click", () => zoomCamera(-0.12));
  zoomIn?.addEventListener("click", () => zoomCamera(0.12));
  focus?.addEventListener("click", () => {
    soundManager.play("tap");
    focusCameraOnPlayer(true);
  });
}

function zoomCamera(delta) {
  const viewport = document.querySelector("#cityMapViewport");
  if (!viewport) return;
  uiState.camera = clampCamera(
    {
      ...uiState.camera,
      scale: uiState.camera.scale + delta,
      follow: false,
    },
    viewport.clientWidth,
    viewport.clientHeight,
  );
  saveExperience();
  applyCamera();
}

function focusCameraOnPlayer(save = true, scale = uiState.camera.scale) {
  const viewport = document.querySelector("#cityMapViewport");
  if (!viewport || !state) return;
  uiState.camera = cameraForTile(state.position, viewport.clientWidth, viewport.clientHeight, scale);
  if (save) saveExperience();
  applyCamera();
}

function applyCamera() {
  const viewport = document.querySelector("#cityMapViewport");
  const stage = document.querySelector("#cityMapStage");
  if (!viewport || !stage) return;
  uiState.camera = clampCamera(uiState.camera, viewport.clientWidth, viewport.clientHeight);
  stage.style.transform = `translate3d(${uiState.camera.x}px, ${uiState.camera.y}px, 0) scale(${uiState.camera.scale})`;
}

function saveExperience() {
  saveExperienceSettings(localStorage, {
    muted: uiState.muted,
    volume: uiState.volume,
    effectVolume: uiState.effectVolume,
    musicVolume: uiState.musicVolume,
    musicEnabled: uiState.musicEnabled,
    hapticsEnabled: uiState.hapticsEnabled,
    animationSpeed: uiState.animationSpeed,
    visualQuality: uiState.visualQuality,
    tutorialComplete: uiState.tutorialComplete,
    seenTips: uiState.seenTips,
    camera: uiState.camera,
  });
}

function applyExperienceMode() {
  document.body.dataset.quality = uiState.visualQuality;
  document.body.dataset.motion = prefersReducedMotion() ? "reduced" : "full";
}

function showTilePreview(index) {
  const tile = boardTiles[index];
  if (!tile) return;
  const visual = tileVisual(tile.type);
  openSimpleModal({
    type: "格子预览",
    title: tile.title,
    text: "这是格子预览，不会结算事件或改变资料。",
    metrics: [
      ["类别", visual.category],
      ["状态", visual.status],
      ["说明", tile.text],
      ["位置", `${index + 1} / ${boardTiles.length}`],
    ],
    actions: [{ label: "知道了", className: "primary", onClick: closeModal }],
  });
}

function renderActions() {
  const debt = state.liabilities.reduce((sum, item) => sum + moneyValue(item.balance), 0);
  const progressText = uiState.turnPhase === "moving" ? `前进 ${uiState.movingStep} / ${uiState.movingTotal}` : state.lastRoll ? `前进 ${state.lastRoll} 格` : "待掷骰";
  const debtButton = debt > 0 ? `<button type="button" id="repayDebt"><span>债</span><strong>偿还</strong></button>` : "";
  const newRunButton = state.gameOver ? `<button class="primary" type="button" id="newRun"><span>★</span><strong>再开</strong></button>` : "";
  const leaderboard = state.aiPlayers?.length ? calculateLeaderboard(state) : [];
  const playerRank = leaderboard.find((item) => item.isPlayer);
  const aiTracker = state.aiPlayers?.length
    ? `
      <button class="hud-ai-tracker" type="button" id="openLeaderboard" aria-label="打开竞赛排名">
        <span>赛</span>
        <strong>排名 ${playerRank?.rank || "-"}/${leaderboard.length}</strong>
        <em>${state.marketCycle?.phase || "market"} · ${state.aiActionSummaries?.[0]?.shortText || "AI 等待行动"}</em>
      </button>
    `
    : "";
  const missionCards = buildMissionCards(state);
  const trackedMission = missionCards.find((item) => item.completed && !item.claimed) || missionCards.find((item) => item.status === "进行中" || item.status === "即将到期");
  const missionTracker = trackedMission
    ? `
      <button class="hud-mission-tracker ${trackedMission.completed ? "completed" : ""}" type="button" id="hudMissionTracker" aria-label="打开当前任务">
        <span>${trackedMission.completed ? "✓" : "任"}</span>
        <strong>${trackedMission.title}</strong>
        <em>${moneyValue(trackedMission.progress)} / ${moneyValue(trackedMission.target)}</em>
      </button>
    `
    : "";
  el.actionStack.innerHTML = `
    <div class="hud-status game-hud-status">
      <span>目前状态</span>
      <strong>${uiState.hudStatus}</strong>
      <em>${progressText}</em>
    </div>
    <div class="hud-summary-grid">
      <div class="hud-chip cash"><span>现金</span><strong>${money(state.cash)}</strong></div>
      <div class="hud-chip flow"><span>月现金流</span><strong>${money(netMonthlyCashflow())}</strong></div>
    </div>
    ${missionTracker}
    ${aiTracker}
    <div class="hud-shortcuts" aria-label="游戏快捷入口">
      <button type="button" id="focusPlayerHud"><span>◎</span><strong>玩家</strong></button>
      <button type="button" id="openFinancePanel"><span>¥</span><strong>财务</strong></button>
      <button type="button" id="openBankCenter"><span>银</span><strong>银行</strong></button>
      <button type="button" id="openProgressCenter"><span>奖</span><strong>进度</strong></button>
      ${state.aiPlayers?.length ? `<button type="button" id="openMarketNews"><span>市</span><strong>市场</strong></button>` : ""}
      ${state.aiPlayers?.length ? `<button type="button" id="toggleAiSpeed"><span>速</span><strong>${state.aiAnimationSpeed === "skip" ? "观看" : "跳过"}</strong></button>` : ""}
      <button type="button" id="openPortfolio"><span>房</span><strong>房产</strong></button>
      <button type="button" id="openStockPortfolio"><span>股</span><strong>股票</strong></button>
      <button type="button" id="openBusinessPortfolio"><span>店</span><strong>生意</strong></button>
      <button type="button" id="openLifeCenter"><span>盾</span><strong>保障</strong></button>
      <button type="button" id="toggleSound"><span>${uiState.muted ? "静" : "声"}</span><strong>${uiState.muted ? "开启" : "静音"}</strong></button>
      ${debtButton}
      ${newRunButton}
    </div>
  `;
  document.querySelector("#focusPlayerHud")?.addEventListener("click", () => focusCameraOnPlayer(true));
  document.querySelector("#hudMissionTracker")?.addEventListener("click", () => showProgressCenter("missions"));
  document.querySelector("#openLeaderboard")?.addEventListener("click", showLeaderboardPanel);
  document.querySelector("#toggleSound")?.addEventListener("click", toggleSound);
  document.querySelector("#openFinancePanel")?.addEventListener("click", () => {
    recordProgressEvent(state, "financeView");
    processProgress(false);
    document.querySelector(".finance-grid")?.scrollIntoView({ behavior: "smooth", block: "start" });
  });
  document.querySelector("#openBankCenter")?.addEventListener("click", showBankCenter);
  document.querySelector("#openProgressCenter")?.addEventListener("click", () => showProgressCenter("freedom"));
  document.querySelector("#openMarketNews")?.addEventListener("click", showMarketPanel);
  document.querySelector("#toggleAiSpeed")?.addEventListener("click", toggleAiSpeed);
  document.querySelector("#repayDebt")?.addEventListener("click", repayDebt);
  document.querySelector("#newRun")?.addEventListener("click", resetGame);
  document.querySelector("#openPortfolio")?.addEventListener("click", () => {
    document.querySelector("#realEstateSection")?.scrollIntoView({ behavior: "smooth", block: "start" });
  });
  document.querySelector("#openStockPortfolio")?.addEventListener("click", () => {
    document.querySelector("#stockSection")?.scrollIntoView({ behavior: "smooth", block: "start" });
  });
  document.querySelector("#openBusinessPortfolio")?.addEventListener("click", () => {
    document.querySelector("#businessSection")?.scrollIntoView({ behavior: "smooth", block: "start" });
  });
  document.querySelector("#openLifeCenter")?.addEventListener("click", () => {
    document.querySelector("#lifeSection")?.scrollIntoView({ behavior: "smooth", block: "start" });
  });
}

function processProgress(allowVictory = true) {
  if (!state) return null;
  const result = evaluateProgress(state, {
    turnPhase: uiState.turnPhase,
    hasOpenEvent: !el.modal.classList.contains("hidden"),
  });
  if (el.modal.classList.contains("hidden")) {
    const notification = nextProgressNotification(state);
    if (notification) showUnlockToast(notification);
  }
  if (allowVictory && result.victory.triggered) {
    showVictoryReport(result.victory.report);
  } else if (allowVictory && result.challenge.active && (result.challenge.completed || result.challenge.timedOut) && !state.activeChallenge.reportShown) {
    state.activeChallenge.reportShown = true;
    const report = addReport(state, createGameReport(state, result.challenge.completed ? "challenge-complete" : "challenge-timeout"));
    showGameReport(report, result.challenge.completed ? "挑战完成" : "挑战回合用完");
  } else if (allowVictory && result.pressure.severe && !state.progressStats.pressureWarningShown && el.modal.classList.contains("hidden")) {
    state.progressStats.pressureWarningShown = true;
    showFinancialPressure(result.pressure);
  }
  persistQuietly();
  return result;
}

function showUnlockToast(item) {
  const toast = document.createElement("button");
  toast.type = "button";
  toast.className = "unlock-toast";
  toast.innerHTML = `
    <span>${item.iconKey || "奖"}</span>
    <strong>${item.type || "解锁"}：${item.title}</strong>
    <small>${item.description || item.learningTip || "新的进度已记录。"}</small>
  `;
  toast.addEventListener("click", () => {
    toast.remove();
    if (item.targetTab === "leaderboard") showLeaderboardPanel();
    else showProgressCenter(item.targetTab || (item.type === "徽章" ? "badges" : "achievements"));
  });
  document.body.append(toast);
  soundManager.play("happy");
  window.setTimeout(() => toast.remove(), prefersReducedMotion() ? 500 : 2400);
}

function showProgressCenter(tab = "freedom") {
  if (!state) return;
  migrateProgressState(state);
  evaluateProgress(state, { turnPhase: uiState.turnPhase, hasOpenEvent: true });
  const tabs = [
    ["freedom", "财务自由"],
    ["missions", "任务"],
    ["achievements", "成就"],
    ["badges", "徽章"],
    ["challenges", "挑战"],
    ["reports", "报告"],
  ];
  openSimpleModal({
    type: "Progress Center",
    title: "进度中心",
    text: "这里记录短期任务、中期里程碑和最终财务自由目标。内容都是游戏中的简化学习模型。",
    metrics: [],
    actions: [
      ...(tab === "missions" ? [{ label: "领取完成任务", className: "primary", onClick: claimMissionsAndRefresh }] : []),
      ...(tab === "missions" ? [{ label: "刷新任务", onClick: refreshMissionsAndRefresh }] : []),
      ...(tab === "reports" ? [{ label: "生成当前报告", className: "primary", onClick: createManualReport }] : []),
      ...(tab === "reports" && state.gameReports.length ? [{ label: "生成分享卡片", onClick: () => showShareCard(state.gameReports[0]) }] : []),
      { label: "关闭", onClick: closeModal },
    ],
  });
  const modalCard = el.modal.querySelector(".modal-card");
  modalCard?.classList.add("progress-modal-card");
  el.dealMetrics.classList.add("progress-center-body");
  el.dealMetrics.innerHTML = `
    <div class="progress-center-shell" data-progress-tab="${tab}">
      <nav class="progress-tab-rail" aria-label="进度中心分页">
        ${tabs.map(([id, label]) => `<button type="button" class="${id === tab ? "selected" : ""}" data-progress-tab="${id}" aria-pressed="${id === tab}">${label}</button>`).join("")}
      </nav>
      ${progressTabHtml(tab)}
    </div>
  `;
  attachProgressCenterHandlers();
}

function progressCenterMetrics(tab) {
  const progress = calculateFinancialFreedomProgress(state);
  if (tab === "freedom") {
    return [
      ["目前阶段", progress.stage],
      ["被动收入", money(progress.passiveIncome)],
      ["每月必要支出", money(progress.necessaryExpenses)],
      ["还差", money(progress.remaining)],
      ["完成百分比", `${progress.percent}%`],
      ["说明", progress.educationTip],
    ];
  }
  if (tab === "missions") {
    return state.activeMissions.map((missionItem) => [
      missionItem.completed ? `完成：${missionItem.title}` : missionItem.title,
      `${moneyValue(missionItem.progress)} / ${moneyValue(missionItem.target)} · ${missionItem.description}`,
    ]);
  }
  if (tab === "achievements") {
    return [
      ["已解锁", `${state.achievements.filter((item) => item.unlocked).length} / ${achievementDefinitions.length}`],
      ...state.achievements.slice(0, 10).map((item) => [item.unlocked ? item.title : "神秘成就", item.unlocked ? `${item.category} · 第 ${item.unlockedAtRound || "-"} 回合` : item.description]),
    ];
  }
  if (tab === "badges") {
    return [
      ["已收藏", `${state.badges.filter((item) => item.unlocked).length} / ${badgeDefinitions.length}`],
      ...state.badges.map((item) => [item.unlocked ? `${item.iconKey} ${item.title}` : `锁定 ${item.iconKey}`, item.unlocked ? item.description : "继续游戏可解锁。"]),
    ];
  }
  if (tab === "challenges") {
    return challengeDefinitions.map((item) => {
      const best = state.challengeBestResults[item.id];
      return [item.title, `${item.difficulty} · ${item.roundLimit} 回合 · ${best?.completed ? `最佳 ${best.bestRound} 回合` : item.description}`];
    });
  }
  return state.gameReports.length
    ? state.gameReports.slice(0, 6).map((report) => [`${report.reason} · 第 ${report.round} 回合`, `净资产 ${money(report.netWorth)} · 自由进度 ${report.freedomPercent}% · ${report.goodSummary}`])
    : [["暂无报告", "胜利、挑战结束或手动生成后会显示。"]];
}

function progressTabHtml(tab) {
  if (tab === "freedom") return freedomDashboardHtml();
  if (tab === "missions") return missionsHtml();
  if (tab === "achievements") return achievementsHtml();
  if (tab === "badges") return badgesHtml();
  if (tab === "challenges") return challengesHtml();
  if (tab === "reports") return reportsHtml();
  return freedomDashboardHtml();
}

function freedomDashboardHtml() {
  const dashboard = buildProgressDashboard(state);
  const gauge = Math.min(100, dashboard.displayPercent);
  return `
    <section class="freedom-dashboard">
      <div class="freedom-gauge-card">
        <div class="freedom-gauge" style="--progress:${gauge}">
          <span>${Math.round(dashboard.percent)}%</span>
          <small>${dashboard.stage}</small>
        </div>
        <div class="stage-markers" aria-label="财务自由阶段">
          <span>0</span><span>25</span><span>50</span><span>75</span><span>100%</span>
        </div>
      </div>
      <div class="freedom-dashboard-main">
        <div class="progress-metric-row">
          <article><span>目前阶段</span><strong>${dashboard.stage}</strong></article>
          <article><span>被动收入</span><strong>${money(dashboard.passiveIncome)}</strong></article>
          <article><span>必要支出</span><strong>${money(dashboard.necessaryExpenses)}</strong></article>
          <article><span>每月差额</span><strong>${money(-dashboard.remaining)}</strong></article>
          <article><span>下一阶段</span><strong>${dashboard.nextStage}</strong><small>还差 ${money(dashboard.nextStageIncomeGap)}</small></article>
        </div>
        <p class="progress-learning-note">${dashboard.educationTip}</p>
      </div>
      <div class="progress-split-grid">
        <section>
          <h3>主要被动收入来源</h3>
          ${sourceListHtml(dashboard.passiveSources, "positive")}
        </section>
        <section>
          <h3>最主要支出来源</h3>
          ${sourceListHtml(dashboard.expenseSources, "warning")}
        </section>
        <section class="progress-history-card">
          <h3>最近 5 次进度变化</h3>
          ${dashboard.recentChanges.length ? dashboard.recentChanges.map((item) => `<p><strong>${item.stage}</strong><span>第 ${item.round} 回合 · ${item.change >= 0 ? "上升" : "下降"} ${Math.abs(item.change)}%</span></p>`).join("") : "<p><strong>等待变化</strong><span>完成收入或支出变化后会记录。</span></p>"}
        </section>
      </div>
      ${milestoneTimelineHtml()}
    </section>
  `;
}

function sourceListHtml(items, tone) {
  return `
    <div class="source-list ${tone}">
      ${items.map((item) => `<p><span>${escapeHtml(item.iconKey)}</span><strong>${escapeHtml(item.label)}</strong><em>${money(item.amount)}</em></p>`).join("")}
    </div>
  `;
}

function missionsHtml() {
  const missions = buildMissionCards(state);
  if (!missions.length) {
    return `<section class="progress-empty"><strong>目前没有合适任务</strong><p>继续玩几回合后，系统会根据状态安排新的短期目标。</p></section>`;
  }
  return `
    <section class="mission-board">
      ${missions.map((missionItem) => `
        <article class="mission-card ${missionItem.completed ? "completed" : ""}">
          <div class="mission-card-head">
            <span>${missionItem.completed ? "✓" : "任"}</span>
            <div><strong>${escapeHtml(missionItem.title)}</strong><small>${escapeHtml(missionItem.category)} · ${escapeHtml(missionItem.difficulty)}</small></div>
            <em>${escapeHtml(missionItem.status)}</em>
          </div>
          <p>${escapeHtml(missionItem.description)}</p>
          <div class="mission-progress" aria-label="任务进度 ${missionItem.progressPercent}%"><span style="width:${missionItem.progressPercent}%"></span></div>
          <div class="mission-meta">
            <span>${moneyValue(missionItem.progress)} / ${moneyValue(missionItem.target)}</span>
            <span>剩余 ${missionItem.remainingRounds} 回合</span>
            <span>奖励：${escapeHtml(missionItem.reward?.label || "徽章光效")}</span>
          </div>
          <button type="button" data-mission-help="${missionItem.id}">怎么完成</button>
          <small class="mission-help hidden" id="mission-help-${missionItem.id}">${escapeHtml(missionItem.howToComplete)}</small>
        </article>
      `).join("")}
    </section>
    <p class="progress-learning-note">任务只会从正常玩法推进，刷新有冷却，不能无限刷出奖励。</p>
  `;
}

function achievementsHtml(filter = "all", category = "all") {
  const groups = buildAchievementGroups(state, filter, category);
  const categories = ["all", ...new Set(state.achievements.map((item) => item.category))];
  const filters = [["all", "全部"], ["unlocked", "已解锁"], ["locked", "未解锁"], ["recent", "最近解锁"]];
  return `
    <section class="achievement-panel">
      <div class="progress-filter-row">
        ${filters.map(([id, label]) => `<button type="button" class="${id === filter ? "selected" : ""}" data-achievement-filter="${id}">${label}</button>`).join("")}
      </div>
      <div class="progress-filter-row compact">
        ${categories.map((name) => `<button type="button" class="${name === category ? "selected" : ""}" data-achievement-category="${escapeHtml(name)}">${name === "all" ? "全部类别" : escapeHtml(name)}</button>`).join("")}
      </div>
      <div class="achievement-groups">
        ${Object.keys(groups).length ? Object.entries(groups).map(([group, items]) => `
          <section>
            <h3>${escapeHtml(group)}</h3>
            <div class="achievement-grid">
              ${items.map((item) => `
                <article class="achievement-card ${item.unlocked ? "unlocked" : "locked"}">
                  <span>${item.unlocked ? escapeHtml(item.iconKey) : "？"}</span>
                  <strong>${escapeHtml(item.displayTitle)}</strong>
                  <p>${escapeHtml(item.displayDescription)}</p>
                  <small>${item.unlocked ? `第 ${item.unlockedAtRound || "-"} 回合解锁` : escapeHtml(item.progressLabel)}</small>
                </article>
              `).join("")}
            </div>
          </section>
        `).join("") : `<section class="progress-empty"><strong>没有符合筛选的成就</strong><p>切换筛选或继续游戏试试看。</p></section>`}
      </div>
    </section>
  `;
}

function badgesHtml() {
  const badges = buildBadgeCollection(state);
  const recent = badges.find((item) => item.unlocked);
  return `
    <section class="badge-collection">
      ${recent ? `<div class="recent-badge"><span>${escapeHtml(recent.iconKey)}</span><strong>最近徽章：${escapeHtml(recent.title)}</strong><small>${escapeHtml(recent.description)}</small></div>` : ""}
      <div class="badge-grid">
        ${badges.map((badge) => `
          <button type="button" class="badge-card ${badge.unlocked ? "unlocked" : "locked"}" data-badge-id="${badge.id}">
            <span>${badge.unlocked ? escapeHtml(badge.iconKey) : "锁"}</span>
            <strong>${badge.unlocked ? escapeHtml(badge.title) : "未解锁徽章"}</strong>
            <small>${escapeHtml(badge.rarity)} · ${badge.unlocked ? `第 ${badge.unlockedAtRound || "-"} 回合` : escapeHtml(badge.description)}</small>
          </button>
        `).join("")}
      </div>
    </section>
  `;
}

function milestoneTimelineHtml() {
  const timeline = buildMilestoneTimeline(state);
  return `
    <section class="milestone-timeline">
      <h3>里程碑时间线</h3>
      ${timeline.length ? timeline.map((item) => `
        <article>
          <span>${escapeHtml(item.iconKey)}</span>
          <div><strong>${escapeHtml(item.title)}</strong><small>${escapeHtml(item.result)} · ${escapeHtml(item.learningTip)}</small></div>
        </article>
      `).join("") : `<p><strong>还没有里程碑</strong><span>完成第一回合后就会开始记录。</span></p>`}
    </section>
  `;
}

function challengesHtml() {
  const challenges = buildChallengeCards(state);
  return `
    <section class="challenge-select">
      <p class="progress-learning-note">挑战会使用独立挑战存档，不覆盖正常游戏存档。中途可以退出并回到正常存档。</p>
      <div class="challenge-grid">
        ${challenges.map((item) => `
          <article class="challenge-card ${item.completed ? "completed" : ""}">
            <span>${item.completed ? "✓" : "挑"}</span>
            <strong>${escapeHtml(item.title)}</strong>
            <p>${escapeHtml(item.description)}</p>
            <small>${escapeHtml(item.difficulty)} · ${item.roundLimit} 回合 · 奖励 ${escapeHtml(item.rewardBadge)}</small>
            <em>${escapeHtml(item.bestResult)}</em>
            <button type="button" data-start-challenge="${item.id}">开始挑战</button>
          </article>
        `).join("")}
      </div>
    </section>
  `;
}

function reportsHtml() {
  const reports = state.gameReports || [];
  return `
    <section class="report-center">
      ${reports.length ? reports.slice(0, 10).map((report, index) => `
        <article class="report-card">
          <div><strong>${report.reason === "victory" ? "财务自由报告" : "游戏报告"}</strong><small>第 ${report.round} 回合 · ${escapeHtml(report.createdAt?.slice(0, 10) || "本地")}</small></div>
          <span>${report.freedomPercent}%</span>
          <button type="button" data-view-report="${report.id}">查看报告</button>
          ${index === 0 ? `<button type="button" data-share-report="${report.id}">分享卡片</button>` : ""}
        </article>
      `).join("") : `<section class="progress-empty"><strong>暂无历史报告</strong><p>胜利、挑战结束或手动生成后会保留最近 10 份。</p></section>`}
    </section>
  `;
}

function attachProgressCenterHandlers() {
  el.dealMetrics.querySelectorAll(".progress-tab-rail [data-progress-tab]").forEach((button) => {
    button.addEventListener("click", () => showProgressCenter(button.dataset.progressTab || "freedom"));
  });
  el.dealMetrics.querySelectorAll("[data-mission-help]").forEach((button) => {
    button.addEventListener("click", () => {
      const help = document.querySelector(`#mission-help-${button.dataset.missionHelp}`);
      help?.classList.toggle("hidden");
    });
  });
  el.dealMetrics.querySelectorAll("[data-achievement-filter]").forEach((button) => {
    button.addEventListener("click", () => updateAchievementPanel(button.dataset.achievementFilter || "all", currentAchievementCategory()));
  });
  el.dealMetrics.querySelectorAll("[data-achievement-category]").forEach((button) => {
    button.addEventListener("click", () => updateAchievementPanel(currentAchievementFilter(), button.dataset.achievementCategory || "all"));
  });
  el.dealMetrics.querySelectorAll("[data-start-challenge]").forEach((button) => {
    button.addEventListener("click", () => confirmStartChallenge(button.dataset.startChallenge || "starter-cashflow"));
  });
  el.dealMetrics.querySelectorAll("[data-view-report]").forEach((button) => {
    button.addEventListener("click", () => {
      const report = state.gameReports.find((item) => item.id === button.dataset.viewReport);
      if (report) showGameReport(report, "历史结算报告");
    });
  });
  el.dealMetrics.querySelectorAll("[data-share-report]").forEach((button) => {
    button.addEventListener("click", () => {
      const report = state.gameReports.find((item) => item.id === button.dataset.shareReport);
      if (report) showShareCard(report);
    });
  });
  el.dealMetrics.querySelectorAll("[data-badge-id]").forEach((button) => {
    button.addEventListener("click", () => {
      const badge = state.badges.find((item) => item.id === button.dataset.badgeId);
      if (!badge) return;
      openSimpleModal({
        type: "徽章收藏",
        title: badge.unlocked ? badge.title : "未解锁徽章",
        text: badge.unlocked ? badge.description : "继续完成对应目标后会点亮这个徽章。",
        metrics: [["类别", badge.category], ["状态", badge.unlocked ? `第 ${badge.unlockedAtRound || "-"} 回合解锁` : "尚未解锁"]],
        actions: [{ label: "返回徽章", className: "primary", onClick: () => showProgressCenter("badges") }],
      });
    });
  });
}

function updateAchievementPanel(filter, category) {
  const shell = el.dealMetrics.querySelector(".progress-center-shell");
  if (!shell) return;
  shell.innerHTML = `
    <nav class="progress-tab-rail" aria-label="进度中心分页">
      ${[["freedom", "财务自由"], ["missions", "任务"], ["achievements", "成就"], ["badges", "徽章"], ["challenges", "挑战"], ["reports", "报告"]].map(([id, label]) => `<button type="button" class="${id === "achievements" ? "selected" : ""}" data-progress-tab="${id}" aria-pressed="${id === "achievements"}">${label}</button>`).join("")}
    </nav>
    ${achievementsHtml(filter, category)}
  `;
  attachProgressCenterHandlers();
}

function currentAchievementFilter() {
  return el.dealMetrics.querySelector("[data-achievement-filter].selected")?.dataset.achievementFilter || "all";
}

function currentAchievementCategory() {
  return el.dealMetrics.querySelector("[data-achievement-category].selected")?.dataset.achievementCategory || "all";
}

function claimMissionsAndRefresh() {
  const claimed = claimCompletedMissions(state);
  if (claimed.length) addLog(`领取 ${claimed.length} 个任务奖励。`);
  persistQuietly();
  render();
  showProgressCenter("missions");
}

function refreshMissionsAndRefresh() {
  const result = refreshActiveMissions(state);
  addLog(result.refreshed ? "刷新了当前任务。" : result.reason);
  persistQuietly();
  render();
  showProgressCenter("missions");
}

function createManualReport() {
  const report = addReport(state, createGameReport(state, "manual"));
  persistQuietly();
  showGameReport(report, "当前结算报告");
}

function showVictoryReport(report) {
  setAvatarMood("celebrating", 2200);
  emitFinanceEffect(calculateFinancialFreedomProgress(state).passiveIncome, "财务自由达成", "payday", state.victoryState.reportId || "victory");
  showGameReport(report || createGameReport(state, "victory"), "财务自由达成");
}

function showGameReport(report, title = "游戏结算报告") {
  const sections = buildReportSections(state, report);
  openSimpleModal({
    type: "结算报告",
    title,
    text: "这份报告使用游戏规则整理，不是真实投资建议。你可以继续自由模式，或开始新挑战。",
    metrics: [],
    actions: [
      { label: "分享卡片", onClick: () => showShareCard(report) },
      { label: "继续自由模式", className: "primary", onClick: continueAfterVictory },
      { label: "开始新挑战", onClick: () => showProgressCenter("challenges") },
      { label: "返回首页", onClick: resetGame },
    ],
    outcome: "success",
  });
  el.modal.querySelector(".modal-card")?.classList.add("report-modal-card");
  el.dealMetrics.classList.add("report-body");
  el.dealMetrics.innerHTML = `
    <section class="game-report-layout">
      <div class="report-hero">
        <strong>${report.freedomPercent >= 100 ? "已达成财务自由" : "本局复盘"}</strong>
        <span>${report.freedomPercent}%</span>
        <small>第 ${report.round} 回合 · 第 ${report.month} 月</small>
      </div>
      <div class="report-summary-grid">
        ${sections.summary.map(([label, value]) => `<article><span>${escapeHtml(label)}</span><strong>${escapeHtml(value)}</strong></article>`).join("")}
      </div>
      <div class="report-section-grid">
        ${sections.sections.map((section) => `
          <article>
            <h3>${escapeHtml(section.title)}</h3>
            ${section.items.map((item) => `<p>${escapeHtml(item)}</p>`).join("")}
          </article>
        `).join("")}
      </div>
    </section>
  `;
}

function showShareCard(report) {
  const card = createShareCard(state, report);
  openSimpleModal({
    type: "分享卡片",
    title: "本地分享卡片",
    text: "卡片在浏览器本地生成，不上传服务器。若设备不支持分享，可以复制文字摘要。",
    metrics: [],
    actions: [
      { label: "复制文字", className: "primary", onClick: () => copyShareText(card.text) },
      { label: "返回报告", onClick: () => showGameReport(report, "游戏结算报告") },
    ],
  });
  el.dealMetrics.classList.add("report-body");
  el.dealMetrics.innerHTML = `
    <section class="share-card-panel">
      <img alt="现金流冒险城分享卡片预览" src="${card.dataUrl}">
      <p>${escapeHtml(card.text)}</p>
    </section>
  `;
}

function copyShareText(text) {
  navigator.clipboard?.writeText(text).catch(() => {});
  openSimpleModal({
    type: "分享卡片",
    title: "文字摘要已准备好",
    text,
    actions: [{ label: "知道了", className: "primary", onClick: closeModal }],
  });
}

function continueAfterVictory() {
  continueFreedomMode(state);
  persistQuietly();
  closeModal();
  render();
}

function showFinancialPressure(pressure = evaluateFinancialPressure(state)) {
  openSimpleModal({
    type: "财务压力",
    title: "需要重新规划",
    text: "这不是失败，只是现金流正在提醒你先处理压力。",
    metrics: [
      ["目前现金", money(pressure.cash)],
      ["每月缺口", money(pressure.monthlyGap)],
      ["负债状况", money(pressure.debt)],
      ["可行动作", pressure.actions.join(" · ")],
    ],
    actions: [
      { label: "前往银行", className: "primary", onClick: showBankCenter },
      { label: "查看资产", onClick: () => showProgressCenter("freedom") },
      { label: "继续挑战", onClick: closeModal },
    ],
    outcome: "warning",
  });
}

function maybeRunAiTurns() {
  if (!state?.aiPlayers?.length) return null;
  if (!el.modal.classList.contains("hidden")) return null;
  if (uiState.turnPhase !== "idle" || uiState.isRolling || uiState.isMoving) return null;
  if (state.turnManager?.aiRunning) return null;
  if (state.turnManager?.lastAiCycleRound === state.round) return null;
  state.turnManager.aiRunning = true;
  state.turnManager.status = "aiThinking";
  const result = runAiTurnCycle(state, boardTiles);
  state.turnManager.aiRunning = false;
  persistQuietly();
  render();
  if (!result.skipped && state.leaderboardSettings?.showRoundSummary === "always") {
    showRoundSummary(result.roundSummary);
  } else if (!result.skipped && state.aiActionSummaries?.[0]) {
    showUnlockToast({
      iconKey: "赛",
      type: "AI 回合",
      title: "AI 行动完成",
      description: state.aiActionSummaries[0].shortText,
      targetTab: "leaderboard",
    });
  }
  return result;
}

function showLeaderboardPanel() {
  const leaderboard = calculateLeaderboard(state);
  openSimpleModal({
    type: "竞赛排名",
    title: "本局排名",
    text: "排名来自真实财务数据，默认比较财务自由进度、净资产和月现金流。",
    metrics: leaderboard.map((item) => [
      `${item.rank}. ${item.isPlayer ? "你" : item.name}`,
      `${item.freedomPercent}% · 净资产 ${money(item.netWorth)} · 月现金流 ${money(item.monthlyCashflow)} · ${item.currentStatus}`,
    ]),
    actions: [
      ...state.aiPlayers.slice(0, 3).map((ai) => ({ label: `查看 ${ai.name}`, onClick: () => showAiFinance(ai.id) })),
      { label: "回合摘要", onClick: () => showRoundSummary(state.roundHistory?.[0]) },
      { label: "关闭", className: "primary", onClick: closeModal },
    ],
  });
}

function showAiFinance(aiId) {
  const summary = buildAiPublicSummary(state, aiId);
  if (!summary) return;
  openSimpleModal({
    type: "AI 财务",
    title: summary.name,
    text: "这是公开财务摘要，不显示隐藏随机数、未来事件或内部权重。",
    metrics: [
      ["现金", money(summary.cash)],
      ["月现金流", money(summary.monthlyCashflow)],
      ["被动收入", money(summary.passiveIncome)],
      ["净资产", money(summary.netWorth)],
      ["资产数量", `${summary.assetCount}`],
      ["负债", money(summary.liabilities)],
      ["财务自由进度", `${summary.freedomPercent}%`],
      ["投资组合", `股票 ${money(summary.portfolio.stocks)} · 房产 ${money(summary.portfolio.realEstate)} · 生意 ${money(summary.portfolio.businesses)}`],
      ["最近决策", summary.recentDecisions.map((item) => item.shortText).join(" · ") || "等待行动"],
    ],
    actions: [
      { label: "返回排名", onClick: showLeaderboardPanel },
      { label: "关闭", className: "primary", onClick: closeModal },
    ],
  });
}

function showMarketPanel() {
  const news = state.marketNews?.[0];
  const phase = state.marketCycle?.phase || "recovery";
  openSimpleModal({
    type: "市场新闻",
    title: news?.title || "市场等待更新",
    text: news?.summary || "AI 竞赛每轮会生成一条本地规则市场新闻。",
    metrics: [
      ["市场阶段", phase],
      ["影响范围", news?.affectedAssets?.join(" · ") || "尚无"],
      ["持续时间", news ? `${news.effectDuration} 月` : "等待回合"],
      ["学习提示", news?.learningTip || "这只是游戏市场规则，不是真实投资建议。"],
    ],
    actions: [
      { label: "查看排名", onClick: showLeaderboardPanel },
      { label: "关闭", className: "primary", onClick: closeModal },
    ],
  });
}

function showRoundSummary(summary = state.roundHistory?.[0]) {
  if (!summary) {
    openSimpleModal({
      type: "回合摘要",
      title: "还没有摘要",
      text: "AI 完成一轮行动后会记录玩家、AI、市场和排名变化。",
      actions: [{ label: "知道了", className: "primary", onClick: closeModal }],
    });
    return;
  }
  openSimpleModal({
    type: "回合摘要",
    title: `第 ${summary.round} 回合摘要`,
    text: "摘要来自本轮真实行动，不会重复结算。",
    metrics: [
      ["玩家行动", summary.playerAction],
      ["AI 行动", summary.aiActions.join(" · ")],
      ["市场变化", summary.marketChange],
      ["排名", summary.ranking.join(" · ")],
      ["下一轮提示", summary.nextTip],
    ],
    actions: [
      { label: "查看市场", onClick: showMarketPanel },
      { label: "关闭", className: "primary", onClick: closeModal },
    ],
  });
}

function toggleAiSpeed() {
  if (!state?.aiPlayers?.length) return;
  state.aiAnimationSpeed = state.aiAnimationSpeed === "skip" ? "watch" : "skip";
  persistQuietly();
  renderActions();
}

function confirmStartChallenge(challengeId) {
  const challengeItem = challengeDefinitions.find((item) => item.id === challengeId) || challengeDefinitions[0];
  openSimpleModal({
    type: "挑战模式",
    title: challengeItem.title,
    text: "挑战会使用独立挑战存档，不覆盖正常游戏存档。",
    metrics: [
      ["难度", challengeItem.difficulty],
      ["回合限制", `${challengeItem.roundLimit}`],
      ["目标", challengeItem.objectives.join("、")],
      ["奖励徽章", challengeItem.rewardBadge],
    ],
    actions: [
      { label: "开始挑战", className: "primary", onClick: () => startChallenge(challengeItem.id) },
      { label: "返回", onClick: () => showProgressCenter("challenges") },
    ],
  });
}

function startChallenge(challengeId) {
  const career = state?.career || createDifficultyAdjustedCareer(careers.find((item) => item.id === selectedCareerId) || careers[0], selectedDifficultyId);
  const baseState = state || createNewGameState(career, selectedDifficultyId);
  state = startChallengeState(baseState, challengeId, career);
  persistQuietly();
  closeModal();
  render();
}

function toggleSound() {
  uiState.muted = !uiState.muted;
  soundManager.setMuted(uiState.muted);
  saveExperience();
  if (!uiState.muted) {
    soundManager.play("tap");
    soundManager.startMusic(state ? "board" : "home");
  }
  renderActions();
}

function setAvatarMood(mood, duration = 1500) {
  uiState.avatarMood = mood;
  uiState.avatarState = mood === "walking" ? "walk" : mood === "neutral" || mood === "idle" ? "idle" : mood;
  if (uiState.avatarTimer) clearTimeout(uiState.avatarTimer);
  if (duration > 0 && mood !== "walking") {
    uiState.avatarTimer = setTimeout(() => {
      uiState.avatarMood = "neutral";
      uiState.avatarState = "idle";
      uiState.avatarTimer = null;
      if (state) renderBoard();
    }, prefersReducedMotion() ? 120 : duration);
  }
  if (state) renderBoard();
}

function directionBetween(fromIndex, toIndex) {
  const from = boardPath[fromIndex % boardPath.length] || boardPath[0];
  const to = boardPath[toIndex % boardPath.length] || from;
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  if (Math.abs(dx) >= Math.abs(dy)) return dx >= 0 ? "right" : "left";
  return dy >= 0 ? "down" : "up";
}

function animationScale() {
  if (prefersReducedMotion()) return 0.18;
  return uiState.animationSpeed === "fast" ? 0.62 : 1;
}

function animationMs(standard, fast = standard * 0.62) {
  if (prefersReducedMotion()) return Math.max(20, Math.round(standard * 0.12));
  return Math.round(uiState.animationSpeed === "fast" ? fast : standard);
}

function moodFromAmount(amount, fallback = "neutral") {
  const value = moneyValue(amount);
  if (value > 0) return value > 5000 ? "excited" : "happy";
  if (value < 0) return Math.abs(value) > 5000 ? "sad" : "worried";
  return fallback;
}

function startTutorial(replay = false) {
  uiState.tutorial = { active: true, index: 0, replay };
  soundManager.play("tap");
  renderTutorial();
}

function nextTutorialStep() {
  if (!uiState.tutorial.active) return;
  if (uiState.tutorial.index >= tutorialSteps.length - 1) {
    completeTutorial();
    return;
  }
  uiState.tutorial.index += 1;
  renderTutorial();
}

function previousTutorialStep() {
  if (!uiState.tutorial.active) return;
  uiState.tutorial.index = Math.max(0, uiState.tutorial.index - 1);
  renderTutorial();
}

function skipTutorial() {
  if (!uiState.tutorial.active) return;
  uiState.tutorial.active = false;
  uiState.tutorialComplete = true;
  if (state) recordProgressEvent(state, "tutorialComplete");
  saveExperience();
  renderTutorial();
}

function completeTutorial() {
  uiState.tutorial.active = false;
  uiState.tutorialComplete = true;
  if (state) recordProgressEvent(state, "tutorialComplete");
  saveExperience();
  soundManager.play("win");
  setAvatarMood("celebrating", 1800);
  renderTutorial();
}

function maybeStartTutorial() {
  if (!uiState.tutorialComplete) startTutorial(false);
}

function renderTutorial() {
  document.querySelector("#tutorialOverlay")?.remove();
  if (!uiState.tutorial.active) return;
  const step = tutorialSteps[uiState.tutorial.index] || tutorialSteps[0];
  const overlay = document.createElement("div");
  overlay.className = `tutorial-overlay target-${step.target}`;
  overlay.id = "tutorialOverlay";
  overlay.setAttribute("role", "dialog");
  overlay.setAttribute("aria-modal", "true");
  overlay.setAttribute("aria-label", `新手教学：${step.title}`);
  overlay.innerHTML = `
    <div class="tutorial-spotlight" aria-hidden="true"></div>
    <div class="tutorial-card">
      <span class="tutorial-count">${uiState.tutorial.index + 1} / ${tutorialSteps.length}</span>
      <h2>${step.title}</h2>
      <p>${step.text}</p>
      <div class="tutorial-actions">
        <button type="button" id="tutorialBack" ${uiState.tutorial.index === 0 ? "disabled" : ""}>上一步</button>
        <button type="button" id="tutorialSkip">跳过</button>
        <button class="primary" type="button" id="tutorialNext">${uiState.tutorial.index >= tutorialSteps.length - 1 ? "完成" : "下一步"}</button>
      </div>
    </div>
  `;
  document.body.append(overlay);
  document.querySelector("#tutorialBack")?.addEventListener("click", previousTutorialStep);
  document.querySelector("#tutorialSkip")?.addEventListener("click", skipTutorial);
  document.querySelector("#tutorialNext")?.addEventListener("click", nextTutorialStep);
}

function showContextTip(tipId, force = false) {
  const tip = contextTipMessages[tipId];
  if (!tip) return false;
  if (!force && uiState.seenTips[tipId]) return false;
  uiState.seenTips = { ...uiState.seenTips, [tipId]: true };
  saveExperience();
  openSimpleModal({
    type: "教学提示",
    title: tip.title,
    text: tip.text,
    actions: [{ label: "知道了", className: "primary", onClick: closeModal }],
  });
  setAvatarMood("thinking", 1400);
  return true;
}

function queueContextTip(tipId) {
  const tip = contextTipMessages[tipId];
  if (!tip || uiState.seenTips[tipId] || uiState.pendingTips.includes(tipId)) return false;
  uiState.seenTips = { ...uiState.seenTips, [tipId]: true };
  uiState.pendingTips = [...uiState.pendingTips, tipId];
  saveExperience();
  return true;
}

function statementIcon(label = "") {
  if (label.includes("现金")) return "¥";
  if (label.includes("收入") || label.includes("租金") || label.includes("股息")) return "↑";
  if (label.includes("支出") || label.includes("月供") || label.includes("保费") || label.includes("税")) return "↓";
  if (label.includes("资产")) return "资";
  if (label.includes("贷款") || label.includes("负债")) return "债";
  if (label.includes("信用")) return "信";
  if (label.includes("利率")) return "%";
  if (label.includes("景气")) return "风";
  return "•";
}

function renderStatements() {
  const summary = calculatePortfolioSummary(state.ownedProperties);
  const stockSummary = calculateStockPortfolioSummary(state);
  const businessSummary = calculateBusinessSummary(state);
  const bankSummary = calculateBankSummary(state);
  const lifeSummary = calculateLifeEffectsSummary(state);
  const insurancePremiums = calculateInsurancePremiums(state);
  const taxSummary = calculateTaxSummary(state);
  const economy = getEconomyProfile(state);
  const rows = [
    ["工资收入", state.unemployment.unemployed ? "失业期间工资暂停" : "主动收入", state.unemployment.unemployed ? 0 : state.salary],
    ["人生事件收入", "持续事件造成的收入变化", lifeSummary.monthlyIncomeImpact],
    ["小生意主動收入", "需要你投入時間的淨利", businessSummary.activeIncome],
    ["小生意被動收入", "系統建立後較少時間維持", businessSummary.passiveIncome],
    ["租金收入", "房地产每月租金", summary.monthlyRent],
    ["股票股息", "Payday 发放时进入现金", stockSummary.dividendsReceived],
    ["其他被动收入", "生意或证券流入", passiveIncome() - summary.monthlyRent],
    ["生活支出", "职业基础支出", -state.baseExpenses],
    ["保险保费", "已购保单每月固定支出", -insurancePremiums],
    ["人生持续支出", "医疗、家庭或工作压力持续影响", -lifeSummary.monthlyExpenseImpact],
    ["房贷月供", "房地产贷款月付款", -summary.monthlyMortgage],
    ["房产支出", "管理费与维修准备金", -summary.monthlyExpenses],
    ["其他贷款月供", "非房贷负债月付款", -(liabilityPayments() - summary.monthlyMortgage)],
    ["贷款总额", "银行、个人贷款与房贷余额", -bankSummary.totalDebt],
    ["信用分", `${bankSummary.creditTier} · 影响额度和利率`, bankSummary.creditScore],
    ["当前利率", `${bankSummary.interestLevel} · 个人月利率 ${percentText(bankSummary.personalLoanMonthlyRate)}`, 0],
    ["税务预估", `游戏简化税务 · 税率 ${percentText(taxSummary.taxRate)}`, -taxSummary.taxBalance],
    ["景气状态", economy.description, 0],
    ["净月现金流", "月结日实际增加的现金", netMonthlyCashflow()],
    ["手上现金", "可以投资或应急", state.cash],
    ["净资产", "现金 + 资产 - 负债", calculateNetWorth(state)],
  ];

  el.incomeStatement.innerHTML = rows
    .map(
      ([label, help, value]) => `
        <div class="stat-row hud-metric ${Number(value) < 0 ? "negative-line" : "positive-line"}">
          <span class="hud-metric-icon" aria-hidden="true">${statementIcon(label)}</span>
          <div>
            <strong>${label}</strong>
            <small>${help}</small>
          </div>
          <b>${label === "信用分" ? `${value}` : label === "当前利率" ? bankSummary.interestLevel : label === "景气状态" ? economy.label : money(value)}</b>
        </div>
      `,
    )
    .join("");

  const nonPropertyAssets = state.assets.filter((asset) => asset.type !== "property" && asset.type !== "stock");
  el.assetList.innerHTML = nonPropertyAssets.length
    ? nonPropertyAssets
        .map(
          (asset) => `
            <div class="asset-row positive">
              <div>
                <strong>${asset.name}</strong>
                <small>${assetLabel(asset.type)}，价值 ${money(asset.value)}</small>
              </div>
              <b>+${money(asset.cashflow)}</b>
            </div>
          `,
        )
        .join("")
    : '<div class="asset-row"><strong>暂无其他资产</strong><small>本轮重点资产在房地产中心。</small></div>';

  el.liabilityList.innerHTML = state.liabilities.length
    ? state.liabilities
        .map(
          (item) => `
            <div class="asset-row negative">
              <div>
                <strong>${item.name}</strong>
                <small>${liabilityLabel(item.type)}余额 ${money(item.balance)} · 月供 ${money(item.payment)}</small>
              </div>
              <b>-${money(item.payment)}</b>
            </div>
          `,
        )
        .join("")
    : '<div class="asset-row"><strong>暂无负债</strong><small>借款或买入房产后会增加月供。</small></div>';
}

function renderBankPanel() {
  const summary = calculateBankSummary(state);
  const debt = calculateDebtTotals(state);
  const latestHtml = state.bankTransactions.length
    ? state.bankTransactions
        .slice(0, 5)
        .map(
          (tx) => `
            <div class="history-row">
              <strong>${tx.type}</strong>
              <span>第 ${tx.month} 月 · ${tx.description}</span>
            </div>
          `,
        )
        .join("")
    : '<div class="history-row"><strong>暂无记录</strong><span>贷款、利率变化、再融资和破产保护会记录在这里。</span></div>';

  el.bankPanel.innerHTML = `
    <div class="portfolio-summary bank-summary-grid">
      ${summaryMetric("信用额度", `${money(summary.availableCredit)} / ${money(summary.creditLimit)}`)}
      ${summaryMetric("贷款总额", money(debt.totalDebt))}
      ${summaryMetric("每月月供", money(debt.monthlyPayment))}
      ${summaryMetric("信用分", creditGauge(summary.creditScore))}
      ${summaryMetric("利率", ratePulse(summary.interestLevel))}
      ${summaryMetric("现金", money(summary.cash))}
      ${summaryMetric("净资产", money(summary.netWorth))}
      ${summaryMetric("房贷余额", money(debt.mortgageDebt))}
    </div>
    <div class="bank-actions">
      <button class="primary" type="button" id="bankPanelOpen">打开银行中心</button>
      <button type="button" id="bankPanelLoan">个人贷款</button>
      <button type="button" id="bankPanelRefinance">再融资</button>
    </div>
    <div class="transaction-history">
      <h3>银行记录</h3>
      ${latestHtml}
    </div>
  `;

  document.querySelector("#bankPanelOpen")?.addEventListener("click", () => showBankCenter());
  document.querySelector("#bankPanelLoan")?.addEventListener("click", showPersonalLoanOptions);
  document.querySelector("#bankPanelRefinance")?.addEventListener("click", showRefinanceOptions);
}

function renderLifePanel() {
  const premiums = calculateInsurancePremiums(state);
  const taxSummary = calculateTaxSummary(state);
  const emergency = calculateEmergencyFundStatus(state, totalExpenses());
  const economy = getEconomyProfile(state);
  const activePolicies = state.insurancePolicies.filter((policy) => policy.active);
  const historyHtml = state.lifeEventHistory.length
    ? state.lifeEventHistory
        .slice(0, 8)
        .map(
          (record) => `
            <div class="history-row">
              <strong>${record.category}</strong>
              <span>第 ${record.month} 月 · ${record.title} · ${record.choice} · 现金 ${signedMoney(record.cashChange)}</span>
            </div>
          `,
        )
        .join("")
    : '<div class="history-row"><strong>暂无记录</strong><span>医疗、工作、家庭、税务、保险和法律事件会记录在这里。</span></div>';
  const unemploymentText = state.unemployment.unemployed
    ? `失业中 · 剩余 ${state.unemployment.unemploymentMonthsRemaining} 月 · 找工作 ${state.unemployment.jobSearchProgress}%`
    : "目前有工作";

  el.lifePanel.innerHTML = `
    <div class="portfolio-summary life-summary-grid">
      ${summaryMetric("每月保费", money(premiums))}
      ${summaryMetric("已购保单", `${activePolicies.length} 张`)}
      ${summaryMetric("失业状态", unemploymentText)}
      ${summaryMetric("税务预估", money(taxSummary.estimatedTax))}
      ${summaryMetric("税务余额", money(taxSummary.taxBalance))}
      ${summaryMetric("预备金月数", `${emergency.months} 月 · ${emergency.status}`)}
      ${summaryMetric("建议预备金", money(emergency.suggestedReserve))}
      ${summaryMetric("景气循环", `${economy.label} · ${state.economy.monthsRemaining} 月`)}
    </div>
    <div class="risk-panel">
      <div class="risk-note">${emergency.note}</div>
      <div class="risk-note">游戏中的税务、保险、医疗和法律规则都是简化学习规则，不是真实建议。</div>
    </div>
    <div class="bank-actions">
      <button class="primary" type="button" id="lifeEventButton">抽人生事件</button>
      <button type="button" id="insuranceButton">保险中心</button>
      <button type="button" id="jobSearchButton">寻找工作</button>
      <button type="button" id="taxButton">税务摘要</button>
    </div>
    <div class="transaction-history">
      <h3>人生事件记录</h3>
      <div class="filter-row">
        ${["全部", "医疗", "工作", "家庭", "税务", "保险", "法律", "奖励"].map((filter) => `<span>${filter}</span>`).join("")}
      </div>
      ${historyHtml}
    </div>
  `;

  document.querySelector("#lifeEventButton")?.addEventListener("click", () => showLifeEvent());
  document.querySelector("#insuranceButton")?.addEventListener("click", showInsuranceCenter);
  document.querySelector("#jobSearchButton")?.addEventListener("click", showJobSearch);
  document.querySelector("#taxButton")?.addEventListener("click", () => showTaxSummary(false));
}

function renderRealEstatePortfolio() {
  const summary = calculatePortfolioSummary(state.ownedProperties);
  const propertiesHtml = state.ownedProperties.length
    ? state.ownedProperties
        .map(
          (property) => `
            <button class="property-row motion-pop" type="button" data-property="${property.id}">
              <span class="property-icon">${propertyIcon(property.category)}</span>
              <span>
                <strong>${property.name}</strong>
                <small>${property.category} · 持有 ${Math.max(0, state.month - property.purchasedMonth)} 个月 · ${property.lastMarketChange || "市场未变化"}</small>
              </span>
              <span class="property-numbers">
                <b>${money(property.monthlyCashflow)}</b>
                <small>净值 ${money(property.equity)}</small>
              </span>
            </button>
          `,
        )
        .join("")
    : '<div class="asset-row"><strong>还没有房地产</strong><small>遇到房地产机会时，可以从首付、房贷和租金开始判断。</small></div>';

  const historyHtml = state.propertyTransactions.length
    ? state.propertyTransactions
        .slice(0, 7)
        .map(
          (tx) => `
            <div class="history-row">
              <strong>${tx.type}</strong>
              <span>第 ${tx.month} 月 · ${tx.description}</span>
            </div>
          `,
        )
        .join("")
    : '<div class="history-row"><strong>暂无记录</strong><span>购买、出售、维修和市场变化会记录在这里。</span></div>';

  el.realEstatePortfolio.innerHTML = `
    <div class="portfolio-summary">
      ${summaryMetric("持有数量", `${summary.count} 项`)}
      ${summaryMetric("总市值", money(summary.totalValue))}
      ${summaryMetric("房贷总额", money(summary.totalMortgage))}
      ${summaryMetric("房产净值", money(summary.totalEquity))}
      ${summaryMetric("每月租金", money(summary.monthlyRent))}
      ${summaryMetric("每月支出", money(summary.monthlyExpenses + summary.monthlyMortgage))}
      ${summaryMetric("每月现金流", money(summary.monthlyCashflow))}
    </div>
    <div class="property-list">${propertiesHtml}</div>
    <div class="transaction-history">
      <h3>房地产交易记录</h3>
      ${historyHtml}
    </div>
  `;

  el.realEstatePortfolio.querySelectorAll("[data-property]").forEach((button) => {
    button.addEventListener("click", () => showPropertyDetail(button.dataset.property));
  });
}

function renderStockPortfolio() {
  const summary = calculateStockPortfolioSummary(state);
  const holdingsHtml = state.stockHoldings.length
    ? state.stockHoldings
        .map((holding) => {
          const stock = findStock(state.stockMarket, holding.stockId);
          const ratio = summary.totalValue > 0 ? stockMoney((holding.currentValue / summary.totalValue) * 100) : 0;
          const direction = holding.unrealizedGain >= 0 ? "上涨" : "下跌";
          return `
            <button class="stock-row motion-pop" type="button" data-stock="${holding.stockId}">
              <span class="stock-icon">${stockIcon(stock?.sector)}</span>
              <span>
                <strong>${stock?.name || holding.symbol} <em>${holding.symbol}</em></strong>
                <small>${stock?.sector || "产业"} · ${holding.shares} 股 · 组合占比 ${ratio}%</small>
              </span>
              <span class="stock-numbers ${holding.unrealizedGain >= 0 ? "gain" : "loss"}">
                <b>${direction} ${signedMoney(holding.unrealizedGain)}</b>
                <small>市值 ${money(holding.currentValue)} · ${signedPercent(holding.unrealizedGainPercent)}</small>
              </span>
            </button>
          `;
        })
        .join("")
    : '<div class="asset-row"><strong>还没有股票</strong><small>落到股票机会格后，可以从价格、风险和分散开始判断。</small></div>';

  const warningHtml = summary.warnings.length
    ? summary.warnings.map((warning) => `<div class="risk-note">${warning}</div>`).join("")
    : '<div class="risk-note">目前没有明显集中提醒。分散可以减少一次事件带来的影响，但不能消除所有风险。</div>';

  const historyHtml = state.stockTransactions.length
    ? state.stockTransactions
        .slice(0, 8)
        .map(
          (tx) => `
            <div class="history-row">
              <strong>${tx.type}</strong>
              <span>第 ${tx.month} 月 · ${tx.description}</span>
            </div>
          `,
        )
        .join("")
    : '<div class="history-row"><strong>暂无记录</strong><span>买入、卖出、股息和迁移会记录在这里。</span></div>';

  el.stockPortfolio.innerHTML = `
    <div class="portfolio-summary stock-summary-grid">
      ${summaryMetric("股票总市值", money(summary.totalValue))}
      ${summaryMetric("总投入成本", money(summary.totalCost))}
      ${summaryMetric("未实现损益", `${summary.unrealizedGain >= 0 ? "上涨" : "下跌"} ${signedMoney(summary.unrealizedGain)}`)}
      ${summaryMetric("已实现损益", signedMoney(summary.realizedGain))}
      ${summaryMetric("累计股息", money(summary.dividendsReceived))}
      ${summaryMetric("持有股票", `${summary.holdingCount} 支`)}
      ${summaryMetric("组合风险", summary.riskLevel)}
      ${summaryMetric("最大单一占比", `${summary.maxSingleHoldingRatio}%`)}
    </div>
    <div class="risk-panel">${warningHtml}</div>
    <div class="stock-list">${holdingsHtml}</div>
    <div class="transaction-history">
      <h3>股票交易记录</h3>
      ${historyHtml}
    </div>
  `;

  el.stockPortfolio.querySelectorAll("[data-stock]").forEach((button) => {
    button.addEventListener("click", () => showStockDetail(button.dataset.stock));
  });
}

function renderBusinessPortfolio() {
  const summary = calculateBusinessSummary(state);
  const holdingsHtml = state.businessHoldings.length
    ? state.businessHoldings
        .map(
          (business) => `
            <button class="business-row motion-pop" type="button" data-business="${business.businessId}">
              <span class="business-icon">${businessIcon(business.category)}</span>
              <span>
                <strong>${business.name}</strong>
                <small>等級 ${business.level} · ${business.condition} · 需求 ${Math.round(business.demandModifier * 100)}%</small>
              </span>
              <span class="business-numbers ${business.monthlyProfit >= 0 ? "gain" : "loss"}">
                <b>${business.monthlyProfit >= 0 ? "淨利" : "虧損"} ${signedMoney(business.monthlyProfit)}</b>
                <small>價值 ${money(business.currentValue)} · 被動 ${Math.round(business.passiveRatio * 100)}%</small>
              </span>
            </button>
          `,
        )
        .join("")
    : '<div class="asset-row"><strong>還沒有小生意</strong><small>落到小生意機會格後，可以從營收、成本和淨利開始判斷。</small></div>';

  const warningsHtml = summary.warnings.length
    ? summary.warnings.map((warning) => `<div class="risk-note">${warning}</div>`).join("")
    : '<div class="risk-note">目前沒有明顯集中提醒。分散可以降低一次事件的影響，但不能消除所有風險。</div>';

  const historyHtml = state.businessTransactions.length
    ? state.businessTransactions
        .slice(0, 8)
        .map(
          (tx) => `
            <div class="history-row">
              <strong>${tx.type}</strong>
              <span>第 ${tx.month} 月 · ${tx.description}</span>
            </div>
          `,
        )
        .join("")
    : '<div class="history-row"><strong>暂无记录</strong><span>投資、升級、收入、事件和出售會記錄在這裡。</span></div>';

  el.businessPortfolio.innerHTML = `
    <div class="portfolio-summary business-summary-grid">
      ${summaryMetric("持有數量", `${summary.count} 個`)}
      ${summaryMetric("總市值", money(summary.totalValue))}
      ${summaryMetric("每月營收", money(summary.monthlyRevenue))}
      ${summaryMetric("每月成本", money(summary.monthlyExpenses))}
      ${summaryMetric("每月淨利", money(summary.monthlyProfit))}
      ${summaryMetric("累計獲利", money(summary.cumulativeProfit))}
      ${summaryMetric("平均風險", summary.averageRisk)}
      ${summaryMetric("被動占比", `${summary.passiveRatio}%`)}
    </div>
    <div class="risk-panel">${warningsHtml}</div>
    <div class="business-list">${holdingsHtml}</div>
    <div class="transaction-history">
      <h3>小生意交易記錄</h3>
      <div class="filter-row">
        ${["全部", "投資", "升級", "收入", "支出", "市場變化", "出售"].map((filter) => `<span>${filter}</span>`).join("")}
      </div>
      ${historyHtml}
    </div>
  `;

  el.businessPortfolio.querySelectorAll("[data-business]").forEach((button) => {
    button.addEventListener("click", () => showBusinessDetail(button.dataset.business));
  });
}

function summaryMetric(label, value) {
  return `<div class="summary-metric"><span>${label}</span><strong>${value}</strong></div>`;
}

function renderLogs() {
  el.logList.innerHTML = state.logs.map((item) => `<div class="log-item">${item}</div>`).join("");
}

function emitFinanceEffect(amount, label = "现金变化", kind = "neutral", transactionId = "") {
  if (transactionId) {
    if (uiState.playedEffectIds.has(transactionId)) return;
    uiState.playedEffectIds.add(transactionId);
  }
  const number = moneyValue(amount);
  const layer = document.createElement("div");
  const lane = Math.min(3, document.querySelectorAll(".finance-effect").length);
  layer.className = `finance-effect ${number >= 0 ? "positive" : "negative"} ${kind}`;
  layer.style.setProperty("--effect-offset", `${lane * 72}px`);
  layer.setAttribute("role", "status");
  layer.setAttribute("aria-live", "polite");
  const effectLabel = number >= 0 ? "现金增加" : "现金减少";
  const icon = number >= 0 ? (kind === "payday" ? "薪" : "¥") : kind === "expense" ? "账" : "债";
  layer.innerHTML = `
    <span class="effect-icon">${icon}</span>
    <strong>${number >= 0 ? "+" : "-"}${money(Math.abs(number))}</strong>
    <small>${effectLabel} · ${label}</small>
    <span class="effect-trail" aria-hidden="true"></span>
    <span class="effect-particle one" aria-hidden="true"></span>
    <span class="effect-particle two" aria-hidden="true"></span>
    <span class="effect-particle three" aria-hidden="true"></span>
  `;
  document.body.append(layer);
  soundManager.play(number >= 0 ? "income" : "expense");
  if (number >= 0) haptic([8, 24, 8], uiState.hapticsEnabled);
  else haptic([14, 20, 14], uiState.hapticsEnabled);
  setAvatarMood(moodFromAmount(number), 1400);
  setTimeout(() => layer.remove(), prefersReducedMotion() ? 260 : 1800);
}

function assetLabel(type) {
  return {
    property: "房产",
    business: "生意",
    stock: "证券",
  }[type] || "资产";
}

function propertyIcon(category) {
  return {
    小套房: "套",
    学生公寓: "学",
    双拼屋: "双",
    郊区住宅: "宅",
    商店店面: "店",
    停车位: "车",
    小型仓库: "仓",
    度假小屋: "假",
    小型办公空间: "办",
    多户住宅: "户",
  }[category] || "房";
}

function stockIcon(sector = "") {
  return {
    科技: "科",
    绿能: "绿",
    消费: "食",
    运输: "运",
    教育: "学",
    健康: "康",
    金融: "银",
    娱乐: "乐",
    零售: "店",
    基金: "篮",
  }[sector] || "股";
}

function businessIcon(category = "") {
  return {
    食品: "食",
    寵物服務: "寵",
    零售: "店",
    手作: "作",
    教育: "課",
    自動化: "自",
    線上服務: "雲",
    維修服務: "修",
  }[category] || "生";
}

function signedMoney(value) {
  const number = moneyValue(value);
  return `${number >= 0 ? "+" : "-"}${money(Math.abs(number))}`;
}

function signedPercent(value) {
  const number = stockMoney(value);
  return `${number >= 0 ? "+" : "-"}${Math.abs(number)}%`;
}

function percentText(value) {
  const number = Number(value);
  if (!Number.isFinite(number)) return "0%";
  return `${(number * 100).toFixed(2)}%`;
}

function liabilityLabel(type = "") {
  return {
    mortgage: "房贷",
    personalLoan: "个人贷款",
    emergency: "紧急负债",
  }[type] || "负债";
}

function creditGauge(score) {
  const safeScore = Math.max(300, Math.min(850, moneyValue(score)));
  const percent = Math.round(((safeScore - 300) / 550) * 100);
  return `<div class="credit-gauge" aria-label="信用分 ${safeScore}"><span style="width:${percent}%"></span></div>${safeScore}`;
}

function ratePulse(label) {
  return `<span class="rate-pulse">${label}</span>`;
}

async function rollDice(forcedRoll = null) {
  if (!canRoll()) return;
  try {
    setTurnPhase("rolling");
    soundManager.play("dice");
    haptic(12, uiState.hapticsEnabled);
    setAvatarState("idle");
    render();
    const roll = typeof forcedRoll === "number" ? Math.max(1, Math.min(6, Math.round(forcedRoll))) : Math.floor(Math.random() * 6) + 1;
    const previous = state.position;
    uiState.previewIndices = nextIndices(previous, roll, boardTiles.length);
    const tickCount = prefersReducedMotion() ? 2 : uiState.animationSpeed === "fast" ? 8 : 12;
    for (let index = 0; index < tickCount; index += 1) {
      state.lastRoll = (index % 6) + 1;
      render();
      await wait(animationMs(72, 50));
    }
    state.lastRoll = roll;
    setTurnPhase("diceResult");
    soundManager.play("land");
    haptic(22, uiState.hapticsEnabled);
    render();
    await wait(animationMs(160, 90));
    setTurnPhase("preparingMove");
    if (uiState.camera.follow) {
      focusCameraOnPlayer(false, Math.min(1.08, uiState.camera.scale + 0.08));
    }
    await movePlayerStepByStep(previous, roll);
    const next = state.position;
    uiState.previewIndices = [];
    uiState.movingStep = 0;
    uiState.movingTotal = 0;
    setTurnPhase("arriving");
    setAvatarState("land", 420);
    soundManager.play("happy");
    haptic(8, uiState.hapticsEnabled);
    addLog(`掷出 ${roll}，逐格移动到「${boardTiles[next].title}」。`);
    state.round += 1;
    persistQuietly();
    render();
    if (uiState.camera.follow) focusCameraOnPlayer(false, uiState.camera.scale);
    await wait(animationMs(380, 230));
    setTurnPhase("openingEvent");
    renderActions();
    triggerTile(boardTiles[next]);
  } catch {
    setTurnPhase("idle");
    uiState.previewIndices = [];
    render();
  }
}

async function movePlayerStepByStep(previous, roll) {
  uiState.movingTotal = roll;
  setTurnPhase("moving");
  setAvatarState("walk");
  for (let step = 1; step <= roll; step += 1) {
    const beforeIndex = state.position;
    const nextIndex = indexAfter(previous, step, boardTiles.length);
    uiState.movingStep = step;
    uiState.hudStatus = phaseLabel("moving");
    uiState.avatarDirection = directionBetween(beforeIndex, nextIndex);
    state.position = nextIndex;
    if (nextIndex === 0 && step < roll) {
      collectPayday("经过月结日");
    }
    soundManager.play("step");
    haptic(8, uiState.hapticsEnabled);
    render();
    if (uiState.camera.follow) focusCameraOnPlayer(false, uiState.camera.scale);
    await wait(animationMs(240, 150));
  }
  setAvatarState("idle");
}

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function prefersReducedMotion() {
  return window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
}

function triggerTile(tile) {
  if (tile.type === "payday") {
    collectPayday("停在月结日");
    setTurnPhase("turnComplete");
    render();
    finishTurnSoon(220);
    return;
  }

  if (tile.type === "opportunity") {
    showOpportunity();
    return;
  }

  if (tile.type === "stockOpportunity") {
    showStockOpportunity();
    return;
  }

  if (tile.type === "businessOpportunity") {
    showBusinessOpportunity();
    return;
  }

  if (tile.type === "doodad") {
    showDoodad();
    return;
  }

  if (tile.type === "market") {
    showPropertyMarket();
    return;
  }

  if (tile.type === "stockMarket") {
    showStockMarket();
    return;
  }

  if (tile.type === "businessEvent") {
    showBusinessRiskEvent();
    return;
  }

  if (tile.type === "businessMarket") {
    showBusinessMarket();
    return;
  }

  if (tile.type === "lifeEvent") {
    showLifeEvent();
    return;
  }

  if (tile.type === "family") {
    showLifeEvent(pickLifeEvent(state, "家庭责任"));
    return;
  }

  if (tile.type === "charity") {
    showCharityEvent();
    return;
  }

  if (tile.type === "insurance") {
    showInsuranceCenter();
    return;
  }

  if (tile.type === "tax") {
    showTaxSummary(true);
    return;
  }

  if (tile.type === "jobEvent") {
    showLifeEvent(pickLifeEvent(state, "失业与工作"));
    return;
  }

  if (tile.type === "propertyEvent") {
    showPropertyHoldingEvent();
    return;
  }

  if (tile.type === "learn") {
    showLearning();
    return;
  }

  if (tile.type === "bank") {
    showBankCenter(true);
  }
}

function collectPayday(reason) {
  const beforeCashflow = netMonthlyCashflow();
  state.cash += beforeCashflow;
  emitFinanceEffect(beforeCashflow, "薪水日结算", beforeCashflow >= 0 ? "payday" : "expense");
  const mortgageResults = applyMortgagePayday(state);
  const dividendResult = settleStockDividends(state);
  const priceTick = resolveStockPriceTick(state, "Payday 后股票价格更新");
  const businessResult = settleBusinessPayday(state);
  const unemploymentResult = settleUnemploymentMonth(state);
  const expiredLifeEffects = settleLifeEffectsMonth(state);
  const economyResult = advanceEconomyCycle(state);
  state.month += 1;
  addLog(`${reason}：结算净现金流 ${money(beforeCashflow)}。`);
  if (dividendResult.totalDividend > 0) {
    recordProgressEvent(state, "dividend");
    addLog(`收到股票股息 ${money(dividendResult.totalDividend)}。股息不是每家公司都会发放。`);
    queueContextTip("firstDividend");
    setAvatarMood("happy", 1400);
  }
  if (priceTick.affected.length) {
    addLog(`股票价格更新：${priceTick.affected.slice(0, 2).map((item) => `${item.symbol}${item.direction}${signedPercent(item.percent)}`).join("，")}。`);
  }
  if (!businessResult.skipped && businessResult.details.length) {
    addLog(`小生意月結：營收 ${money(businessResult.totalRevenue)}，成本 ${money(businessResult.totalExpenses)}，淨利 ${money(businessResult.totalProfit)}。`);
  }
  if (!unemploymentResult.skipped && unemploymentResult.benefit > 0) {
    addLog(`失业保险补助 ${money(unemploymentResult.benefit)} 入账。`);
  }
  if (expiredLifeEffects.length) {
    addLog(`${expiredLifeEffects.length} 个持续人生事件影响结束。`);
  }
  if (economyResult.changed) {
    addLog(`景气进入「${economyResult.profile.label}」：${economyResult.profile.description}`);
  }
  mortgageResults.forEach((result) => {
    addLog(`${result.propertyName} 本月偿还本金 ${money(result.principal)}，剩余房贷 ${money(result.afterBalance)}。`);
    if (result.paidOff) {
      addLog(`庆祝！${result.propertyName} 房贷还清，房产现金流提高。`);
      openSimpleModal({
        type: "房贷还清",
        title: "你真正拥有了更多房产",
        text: `${result.propertyName} 的房贷已经还清。每次偿还一部分本金，你真正拥有的房产比例就会增加。`,
        actions: [{ label: "太好了", className: "primary", onClick: closeModal }],
      });
    }
  });
  if (state.cash < 0) {
    const protection = evaluateBankruptcyProtection(state);
    addLog(protection.message);
    queueContextTip("cashShortage");
    queueContextTip("firstDebt");
    if (protection.status === "bankrupt") {
      persistQuietly();
      render();
      showBankruptcyProtection(protection);
      return;
    }
  }
  persistQuietly();
  checkWin();
}

function showOpportunity() {
  recordProgressEvent(state, "propertyCard");
  processProgress(false);
  const card = pick(realEstateOpportunities);
  const iqDiscount = Math.min(0.08, state.financialIq * 0.01);
  const opportunity = {
    ...card,
    downPayment: Math.round(card.downPayment * (1 - iqDiscount)),
  };
  const mortgagePlan = calculateMortgagePurchasePlan(state, opportunity, "mortgage");
  const cashPlan = calculateMortgagePurchasePlan(state, opportunity, "cash");
  const calculation = calculateOpportunityWithFinancing(opportunity, mortgagePlan);
  const eventId = `opportunity-${state.round}-${state.position}-${opportunity.id}`;
  const shortfall = Math.max(0, mortgagePlan.cashRequired - state.cash);
  const cashShortfall = Math.max(0, cashPlan.cashRequired - state.cash);
  const cashAfter = state.cash - mortgagePlan.cashRequired;
  const reserveMonths = calculateEmergencyReserveMonths(state, cashAfter);
  const requiredMonths = emergencyReserveRequiredMonths(opportunity.riskLevel);

  openSimpleModal({
    type: "房地产机会",
    title: opportunity.name,
    text: `${opportunity.description} ${opportunity.childNote}`,
    metrics: propertyOpportunityMetrics(opportunity, calculation),
    actions: [
      {
        label: shortfall > 0 ? `房贷购买还差 ${money(shortfall)}` : "房贷购买",
        className: "primary",
        disabled: shortfall > 0,
        onClick: () => {
          if (shortfall > 0) return;
          if (reserveMonths < requiredMonths) {
            showEmergencyReserveConfirm(opportunity, eventId, reserveMonths, requiredMonths, mortgagePlan);
            return;
          }
          completePropertyPurchase(opportunity, eventId, mortgagePlan);
        },
      },
      {
        label: cashShortfall > 0 ? `现金购买还差 ${money(cashShortfall)}` : "现金购买",
        disabled: cashShortfall > 0,
        onClick: () => completePropertyPurchase(opportunity, `${eventId}-cash`, cashPlan),
      },
      { label: "为什么？", onClick: () => showOpportunityWhy(opportunity, calculation, eventId) },
      { label: "查看计算", onClick: () => showOpportunityCalculation(opportunity, calculation, eventId, mortgagePlan, cashPlan) },
      {
        label: "放弃",
        onClick: () => {
          state.settledEvents.push(eventId);
          addLog(`放弃了「${opportunity.name}」。`);
          closeModal();
          persistQuietly();
          render();
        },
      },
    ],
  });
}

function propertyOpportunityMetrics(opportunity, calculation) {
  const mortgagePlan = calculateMortgagePurchasePlan(state, opportunity, "mortgage");
  return [
    ["类型", opportunity.category],
    ["总价", money(opportunity.purchasePrice)],
    ["首付款", money(mortgagePlan.downPayment)],
    ["贷款金额", money(mortgagePlan.loanAmount)],
    ["当前房贷利率", percentText(mortgagePlan.interestRate)],
    ["每月租金", money(opportunity.monthlyRent)],
    ["每月房贷", money(mortgagePlan.monthlyPayment)],
    ["管理与维修", money(calculation.monthlyExpenses)],
    ["每月净现金流", money(calculation.monthlyCashflow)],
    ["预计房产净值", money(calculation.projectedEquity)],
    ["风险等级", opportunity.riskLevel],
    ["地段等级", opportunity.locationQuality],
    ["儿童说明", opportunity.childNote],
  ];
}

function showOpportunityWhy(opportunity, calculation, eventId) {
  recordProgressEvent(state, "why");
  processProgress(false);
  openSimpleModal({
    type: "为什么",
    title: `${opportunity.name} 值得看什么？`,
    text: `房地产不是只看总价。你要先看首付会不会掏空现金，再看租金扣掉房贷、管理费和维修准备金后是否仍有净现金流。`,
    metrics: [
      ["风险", opportunity.riskLevel],
      ["地段", opportunity.locationQuality],
      ["状态", opportunity.condition],
      ["现金流判断", calculation.monthlyCashflow >= 0 ? "每月流入" : "每月倒贴"],
    ],
    actions: [
      { label: "返回机会卡", className: "primary", onClick: () => showOpportunityByCard(opportunity, eventId) },
      { label: "放弃", onClick: closeModal },
    ],
  });
}

function showOpportunityCalculation(opportunity, calculation, eventId) {
  const mortgagePlan = calculateMortgagePurchasePlan(state, opportunity, "mortgage");
  const cashPlan = calculateMortgagePurchasePlan(state, opportunity, "cash");
  openSimpleModal({
    type: "查看计算",
    title: `${opportunity.name} 每月现金流`,
    text: "每月租金 − 每月房贷 − 管理费 − 维修准备金 ＝ 每月净现金流。",
    metrics: [
      ["每月租金", money(opportunity.monthlyRent)],
      ["− 每月房贷", money(-mortgagePlan.monthlyPayment)],
      ["− 管理费", money(-opportunity.managementFee)],
      ["− 维修准备金", money(-opportunity.repairReserve)],
      ["＝ 每月净现金流", money(calculation.monthlyCashflow)],
      ["现金购买净现金流", money(cashPlan.monthlyCashflow)],
    ],
    actions: [
      { label: "返回机会卡", className: "primary", onClick: () => showOpportunityByCard(opportunity, eventId) },
      { label: "关闭", onClick: closeModal },
    ],
  });
}

function showOpportunityByCard(opportunity, eventId) {
  const mortgagePlan = calculateMortgagePurchasePlan(state, opportunity, "mortgage");
  const cashPlan = calculateMortgagePurchasePlan(state, opportunity, "cash");
  const calculation = calculateOpportunityWithFinancing(opportunity, mortgagePlan);
  const shortfall = Math.max(0, mortgagePlan.cashRequired - state.cash);
  const cashShortfall = Math.max(0, cashPlan.cashRequired - state.cash);
  openSimpleModal({
    type: "房地产机会",
    title: opportunity.name,
    text: `${opportunity.description} ${opportunity.childNote}`,
    metrics: propertyOpportunityMetrics(opportunity, calculation),
    actions: [
      {
        label: shortfall > 0 ? `房贷购买还差 ${money(shortfall)}` : "房贷购买",
        className: "primary",
        disabled: shortfall > 0,
        onClick: () => completePropertyPurchase(opportunity, eventId, mortgagePlan),
      },
      {
        label: cashShortfall > 0 ? `现金购买还差 ${money(cashShortfall)}` : "现金购买",
        disabled: cashShortfall > 0,
        onClick: () => completePropertyPurchase(opportunity, `${eventId}-cash`, cashPlan),
      },
      { label: "查看计算", onClick: () => showOpportunityCalculation(opportunity, calculation, eventId, mortgagePlan, cashPlan) },
      { label: "放弃", onClick: closeModal },
    ],
  });
}

function showEmergencyReserveConfirm(opportunity, eventId, reserveMonths, requiredMonths, financing) {
  openSimpleModal({
    type: "现金安全垫提醒",
    title: "购买后现金会偏低",
    text: "房产可能赚钱，但你仍需要留钱处理维修和生活意外。",
    metrics: [
      ["购买后现金", money(state.cash - opportunity.downPayment)],
      ["约可覆盖支出", `${reserveMonths} 个月`],
      ["建议安全垫", `${requiredMonths} 个月`],
      ["风险等级", opportunity.riskLevel],
    ],
    actions: [
      { label: "仍然购买", className: "primary", onClick: () => completePropertyPurchase(opportunity, eventId, financing) },
      { label: "先不买", onClick: closeModal },
    ],
  });
}

function completePropertyPurchase(opportunity, eventId, financing = null) {
  if (state.settledEvents.includes(eventId)) return;
  const result = buyProperty(state, opportunity, eventId, financing);
  if (!result.ok) {
    openSimpleModal({
      type: "无法购买",
      title: "购买没有完成",
      text: result.reason,
      actions: [{ label: "知道了", className: "primary", onClick: closeModal }],
    });
    return;
  }
  addLog(`${result.property.financingMode === "cash" ? "现金买入" : "房贷买入"}「${result.property.name}」，每月房地产现金流 ${money(result.property.monthlyCashflow)}。`);
  emitFinanceEffect(-result.property.downPayment, "买入房地产", "buy");
  queueContextTip("firstProperty");
  setAvatarMood("proud", 1800);
  persistQuietly();
  render();
  openSimpleModal({
    type: "购买成功",
    title: "新房地产加入资产中心",
    text:
      result.property.mortgageBalance > 0
        ? `扣除首付 ${money(result.property.downPayment)}，新增房贷 ${money(result.property.originalMortgage)}。`
        : `一次支付 ${money(result.property.downPayment)}，没有新增房贷。`,
    metrics: [
      ["剩余现金", money(state.cash)],
      ["每月租金", money(result.property.monthlyRent)],
      ["每月支出", money(result.property.monthlyExpenses + result.property.mortgagePayment)],
      ["净现金流变化", money(result.property.monthlyCashflow)],
      ["房产净值", money(result.property.equity)],
      ["净资产", money(calculateNetWorth(state))],
    ],
    actions: [{ label: "查看资产中心", className: "primary", onClick: closeModal }],
    outcome: "success",
  });
  checkWin();
}

function showStockOpportunity(stock = pick(state.stockMarket)) {
  const holding = state.stockHoldings.find((item) => item.stockId === stock.id);
  const change = stockMoney(stock.currentPrice - stock.previousPrice);
  const changePercent = stock.previousPrice > 0 ? stockMoney((change / stock.previousPrice) * 100) : 0;
  const eventId = `stock-buy-${state.round}-${state.position}-${stock.id}`;
  openSimpleModal({
    type: "股票机会",
    title: `${stock.name} (${stock.symbol})`,
    text: `${stock.description} ${stock.childNote}`,
    metrics: [
      ["产业", stock.sector],
      ["当前价格", money(stock.currentPrice)],
      ["上次价格", money(stock.previousPrice)],
      ["最近涨跌", `${change >= 0 ? "上涨" : "下跌"} ${signedMoney(change)} (${signedPercent(changePercent)})`],
      ["风险等级", stock.riskLevel],
      ["股息资料", stock.dividendPerShare > 0 ? `每股 ${money(stock.dividendPerShare)}，每 ${stock.dividendFrequency} 月` : "暂无股息"],
      ["趋势说明", `${stock.trend} · 波动 ${Math.round(stock.volatility * 100)}%`],
      ["目前持有", `${holding?.shares || 0} 股`],
      ["可用现金", money(state.cash)],
      ["学习说明", stockLearningNotes.buy],
    ],
    actions: [
      { label: "买入 1 股", className: "primary", onClick: () => completeStockPurchase(stock.id, 1, `${eventId}-1`) },
      { label: "买入 5 股", onClick: () => completeStockPurchase(stock.id, 5, `${eventId}-5`) },
      { label: "买入 10 股", onClick: () => completeStockPurchase(stock.id, 10, `${eventId}-10`) },
      { label: "自定义数量", onClick: () => showStockCustomBuy(stock, eventId) },
      { label: "为什么？", onClick: () => showStockWhy(stock, () => showStockOpportunity(stock)) },
      { label: "查看价格记录", onClick: () => showStockPriceHistory(stock, () => showStockOpportunity(stock)) },
      {
        label: "放弃",
        onClick: () => {
          addLog(`放弃了股票机会「${stock.name}」。`);
          closeModal();
          render();
        },
      },
    ],
  });
}

function showStockCustomBuy(stock, eventId) {
  openSimpleModal({
    type: "自定义买入",
    title: `${stock.name} 买入数量`,
    text: "请输入正整数股数。买入前会检查现金、最低数量和持仓上限。",
    metrics: [
      ["当前价格", money(stock.currentPrice)],
      ["最低购买", `${stock.minimumPurchase} 股`],
      ["最高持仓", `${stock.maximumPurchase} 股`],
      ["数量", '<input class="quantity-input" id="stockQuantityInput" type="number" min="1" step="1" value="1" />'],
    ],
    actions: [
      {
        label: "确认买入",
        className: "primary",
        onClick: () => {
          const quantity = stockShares(document.querySelector("#stockQuantityInput")?.value);
          completeStockPurchase(stock.id, quantity, `${eventId}-custom-${quantity}`);
        },
      },
      { label: "返回", onClick: () => showStockOpportunity(stock) },
    ],
  });
}

function completeStockPurchase(stockId, quantity, eventId) {
  const result = buyStock(state, stockId, quantity, eventId);
  if (!result.ok) {
    openSimpleModal({
      type: "无法买入",
      title: "股票交易没有完成",
      text: result.reason,
      actions: [{ label: "知道了", className: "primary", onClick: closeModal }],
    });
    return;
  }
  addLog(`买入 ${result.stock.name} ${result.shares} 股，花费 ${money(result.totalAmount)}。`);
  emitFinanceEffect(-result.totalAmount, "买入股票", "buy");
  queueContextTip("firstStock");
  setAvatarMood("excited", 1500);
  persistQuietly();
  render();
  const summary = calculateStockPortfolioSummary(state);
  openSimpleModal({
    type: "买入成功",
    title: `${result.stock.name} 已加入股票持仓`,
    text: "不同价格买入后，平均成本能帮助你看出整体买入价格。",
    metrics: [
      ["买入股数", `${result.shares} 股`],
      ["成交价格", money(result.stock.currentPrice)],
      ["花费现金", money(result.totalAmount)],
      ["剩余现金", money(state.cash)],
      ["股票总市值", money(summary.totalValue)],
      ["净资产", money(calculateNetWorth(state))],
    ],
    actions: [{ label: "查看股票中心", className: "primary", onClick: closeModal }],
    outcome: "success",
  });
}

function showStockWhy(stock, backAction) {
  openSimpleModal({
    type: "为什么",
    title: `${stock.name} 学习说明`,
    text: "这些说明是游戏里的财商练习，不是真实投资建议。",
    metrics: [
      ["买入", stockLearningNotes.buy],
      ["平均成本", stockLearningNotes.averageCost],
      ["未实现损益", stockLearningNotes.unrealized],
      ["股息", stockLearningNotes.dividend],
      ["风险", stockLearningNotes.risk],
      ["分散", stockLearningNotes.diversification],
    ],
    actions: [
      { label: "返回", className: "primary", onClick: backAction },
      { label: "关闭", onClick: closeModal },
    ],
  });
}

function showStockPriceHistory(stock, backAction) {
  const latest = findStock(state.stockMarket, stock.id) || stock;
  const high = Math.max(...latest.priceHistory);
  const low = Math.min(...latest.priceHistory);
  openSimpleModal({
    type: "价格记录",
    title: `${latest.name} 最近价格`,
    text: "这是最近价格记录，不包含复杂技术指标，也不是预测。",
    metrics: [
      ["迷你趋势图", miniTrend(latest.priceHistory)],
      ["历史最高", money(high)],
      ["历史最低", money(low)],
      ["最近记录", latest.priceHistory.slice(-12).map((price) => money(price)).join(" · ")],
    ],
    actions: [
      { label: "返回", className: "primary", onClick: backAction },
      { label: "关闭", onClick: closeModal },
    ],
  });
}

function miniTrend(history) {
  const values = history.slice(-12);
  const high = Math.max(...values);
  const low = Math.min(...values);
  const range = Math.max(1, high - low);
  const points = values
    .map((value, index) => {
      const x = values.length === 1 ? 0 : (index / (values.length - 1)) * 100;
      const y = 38 - ((value - low) / range) * 32;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
  return `<svg class="mini-chart" viewBox="0 0 100 44" role="img" aria-label="最近价格折线"><polyline points="${points}" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" /></svg>`;
}

function showBankCenter(fromTile = false) {
  ensureBankingState(state);
  const summary = calculateBankSummary(state);
  const debt = calculateDebtTotals(state);
  const credit = calculateCreditLimit(state);
  const latest = state.bankTransactions.slice(0, 4).map((tx) => `第 ${tx.month} 月 ${tx.type}`).join(" · ") || "暂无记录";
  openSimpleModal({
    type: fromTile ? "银行格" : "银行中心",
    title: "银行与贷款",
    text: "贷款会马上增加现金，但之后每个月都要还款。信用分数和利率会影响可借额度与月供。",
    metrics: [
      ["现金", money(summary.cash)],
      ["净资产", money(summary.netWorth)],
      ["信用额度", `${money(credit.available)} / ${money(credit.totalLimit)}`],
      ["信用分", creditGauge(summary.creditScore)],
      ["贷款总额", money(debt.totalDebt)],
      ["每月总月供", money(debt.monthlyPayment)],
      ["当前利率", ratePulse(summary.interestLevel)],
      ["个人贷款月利率", percentText(summary.personalLoanMonthlyRate)],
      ["房贷月利率", percentText(summary.mortgageMonthlyRate)],
      ["最近银行记录", latest],
    ],
    actions: [
      { label: "申请个人贷款", className: "primary", onClick: showPersonalLoanOptions },
      { label: "利率事件", onClick: showInterestEvent },
      { label: "查看再融资", onClick: showRefinanceOptions },
      { label: "破产保护", onClick: () => showBankruptcyProtection(evaluateBankruptcyProtection(state)) },
      { label: "关闭", onClick: closeModal },
    ],
  });
}

function showPersonalLoanOptions() {
  const summary = calculateBankSummary(state);
  openSimpleModal({
    type: "Personal Loan",
    title: "选择个人贷款",
    text: bankingLearningNotes.loan,
    metrics: [
      ["可用信用额度", money(summary.availableCredit)],
      ["信用分", creditGauge(summary.creditScore)],
      ["当前利率", `${summary.interestLevel} · ${percentText(summary.personalLoanMonthlyRate)}/月`],
      ["提醒", "借款会加入现金，也会增加负债和每月还款金额。"],
    ],
    actions: [
      ...personalLoanProducts.map((amount) => ({
        label: `贷款 ${money(amount)}`,
        className: amount <= summary.availableCredit ? "primary" : "",
        disabled: amount > summary.availableCredit,
        onClick: () => completePersonalLoan(amount),
      })),
      { label: "返回银行", onClick: () => showBankCenter() },
    ],
  });
}

function completePersonalLoan(amount) {
  const result = takePersonalLoan(state, amount, `personal-loan-${state.round}-${amount}-${Date.now()}`);
  if (!result.ok) {
    openSimpleModal({
      type: "贷款失败",
      title: "无法完成个人贷款",
      text: result.reason,
      actions: [{ label: "知道了", className: "primary", onClick: () => showBankCenter() }],
    });
    return;
  }
  addLog(`个人贷款 ${money(result.amount)}，每月还款 ${money(result.payment)}。`);
  emitFinanceEffect(result.amount, "个人贷款入账", "loan");
  persistQuietly();
  render();
  openSimpleModal({
    type: "贷款成功",
    title: "现金增加，但月供也增加",
    text: "贷款不是免费的钱。每个月的还款会降低你的净现金流。",
    metrics: [
      ["现金增加", money(result.amount)],
      ["每月还款", money(result.payment)],
      ["贷款利率", `${percentText(result.rate)}/月`],
      ["剩余现金", money(state.cash)],
      ["信用分", creditGauge(state.bank.creditScore)],
    ],
    actions: [{ label: "回银行中心", className: "primary", onClick: () => showBankCenter() }],
  });
}

function showInterestEvent() {
  const event = pick(interestEvents);
  openSimpleModal({
    type: "利率事件",
    title: event.title,
    text: event.text,
    metrics: [["当前利率", calculateBankSummary(state).interestLevel]],
    actions: [
      {
        label: "应用利率变化",
        className: "primary",
        onClick: () => completeInterestEvent(event),
      },
      { label: "返回银行", onClick: () => showBankCenter() },
    ],
  });
}

function completeInterestEvent(event) {
  const result = applyInterestEvent(state, event, `interest-${state.round}-${event.id}`);
  addLog(result.ok ? `${event.title}：${result.before.label} 变为 ${result.after.label}。` : result.reason);
  persistQuietly();
  render();
  openSimpleModal({
    type: "利率变化",
    title: event.title,
    text: result.ok ? "利率会影响新的个人贷款、房贷购买和再融资。" : result.reason,
    metrics: result.ok
      ? [
          ["变化前", result.before.label],
          ["变化后", ratePulse(result.after.label)],
          ["个人贷款月利率", percentText(calculateBankSummary(state).personalLoanMonthlyRate)],
          ["房贷月利率", percentText(calculateBankSummary(state).mortgageMonthlyRate)],
        ]
      : [["结果", "未变化"]],
    actions: [{ label: "回银行中心", className: "primary", onClick: () => showBankCenter() }],
  });
}

function showRefinanceOptions() {
  const properties = state.ownedProperties.filter((property) => property.mortgageBalance > 0);
  if (!properties.length) {
    openSimpleModal({
      type: "Refinance",
      title: "目前没有可再融资房贷",
      text: bankingLearningNotes.refinance,
      actions: [{ label: "回银行中心", className: "primary", onClick: () => showBankCenter() }],
    });
    return;
  }
  openSimpleModal({
    type: "Refinance",
    title: "选择要再融资的房贷",
    text: bankingLearningNotes.refinance,
    metrics: properties.flatMap((property) => {
      const preview = calculateRefinancePreview(state, property);
      return [[property.name, `${money(preview.oldPayment)} -> ${money(preview.newPayment)}，节省 ${money(preview.paymentSavings)}`]];
    }),
    actions: [
      ...properties.map((property) => {
        const preview = calculateRefinancePreview(state, property);
        return {
          label: preview.canRefinance ? `再融资 ${property.name}` : `${property.name} 暂不划算`,
          className: preview.canRefinance ? "primary" : "",
          disabled: !preview.canRefinance,
          onClick: () => showRefinanceConfirm(property.id),
        };
      }),
      { label: "返回银行", onClick: () => showBankCenter() },
    ],
  });
}

function showRefinanceConfirm(propertyId) {
  const property = state.ownedProperties.find((item) => item.id === propertyId);
  if (!property) return;
  const preview = calculateRefinancePreview(state, property);
  openSimpleModal({
    type: "确认再融资",
    title: property.name,
    text: "如果利率下降，重新贷款可以减少月供，但贷款本金仍然要继续还。",
    metrics: [
      ["剩余房贷", money(property.mortgageBalance)],
      ["旧月供", money(preview.oldPayment)],
      ["新月供", money(preview.newPayment)],
      ["每月减少", money(preview.paymentSavings)],
      ["新房贷利率", percentText(preview.newRate)],
    ],
    actions: [
      { label: "确认再融资", className: "primary", disabled: !preview.canRefinance, onClick: () => completeRefinance(property.id) },
      { label: "取消", onClick: () => showPropertyDetail(property.id) },
    ],
  });
}

function completeRefinance(propertyId) {
  const result = refinancePropertyMortgage(state, propertyId, `refinance-${state.round}-${propertyId}`);
  if (!result.ok) {
    openSimpleModal({
      type: "再融资失败",
      title: "无法完成再融资",
      text: result.reason,
      actions: [{ label: "知道了", className: "primary", onClick: () => showBankCenter() }],
    });
    return;
  }
  addLog(`${result.after.name} 再融资成功，月供减少 ${money(result.preview.paymentSavings)}。`);
  emitFinanceEffect(result.preview.paymentSavings, "月供减少", "refinance");
  persistQuietly();
  render();
  openSimpleModal({
    type: "再融资成功",
    title: result.after.name,
    text: "月供下降后，每月现金流会改善，但房贷余额仍需要继续偿还。",
    metrics: [
      ["旧月供", money(result.preview.oldPayment)],
      ["新月供", money(result.preview.newPayment)],
      ["每月减少", money(result.preview.paymentSavings)],
      ["房产现金流", money(result.after.monthlyCashflow)],
    ],
    actions: [{ label: "完成", className: "primary", onClick: closeModal }],
  });
}

function showBankruptcyProtection(protection) {
  const currentProtection = protection || evaluateBankruptcyProtection(state);
  const needed = Math.abs(Math.min(0, moneyValue(state.cash)));
  openSimpleModal({
    type: "破产保护",
    title: currentProtection.status === "bankrupt" ? "破产" : "现金不足警报",
    text: `${bankingLearningNotes.bankruptcy} ${currentProtection.message}`,
    metrics: [
      ["当前现金", money(state.cash)],
      ["需要补足", money(needed)],
      ["可用信用额度", money(calculateBankSummary(state).availableCredit)],
      ["可出售资产", `${state.ownedProperties.length + state.stockHoldings.length + state.businessHoldings.length} 项`],
    ],
    actions:
      currentProtection.status === "loan"
        ? [
            { label: "申请保护贷款", className: "primary", onClick: () => completePersonalLoan(Math.ceil((needed + 1000) / 1000) * 1000) },
            { label: "先卖资产", onClick: closeModal },
          ]
        : currentProtection.status === "sellAssets"
          ? [
              { label: "查看房地产", className: "primary", onClick: closeModal },
              { label: "回银行中心", onClick: () => showBankCenter() },
            ]
          : [{ label: "知道了", className: "primary", onClick: closeModal }],
  });
}

function showLifeEvent(event = pickLifeEvent(state)) {
  const firstOption = event.options?.[0] || { id: "default", label: "结算" };
  const previewCost = Math.max(0, moneyValue(event.cashImpact * (firstOption.cashMultiplier ?? 1)));
  const claim = event.insuranceEligible ? previewBestClaim(event, previewCost) : null;
  openSimpleModal({
    type: "人生事件",
    title: event.title,
    text: `${event.subtitle}。${event.description}`,
    metrics: [
      ["类型", event.category],
      ["严重度", event.severity],
      ["原始费用", event.cashImpact < 0 ? `收入 ${money(Math.abs(event.cashImpact))}` : money(previewCost)],
      ["保险可理赔", claim ? money(claim.claimAmount) : event.insuranceEligible ? "可投保项目" : "不适用"],
      ["玩家实际负担", claim ? money(claim.playerCost) : money(previewCost)],
      ["持续月份", event.durationMonths > 0 ? `${event.durationMonths} 个月` : "一次性"],
      ["学习提示", event.learningTip],
    ],
    actions: [
      ...(event.options || [firstOption]).slice(0, 3).map((option) => ({
        label: option.label,
        className: option.id === firstOption.id ? "primary" : "",
        onClick: () => completeLifeEvent(event, option.id),
      })),
      { label: "放弃本次", onClick: closeModal },
    ],
  });
}

function previewBestClaim(event, cost) {
  const claims = state.insurancePolicies
    .map((policy) => calculateClaimForPolicy(policy, event, cost, state.month || 1))
    .filter((claim) => claim.eligible);
  return claims.sort((a, b) => b.claimAmount - a.claimAmount)[0] || { claimAmount: 0, playerCost: cost };
}

function completeLifeEvent(event, optionId) {
  const result = applyLifeEvent(state, event, optionId, `life-${state.round}-${event.id}-${Date.now()}`);
  if (!result.ok) {
    openSimpleModal({
      type: "人生事件",
      title: "结算失败",
      text: result.reason,
      actions: [{ label: "知道了", className: "primary", onClick: closeModal }],
    });
    return;
  }
  addLog(`${event.title}：${result.option.label}，现金变化 ${signedMoney(result.cashChange)}。`);
  emitFinanceEffect(result.cashChange, event.title, result.cashChange >= 0 ? "life-positive" : "life-negative");
  setAvatarMood(event.type === "unemployment" ? "sad" : moodFromAmount(result.cashChange, "thinking"), 1700);
  if (event.type === "unemployment" || event.category === "失业与工作") queueContextTip("firstUnemployment");
  if (result.liabilityAdded > 0) queueContextTip("firstDebt");
  persistQuietly();
  render();
  openSimpleModal({
    type: "事件结果",
    title: event.title,
    text: result.claim?.claimAmount > 0 ? "保险已按最合适保单理赔，理赔不会超过实际费用。" : event.learningTip,
    metrics: [
      ["选择", result.option.label],
      ["原始费用", event.cashImpact < 0 ? `收入 ${money(Math.abs(event.cashImpact))}` : money(Math.max(0, event.cashImpact))],
      ["自付额", money(result.claim?.deductible || 0)],
      ["保险支付", money(result.claim?.claimAmount || 0)],
      ["玩家负担", money(result.playerCost || 0)],
      ["新增负债", money(result.liabilityAdded || 0)],
      ["现金", money(state.cash)],
    ],
    actions: [{ label: "完成", className: "primary", onClick: closeModal }],
    outcome: result.cashChange < 0 || result.liabilityAdded > 0 ? "warning" : "success",
  });
}

function showInsuranceCenter() {
  const premiums = calculateInsurancePremiums(state);
  const active = state.insurancePolicies.filter((policy) => policy.active);
  openSimpleModal({
    type: "Insurance Center",
    title: "保险中心",
    text: "保费是平常固定的小支出，用来减少某些大意外一次带来的压力。",
    metrics: [
      ["每月总保费", money(premiums)],
      ["已购买保单", active.map((policy) => policy.name).join(" · ") || "暂无"],
      ["现金流影响", money(-premiums)],
      ["最近理赔", state.insuranceClaims[0] ? `${state.insuranceClaims[0].eventTitle} ${money(state.insuranceClaims[0].claimAmount)}` : "暂无"],
    ],
    actions: [
      ...insurancePolicies.map((policy) => ({
        label: state.insurancePolicies.some((item) => item.id === policy.id && item.active) ? `${policy.name} 已购买` : `${policy.name} ${money(policy.monthlyPremium)}/月`,
        className: state.insurancePolicies.some((item) => item.id === policy.id && item.active) ? "" : "primary",
        disabled: state.insurancePolicies.some((item) => item.id === policy.id && item.active),
        onClick: () => showInsurancePolicy(policy.id),
      })),
      { label: "关闭", onClick: closeModal },
    ],
  });
}

function showInsurancePolicy(policyId) {
  const policy = insurancePolicies.find((item) => item.id === policyId);
  if (!policy) return;
  const beforeCashflow = netMonthlyCashflow();
  openSimpleModal({
    type: "Insurance Policy",
    title: policy.name,
    text: policy.childNote,
    metrics: [
      ["保障类型", policy.coveredEvents.join("、")],
      ["每月保费", money(policy.monthlyPremium)],
      ["自付额", money(policy.deductible)],
      ["理赔比例", `${Math.round(policy.coverageRate * 100)}%`],
      ["理赔上限", money(policy.coverageLimit)],
      ["等待期", `${policy.waitingPeriod} 月`],
      ["现金流变化", `${money(beforeCashflow)} -> ${money(beforeCashflow - policy.monthlyPremium)}`],
    ],
    actions: [
      { label: "购买保单", className: "primary", onClick: () => completeInsurancePurchase(policy.id) },
      { label: "返回", onClick: showInsuranceCenter },
    ],
  });
}

function completeInsurancePurchase(policyId) {
  const result = purchaseInsurancePolicy(state, policyId, `insurance-${state.round}-${policyId}-${Date.now()}`);
  if (!result.ok) {
    openSimpleModal({
      type: "购买失败",
      title: "没有买成保险",
      text: result.reason,
      actions: [{ label: "知道了", className: "primary", onClick: showInsuranceCenter }],
    });
    return;
  }
  addLog(`购买 ${result.policy.name}，每月保费 ${money(result.policy.monthlyPremium)}。`);
  emitFinanceEffect(-result.policy.monthlyPremium, "购买保险", "insurance");
  persistQuietly();
  render();
  openSimpleModal({
    type: "购买成功",
    title: result.policy.name,
    text: "保费会进入每月支出，未来符合条件的事件可申请理赔。",
    metrics: [
      ["首月保费", money(result.policy.monthlyPremium)],
      ["每月总保费", `${money(result.beforePremiums)} -> ${money(result.afterPremiums)}`],
      ["现金", money(state.cash)],
      ["净月现金流", money(netMonthlyCashflow())],
    ],
    actions: [{ label: "回保险中心", className: "primary", onClick: showInsuranceCenter }],
  });
}

function showJobSearch() {
  if (!state.unemployment.unemployed) {
    openSimpleModal({
      type: "失业与再就业",
      title: "目前有工作",
      text: "收入中断时，紧急预备金和较低的固定支出会让你有更多时间做选择。",
      actions: [
        { label: "模拟失业事件", className: "primary", onClick: () => completeLifeEvent(lifeEvents.find((event) => event.id === "layoff"), "job-search") },
        { label: "关闭", onClick: closeModal },
      ],
    });
    return;
  }
  openSimpleModal({
    type: "失业与再就业",
    title: "寻找工作",
    text: "每回合可以寻找工作，也可以支付进修费提高机会。不是保证成功，但会增加进度。",
    metrics: [
      ["剩余月份", `${state.unemployment.unemploymentMonthsRemaining} 月`],
      ["失业补助", money(state.unemployment.unemploymentBenefit)],
      ["找工作进度", `${state.unemployment.jobSearchProgress}%`],
      ["再就业机会", `${Math.round(state.unemployment.reemploymentChance * 100)}%`],
    ],
    actions: [
      { label: "寻找工作", className: "primary", onClick: () => completeJobSearch(false) },
      { label: "支付进修费", onClick: () => completeJobSearch(true) },
      { label: "关闭", onClick: closeModal },
    ],
  });
}

function completeJobSearch(training) {
  const before = state.salary;
  const result = searchForJob(state, training);
  addLog(result.ok ? `寻找工作进度 ${state.unemployment.jobSearchProgress}%。` : result.reason);
  if (!state.unemployment.unemployed && before !== state.salary) {
    recordProgressEvent(state, "unemploymentRecovered");
  }
  setAvatarMood(state.unemployment.unemployed ? "thinking" : "celebrating", 1800);
  persistQuietly();
  render();
  openSimpleModal({
    type: state.unemployment.unemployed ? "寻找工作" : "重新就业",
    title: state.unemployment.unemployed ? "继续努力" : "重新就业成功",
    text: state.unemployment.unemployed ? "持续行动会提高机会。" : "重新就业后工资恢复，可能高于、等于或低于原薪资。",
    metrics: [
      ["进修费用", money(result.cost || 0)],
      ["原工资", money(before)],
      ["当前工资", money(state.salary)],
      ["找工作进度", `${state.unemployment.jobSearchProgress}%`],
    ],
    actions: [{ label: "完成", className: "primary", onClick: closeModal }],
    outcome: state.unemployment.unemployed ? "neutral" : "success",
  });
}

function showTaxSummary(fromTile = false) {
  const summary = calculateTaxSummary(state);
  openSimpleModal({
    type: fromTile ? "税务格" : "Tax Summary",
    title: "游戏中的简化税务规则",
    text: "这不是任何真实国家的报税建议，只是练习收入增加时也要预留税务责任。",
    metrics: [
      ["工资收入", money(summary.sources.salaryIncome)],
      ["小生意利润", money(summary.sources.businessProfit)],
      ["租金收入", money(summary.sources.rentalIncome)],
      ["股息与收益", money(summary.sources.dividends + summary.sources.realizedGain)],
      ["简化应税收入", money(summary.taxableIncome)],
      ["游戏税率", percentText(summary.taxRate)],
      ["预估税款", money(summary.estimatedTax)],
      ["税务余额", money(summary.taxBalance)],
    ],
    actions: [
      { label: "完成税务结算", className: "primary", onClick: completeTaxSettlement },
      { label: "关闭", onClick: closeModal },
    ],
  });
}

function completeTaxSettlement() {
  const result = settleTax(state, `tax-${state.round}-${Date.now()}`);
  addLog(result.ok ? `税务结算：支付 ${money(result.paidNow)}，新增税务负债 ${money(result.liabilityAdded)}。` : result.reason);
  if (result.ok) emitFinanceEffect(-result.paidNow, "税务结算", "tax");
  persistQuietly();
  render();
  openSimpleModal({
    type: "税务结算",
    title: "结算完成",
    text: "收入增加时，也要记得可能有税务责任。提前预留，可以避免到期时现金不足。",
    metrics: [
      ["预估税款", money(result.summary?.estimatedTax || 0)],
      ["本次支付", money(result.paidNow || 0)],
      ["税务负债", money(result.liabilityAdded || 0)],
      ["现金", money(state.cash)],
    ],
    actions: [{ label: "完成", className: "primary", onClick: closeModal }],
  });
}

function showDoodad() {
  const card = pick(doodadCards);
  const discount = Math.min(0.3, state.financialIq * 0.03);
  const cost = Math.round(card.cost * (1 - discount));
  openSimpleModal({
    type: "支出",
    title: card.name,
    text: `${card.text} 财商等级让你少花了 ${money(card.cost - cost)}。`,
    metrics: [["需要支付", money(cost)], ["当前现金", money(state.cash)]],
    actions: [
      {
        label: "支付",
        className: "primary",
        onClick: () => {
          payCost(cost, card.name);
          closeModal();
          persistQuietly();
          render();
        },
      },
    ],
  });
}

function showCharityEvent() {
  const donation = Math.min(1800, Math.max(300, Math.round(state.cash * 0.015)));
  openSimpleModal({
    type: "慈善分享",
    title: "社区爱心分享",
    text: "在预算内分享，可以练习把善意也放进财务计划里。",
    metrics: [
      ["建议金额", money(donation)],
      ["当前现金", money(state.cash)],
      ["说明", "这是游戏中的价值选择，不是强制事件。"],
    ],
    actions: [
      {
        label: "分享一点",
        className: "primary",
        onClick: () => {
          payCost(donation, "慈善分享");
          closeModal();
          persistQuietly();
          render();
        },
      },
      { label: "这次先保留现金", onClick: closeModal },
    ],
  });
}

function showPropertyMarket() {
  const event = pickRealEstateMarketEvent();
  openSimpleModal({
    type: "房地产市场",
    title: event.title,
    text: state.ownedProperties.length ? event.text : "你还没有房产，所以这次房地产市场变化没有受到影响。",
    actions: [
      {
        label: "应用市场变化",
        className: "primary",
        onClick: () => {
          const result = resolveRealEstateMarketEvent(state, event);
          const affected = result.affected || [];
          addLog(affected.length ? `${event.title} 已影响 ${affected.length} 项房产。` : result.message);
          persistQuietly();
          render();
          showMarketResult(event, affected);
        },
      },
    ],
  });
}

function showStockMarket() {
  const event = pickStockMarketEvent();
  openSimpleModal({
    type: "股票市场",
    title: event.title,
    text: `${event.text} 这是虚构市场资讯，不是真实投资建议。`,
    actions: [
      {
        label: "应用市场变化",
        className: "primary",
        onClick: () => {
          const result = resolveStockMarketEvent(state, event);
          const heldText = result.heldAffected.length
            ? `影响 ${result.heldAffected.length} 支持仓股票。`
            : "你没有相关持仓，资产未受直接影响。";
          addLog(`${event.title}：${heldText}`);
          persistQuietly();
          render();
          showStockMarketResult(event, result.affected, result.heldAffected);
        },
      },
    ],
  });
}

function showStockMarketResult(event, affected, heldAffected) {
  openSimpleModal({
    type: "股票市场结果",
    title: event.title,
    text: heldAffected.length ? "以下是你持仓相关或市场变化前后的数值。" : "没有相关持仓时，也可以把它当作市场资讯学习。",
    metrics: affected.length
      ? affected.slice(0, 6).flatMap((item) => [
          [`${item.name} ${item.symbol}`, `${item.direction} ${money(item.beforePrice)} -> ${money(item.afterPrice)}`],
          ["变化", `${signedMoney(item.change)} (${signedPercent(item.percent)})`],
        ])
      : [["影响", "无"]],
    actions: [{ label: "知道了", className: "primary", onClick: closeModal }],
  });
}

function showMarketResult(event, affected) {
  openSimpleModal({
    type: "市场结果",
    title: event.title,
    text: affected.length ? "以下是变化前后的关键数值。" : "你没有房产，因此没有数值变化。",
    metrics: affected.length
      ? affected.slice(0, 4).flatMap((item) => [
          [item.name, `${money(item.beforeValue)} -> ${money(item.afterValue)}`],
          ["租金 / 现金流", `${money(item.beforeRent)} -> ${money(item.afterRent)} / ${money(item.afterCashflow)}`],
        ])
      : [["影响", "无"]],
    actions: [{ label: "知道了", className: "primary", onClick: closeModal }],
  });
}

function showStockDetail(stockId) {
  const stock = findStock(state.stockMarket, stockId);
  const holding = state.stockHoldings.find((item) => item.stockId === stockId);
  if (!stock || !holding) return;
  const high = Math.max(...stock.priceHistory);
  const low = Math.min(...stock.priceHistory);
  openSimpleModal({
    type: "股票详情",
    title: `${stock.name} (${stock.symbol})`,
    text: `${stock.childNote} ${stockLearningNotes.unrealized}`,
    metrics: [
      ["当前价格", money(stock.currentPrice)],
      ["平均成本", money(holding.averageCost)],
      ["持股数量", `${holding.shares} 股`],
      ["总成本", money(holding.totalCost)],
      ["当前价值", money(holding.currentValue)],
      ["未实现损益", `${holding.unrealizedGain >= 0 ? "上涨" : "下跌"} ${signedMoney(holding.unrealizedGain)} (${signedPercent(holding.unrealizedGainPercent)})`],
      ["历史最高", money(high)],
      ["历史最低", money(low)],
      ["价格记录", miniTrend(stock.priceHistory)],
      ["累计股息", money(holding.dividendsReceived)],
      ["风险等级", stock.riskLevel],
      ["产业类别", stock.sector],
    ],
    actions: [
      { label: "卖出股票", className: "danger", onClick: () => showStockSellModal(stock.id, Math.min(1, holding.shares)) },
      { label: "为什么？", onClick: () => showStockWhy(stock, () => showStockDetail(stock.id)) },
      { label: "关闭", className: "primary", onClick: closeModal },
    ],
  });
}

function showStockSellModal(stockId, initialQuantity) {
  const holding = state.stockHoldings.find((item) => item.stockId === stockId);
  const stock = findStock(state.stockMarket, stockId);
  if (!holding || !stock) return;
  const half = Math.max(1, Math.floor(holding.shares / 2));
  openSimpleModal({
    type: "卖出股票",
    title: `卖出 ${stock.name}`,
    text: "价格上涨不代表已经赚钱，真正卖出后，损益才会变成实际结果。",
    metrics: [
      ["当前价格", money(stock.currentPrice)],
      ["平均成本", money(holding.averageCost)],
      ["持有数量", `${holding.shares} 股`],
      ["选择数量", `${initialQuantity} 股`],
    ],
    actions: [
      { label: "卖出 1 股", className: "danger", onClick: () => showStockSellConfirm(stock.id, 1) },
      { label: "卖出一半", onClick: () => showStockSellConfirm(stock.id, half) },
      { label: "全部卖出", onClick: () => showStockSellConfirm(stock.id, holding.shares) },
      { label: "自定义数量", onClick: () => showStockCustomSell(stock.id) },
      { label: "返回详情", className: "primary", onClick: () => showStockDetail(stock.id) },
    ],
  });
}

function showStockCustomSell(stockId) {
  const holding = state.stockHoldings.find((item) => item.stockId === stockId);
  const stock = findStock(state.stockMarket, stockId);
  if (!holding || !stock) return;
  openSimpleModal({
    type: "自定义卖出",
    title: `${stock.name} 卖出数量`,
    text: "请输入正整数股数，不能超过你持有的数量。",
    metrics: [
      ["持有数量", `${holding.shares} 股`],
      ["当前价格", money(stock.currentPrice)],
      ["数量", `<input class="quantity-input" id="stockSellQuantityInput" type="number" min="1" max="${holding.shares}" step="1" value="1" />`],
    ],
    actions: [
      {
        label: "继续",
        className: "primary",
        onClick: () => {
          const quantity = stockShares(document.querySelector("#stockSellQuantityInput")?.value);
          showStockSellConfirm(stock.id, quantity);
        },
      },
      { label: "返回", onClick: () => showStockSellModal(stock.id, 1) },
    ],
  });
}

function showStockSellConfirm(stockId, quantity) {
  const preview = calculateStockSellPreview(state, stockId, quantity);
  if (!preview.holding || !preview.stock || preview.shares <= 0 || preview.shares > preview.holding.shares) {
    openSimpleModal({
      type: "无法卖出",
      title: "卖出数量不正确",
      text: "卖出数量必须是正整数，而且不能超过持有数量。",
      actions: [{ label: "知道了", className: "primary", onClick: closeModal }],
    });
    return;
  }
  const eventId = `stock-sell-${state.round}-${preview.stock.id}-${preview.shares}-${Date.now()}`;
  openSimpleModal({
    type: "确认卖出",
    title: `卖出 ${preview.stock.name}`,
    text: "卖出金额 ＝ 卖出股数 × 当前价格。实现损益 ＝ 卖出金额 − 对应持仓成本。",
    metrics: [
      ["卖出数量", `${preview.shares} 股`],
      ["当前价格", money(preview.pricePerShare)],
      ["预计收到现金", money(preview.totalAmount)],
      ["平均成本", money(preview.averageCost)],
      ["预计实现损益", signedMoney(preview.realizedGain)],
    ],
    actions: [
      { label: "确认卖出", className: "danger", onClick: () => completeStockSale(preview.stock.id, preview.shares, eventId) },
      { label: "取消", className: "primary", onClick: () => showStockDetail(preview.stock.id) },
    ],
  });
}

function completeStockSale(stockId, quantity, eventId) {
  const result = sellStock(state, stockId, quantity, eventId);
  if (!result.ok) {
    openSimpleModal({
      type: "卖出失败",
      title: "没有完成卖出",
      text: result.reason,
      actions: [{ label: "知道了", className: "primary", onClick: closeModal }],
    });
    return;
  }
  addLog(`卖出 ${result.stock.name} ${result.shares} 股，收到 ${money(result.totalAmount)}，实现损益 ${signedMoney(result.realizedGain)}。`);
  emitFinanceEffect(result.totalAmount, "卖出股票", "sell");
  persistQuietly();
  render();
  openSimpleModal({
    type: "卖出结果",
    title: `${result.stock.name} 已卖出`,
    text: "卖出后，损益才会变成实际结果；剩余持仓继续随价格变化。",
    metrics: [
      ["现金增加", money(result.totalAmount)],
      ["实现损益", signedMoney(result.realizedGain)],
      ["剩余现金", money(state.cash)],
      ["已实现损益累计", signedMoney(state.realizedStockGain)],
    ],
    actions: [{ label: "完成", className: "primary", onClick: closeModal }],
  });
}

function showBusinessOpportunity(business = pick(businessDefinitions)) {
  const calculation = calculateBusinessDefinition(business);
  const eventId = `business-buy-${state.round}-${state.position}-${business.id}`;
  const shortfall = Math.max(0, business.startupCost - state.cash);
  const cashAfter = state.cash - business.startupCost;
  const reserveMonths = Math.round(cashAfter / Math.max(1, totalExpenses()));
  openSimpleModal({
    type: "小生意機會",
    title: business.name,
    text: `${business.description} ${business.childNote}`,
    metrics: [
      ["類型", business.category],
      ["起始成本", money(business.startupCost)],
      ["每月收入", money(business.monthlyRevenue)],
      ["固定成本", money(business.monthlyFixedCost)],
      ["變動成本", money(business.monthlyVariableCost)],
      ["每月淨利", money(calculation.monthlyProfit)],
      ["風險等級", business.riskLevel],
      ["成長潛力", `${business.maxLevel} 級`],
      ["所需時間", `${business.ownerTimeRequired} 小時/月`],
      ["被動程度", `${Math.round(business.passiveRatio * 100)}%`],
      ["投資後現金", money(cashAfter)],
      ["預備金提醒", reserveMonths < 2 ? "投資後現金偏低，仍要留錢處理意外。" : "現金安全墊看起來較充足。"],
    ],
    actions: [
      {
        label: shortfall > 0 ? `現金不足，還差 ${money(shortfall)}` : "投資",
        className: "primary",
        disabled: shortfall > 0,
        onClick: () => completeBusinessInvestment(business.id, eventId),
      },
      { label: "為什麼？", onClick: () => showBusinessWhy(() => showBusinessOpportunity(business)) },
      { label: "查看計算", onClick: () => showBusinessCalculation(business, () => showBusinessOpportunity(business)) },
      { label: "放棄", onClick: closeModal },
    ],
  });
}

function showBusinessCalculation(business, backAction) {
  const calculation = calculateBusinessDefinition(business);
  openSimpleModal({
    type: "查看計算",
    title: `${business.name} 每月淨利`,
    text: "每月營收 − 固定成本 − 變動成本 ＝ 每月淨利。",
    metrics: [
      ["每月營收", money(business.monthlyRevenue)],
      ["− 固定成本", money(-business.monthlyFixedCost)],
      ["− 變動成本", money(-business.monthlyVariableCost)],
      ["＝ 每月淨利", money(calculation.monthlyProfit)],
    ],
    actions: [
      { label: "返回", className: "primary", onClick: backAction },
      { label: "關閉", onClick: closeModal },
    ],
  });
}

function showBusinessWhy(backAction) {
  openSimpleModal({
    type: "為什麼",
    title: "小生意學習說明",
    text: "這些是遊戲中的財商概念，不是真實投資建議。",
    metrics: [
      ["營收", businessLearningNotes.revenue],
      ["淨利", businessLearningNotes.profit],
      ["固定成本", businessLearningNotes.fixedCost],
      ["變動成本", businessLearningNotes.variableCost],
      ["升級", businessLearningNotes.upgrade],
      ["被動收入", businessLearningNotes.passive],
    ],
    actions: [
      { label: "返回", className: "primary", onClick: backAction },
      { label: "關閉", onClick: closeModal },
    ],
  });
}

function completeBusinessInvestment(businessId, eventId) {
  const definition = findBusinessDefinition(businessId);
  const result = investBusiness(state, definition, eventId);
  if (!result.ok) {
    openSimpleModal({
      type: "無法投資",
      title: "小生意投資未完成",
      text: result.reason,
      actions: [{ label: "知道了", className: "primary", onClick: closeModal }],
    });
    return;
  }
  addLog(`投資 ${result.business.name}，每月預估淨利 ${money(result.business.monthlyProfit)}。`);
  emitFinanceEffect(-result.business.totalInvested, "投资小生意", "buy");
  queueContextTip("firstBusiness");
  setAvatarMood("proud", 1600);
  persistQuietly();
  render();
  openSimpleModal({
    type: "投資成功",
    title: `${result.business.name} 加入小生意中心`,
    text: "營收不是全部賺到的錢，扣除成本後留下的才是淨利。",
    metrics: [
      ["剩餘現金", money(state.cash)],
      ["每月營收", money(result.business.monthlyRevenue)],
      ["每月成本", money(result.business.monthlyExpenses)],
      ["每月淨利", money(result.business.monthlyProfit)],
      ["目前價值", money(result.business.currentValue)],
      ["淨資產", money(calculateNetWorth(state))],
    ],
    actions: [{ label: "查看小生意中心", className: "primary", onClick: closeModal }],
    outcome: "success",
  });
}

function showBusinessDetail(businessId) {
  const business = state.businessHoldings.find((item) => item.businessId === businessId);
  const definition = findBusinessDefinition(businessId);
  if (!business || !definition) return;
  const progress = Math.min(100, Math.max(0, Math.round((business.cumulativeProfit / Math.max(1, business.totalInvested)) * 100)));
  const upgrades = definition.upgradeOptions
    .filter((upgrade) => !business.purchasedUpgrades.includes(upgrade.id))
    .map((upgrade) => `${upgrade.name} ${money(upgrade.cost)}`)
    .join(" · ") || "已無可用升級";
  openSimpleModal({
    type: "小生意詳情",
    title: business.name,
    text: `${definition.childNote} 投資回收進度不是保證回本，只是用累計獲利和投入金額做比較。`,
    metrics: [
      ["類型", business.category],
      ["等級", `${business.level} / ${business.maxLevel}`],
      ["總投入", money(business.totalInvested)],
      ["當前價值", money(business.currentValue)],
      ["每月收入", money(business.monthlyRevenue)],
      ["每月成本", money(business.monthlyExpenses)],
      ["每月淨利", money(business.monthlyProfit)],
      ["累計獲利", money(business.cumulativeProfit)],
      ["投資回收進度", `<div class="mini-progress"><span style="width:${progress}%"></span></div>${progress}%`],
      ["風險等級", business.riskLevel],
      ["顧客需求", `${Math.round(business.demandModifier * 100)}%`],
      ["員工數量", `${business.staffCount} 人`],
      ["所需時間", `${business.ownerTimeRequired} 小時/月`],
      ["被動程度", `${Math.round(business.passiveRatio * 100)}%`],
      ["可用升級", upgrades],
      ["最近事件", business.recentEvent || "暫無"],
    ],
    actions: [
      { label: "升級", className: "primary", onClick: () => showBusinessUpgradeModal(business.businessId) },
      { label: "出售生意", className: "danger", onClick: () => showBusinessSellModal(business.businessId) },
      { label: "為什麼？", onClick: () => showBusinessWhy(() => showBusinessDetail(business.businessId)) },
      { label: "關閉", onClick: closeModal },
    ],
  });
}

function showBusinessUpgradeModal(businessId) {
  const business = state.businessHoldings.find((item) => item.businessId === businessId);
  const definition = findBusinessDefinition(businessId);
  if (!business || !definition) return;
  const actions = definition.upgradeOptions
    .filter((upgrade) => !business.purchasedUpgrades.includes(upgrade.id))
    .map((upgrade) => ({
      label: `${upgrade.name} ${money(upgrade.cost)}`,
      className: state.cash >= upgrade.cost ? "primary" : "",
      disabled: state.cash < upgrade.cost,
      onClick: () => showBusinessUpgradeConfirm(business.businessId, upgrade.id),
    }));
  openSimpleModal({
    type: "小生意升級",
    title: `${business.name} 可用升級`,
    text: "升級可以增加收入，但也可能增加成本，所以要看最後留下多少。",
    metrics: [
      ["目前淨利", money(business.monthlyProfit)],
      ["目前被動程度", `${Math.round(business.passiveRatio * 100)}%`],
      ["現金", money(state.cash)],
    ],
    actions: actions.length ? [...actions, { label: "返回", onClick: () => showBusinessDetail(business.businessId) }] : [{ label: "返回", className: "primary", onClick: () => showBusinessDetail(business.businessId) }],
  });
}

function showBusinessUpgradeConfirm(businessId, upgradeId) {
  const business = state.businessHoldings.find((item) => item.businessId === businessId);
  const upgrade = findBusinessDefinition(businessId)?.upgradeOptions.find((item) => item.id === upgradeId);
  if (!business || !upgrade) return;
  const nextRevenue = business.monthlyRevenue + upgrade.revenueChange;
  const nextExpenses = business.monthlyExpenses + upgrade.costChange;
  const nextProfit = nextRevenue - nextExpenses;
  openSimpleModal({
    type: "確認升級",
    title: upgrade.name,
    text: "請比較升級前後。收入增加不代表全部都是淨利。",
    metrics: [
      ["升級成本", money(upgrade.cost)],
      ["收入變化", `${money(business.monthlyRevenue)} -> ${money(nextRevenue)}`],
      ["成本變化", `${money(business.monthlyExpenses)} -> ${money(nextExpenses)}`],
      ["淨利變化", `${money(business.monthlyProfit)} -> ${money(nextProfit)}`],
      ["被動程度", `${Math.round(business.passiveRatio * 100)}% -> ${Math.round((business.passiveRatio + upgrade.passiveChange) * 100)}%`],
    ],
    actions: [
      { label: "確認升級", className: "primary", onClick: () => completeBusinessUpgrade(businessId, upgradeId) },
      { label: "取消", onClick: () => showBusinessDetail(businessId) },
    ],
  });
}

function completeBusinessUpgrade(businessId, upgradeId) {
  const result = upgradeBusiness(state, businessId, upgradeId, `business-upgrade-${state.round}-${businessId}-${upgradeId}`);
  if (!result.ok) {
    openSimpleModal({ type: "升級失敗", title: "沒有完成升級", text: result.reason, actions: [{ label: "知道了", className: "primary", onClick: closeModal }] });
    return;
  }
  addLog(`${result.business.name} 完成升級「${result.upgrade.name}」。`);
  emitFinanceEffect(-result.upgrade.cost, "小生意升级", "upgrade");
  persistQuietly();
  render();
  openSimpleModal({
    type: "升級成功",
    title: result.upgrade.name,
    text: "升級完成，小生意收入、成本、淨利與價值已更新。",
    metrics: [
      ["新每月營收", money(result.business.monthlyRevenue)],
      ["新每月成本", money(result.business.monthlyExpenses)],
      ["新每月淨利", money(result.business.monthlyProfit)],
      ["新價值", money(result.business.currentValue)],
    ],
    actions: [{ label: "完成", className: "primary", onClick: closeModal }],
  });
}

function showBusinessRiskEvent(positive = null) {
  if (!state.businessHoldings.length) {
    openSimpleModal({
      type: "小生意事件",
      title: "目前沒有小生意",
      text: "你還沒有持有小生意，所以不會抽取這類事件。",
      actions: [{ label: "知道了", className: "primary", onClick: closeModal }],
    });
    return;
  }
  const business = pick(state.businessHoldings);
  const event = pickBusinessRiskEvent(positive);
  openSimpleModal({
    type: event.positive ? "正面事件" : "風險事件",
    title: event.title,
    text: `${business.name}：${event.text}`,
    metrics: [
      ["作用生意", business.name],
      ["目前營收", money(business.monthlyRevenue)],
      ["目前成本", money(business.monthlyExpenses)],
      ["目前淨利", money(business.monthlyProfit)],
    ],
    actions: [
      { label: "結算事件", className: "primary", onClick: () => completeBusinessRiskEvent(event, business.businessId) },
    ],
  });
}

function completeBusinessRiskEvent(event, businessId) {
  const result = resolveBusinessRiskEvent(state, event, businessId, `business-risk-${state.round}-${businessId}-${event.id}`);
  addLog(result.ok ? `${event.title} 影響了 ${result.after.name}。` : result.reason);
  persistQuietly();
  render();
  openSimpleModal({
    type: "事件結果",
    title: event.title,
    text: result.ok ? event.text : result.reason,
    metrics: result.ok
      ? [
          ["營收", `${money(result.before.monthlyRevenue)} -> ${money(result.after.monthlyRevenue)}`],
          ["成本", `${money(result.before.monthlyExpenses)} -> ${money(result.after.monthlyExpenses)}`],
          ["淨利", `${money(result.before.monthlyProfit)} -> ${money(result.after.monthlyProfit)}`],
          ["現金變化", money(-result.cashCost)],
        ]
      : [["結果", "未影響"]],
    actions: [{ label: "知道了", className: "primary", onClick: closeModal }],
  });
}

function showBusinessMarket() {
  const event = pickBusinessMarketEvent();
  openSimpleModal({
    type: "需求變化",
    title: event.title,
    text: event.text,
    actions: [
      { label: "套用需求變化", className: "primary", onClick: () => completeBusinessMarketEvent(event) },
    ],
  });
}

function completeBusinessMarketEvent(event) {
  const result = resolveBusinessMarketEvent(state, event, `business-market-${state.round}-${event.id}`);
  addLog(result.affected?.length ? `${event.title} 影響 ${result.affected.length} 個小生意。` : `${event.title} 沒有影響目前持有的小生意。`);
  persistQuietly();
  render();
  openSimpleModal({
    type: "需求變化結果",
    title: event.title,
    text: result.affected?.length ? "以下是需求變化前後。" : "你目前沒有相關類型的小生意。",
    metrics: result.affected?.length
      ? result.affected.slice(0, 5).flatMap((item) => [
          [item.after.name, `${money(item.before.monthlyRevenue)} -> ${money(item.after.monthlyRevenue)}`],
          ["淨利", `${money(item.before.monthlyProfit)} -> ${money(item.after.monthlyProfit)}`],
        ])
      : [["影響", "無"]],
    actions: [{ label: "知道了", className: "primary", onClick: closeModal }],
  });
}

function showBusinessSellModal(businessId) {
  const business = state.businessHoldings.find((item) => item.businessId === businessId);
  if (!business) return;
  const preview = calculateBusinessSellPreview(business);
  openSimpleModal({
    type: "出售小生意",
    title: `出售 ${business.name}`,
    text: "賣出生意時，要看收到的錢、之前投入的錢，以及經營期間已經賺到的錢。",
    metrics: [
      ["當前價值", money(preview.currentValue)],
      ["出售費用", money(preview.sellingFee)],
      ["實際收到現金", money(preview.cashReceived)],
      ["總投入", money(preview.totalInvested)],
      ["累計獲利", money(preview.cumulativeProfit)],
      ["預計總結果", signedMoney(preview.totalResult)],
    ],
    actions: [
      { label: "確認出售", className: "danger", onClick: () => completeBusinessSale(business.businessId) },
      { label: "取消", className: "primary", onClick: () => showBusinessDetail(business.businessId) },
    ],
  });
}

function completeBusinessSale(businessId) {
  const result = sellBusiness(state, businessId, `business-sell-${state.round}-${businessId}`);
  if (!result.ok) {
    openSimpleModal({ type: "出售失敗", title: "沒有完成出售", text: result.reason, actions: [{ label: "知道了", className: "primary", onClick: closeModal }] });
    return;
  }
  addLog(`出售 ${result.business.name}，收到 ${money(result.preview.cashReceived)}。`);
  emitFinanceEffect(result.preview.cashReceived, "出售小生意", "sell");
  persistQuietly();
  render();
  openSimpleModal({
    type: "出售結算",
    title: `${result.business.name} 已出售`,
    text: "小生意已移出資產中心，相關收入與成本也已移除。",
    metrics: [
      ["現金增加", money(result.preview.cashReceived)],
      ["出售費用", money(result.preview.sellingFee)],
      ["總結果", signedMoney(result.preview.totalResult)],
    ],
    actions: [{ label: "完成", className: "primary", onClick: closeModal }],
  });
}

function showPropertyHoldingEvent() {
  const event = pickPropertyHoldingEvent(state);
  if (!event) {
    openSimpleModal({
      type: "房产持有",
      title: "本次没有房地产事件",
      text: "你还没有持有房产，所以不会抽取维修、空置或翻修事件。",
      actions: [{ label: "知道了", className: "primary", onClick: closeModal }],
    });
    return;
  }
  const property = pick(state.ownedProperties);
  openSimpleModal({
    type: "房产持有",
    title: event.title,
    text: `${property.name}：${event.text}`,
    metrics: [
      ["作用房产", property.name],
      ["当前现金", money(state.cash)],
      ["当前价值", money(property.currentValue)],
      ["当前租金", money(property.monthlyRent)],
    ],
    actions: [
      {
        label: "结算事件",
        className: "primary",
        onClick: () => {
          const result = resolvePropertyHoldingEvent(state, event, property.id);
          addLog(result.ok ? result.description : result.reason);
          persistQuietly();
          render();
          showHoldingResult(event, result);
        },
      },
    ],
  });
}

function showHoldingResult(event, result) {
  openSimpleModal({
    type: "持有事件结果",
    title: event.title,
    text: result.ok ? result.description : result.reason,
    metrics: result.ok
      ? [
          ["现金变化", money(-result.cashCost)],
          ["价值变化", `${money(result.before.currentValue)} -> ${money(result.after.currentValue)}`],
          ["租金变化", `${money(result.before.monthlyRent)} -> ${money(result.after.monthlyRent)}`],
          ["现金流变化", `${money(result.before.monthlyCashflow)} -> ${money(result.after.monthlyCashflow)}`],
          ["紧急负债", money(state.emergencyDebt)],
        ]
      : [["结果", "未影响"]],
    actions: [{ label: "知道了", className: "primary", onClick: closeModal }],
  });
}

function showLearning() {
  const card = pick(learningCards);
  openSimpleModal({
    type: "学习",
    title: card.name,
    text: card.text,
    metrics: [["费用", money(card.cost)], ["财商提升", `+${card.iq}`]],
    actions: [
      {
        label: card.cost > 0 ? "支付并学习" : "马上学习",
        className: "primary",
        onClick: () => {
          payCost(card.cost, card.name);
          state.financialIq += card.iq;
          recordProgressEvent(state, "learningEvent");
          addLog(`完成学习，财商等级提升到 ${state.financialIq}。`);
          closeModal();
          persistQuietly();
          render();
        },
      },
      { label: "跳过", onClick: closeModal },
    ],
  });
}

function showPropertyDetail(propertyId) {
  const property = state.ownedProperties.find((item) => item.id === propertyId);
  if (!property) return;
  const refinancePreview = calculateRefinancePreview(state, property);
  openSimpleModal({
    type: "房地产详情",
    title: property.name,
    text: `${property.description} 儿童说明：每次偿还一部分本金，你真正拥有的房产比例就会增加。`,
    metrics: [
      ["类型", property.category],
      ["当前价值", money(property.currentValue)],
      ["剩余房贷", money(property.mortgageBalance)],
      ["房产净值", money(property.equity)],
      ["每月租金", money(property.monthlyRent)],
      ["房贷月供", money(property.mortgagePayment)],
      ["房贷利率", property.interestRate ? percentText(property.interestRate) : "旧房贷"],
      ["每月支出", money(property.monthlyExpenses)],
      ["每月净现金流", money(calculatePropertyCashflow(property))],
      ["已还本金", money(property.principalPaid)],
      ["市场变化", property.lastMarketChange || "暂无"],
      ["持有月份", `${Math.max(0, state.month - property.purchasedMonth)} 个月`],
      ["状态", property.status === "paidOff" ? "房贷已还清" : "持有中"],
    ],
    actions: [
      {
        label: refinancePreview.canRefinance ? "再融资降低月供" : "再融资暂不划算",
        disabled: !refinancePreview.canRefinance,
        onClick: () => showRefinanceConfirm(property.id),
      },
      { label: "出售房产", className: "danger", onClick: () => showPropertySellModal(property.id) },
      { label: "关闭", className: "primary", onClick: closeModal },
    ],
  });
}

function showPropertySellModal(propertyId) {
  const property = state.ownedProperties.find((item) => item.id === propertyId);
  if (!property) return;
  const preview = calculateSellPreview(property);
  openSimpleModal({
    type: "出售房地产",
    title: `出售 ${property.name}`,
    text: "卖价不是你真正拿到的钱，还要先还贷款和支付出售费用。",
    metrics: [
      ["当前市场价值", money(preview.currentValue)],
      ["剩余房贷", money(preview.mortgageBalance)],
      ["出售费用", money(preview.sellingFee)],
      ["实际收到现金", money(preview.cashReceived)],
      ["预计损益", money(preview.profitLoss)],
      ["亏损提示", preview.profitLoss < 0 ? "这笔出售会亏损" : "这笔出售预计盈利"],
    ],
    actions: [
      {
        label: "确认出售",
        className: "danger",
        onClick: () => completePropertySale(property.id),
      },
      { label: "取消", className: "primary", onClick: () => showPropertyDetail(property.id) },
    ],
  });
}

function completePropertySale(propertyId) {
  const result = sellProperty(state, propertyId);
  if (!result.ok) {
    openSimpleModal({
      type: "出售失败",
      title: "没有完成出售",
      text: result.reason,
      actions: [{ label: "知道了", className: "primary", onClick: closeModal }],
    });
    return;
  }
  addLog(`卖出「${result.property.name}」，实际收到 ${money(result.preview.cashReceived)}。`);
  emitFinanceEffect(result.preview.cashReceived, "出售房地产", "sell");
  persistQuietly();
  render();
  openSimpleModal({
    type: "出售结算",
    title: `${result.property.name} 已出售`,
    text: "房产已移出资产中心，对应房贷也已移除。",
    metrics: [
      ["现金增加", money(result.preview.cashReceived)],
      ["房贷减少", money(result.preview.mortgageBalance)],
      ["出售费用", money(result.preview.sellingFee)],
      ["损益", money(result.preview.profitLoss)],
    ],
    actions: [{ label: "完成", className: "primary", onClick: closeModal }],
  });
}

function payCost(cost, reason) {
  state.cash -= cost;
  addLog(`${reason}：支出 ${money(cost)}。`);
  emitFinanceEffect(-cost, reason, "expense");
  setAvatarMood("worried", 1400);
  if (state.cash < 0) {
    const protection = evaluateBankruptcyProtection(state);
    addLog(protection.message);
    queueContextTip("cashShortage");
    queueContextTip("firstDebt");
  }
}

function borrowMoney(amount, name = "银行借款", shouldRender = true) {
  const rounded = Math.ceil(amount / 1000) * 1000;
  const result = takePersonalLoan(state, rounded, `legacy-loan-${state.round}-${Date.now()}`);
  addLog(result.ok ? `${name}：现金增加 ${money(result.amount)}，月供增加 ${money(result.payment)}。` : result.reason);
  if (result.ok) {
    queueContextTip("firstDebt");
    setAvatarMood("worried", 1400);
  }
  persistQuietly();
  if (shouldRender) render();
}

function repayDebt() {
  const loan = state.liabilities.find((item) => item.type !== "mortgage");
  if (!loan || state.cash <= 0) return;
  const payment = Math.min(5000, loan.balance, state.cash);
  loan.balance -= payment;
  state.cash -= payment;
  recordProgressEvent(state, "debtRepaid", payment);
  if (loan.type === "personalLoan") {
    state.bank.creditScore = Math.min(850, state.bank.creditScore + 2);
  }
  addLog(`偿还债务 ${money(payment)}。`);
  if (loan.balance <= 0) {
    addLog(`清偿「${loan.name}」，月供减少 ${money(loan.payment)}。`);
    recordProgressEvent(state, "debtPaidOff");
    state.liabilities = state.liabilities.filter((item) => item.id !== loan.id);
  } else {
    loan.payment = Math.ceil(loan.balance * 0.03);
  }
  persistQuietly();
  render();
}

function checkWin() {
  const result = processProgress(true);
  return Boolean(result?.victory.triggered);
}

function openSimpleModal({ type, title, text, metrics = [], actions = [], outcome = "neutral" }) {
  if (uiState.turnPhase === "openingEvent") setTurnPhase("resolvingEvent");
  el.modalType.textContent = type;
  el.modalTitle.textContent = title;
  el.modalText.textContent = text;
  const modalCard = el.modal.querySelector(".modal-card");
  modalCard?.setAttribute("data-event-type", type);
  modalCard?.setAttribute("data-outcome", outcome);
  modalCard?.classList.remove("progress-modal-card", "report-modal-card");
  el.dealMetrics.classList.remove("progress-center-body", "report-body");
  modalCard?.querySelector(".event-illustration")?.remove();
  modalCard?.insertAdjacentHTML("afterbegin", eventIllustrationMarkup(type));
  el.dealMetrics.innerHTML = metrics
    .map(
      ([label, value]) => `
        <div class="metric">
          <span>${label}</span>
          <strong>${value}</strong>
        </div>
      `,
    )
    .join("");
  el.modalActions.innerHTML = "";

  actions.forEach((action) => {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = action.label;
    if (action.className) button.className = action.className;
    if (action.disabled) button.disabled = true;
    button.addEventListener("click", () => {
      if (button.disabled) return;
      button.disabled = true;
      if (uiState.turnPhase === "resolvingEvent") setTurnPhase("showingResult");
      soundManager.play(action.className === "danger" ? "warning" : "tap");
      action.onClick();
    });
    el.modalActions.append(button);
  });

  el.modal.classList.remove("hidden");
  document.body.classList.add("modal-open");
  soundManager.setScene("event");
}

function closeModal() {
  el.modal.classList.add("hidden");
  document.body.classList.remove("modal-open");
  if (["openingEvent", "resolvingEvent", "showingResult", "turnComplete"].includes(uiState.turnPhase)) {
    setTurnPhase("idle");
  }
  soundManager.setScene(state ? "board" : "home");
  if (state && !state.gameOver && !uiState.isRolling && !uiState.isMoving) {
    setTimeout(() => el.rollDice.focus({ preventScroll: true }), 30);
  }
  const nextTip = uiState.pendingTips.shift();
  if (nextTip) setTimeout(() => showContextTip(nextTip, true), prefersReducedMotion() ? 20 : 120);
  if (state && !state.gameOver && !nextTip && uiState.turnPhase === "idle") {
    window.setTimeout(() => {
      checkWin();
      maybeRunAiTurns();
    }, prefersReducedMotion() ? 20 : 120);
  }
}

function saveGame() {
  if (!state) return;
  persistQuietly();
  openSimpleModal({
    type: "保存",
    title: "进度已保存",
    text: "下次打开这个页面后，可以点击读取继续。房地产、房贷和交易记录都会恢复。",
    actions: [{ label: "知道了", className: "primary", onClick: closeModal }],
  });
}

function loadGame() {
  const loaded = parseSavedState(localStorage.getItem(STORAGE_KEY));
  if (!loaded) {
    localStorage.removeItem(STORAGE_KEY);
    openSimpleModal({
      type: "读取",
      title: "没有找到可用存档",
      text: "先开始一局并保存，之后才能读取。旧版异常存档会被安全跳过，避免白屏。",
      actions: [{ label: "知道了", className: "primary", onClick: closeModal }],
    });
    return;
  }

  state = loaded;
  addLog("读取并迁移了本地存档。");
  persistQuietly();
  render();
}

function resetGame() {
  if (state?.activeChallenge) localStorage.removeItem(CHALLENGE_STORAGE_KEY);
  state = null;
  localStorage.removeItem(STORAGE_KEY);
  closeModal();
  renderSetup();
  showSetup();
}

function clearSavedGame() {
  localStorage.removeItem(STORAGE_KEY);
  state = null;
  soundManager.play("warning");
  openSimpleModal({
    type: "清除存档",
    title: "本机存档已清除",
    text: "只清除这个浏览器里的游戏进度，不影响线上版本。",
    actions: [{ label: "知道了", className: "primary", onClick: closeModal }],
  });
  renderSetup();
  showSetup();
}

function confirmClearSavedGame() {
  openSimpleModal({
    type: "清除存档",
    title: "确认清除本机存档？",
    text: "这只会删除这个浏览器里的 Cashflow 进度，线上游戏不会受到影响。",
    actions: [
      { label: "确认清除", className: "danger", onClick: clearSavedGame },
      { label: "先保留", className: "primary", onClick: closeModal },
    ],
    outcome: "warning",
  });
}

function showGameMenu() {
  openSimpleModal({
    type: "游戏选单",
    title: "现金流冒险城",
    text: "保存、读取、重新开始和设置都放在这里，主画面可以专心显示棋盘。",
    metrics: [
      ["自动存档", "关键选择后会保存到这个浏览器"],
      ["当前状态", state ? `第 ${state.month} 月 · 现金 ${money(state.cash)}` : "尚未开始"],
    ],
    actions: [
      { label: "保存进度", className: "primary", disabled: !state, onClick: saveGame },
      { label: "读取存档", onClick: loadGame },
      { label: "声音与画面", onClick: showSoundSettings },
      { label: "进度中心", disabled: !state, onClick: () => showProgressCenter("freedom") },
      { label: "游戏规则", onClick: showRules },
      { label: "重新开始", className: "danger", onClick: confirmResetGame },
      { label: "关闭", onClick: closeModal },
    ],
  });
}

function confirmResetGame() {
  openSimpleModal({
    type: "重新开始",
    title: "确认重新开始？",
    text: "这会清除目前这局的本机进度，重新回到首页选角。",
    actions: [
      { label: "确认重开", className: "danger", onClick: resetGame },
      { label: "先保留", className: "primary", onClick: closeModal },
    ],
    outcome: "warning",
  });
}

function showRules() {
  const tips = Object.entries(contextTipMessages)
    .map(([, tip]) => `${tip.title}：${tip.text}`)
    .join("<br>");
  openSimpleModal({
    type: "游戏规则",
    title: "现金流城市挑战",
    text: "掷骰在城市地图中前进，遇到收入、支出、投资、保险、银行和人生事件。目标是让被动收入覆盖总支出。",
    metrics: [
      ["行动", "掷骰前进，最终落点才触发事件"],
      ["胜利", "被动收入 ≥ 总支出"],
      ["地图", "可拖曳、缩放，并可回到玩家"],
      ["新手教学", "可在音效设置中重新观看"],
      ["情境提示", tips],
      ["提醒", "所有税务、保险、投资内容都是游戏学习规则"],
    ],
    actions: [{ label: "开始吧", className: "primary", onClick: closeModal }],
  });
}

function showSoundSettings() {
  const soundSnapshot = soundManager.getSnapshot();
  openSimpleModal({
    type: "音效设置",
    title: uiState.muted ? "声音已关闭" : "声音已开启",
    text: "音效和背景音乐使用浏览器即时生成；首次互动后才会播放，不支持时会安静降级。",
    metrics: [
      ["总声音", uiState.muted ? "静音" : "开启"],
      ["音效音量", `${Math.round(uiState.effectVolume * 100)}%`],
      ["背景音乐", `${uiState.musicEnabled ? "开启" : "关闭"} · ${Math.round(uiState.musicVolume * 100)}%`],
      ["震动", uiState.hapticsEnabled && navigator?.vibrate ? "轻量开启" : uiState.hapticsEnabled ? "设备不支持" : "关闭"],
      ["动画速度", uiState.animationSpeed === "fast" ? "快速" : "标准"],
      ["画面品质", qualityLabel(uiState.visualQuality)],
      ["音乐状态", soundSnapshot.musicPlaying ? "正在播放" : "等待互动或已暂停"],
      ["教学", uiState.tutorialComplete ? "已完成，可重播" : "尚未完成"],
    ],
    actions: [
      { label: uiState.muted ? "开启声音" : "关闭声音", className: "primary", onClick: () => { toggleSound(); showSoundSettings(); } },
      { label: uiState.musicEnabled ? "关闭音乐" : "开启音乐", onClick: () => { toggleMusic(); showSoundSettings(); } },
      { label: uiState.hapticsEnabled ? "关闭震动" : "开启震动", onClick: () => { toggleHaptics(); showSoundSettings(); } },
      { label: uiState.animationSpeed === "fast" ? "标准动画" : "快速动画", onClick: () => { toggleAnimationSpeed(); showSoundSettings(); } },
      { label: `画面：${qualityLabel(nextQuality(uiState.visualQuality))}`, onClick: () => { cycleVisualQuality(); showSoundSettings(); } },
      { label: "音效小一点", onClick: () => { adjustEffectVolume(-0.15); showSoundSettings(); } },
      { label: "音效大一点", onClick: () => { adjustEffectVolume(0.15); showSoundSettings(); } },
      { label: "重新观看教学", onClick: () => { closeModal(); startTutorial(true); } },
      { label: "查看提示", onClick: showRules },
      { label: "关闭", onClick: closeModal },
    ],
  });
}

function toggleMusic() {
  uiState.musicEnabled = !uiState.musicEnabled;
  soundManager.setMusicEnabled(uiState.musicEnabled);
  if (uiState.musicEnabled && !uiState.muted) soundManager.startMusic(state ? "board" : "home");
  saveExperience();
}

function toggleHaptics() {
  uiState.hapticsEnabled = !uiState.hapticsEnabled;
  if (uiState.hapticsEnabled) haptic(8, true);
  saveExperience();
}

function adjustEffectVolume(delta) {
  uiState.effectVolume = Math.max(0, Math.min(1, uiState.effectVolume + delta));
  soundManager.setEffectVolume(uiState.effectVolume);
  soundManager.play("tap");
  saveExperience();
}

function toggleAnimationSpeed() {
  uiState.animationSpeed = uiState.animationSpeed === "fast" ? "standard" : "fast";
  saveExperience();
}

function nextQuality(value) {
  return { high: "standard", standard: "battery", battery: "high" }[value] || "standard";
}

function qualityLabel(value) {
  return { high: "高品质", standard: "标准", battery: "省电" }[value] || "标准";
}

function cycleVisualQuality() {
  uiState.visualQuality = nextQuality(uiState.visualQuality);
  applyExperienceMode();
  saveExperience();
  if (state) renderBoard();
}

el.rollDice.addEventListener("click", rollDice);
el.saveGame?.addEventListener("click", saveGame);
el.loadGame?.addEventListener("click", loadGame);
el.resetGame?.addEventListener("click", confirmResetGame);
el.gameMenu?.addEventListener("click", showGameMenu);
el.continueGameHome?.addEventListener("click", loadGame);
el.startAdventure?.addEventListener("click", showCharacterSelection);
el.rulesHome?.addEventListener("click", showRules);
el.progressHome?.addEventListener("click", () => {
  if (!state) {
    const loaded = parseSavedState(localStorage.getItem(STORAGE_KEY));
    if (!loaded) {
      openSimpleModal({
        type: "进度中心",
        title: "还没有可追踪的进度",
        text: "开始一局后，任务、成就、徽章和报告会自动记录在这个浏览器里。",
        actions: [{ label: "知道了", className: "primary", onClick: closeModal }],
      });
      return;
    }
    state = loaded;
  }
  showProgressCenter("freedom");
});
el.soundHome?.addEventListener("click", showSoundSettings);
el.clearSaveHome?.addEventListener("click", confirmClearSavedGame);
el.closeModal.addEventListener("click", closeModal);
el.modal.addEventListener("click", (event) => {
  if (event.target === el.modal) {
    el.modal.querySelector(".modal-card")?.animate(
      [
        { transform: "translateY(0)" },
        { transform: "translateY(4px)" },
        { transform: "translateY(0)" },
      ],
      { duration: 180, easing: "ease-out" },
    );
  }
});

window.addEventListener("keydown", (event) => {
  if (event.key === "Escape") closeModal();
  if (event.key === " " && state && !state.gameOver && el.modal.classList.contains("hidden")) {
    event.preventDefault();
    rollDice();
  }
});
window.addEventListener("pointerdown", unlockAudio, { once: true });
window.addEventListener("keydown", unlockAudio, { once: true });
document.addEventListener("visibilitychange", () => {
  soundManager.handleVisibility(document.hidden);
  if (document.hidden && uiState.turnPhase === "openingEvent") {
    setTurnPhase("paused");
  } else if (!document.hidden && uiState.turnPhase === "paused") {
    setTurnPhase("idle");
    render();
  }
});
window.addEventListener("resize", () => {
  if (!state) return;
  applyCamera();
  if (uiState.camera.follow) focusCameraOnPlayer(true, uiState.camera.scale);
});

window.cashflowDebug = {
  getState: () => state,
  setState: (nextState) => {
    state = migrateSavedState(nextState);
    setTurnPhase("idle");
    render();
  },
  buyFirstProperty: () => {
    if (!state) state = createState(careers[3]);
    state.cash = Math.max(state.cash, 300000);
    completePropertyPurchase(realEstateOpportunities[0], `debug-${Date.now()}`);
  },
  buyFirstStock: () => {
    if (!state) state = createState(careers[3]);
    state.cash = Math.max(state.cash, 50000);
    const stock = state.stockMarket.find((item) => item.dividendFrequency === 1) || state.stockMarket[0];
    completeStockPurchase(stock.id, 5, `debug-stock-${Date.now()}`);
  },
  buyFirstBusiness: () => {
    if (!state) state = createState(careers[3]);
    state.cash = Math.max(state.cash, 120000);
    completeBusinessInvestment(businessDefinitions[0].id, `debug-business-1-${Date.now()}`);
  },
  buySecondBusiness: () => {
    if (!state) state = createState(careers[3]);
    state.cash = Math.max(state.cash, 120000);
    completeBusinessInvestment(businessDefinitions[5].id, `debug-business-2-${Date.now()}`);
  },
  upgradeFirstBusiness: () => {
    if (!state?.businessHoldings?.length) return;
    const business = state.businessHoldings[0];
    const upgrade = findBusinessDefinition(business.businessId)?.upgradeOptions.find((item) => !business.purchasedUpgrades.includes(item.id));
    if (upgrade) completeBusinessUpgrade(business.businessId, upgrade.id);
  },
  triggerPositiveBusinessEvent: () => {
    if (!state?.businessHoldings?.length) return;
    completeBusinessRiskEvent(pickBusinessRiskEvent(true, () => 0), state.businessHoldings[0].businessId);
  },
  triggerNegativeBusinessEvent: () => {
    if (!state?.businessHoldings?.length) return;
    completeBusinessRiskEvent(pickBusinessRiskEvent(false, () => 0), state.businessHoldings[0].businessId);
  },
  triggerBusinessMarket: () => {
    if (!state) return;
    completeBusinessMarketEvent(pickBusinessMarketEvent(() => 0));
  },
  buyBasicInsurance: () => {
    if (!state) state = createState(careers[3]);
    state.cash = Math.max(state.cash, 50000);
    completeInsurancePurchase("basic-medical");
  },
  buyAccidentInsurance: () => {
    if (!state) state = createState(careers[3]);
    state.cash = Math.max(state.cash, 50000);
    completeInsurancePurchase("accident-bundle");
  },
  triggerCoveredMedicalEvent: () => {
    if (!state) return;
    completeLifeEvent(lifeEvents.find((event) => event.id === "clinic-visit"), "full-care");
  },
  triggerUncoveredEvent: () => {
    if (!state) return;
    completeLifeEvent(lifeEvents.find((event) => event.id === "phone-accident"), "repair");
  },
  triggerUnemployment: () => {
    if (!state) return;
    completeLifeEvent(lifeEvents.find((event) => event.id === "layoff"), "job-search");
  },
  searchJob: () => {
    if (!state) return;
    completeJobSearch(true);
  },
  triggerPromotion: () => {
    if (!state) return;
    completeLifeEvent(lifeEvents.find((event) => event.id === "performance-raise"), "accept");
  },
  settleTax: () => {
    if (!state) return;
    completeTaxSettlement();
  },
  triggerFamilyEvent: () => {
    if (!state) return;
    completeLifeEvent(lifeEvents.find((event) => event.id === "family-trip"), "basic");
  },
  sellFirstBusiness: () => {
    if (!state?.businessHoldings?.length) return;
    completeBusinessSale(state.businessHoldings[0].businessId);
  },
  sellFirstStock: () => {
    if (!state?.stockHoldings?.length) return;
    completeStockSale(state.stockHoldings[0].stockId, 2, `debug-stock-sell-${Date.now()}`);
  },
  triggerStockMarket: () => {
    if (!state) return;
    const event = pickStockMarketEvent(() => 0);
    resolveStockMarketEvent(state, event, () => 0);
    persistQuietly();
    render();
  },
  triggerMarket: () => {
    if (!state) return;
    const event = pickRealEstateMarketEvent(() => 0);
    resolveRealEstateMarketEvent(state, event);
    persistQuietly();
    render();
  },
  triggerHoldingEvent: () => {
    if (!state) return;
    const event = pickPropertyHoldingEvent(state, () => 0);
    if (event) resolvePropertyHoldingEvent(state, event, state.ownedProperties[0]?.id);
    persistQuietly();
    render();
  },
  payday: () => {
    if (!state) return;
    collectPayday("验收月结日");
    render();
  },
  rollFixed: (roll) => rollDice(roll),
  getExperience: () => ({
    position: state?.position,
    lastRoll: state?.lastRoll,
    hudStatus: uiState.hudStatus,
    turnPhase: uiState.turnPhase,
    turnPhaseHistory: uiState.turnPhaseHistory,
    diceRolling: uiState.diceRolling,
    isRolling: uiState.isRolling,
    isMoving: uiState.isMoving,
    movingStep: uiState.movingStep,
    movingTotal: uiState.movingTotal,
    camera: uiState.camera,
    muted: uiState.muted,
    effectVolume: uiState.effectVolume,
    musicVolume: uiState.musicVolume,
    musicEnabled: uiState.musicEnabled,
    hapticsEnabled: uiState.hapticsEnabled,
    animationSpeed: uiState.animationSpeed,
    visualQuality: uiState.visualQuality,
    avatarState: uiState.avatarState,
    avatarMood: uiState.avatarMood,
    avatarDirection: uiState.avatarDirection,
    tutorialComplete: uiState.tutorialComplete,
    tutorialActive: uiState.tutorial.active,
    tutorialIndex: uiState.tutorial.index,
    seenTips: uiState.seenTips,
    sound: soundManager.getSnapshot(),
    boardTiles: boardTiles.length,
    financeEffects: document.querySelectorAll(".finance-effect").length,
    playedEffectIds: uiState.playedEffectIds.size,
    progress: state
      ? {
          freedom: calculateFinancialFreedomProgress(state),
          milestones: state.milestones?.filter((item) => item.unlocked).length || 0,
          achievements: state.achievements?.filter((item) => item.unlocked).length || 0,
          badges: state.badges?.filter((item) => item.unlocked).length || 0,
          activeMissions: state.activeMissions?.length || 0,
          completedMissions: state.completedMissions?.length || 0,
          reports: state.gameReports?.length || 0,
          victory: state.victoryState,
          challenge: state.activeChallenge,
          pendingNotifications: state.pendingNotifications?.length || 0,
          shownNotifications: state.shownNotificationIds?.length || 0,
        }
      : null,
    ai: state
      ? {
          gameMode: state.gameMode || "solo",
          aiCount: state.aiPlayers?.length || 0,
          aiDifficulty: state.aiDifficulty || "standard",
          aiAnimationSpeed: state.aiAnimationSpeed || "fast",
          currentActorId: state.currentActorId || "player",
          turnStatus: state.turnManager?.status || "waitingPlayer",
          lastAiCycleRound: state.turnManager?.lastAiCycleRound || 0,
          leaderboard: state.aiPlayers?.length ? calculateLeaderboard(state).length : 1,
          marketPhase: state.marketCycle?.phase || "recovery",
          marketNews: state.marketNews?.length || 0,
          roundHistory: state.roundHistory?.length || 0,
          actionSummaries: state.aiActionSummaries?.length || 0,
        }
      : null,
  }),
  focusPlayer: () => focusCameraOnPlayer(true),
  zoomMap: (delta) => zoomCamera(delta),
  toggleSound,
  toggleMusic,
  toggleHaptics,
  toggleAnimationSpeed,
  cycleVisualQuality,
  startTutorial,
  nextTutorialStep,
  previousTutorialStep,
  skipTutorial,
  completeTutorial,
  showContextTip,
  setEmotion: (mood, duration = 0) => setAvatarMood(mood, duration),
  playIncomeEffect: () => emitFinanceEffect(500, "验收收入", "debug-income"),
  playExpenseEffect: () => emitFinanceEffect(-300, "验收支出", "debug-expense"),
  playDuplicateEffect: () => {
    emitFinanceEffect(88, "同一笔交易", "debug-duplicate", "debug-transaction-once");
    emitFinanceEffect(88, "同一笔交易", "debug-duplicate", "debug-transaction-once");
  },
  showProgressCenter,
  configureAiRace: (count = 1, difficulty = "standard") => {
    if (!state) state = createState(careers[3]);
    configureAiMode(state, { mode: "ai-race", aiCount: count, difficulty });
    persistQuietly();
    render();
    return window.cashflowDebug.getExperience().ai;
  },
  runAiCycle: () => {
    if (!state) return null;
    const result = runAiTurnCycle(state, boardTiles, () => 0.12);
    persistQuietly();
    render();
    return {
      skipped: result.skipped,
      summaries: result.summaries?.length || 0,
      marketTitle: result.market?.news?.title || state.marketNews?.[0]?.title || "",
      leaderboard: calculateLeaderboard(state).length,
    };
  },
  showLeaderboardPanel,
  showMarketPanel,
  showAiFinance: (aiId = state?.aiPlayers?.[0]?.id) => showAiFinance(aiId),
  toggleAiSpeed,
  refreshProgressMissions: () => {
    if (!state) return null;
    const result = refreshActiveMissions(state);
    persistQuietly();
    render();
    return result;
  },
  showShareCard: () => {
    if (!state) return;
    const report = state.gameReports[0] || addReport(state, createGameReport(state, "manual"));
    showShareCard(report);
  },
  completeProgressMissions: () => {
    if (!state) return;
    recordProgressEvent(state, "financeView");
    recordProgressEvent(state, "propertyCard");
    state.stockTransactions.push({ type: "买入", cashChange: -1000, totalAmount: 1000 });
    evaluateProgress(state, { turnPhase: "idle", hasOpenEvent: false });
    claimCompletedMissions(state);
    persistQuietly();
    render();
  },
  unlockProgressSamples: () => {
    if (!state) return;
    state.cash = Math.max(state.cash, 60000);
    state.round = Math.max(state.round, 12);
    state.stockTransactions.push({ type: "买入", cashChange: -1000, totalAmount: 1000 });
    if (!state.insurancePolicies.length) state.insurancePolicies.push({ id: "debug-policy", name: "验收保险", active: true, monthlyPremium: 100 });
    evaluateProgress(state, { turnPhase: "idle", hasOpenEvent: false });
    persistQuietly();
    render();
  },
  simulateVictory: () => {
    if (!state) return;
    state.ownedProperties.push({
      id: `debug-freedom-${Date.now()}`,
      name: "自由现金流房产",
      monthlyRent: calculateTotalExpenses(state) + 5000,
      monthlyExpenses: 0,
      mortgagePayment: 0,
      currentValue: 300000,
      mortgageBalance: 0,
      equity: 300000,
    });
    checkWin();
  },
  continueFreedom: () => continueAfterVictory(),
  simulatePressure: () => {
    if (!state) return;
    state.cash = -8000;
    state.salary = 0;
    state.liabilities.push({ id: `debug-pressure-${Date.now()}`, type: "emergency", name: "验收紧急负债", balance: 90000, payment: 2500 });
    state.progressStats.pressureWarningShown = false;
    showFinancialPressure(evaluateFinancialPressure(state));
  },
  startChallengeDebug: () => startChallenge("starter-cashflow"),
  dispatchVisibility: () => document.dispatchEvent(new Event("visibilitychange")),
  closeModal,
};

renderSetup();
render();
