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
  { type: "opportunity", icon: "机", title: "小机会", text: "低门槛资产或小生意。" },
  { type: "doodad", icon: "花", title: "额外支出", text: "生活消费会考验现金储备。" },
  { type: "market", icon: "市", title: "市场", text: "资产价格和租金出现变化。" },
  { type: "learn", icon: "学", title: "学习", text: "提升财商，降低之后的犯错成本。" },
  { type: "opportunity", icon: "投", title: "投资机会", text: "可能是股票、房产或生意。" },
  { type: "bank", icon: "银", title: "银行", text: "可以借钱，也可以提前还债。" },
  { type: "doodad", icon: "账", title: "账单", text: "突发开销直接扣现金。" },
  { type: "opportunity", icon: "房", title: "大机会", text: "更高首付，可能带来更高现金流。" },
  { type: "market", icon: "价", title: "市场", text: "有人愿意买入你的资产。" },
  { type: "learn", icon: "课", title: "课程", text: "用知识换取更好的判断力。" },
  { type: "doodad", icon: "修", title: "维修", text: "现金不足时只能借钱。" },
  { type: "opportunity", icon: "股", title: "投资机会", text: "留意现金回报率。" },
  { type: "bank", icon: "贷", title: "银行", text: "借贷能加速，也会增加月支出。" },
  { type: "market", icon: "涨", title: "市场", text: "好资产有时能卖出溢价。" },
  { type: "doodad", icon: "购", title: "消费", text: "想要和需要不总是一回事。" },
  { type: "opportunity", icon: "店", title: "生意机会", text: "小型企业能贡献被动收入。" },
  { type: "payday", icon: "薪", title: "月结日", text: "再次结算现金流。" },
];

const opportunityCards = [
  {
    name: "自动售货机点位",
    type: "business",
    cost: 18000,
    downPayment: 6000,
    cashflow: 850,
    text: "朋友转让两个稳定点位，需要补货外包管理。",
  },
  {
    name: "指数基金定投包",
    type: "stock",
    cost: 12000,
    downPayment: 4000,
    cashflow: 220,
    text: "现金分红不高，但门槛低，适合早期累积。",
  },
  {
    name: "车位出租",
    type: "property",
    cost: 52000,
    downPayment: 16000,
    cashflow: 1200,
    text: "社区车位长期出租，维护成本低。",
  },
  {
    name: "二手公寓",
    type: "property",
    cost: 320000,
    downPayment: 42000,
    cashflow: 2600,
    text: "租金稳定，但需要较高首付。",
  },
  {
    name: "线上课程版权",
    type: "business",
    cost: 26000,
    downPayment: 9000,
    cashflow: 1400,
    text: "一次制作后持续销售，平台抽成已计入。",
  },
  {
    name: "高息债券组合",
    type: "stock",
    cost: 34000,
    downPayment: 11000,
    cashflow: 900,
    text: "现金流稳定，但市场价格波动较大。",
  },
  {
    name: "洗衣房合伙份额",
    type: "business",
    cost: 88000,
    downPayment: 24000,
    cashflow: 2300,
    text: "店长负责运营，你作为小股东分红。",
  },
  {
    name: "小套房出租",
    type: "property",
    cost: 210000,
    downPayment: 32000,
    cashflow: 2100,
    text: "地段普通，但租客稳定。",
  },
];

const doodadCards = [
  { name: "手机摔坏", cost: 2800, text: "换屏和维修费必须今天支付。" },
  { name: "朋友婚礼红包", cost: 1800, text: "人情支出没有现金流，但现金会减少。" },
  { name: "冲动购买新电脑", cost: 7600, text: "提高体验，但不会带来被动收入。" },
  { name: "车辆保养", cost: 4200, text: "长期忽略维护会让之后花更多钱。" },
  { name: "家庭旅游", cost: 9800, text: "快乐是真的，现金减少也是真的。" },
  { name: "保险补缴", cost: 3600, text: "必要支出，不能跳过。" },
];

const marketCards = [
  {
    name: "房租上涨",
    text: "你的房产类资产租金上涨 10%。",
    action: "rentUp",
  },
  {
    name: "小企业买家出现",
    text: "有人愿意用 1.35 倍账面价值买入你的生意资产。",
    action: "sell",
    type: "business",
    multiple: 1.35,
  },
  {
    name: "房产买家出价",
    text: "买家愿意用 1.25 倍账面价值收购你的房产资产。",
    action: "sell",
    type: "property",
    multiple: 1.25,
  },
  {
    name: "股市热潮",
    text: "股票类资产可以用 1.5 倍账面价值卖出。",
    action: "sell",
    type: "stock",
    multiple: 1.5,
  },
  {
    name: "利率上升",
    text: "所有贷款月供增加 5%。",
    action: "rateUp",
  },
  {
    name: "市场平静",
    text: "没有可以交易的机会。本回合观察市场即可。",
    action: "none",
  },
];

const learningCards = [
  { name: "读完一本财商书", cost: 0, iq: 1, text: "你更会区分资产和负债。" },
  { name: "参加投资课", cost: 3200, iq: 2, text: "之后买资产时现金流评估更准确。" },
  { name: "复盘失败交易", cost: 1200, iq: 1, text: "一次错误如果被复盘，就不算白亏。" },
  { name: "请教会计朋友", cost: 1800, iq: 1, text: "你学会先看净现金流，而不是只看价格。" },
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
  return {
    career,
    month: 1,
    position: 0,
    cash: career.savings,
    salary: career.salary,
    baseExpenses: career.expenses,
    assets: [],
    liabilities: [],
    financialIq: 0,
    lastRoll: null,
    gameOver: false,
    logs: [
      `你选择了${career.name}，初始现金 ${money(career.savings)}。`,
      "目标：让被动收入大于或等于总支出。",
    ],
  };
}

function passiveIncome() {
  return state.assets.reduce((sum, asset) => sum + asset.cashflow, 0);
}

function liabilityPayments() {
  return state.liabilities.reduce((sum, item) => sum + item.payment, 0);
}

function totalExpenses() {
  return state.baseExpenses + liabilityPayments();
}

function netMonthlyCashflow() {
  return state.salary + passiveIncome() - totalExpenses();
}

function freedomRatio() {
  if (!state) return 0;
  return Math.min(100, Math.round((passiveIncome() / Math.max(1, totalExpenses())) * 100));
}

function money(value) {
  const sign = value < 0 ? "-" : "";
  return `${sign}¥${Math.abs(Math.round(value)).toLocaleString("zh-CN")}`;
}

function pick(list) {
  return list[Math.floor(Math.random() * list.length)];
}

function addLog(message) {
  state.logs.unshift(message);
  state.logs = state.logs.slice(0, 9);
}

function renderSetup() {
  el.careerGrid.innerHTML = careers
    .map(
      (career) => `
        <button class="career-card" type="button" data-career="${career.id}">
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
        text: `你现在是${career.name}。每次经过月结日会收到工资和资产现金流，同时支付生活支出和贷款月供。`,
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

  showGame();
  const freedom = freedomRatio();
  el.careerLabel.textContent = state.career.name;
  el.gameTitle.textContent = state.gameOver ? "你已经跳出打工循环" : "现金流挑战进行中";
  el.gameSubtitle.textContent = state.gameOver
    ? "被动收入已经覆盖全部支出，游戏目标达成。"
    : `现金 ${money(state.cash)}，净月现金流 ${money(netMonthlyCashflow())}。`;
  el.freedomPercent.textContent = `${freedom}%`;
  el.freedomBar.style.width = `${freedom}%`;
  el.roundLabel.textContent = `第 ${state.month} 月`;
  el.diceValue.textContent = state.lastRoll || "-";
  el.rollDice.disabled = state.gameOver;
  renderBoard();
  renderActions();
  renderStatements();
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
  const debt = state.liabilities.reduce((sum, item) => sum + item.balance, 0);
  const buttons = [
    `<button type="button" id="borrowSmall">借入 ${money(5000)}</button>`,
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
}

function renderStatements() {
  const rows = [
    ["工资收入", "主动收入", state.salary],
    ["被动收入", "资产每月流入", passiveIncome()],
    ["生活支出", "职业基础支出", -state.baseExpenses],
    ["贷款月供", "所有负债的月付款", -liabilityPayments()],
    ["净月现金流", "月结日实际增加的现金", netMonthlyCashflow()],
    ["手上现金", "可以投资或应急", state.cash],
  ];

  el.incomeStatement.innerHTML = rows
    .map(
      ([label, help, value]) => `
        <div class="stat-row">
          <div>
            <strong>${label}</strong>
            <small>${help}</small>
          </div>
          <b>${money(value)}</b>
        </div>
      `,
    )
    .join("");

  el.assetList.innerHTML = state.assets.length
    ? state.assets
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
    : '<div class="asset-row"><strong>暂无资产</strong><small>买入资产后会显示在这里。</small></div>';

  el.liabilityList.innerHTML = state.liabilities.length
    ? state.liabilities
        .map(
          (item) => `
            <div class="asset-row negative">
              <div>
                <strong>${item.name}</strong>
                <small>余额 ${money(item.balance)}</small>
              </div>
              <b>-${money(item.payment)}</b>
            </div>
          `,
        )
        .join("")
    : '<div class="asset-row"><strong>暂无负债</strong><small>借款后会增加月供。</small></div>';
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

  if (tile.type === "doodad") {
    showDoodad();
    return;
  }

  if (tile.type === "market") {
    showMarket();
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
  const amount = netMonthlyCashflow();
  state.cash += amount;
  state.month += 1;
  addLog(`${reason}：结算净现金流 ${money(amount)}。`);
  if (state.cash < 0) {
    const needed = Math.abs(state.cash) + 2000;
    borrowMoney(needed, "现金为负自动借款", false);
  }
  checkWin();
}

function showOpportunity() {
  const card = pick(opportunityCards);
  const iqBonus = 1 + state.financialIq * 0.02;
  const adjustedCashflow = Math.round(card.cashflow * iqBonus);
  const deal = {
    ...card,
    cashflow: adjustedCashflow,
    value: card.cost,
    id: `${card.type}-${Date.now()}-${Math.random().toString(16).slice(2)}`,
  };
  const shortfall = Math.max(0, deal.downPayment - state.cash);
  const roi = Math.round((deal.cashflow * 12 / deal.downPayment) * 100);

  openSimpleModal({
    type: "机会",
    title: deal.name,
    text: deal.text,
    metrics: [
      ["资产类型", assetLabel(deal.type)],
      ["首付", money(deal.downPayment)],
      ["每月现金流", `+${money(deal.cashflow)}`],
      ["年化现金回报", `${roi}%`],
    ],
    actions: [
      {
        label: state.cash >= deal.downPayment ? "买入资产" : `借 ${money(shortfall)} 买入`,
        className: "primary",
        onClick: () => {
          if (shortfall > 0) borrowMoney(shortfall, "为买入资产借款", false);
          buyAsset(deal);
          closeModal();
        },
      },
      { label: "放弃机会", onClick: () => {
        addLog(`放弃了「${deal.name}」。`);
        closeModal();
        render();
      } },
    ],
  });
}

function buyAsset(deal) {
  state.cash -= deal.downPayment;
  state.assets.push(deal);
  addLog(`买入「${deal.name}」，每月被动收入增加 ${money(deal.cashflow)}。`);
  checkWin();
  render();
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
          render();
        },
      },
    ],
  });
}

function showMarket() {
  const card = pick(marketCards);
  if (card.action === "rentUp") {
    const properties = state.assets.filter((asset) => asset.type === "property");
    openSimpleModal({
      type: "市场",
      title: card.name,
      text: properties.length ? card.text : "你还没有房产资产，所以这次市场变化与你无关。",
      actions: [
        {
          label: "应用市场变化",
          className: "primary",
          onClick: () => {
            properties.forEach((asset) => {
              asset.cashflow = Math.round(asset.cashflow * 1.1);
            });
            addLog(properties.length ? "房产租金上涨，被动收入提高。" : "市场变化没有影响你的资产。");
            closeModal();
            checkWin();
            render();
          },
        },
      ],
    });
    return;
  }

  if (card.action === "rateUp") {
    openSimpleModal({
      type: "市场",
      title: card.name,
      text: state.liabilities.length ? card.text : "你没有贷款，所以利率上升暂时不影响你。",
      actions: [
        {
          label: "应用市场变化",
          className: "primary",
          onClick: () => {
            state.liabilities.forEach((item) => {
              item.payment = Math.ceil(item.payment * 1.05);
            });
            addLog(state.liabilities.length ? "贷款月供上升 5%。" : "利率变化没有影响你。");
            closeModal();
            render();
          },
        },
      ],
    });
    return;
  }

  if (card.action === "sell") {
    const candidates = state.assets.filter((asset) => asset.type === card.type);
    const sellActions = candidates.map((asset) => ({
      label: `卖出 ${asset.name}：${money(asset.value * card.multiple)}`,
      className: "primary",
      onClick: () => {
        sellAsset(asset.id, card.multiple);
        closeModal();
      },
    }));

    openSimpleModal({
      type: "市场",
      title: card.name,
      text: candidates.length ? card.text : `你目前没有${assetLabel(card.type)}资产可以出售。`,
      actions: sellActions.length
        ? [...sellActions, { label: "暂不出售", onClick: closeModal }]
        : [{ label: "知道了", className: "primary", onClick: closeModal }],
    });
    return;
  }

  openSimpleModal({
    type: "市场",
    title: card.name,
    text: card.text,
    actions: [{ label: "继续", className: "primary", onClick: closeModal }],
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
          render();
        },
      },
      { label: "跳过", onClick: closeModal },
    ],
  });
}

function sellAsset(assetId, multiple) {
  const asset = state.assets.find((item) => item.id === assetId);
  if (!asset) return;
  const price = Math.round(asset.value * multiple);
  state.cash += price;
  state.assets = state.assets.filter((item) => item.id !== assetId);
  addLog(`卖出「${asset.name}」，获得 ${money(price)}，但失去每月 ${money(asset.cashflow)} 被动收入。`);
  render();
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
    name,
    balance: rounded,
    payment: Math.ceil(rounded * 0.03),
  });
  addLog(`${name}：现金增加 ${money(rounded)}，月供增加 ${money(Math.ceil(rounded * 0.03))}。`);
  if (shouldRender) render();
}

function repayDebt() {
  const loan = state.liabilities[0];
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
  render();
}

function checkWin() {
  if (state.gameOver || passiveIncome() < totalExpenses()) return false;
  state.gameOver = true;
  addLog("被动收入已经覆盖总支出，财务自由达成。");
  render();
  openSimpleModal({
    type: "胜利",
    title: "你跳出了打工循环",
    text: `你的被动收入为 ${money(passiveIncome())}，总支出为 ${money(totalExpenses())}。现在即使不依赖工资，也能覆盖每月支出。`,
    metrics: [
      ["用时", `${state.month} 个月`],
      ["资产数量", `${state.assets.length} 个`],
      ["手上现金", money(state.cash)],
      ["财商等级", `${state.financialIq}`],
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
    button.addEventListener("click", action.onClick);
    el.modalActions.append(button);
  });

  el.modal.classList.remove("hidden");
}

function closeModal() {
  el.modal.classList.add("hidden");
}

function saveGame() {
  if (!state) return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  openSimpleModal({
    type: "保存",
    title: "进度已保存",
    text: "下次打开这个页面后，可以点击读取继续。",
    actions: [{ label: "知道了", className: "primary", onClick: closeModal }],
  });
}

function loadGame() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    openSimpleModal({
      type: "读取",
      title: "没有找到存档",
      text: "先开始一局并保存，之后才能读取。",
      actions: [{ label: "知道了", className: "primary", onClick: closeModal }],
    });
    return;
  }

  try {
    state = JSON.parse(raw);
    addLog("读取了本地存档。");
    render();
  } catch {
    localStorage.removeItem(STORAGE_KEY);
  }
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

renderSetup();
render();
