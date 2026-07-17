import { realEstateOpportunities } from "./realEstateData.js";
import {
  applyMortgagePayday,
  buyProperty,
  calculateEmergencyReserveMonths,
  calculateMonthlyCashflow,
  calculateNetWorth,
  calculateOpportunity,
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

const STORAGE_KEY = "cashflow-freedom-game-v1";

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

const boardTiles = [
  { type: "payday", icon: "月", title: "月结日", text: "领取工资与被动收入，支付全部支出。" },
  { type: "opportunity", icon: "机", title: "房地产机会", text: "评估租金、房贷和净现金流。" },
  { type: "doodad", icon: "花", title: "额外支出", text: "生活消费会考验现金储备。" },
  { type: "stockMarket", icon: "市", title: "股票市场", text: "虚构股票会随市场波动。" },
  { type: "learn", icon: "学", title: "学习", text: "提升财商，降低之后的犯错成本。" },
  { type: "stockOpportunity", icon: "股", title: "股票机会", text: "买入虚构公司的一小部分。" },
  { type: "bank", icon: "银", title: "银行", text: "可以借钱，也可以提前还债。" },
  { type: "doodad", icon: "账", title: "账单", text: "突发开销直接扣现金。" },
  { type: "opportunity", icon: "租", title: "租赁机会", text: "找到能产生租金的资产。" },
  { type: "market", icon: "价", title: "市场", text: "持有资产会被市场影响。" },
  { type: "learn", icon: "课", title: "课程", text: "用知识换取更好的判断力。" },
  { type: "propertyEvent", icon: "修", title: "房产持有", text: "维修、空置、续约或翻修。" },
  { type: "stockOpportunity", icon: "投", title: "基金机会", text: "练习分散和价格波动。" },
  { type: "bank", icon: "贷", title: "银行", text: "借贷能加速，也会增加月支出。" },
  { type: "stockMarket", icon: "涨", title: "市场消息", text: "产业和公司事件影响价格。" },
  { type: "doodad", icon: "购", title: "消费", text: "想要和需要不总是一回事。" },
  { type: "propertyEvent", icon: "管", title: "持有管理", text: "房产赚钱也需要维护。" },
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
  realEstatePortfolio: document.querySelector("#realEstatePortfolio"),
  stockPortfolio: document.querySelector("#stockPortfolio"),
  saveGame: document.querySelector("#saveGame"),
  loadGame: document.querySelector("#loadGame"),
  resetGame: document.querySelector("#resetGame"),
  modal: document.querySelector("#cardModal"),
  modalType: document.querySelector("#modalType"),
  modalTitle: document.querySelector("#modalTitle"),
  modalText: document.querySelector("#modalText"),
  dealMetrics: document.querySelector("#dealMetrics"),
  modalActions: document.querySelector("#modalActions"),
  closeModal: document.querySelector("#closeModal"),
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
  return Math.min(100, Math.round((passiveIncome() / Math.max(1, totalExpenses())) * 100));
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

function pick(list) {
  return list[Math.floor(Math.random() * list.length)] || list[0];
}

function addLog(message) {
  state.logs.unshift(message);
  state.logs = state.logs.slice(0, 9);
}

function persistQuietly() {
  if (!state) return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function renderSetup() {
  el.careerGrid.innerHTML = careers
    .map(
      (career) => `
        <button class="career-card motion-pop" type="button" data-career="${career.id}">
          <span class="career-icon">${career.icon}</span>
          <h3>${career.name}</h3>
          <p>${career.note}</p>
          <div class="career-stats">
            <span>工资 ${money(career.salary)}</span>
            <span>月支出 ${money(career.expenses)}</span>
            <span>现金 ${money(career.savings)}</span>
          </div>
        </button>
      `,
    )
    .join("");

  el.careerGrid.querySelectorAll("[data-career]").forEach((button) => {
    button.addEventListener("click", () => {
      const career = careers.find((item) => item.id === button.dataset.career);
      state = createState(career);
      showGame();
      render();
      openSimpleModal({
        type: "开始",
        title: "现金流挑战开始",
        text: `你现在是${career.name}。这版重点练习房地产：买入、持有、还房贷、遇到市场变化，再决定是否出售。`,
        actions: [{ label: "开始掷骰", className: "primary", onClick: closeModal }],
      });
    });
  });
}

function showGame() {
  el.setupPanel.classList.add("hidden");
  el.gamePanel.classList.remove("hidden");
}

function showSetup() {
  el.gamePanel.classList.add("hidden");
  el.setupPanel.classList.remove("hidden");
}

function render() {
  if (!state) {
    showSetup();
    return;
  }
  ensureRealEstateState(state);
  ensureStockState(state);
  syncMortgageLiabilities(state);
  showGame();
  const freedom = freedomRatio();
  el.careerLabel.textContent = state.career.name;
  el.gameTitle.textContent = state.gameOver ? "你已经跳出打工循环" : "现金流资产挑战";
  el.gameSubtitle.textContent = state.gameOver
    ? "被动收入已经覆盖全部支出，游戏目标达成。"
    : `现金 ${money(state.cash)}，净月现金流 ${money(netMonthlyCashflow())}，净资产 ${money(calculateNetWorth(state))}。`;
  el.freedomPercent.textContent = `${freedom}%`;
  el.freedomBar.style.width = `${freedom}%`;
  el.roundLabel.textContent = `第 ${state.month} 月`;
  el.diceValue.textContent = state.lastRoll || "-";
  el.rollDice.disabled = state.gameOver;
  renderBoard();
  renderActions();
  renderStatements();
  renderRealEstatePortfolio();
  renderStockPortfolio();
  renderLogs();
}

function renderBoard() {
  el.board.innerHTML = boardTiles
    .map(
      (tile, index) => `
        <div class="tile ${tile.type} ${state.position === index ? "active" : ""}">
          ${state.position === index ? '<span class="player-token">你</span>' : ""}
          <span class="tile-icon">${tile.icon}</span>
          <div>
            <strong>${tile.title}</strong>
            <small>${tile.text}</small>
          </div>
        </div>
      `,
    )
    .join("");
}

function renderActions() {
  const debt = state.liabilities.reduce((sum, item) => sum + moneyValue(item.balance), 0);
  const buttons = [
    `<button type="button" id="borrowSmall">借入 ${money(5000)}</button>`,
    `<button type="button" id="openPortfolio">房地产中心</button>`,
    `<button type="button" id="openStockPortfolio">股票中心</button>`,
  ];

  if (debt > 0) {
    buttons.push(`<button type="button" id="repayDebt">偿还 ${money(Math.min(5000, debt))}</button>`);
  }

  if (state.gameOver) {
    buttons.push(`<button class="primary" type="button" id="newRun">再开一局</button>`);
  }

  el.actionStack.innerHTML = buttons.join("");
  document.querySelector("#borrowSmall")?.addEventListener("click", () => borrowMoney(5000, "主动借款"));
  document.querySelector("#repayDebt")?.addEventListener("click", repayDebt);
  document.querySelector("#newRun")?.addEventListener("click", resetGame);
  document.querySelector("#openPortfolio")?.addEventListener("click", () => {
    document.querySelector("#realEstateSection")?.scrollIntoView({ behavior: "smooth", block: "start" });
  });
  document.querySelector("#openStockPortfolio")?.addEventListener("click", () => {
    document.querySelector("#stockSection")?.scrollIntoView({ behavior: "smooth", block: "start" });
  });
}

function renderStatements() {
  const summary = calculatePortfolioSummary(state.ownedProperties);
  const stockSummary = calculateStockPortfolioSummary(state);
  const rows = [
    ["工资收入", "主动收入", state.salary],
    ["租金收入", "房地产每月租金", summary.monthlyRent],
    ["股票股息", "Payday 发放时进入现金", stockSummary.dividendsReceived],
    ["其他被动收入", "生意或证券流入", passiveIncome() - summary.monthlyRent],
    ["生活支出", "职业基础支出", -state.baseExpenses],
    ["房贷月供", "房地产贷款月付款", -summary.monthlyMortgage],
    ["房产支出", "管理费与维修准备金", -summary.monthlyExpenses],
    ["其他贷款月供", "非房贷负债月付款", -(liabilityPayments() - summary.monthlyMortgage)],
    ["净月现金流", "月结日实际增加的现金", netMonthlyCashflow()],
    ["手上现金", "可以投资或应急", state.cash],
    ["净资产", "现金 + 资产 - 负债", calculateNetWorth(state)],
  ];

  el.incomeStatement.innerHTML = rows
    .map(
      ([label, help, value]) => `
        <div class="stat-row ${Number(value) < 0 ? "negative-line" : ""}">
          <div>
            <strong>${label}</strong>
            <small>${help}</small>
          </div>
          <b>${money(value)}</b>
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
                <small>${item.type === "mortgage" ? "房贷" : "负债"}余额 ${money(item.balance)}</small>
              </div>
              <b>-${money(item.payment)}</b>
            </div>
          `,
        )
        .join("")
    : '<div class="asset-row"><strong>暂无负债</strong><small>借款或买入房产后会增加月供。</small></div>';
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

function summaryMetric(label, value) {
  return `<div class="summary-metric"><span>${label}</span><strong>${value}</strong></div>`;
}

function renderLogs() {
  el.logList.innerHTML = state.logs.map((item) => `<div class="log-item">${item}</div>`).join("");
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

function signedMoney(value) {
  const number = moneyValue(value);
  return `${number >= 0 ? "+" : "-"}${money(Math.abs(number))}`;
}

function signedPercent(value) {
  const number = stockMoney(value);
  return `${number >= 0 ? "+" : "-"}${Math.abs(number)}%`;
}

function rollDice() {
  if (!state || state.gameOver) return;
  const roll = Math.floor(Math.random() * 6) + 1;
  const previous = state.position;
  const next = (state.position + roll) % boardTiles.length;
  state.lastRoll = roll;

  if (previous + roll >= boardTiles.length) {
    collectPayday("经过月结日");
  }

  state.position = next;
  addLog(`掷出 ${roll}，移动到「${boardTiles[next].title}」。`);
  state.round += 1;
  render();
  triggerTile(boardTiles[next]);
}

function triggerTile(tile) {
  if (tile.type === "payday") {
    collectPayday("停在月结日");
    render();
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

  if (tile.type === "propertyEvent") {
    showPropertyHoldingEvent();
    return;
  }

  if (tile.type === "learn") {
    showLearning();
    return;
  }

  if (tile.type === "bank") {
    openSimpleModal({
      type: "银行",
      title: "银行柜台",
      text: "你可以在右侧操作区借入现金或偿还部分债务。借钱能解决短期现金问题，但每月会多一笔支出。",
      actions: [{ label: "知道了", className: "primary", onClick: closeModal }],
    });
  }
}

function collectPayday(reason) {
  const beforeCashflow = netMonthlyCashflow();
  state.cash += beforeCashflow;
  const mortgageResults = applyMortgagePayday(state);
  const dividendResult = settleStockDividends(state);
  const priceTick = resolveStockPriceTick(state, "Payday 后股票价格更新");
  state.month += 1;
  addLog(`${reason}：结算净现金流 ${money(beforeCashflow)}。`);
  if (dividendResult.totalDividend > 0) {
    addLog(`收到股票股息 ${money(dividendResult.totalDividend)}。股息不是每家公司都会发放。`);
  }
  if (priceTick.affected.length) {
    addLog(`股票价格更新：${priceTick.affected.slice(0, 2).map((item) => `${item.symbol}${item.direction}${signedPercent(item.percent)}`).join("，")}。`);
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
    const needed = Math.abs(state.cash) + 2000;
    borrowMoney(needed, "现金为负自动借款", false);
  }
  persistQuietly();
  checkWin();
}

function showOpportunity() {
  const card = pick(realEstateOpportunities);
  const iqDiscount = Math.min(0.08, state.financialIq * 0.01);
  const opportunity = {
    ...card,
    downPayment: Math.round(card.downPayment * (1 - iqDiscount)),
  };
  const calculation = calculateOpportunity(opportunity);
  const eventId = `opportunity-${state.round}-${state.position}-${opportunity.id}`;
  const shortfall = Math.max(0, opportunity.downPayment - state.cash);
  const cashAfter = state.cash - opportunity.downPayment;
  const reserveMonths = calculateEmergencyReserveMonths(state, cashAfter);
  const requiredMonths = emergencyReserveRequiredMonths(opportunity.riskLevel);

  openSimpleModal({
    type: "房地产机会",
    title: opportunity.name,
    text: `${opportunity.description} ${opportunity.childNote}`,
    metrics: propertyOpportunityMetrics(opportunity, calculation),
    actions: [
      {
        label: shortfall > 0 ? `现金不足，还差 ${money(shortfall)}` : "购买",
        className: "primary",
        disabled: shortfall > 0,
        onClick: () => {
          if (shortfall > 0) return;
          if (reserveMonths < requiredMonths) {
            showEmergencyReserveConfirm(opportunity, eventId, reserveMonths, requiredMonths);
            return;
          }
          completePropertyPurchase(opportunity, eventId);
        },
      },
      { label: "为什么？", onClick: () => showOpportunityWhy(opportunity, calculation, eventId) },
      { label: "查看计算", onClick: () => showOpportunityCalculation(opportunity, calculation, eventId) },
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
  return [
    ["类型", opportunity.category],
    ["总价", money(opportunity.purchasePrice)],
    ["首付款", money(opportunity.downPayment)],
    ["贷款金额", money(calculation.loanAmount)],
    ["每月租金", money(opportunity.monthlyRent)],
    ["每月房贷", money(opportunity.mortgagePayment)],
    ["管理与维修", money(calculation.monthlyExpenses)],
    ["每月净现金流", money(calculation.monthlyCashflow)],
    ["预计房产净值", money(calculation.projectedEquity)],
    ["风险等级", opportunity.riskLevel],
    ["地段等级", opportunity.locationQuality],
    ["儿童说明", opportunity.childNote],
  ];
}

function showOpportunityWhy(opportunity, calculation, eventId) {
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
  openSimpleModal({
    type: "查看计算",
    title: `${opportunity.name} 每月现金流`,
    text: "每月租金 − 每月房贷 − 管理费 − 维修准备金 ＝ 每月净现金流。",
    metrics: [
      ["每月租金", money(opportunity.monthlyRent)],
      ["− 每月房贷", money(-opportunity.mortgagePayment)],
      ["− 管理费", money(-opportunity.managementFee)],
      ["− 维修准备金", money(-opportunity.repairReserve)],
      ["＝ 每月净现金流", money(calculation.monthlyCashflow)],
    ],
    actions: [
      { label: "返回机会卡", className: "primary", onClick: () => showOpportunityByCard(opportunity, eventId) },
      { label: "关闭", onClick: closeModal },
    ],
  });
}

function showOpportunityByCard(opportunity, eventId) {
  const calculation = calculateOpportunity(opportunity);
  const shortfall = Math.max(0, opportunity.downPayment - state.cash);
  openSimpleModal({
    type: "房地产机会",
    title: opportunity.name,
    text: `${opportunity.description} ${opportunity.childNote}`,
    metrics: propertyOpportunityMetrics(opportunity, calculation),
    actions: [
      {
        label: shortfall > 0 ? `现金不足，还差 ${money(shortfall)}` : "购买",
        className: "primary",
        disabled: shortfall > 0,
        onClick: () => completePropertyPurchase(opportunity, eventId),
      },
      { label: "查看计算", onClick: () => showOpportunityCalculation(opportunity, calculation, eventId) },
      { label: "放弃", onClick: closeModal },
    ],
  });
}

function showEmergencyReserveConfirm(opportunity, eventId, reserveMonths, requiredMonths) {
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
      { label: "仍然购买", className: "primary", onClick: () => completePropertyPurchase(opportunity, eventId) },
      { label: "先不买", onClick: closeModal },
    ],
  });
}

function completePropertyPurchase(opportunity, eventId) {
  if (state.settledEvents.includes(eventId)) return;
  const result = buyProperty(state, opportunity, eventId);
  if (!result.ok) {
    openSimpleModal({
      type: "无法购买",
      title: "购买没有完成",
      text: result.reason,
      actions: [{ label: "知道了", className: "primary", onClick: closeModal }],
    });
    return;
  }
  addLog(`买入「${result.property.name}」，每月房地产现金流 ${money(result.property.monthlyCashflow)}。`);
  persistQuietly();
  render();
  openSimpleModal({
    type: "购买成功",
    title: "新房地产加入资产中心",
    text: `扣除首付 ${money(result.property.downPayment)}，新增房贷 ${money(result.property.originalMortgage)}。`,
    metrics: [
      ["剩余现金", money(state.cash)],
      ["每月租金", money(result.property.monthlyRent)],
      ["每月支出", money(result.property.monthlyExpenses + result.property.mortgagePayment)],
      ["净现金流变化", money(result.property.monthlyCashflow)],
      ["房产净值", money(result.property.equity)],
      ["净资产", money(calculateNetWorth(state))],
    ],
    actions: [{ label: "查看资产中心", className: "primary", onClick: closeModal }],
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
      ["每月支出", money(property.monthlyExpenses)],
      ["每月净现金流", money(calculatePropertyCashflow(property))],
      ["已还本金", money(property.principalPaid)],
      ["市场变化", property.lastMarketChange || "暂无"],
      ["持有月份", `${Math.max(0, state.month - property.purchasedMonth)} 个月`],
      ["状态", property.status === "paidOff" ? "房贷已还清" : "持有中"],
    ],
    actions: [
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
  if (state.cash < 0) {
    const needed = Math.abs(state.cash) + 1000;
    borrowMoney(needed, "现金不足自动借款", false);
  }
}

function borrowMoney(amount, name = "银行借款", shouldRender = true) {
  const rounded = Math.ceil(amount / 1000) * 1000;
  state.cash += rounded;
  state.liabilities.push({
    id: `loan-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    type: "loan",
    name,
    balance: rounded,
    payment: Math.ceil(rounded * 0.03),
  });
  addLog(`${name}：现金增加 ${money(rounded)}，月供增加 ${money(Math.ceil(rounded * 0.03))}。`);
  persistQuietly();
  if (shouldRender) render();
}

function repayDebt() {
  const loan = state.liabilities.find((item) => item.type !== "mortgage");
  if (!loan || state.cash <= 0) return;
  const payment = Math.min(5000, loan.balance, state.cash);
  loan.balance -= payment;
  state.cash -= payment;
  addLog(`偿还债务 ${money(payment)}。`);
  if (loan.balance <= 0) {
    addLog(`清偿「${loan.name}」，月供减少 ${money(loan.payment)}。`);
    state.liabilities = state.liabilities.filter((item) => item.id !== loan.id);
  } else {
    loan.payment = Math.ceil(loan.balance * 0.03);
  }
  persistQuietly();
  render();
}

function checkWin() {
  if (state.gameOver || passiveIncome() < totalExpenses()) return false;
  state.gameOver = true;
  addLog("被动收入已经覆盖总支出，财务自由达成。");
  persistQuietly();
  render();
  openSimpleModal({
    type: "胜利",
    title: "你跳出了打工循环",
    text: `你的被动收入为 ${money(passiveIncome())}，总支出为 ${money(totalExpenses())}。现在即使不依赖工资，也能覆盖每月支出。`,
    metrics: [
      ["用时", `${state.month} 个月`],
      ["房地产数量", `${state.ownedProperties.length} 项`],
      ["手上现金", money(state.cash)],
      ["净资产", money(calculateNetWorth(state))],
    ],
    actions: [
      { label: "再开一局", className: "primary", onClick: resetGame },
      { label: "留在棋盘", onClick: closeModal },
    ],
  });
  return true;
}

function openSimpleModal({ type, title, text, metrics = [], actions = [] }) {
  el.modalType.textContent = type;
  el.modalTitle.textContent = title;
  el.modalText.textContent = text;
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
      action.onClick();
    });
    el.modalActions.append(button);
  });

  el.modal.classList.remove("hidden");
}

function closeModal() {
  el.modal.classList.add("hidden");
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
  state = null;
  localStorage.removeItem(STORAGE_KEY);
  closeModal();
  renderSetup();
  showSetup();
}

el.rollDice.addEventListener("click", rollDice);
el.saveGame.addEventListener("click", saveGame);
el.loadGame.addEventListener("click", loadGame);
el.resetGame.addEventListener("click", resetGame);
el.closeModal.addEventListener("click", closeModal);
el.modal.addEventListener("click", (event) => {
  if (event.target === el.modal) closeModal();
});

window.addEventListener("keydown", (event) => {
  if (event.key === "Escape") closeModal();
  if (event.key === " " && state && !state.gameOver && el.modal.classList.contains("hidden")) {
    event.preventDefault();
    rollDice();
  }
});

window.cashflowDebug = {
  getState: () => state,
  setState: (nextState) => {
    state = migrateSavedState(nextState);
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
  closeModal,
};

renderSetup();
render();
