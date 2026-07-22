import zhTW from "./zh-TW.js";
import zhCN from "./zh-CN.js";
import en from "./en.js";
import {
  defaultLocale,
  detectLocale,
  formatCurrencyValue,
  formatDateValue,
  formatMonthValue,
  formatNumberValue,
  formatPercentValue,
  localeStorageKey,
  localeVersion,
  normalizeLocale,
  readSavedLocale,
  saveLocale,
  supportedLocales,
  translationSchemaVersion,
} from "./formatters.js";
import { buildGlossary } from "./glossary.js";

export {
  defaultLocale,
  detectLocale,
  localeStorageKey,
  localeVersion,
  normalizeLocale,
  readSavedLocale,
  saveLocale,
  supportedLocales,
  translationSchemaVersion,
};

export const localePacks = {
  "zh-TW": zhTW,
  "zh-CN": zhCN,
  en,
};

let currentLocale = defaultLocale;
const missingKeys = new Set();

export function setLocale(locale) {
  currentLocale = normalizeLocale(locale);
  if (typeof document !== "undefined") {
    document.documentElement.lang = currentLocale;
    document.documentElement.dataset.locale = currentLocale;
  }
  return currentLocale;
}

export function getLocale() {
  return currentLocale;
}

export function localeName(locale = currentLocale) {
  return localePacks[normalizeLocale(locale)]?.meta?.localeName || localePacks[defaultLocale].meta.localeName;
}

export function hasTranslation(locale, key) {
  const pack = localePacks[normalizeLocale(locale)];
  const value = lookup(pack, key);
  return typeof value === "string" && value.trim().length > 0;
}

export function t(key, params = {}, options = {}) {
  const locale = normalizeLocale(options.locale || currentLocale);
  const value = lookup(localePacks[locale], key) ?? lookup(localePacks[defaultLocale], key);
  if (typeof value !== "string") {
    if (!missingKeys.has(`${locale}:${key}`) && isDevMode()) {
      missingKeys.add(`${locale}:${key}`);
      console.warn(`[i18n] Missing translation: ${locale}:${key}`);
    }
    return typeof options.fallback === "string" ? interpolate(options.fallback, params) : "";
  }
  return interpolate(value, params);
}

export function pluralize(key, count, params = {}) {
  const suffix = Number(count) === 1 ? "one" : "other";
  const withSuffix = `${key}.${suffix}`;
  if (hasTranslation(currentLocale, withSuffix)) return t(withSuffix, { ...params, count });
  return t(key, { ...params, count });
}

export function formatCurrency(value, options = {}) {
  return formatCurrencyValue(value, currentLocale, options);
}

export function formatNumber(value, options = {}) {
  return formatNumberValue(value, currentLocale, options);
}

export function formatPercent(value, options = {}) {
  return formatPercentValue(value, currentLocale, options);
}

export function formatDate(value, options = {}) {
  return formatDateValue(value, currentLocale, options);
}

export function formatMonth(value) {
  return formatMonthValue(value, currentLocale);
}

export function localizedGlossary(locale = currentLocale) {
  return buildGlossary(localePacks[normalizeLocale(locale)] || localePacks[defaultLocale]);
}

export function applyStaticTranslations(root = document) {
  if (!root) return;
  root.querySelectorAll("[data-i18n]").forEach((node) => {
    const key = node.getAttribute("data-i18n");
    if (key) node.textContent = t(key);
  });
  root.querySelectorAll("[data-i18n-aria-label]").forEach((node) => {
    const key = node.getAttribute("data-i18n-aria-label");
    if (key) node.setAttribute("aria-label", t(key));
  });
  root.querySelectorAll("[data-i18n-content]").forEach((node) => {
    const key = node.getAttribute("data-i18n-content");
    if (key) node.setAttribute("content", t(key));
  });
  if (typeof document !== "undefined") document.title = t("home.title");
}

export function buildLocaleSelector(id = "localeSelect", className = "locale-select") {
  return `
    <label class="${className}">
      <span>${t("ui.language")}</span>
      <select id="${id}" aria-label="${t("ui.language")}">
        ${supportedLocales.map((locale) => `<option value="${locale}" ${locale === currentLocale ? "selected" : ""}>${localeName(locale)}</option>`).join("")}
      </select>
    </label>
  `;
}

export function attachLocaleSelector(selector, onChange) {
  const node = typeof selector === "string" ? document.querySelector(selector) : selector;
  node?.addEventListener("change", (event) => {
    const next = setLocale(event.target.value);
    onChange?.(next);
  });
}

export function translateText(value, params = {}) {
  const original = String(value ?? "");
  if (!original) return "";
  const pack = textMaps[currentLocale] || textMaps[defaultLocale];
  const fallbackPack = textMaps[defaultLocale];
  const exact = pack[original] ?? fallbackPack[original];
  if (exact) return interpolate(exact, params);
  return translateCommonPatterns(original, pack, fallbackPack);
}

export function translateList(values = []) {
  return values.map((value) => translateText(value));
}

export function localizeCareer(career) {
  const data = domain[currentLocale]?.careers?.[career.id] || (currentLocale === "zh-CN" ? {} : domain[defaultLocale].careers[career.id]) || {};
  return { ...career, ...data };
}

export function localizeBoardTile(tile, index = 0) {
  const data = domain[currentLocale]?.boardTiles?.[index] || (currentLocale === "zh-CN" ? {} : domain[defaultLocale].boardTiles[index]) || {};
  return { ...tile, ...data };
}

export function localizeTileVisual(type, visual) {
  const data = domain[currentLocale]?.tileVisuals?.[type] || (currentLocale === "zh-CN" ? {} : domain[defaultLocale].tileVisuals[type]) || {};
  return { ...visual, ...data };
}

export function localizeExperienceCollection(name, items) {
  const table = domain[currentLocale]?.[name] || domain[defaultLocale][name] || {};
  if (Array.isArray(items)) {
    return items.map((item) => translateObjectStrings({ ...item, ...(table[item.id] || {}) }));
  }
  return items;
}

export function validateTranslations() {
  const reference = flattenKeys(localePacks[defaultLocale]).sort();
  return supportedLocales.map((locale) => {
    const keys = flattenKeys(localePacks[locale]).sort();
    const missing = reference.filter((key) => !keys.includes(key));
    const extra = keys.filter((key) => !reference.includes(key));
    const empty = keys.filter((key) => {
      const value = lookup(localePacks[locale], key);
      return typeof value === "string" && !value.trim();
    });
    return { locale, missing, extra, empty };
  });
}

export function flattenKeys(object, prefix = "") {
  return Object.entries(object || {}).flatMap(([key, value]) => {
    const path = prefix ? `${prefix}.${key}` : key;
    if (value && typeof value === "object" && !Array.isArray(value)) return flattenKeys(value, path);
    return [path];
  });
}

function lookup(object, key) {
  return String(key)
    .split(".")
    .reduce((value, part) => (value && Object.prototype.hasOwnProperty.call(value, part) ? value[part] : undefined), object);
}

function interpolate(template, params) {
  return String(template).replace(/\{(\w+)\}/g, (_, key) => {
    const value = params[key];
    return value === undefined || value === null ? "" : String(value);
  });
}

function translateObjectStrings(object) {
  return Object.fromEntries(Object.entries(object).map(([key, value]) => {
    if (typeof value === "string") return [key, translateText(value)];
    if (Array.isArray(value)) return [key, value.map((item) => (typeof item === "string" ? translateText(item) : item))];
    return [key, value];
  }));
}

function isDevMode() {
  return typeof location === "undefined" || location.hostname === "localhost" || location.hostname === "127.0.0.1";
}

function translateCommonPatterns(original, pack, fallbackPack) {
  let next = original;
  const replacements = { ...commonTextMap["zh-TW"], ...fallbackPack, ...pack };
  Object.entries(replacements)
    .sort((a, b) => b[0].length - a[0].length)
    .forEach(([from, to]) => {
      if (from && typeof to === "string") next = next.split(from).join(to);
    });
  if (currentLocale === "en") {
    next = next.replace(/第\s*(\d+)\s*月/g, "Month $1");
    next = next.replace(/第\s*(\d+)\s*回合/g, "Round $1");
    next = next.replace(/(\d+)\s*个月/g, "$1 months");
    next = next.replace(/(\d+)\s*項/g, "$1 items").replace(/(\d+)\s*项/g, "$1 items");
    next = next.replace(/(\d+)\s*股/g, "$1 shares");
    next = next.replace(/(\d+)\s*張/g, "$1 policies").replace(/(\d+)\s*张/g, "$1 policies");
  }
  return next;
}

const commonTextMap = {
  "zh-TW": {
    "现金": "現金",
    "资产": "資產",
    "负债": "負債",
    "净资产": "淨資產",
    "收入": "收入",
    "支出": "支出",
    "月现金流": "月現金流",
    "被动收入": "被動收入",
    "主动收入": "主動收入",
    "财务自由": "財務自由",
    "房地产": "房地產",
    "房产": "房產",
    "房贷": "房貸",
    "贷款": "貸款",
    "银行": "銀行",
    "保险": "保險",
    "保费": "保費",
    "理赔": "理賠",
    "税务": "稅務",
    "税金": "稅金",
    "股票": "股票",
    "股息": "股息",
    "小生意": "小生意",
    "任务": "任務",
    "成就": "成就",
    "徽章": "徽章",
    "挑战": "挑戰",
    "报告": "報告",
    "进度": "進度",
    "市场": "市場",
    "事件": "事件",
    "学习": "學習",
    "玩家": "玩家",
    "关闭": "關閉",
    "返回": "返回",
    "知道了": "知道了",
    "暂无": "暫無",
    "记录": "紀錄",
    "当前": "目前",
    "选择": "選擇",
    "购买": "購買",
    "买入": "買入",
    "卖出": "賣出",
    "投资": "投資",
    "升级": "升級",
    "显示": "顯示",
    "第": "第",
    "回合": "回合",
    "个月": "個月",
    "项": "項",
    "张": "張",
    "应急储备金": "緊急預備金",
    "紧急预备金": "緊急預備金",
    "manual": "手動備份",
    "debug": "驗收備份",
    "new-game": "新遊戲前",
    "restart": "重開前",
    "clear-save": "清除存檔前",
    "import-before-replace": "匯入取代前",
    "before-restore": "恢復備份前",
  },
};

const textMaps = {
  "zh-TW": commonTextMap["zh-TW"],
  "zh-CN": {
    "現金": "现金",
    "資產": "资产",
    "負債": "负债",
    "淨資產": "净资产",
    "月現金流": "月现金流",
    "被動收入": "被动收入",
    "主動收入": "主动收入",
    "財務自由": "财务自由",
    "房地產": "房地产",
    "房產": "房产",
    "房貸": "房贷",
    "貸款": "贷款",
    "銀行": "银行",
    "保險": "保险",
    "保費": "保费",
    "理賠": "理赔",
    "稅務": "税务",
    "稅金": "税金",
    "任務": "任务",
    "挑戰": "挑战",
    "報告": "报告",
    "進度": "进度",
    "市場": "市场",
    "學習": "学习",
    "關閉": "关闭",
    "選擇": "选择",
    "購買": "购买",
    "買入": "买入",
    "賣出": "卖出",
    "投資": "投资",
    "升級": "升级",
    "紀錄": "记录",
    "目前": "当前",
    "個月": "个月",
    "項": "项",
    "張": "张",
    "緊急預備金": "应急储备金",
    "manual": "手动备份",
    "debug": "验收备份",
    "new-game": "新游戏前",
    "restart": "重开前",
    "clear-save": "清除存档前",
    "import-before-replace": "导入取代前",
    "before-restore": "恢复备份前",
  },
  en: {
    "manual": "Manual backup",
    "debug": "Acceptance backup",
    "new-game": "Before new game",
    "restart": "Before restart",
    "clear-save": "Before clearing save",
    "import-before-replace": "Before import replace",
    "before-restore": "Before restore",
    "欢迎来到现金流冒险城": "Welcome to Cashflow Adventure City",
    "你的目标是让被动收入慢慢高过每月必要支出。": "Your goal is to grow passive income until it is higher than essential monthly expenses.",
    "收入、支出与现金流": "Income, Expenses, and Cash Flow",
    "收入减掉支出，剩下的就是每月现金流。现金流越健康，选择越多。": "Income minus expenses equals monthly cash flow. Healthier cash flow gives you more choices.",
    "资产与负债": "Assets and Liabilities",
    "资产可能带来收入；负债通常需要持续付款。两者都要看现金流。": "Assets may create income. Liabilities usually need ongoing payments. Check both through cash flow.",
    "掷骰、遇到事件、做选择": "Roll, Meet Events, Make Choices",
    "你会逐格前进，阅读事件卡，再决定买入、放弃、借款或学习。": "Move space by space, read the event card, then choose to buy, pass, borrow, or learn.",
    "欢迎": "Welcome",
    "选择角色": "Choose a Character",
    "看懂目标": "Understand the Goal",
    "第一次掷骰": "First Roll",
    "观察移动": "Watch Movement",
    "阅读事件": "Read the Event",
    "查看财务": "Check Finances",
    "先想一想": "Think First",
    "看结算": "Read the Result",
    "资产": "Assets",
    "负债": "Liabilities",
    "被动收入": "Passive Income",
    "准备好继续冒险": "Ready to Keep Playing",
    "先认识目标：让被动收入覆盖必要支出。": "Start with the goal: passive income covers essential expenses.",
    "不同角色的工资、支出和初始现金不同，没有绝对最强。": "Characters have different salaries, expenses, and starting cash. None is always best.",
    "财务自由进度来自真实被动收入和必要支出。": "Financial freedom progress uses real passive income and essential expenses.",
    "按主按钮前进，移动中按钮会锁定。": "Press the main button to move. It locks while movement is happening.",
    "角色会逐格走，只有最后停下的格子触发事件。": "Your character moves one space at a time. Only the final space triggers an event.",
    "先看现金、现金流、资产和负债会怎么变化。": "First check how cash, cash flow, assets, and liabilities may change.",
    "现金、收入、支出和月现金流会一起影响你的选择。": "Cash, income, expenses, and monthly cash flow all affect your choices.",
    "好选择不是只看价格，还要看剩余现金和风险。": "A good choice is not only about price. Check remaining cash and risk too.",
    "结算后会显示现金、现金流、资产或负债的真实变化。": "After settling, the game shows real changes to cash, cash flow, assets, or liabilities.",
    "资产可能带来收入或价值变化，但也可能有风险。": "Assets may create income or change value, but they can have risk.",
    "负债可以帮你处理现金压力，但通常会增加未来月付款。": "Liabilities can help with cash pressure, but usually add future payments.",
    "当被动收入接近支出，你就越来越接近游戏中的财务自由。": "As passive income gets closer to expenses, you move toward financial freedom in the game.",
    "任务、成就、徽章和报告会记录你的学习路线。": "Missions, achievements, badges, and reports track your learning path.",
    "你已经知道核心目标，可以继续自由探索。": "You know the core goal. Keep exploring freely.",
    "第 1 回合：看落点": "Round 1: Watch the Landing Space",
    "这回合先观察骰子、移动和最后停下的格子。": "This round, watch the die, the movement, and the final space.",
    "第 2 回合：现金流": "Round 2: Cash Flow",
    "试着找出收入减支出后，每月还剩多少。": "Try to find what is left each month after income minus expenses.",
    "第 3 回合：预备金": "Round 3: Emergency Fund",
    "现金像安全垫，能帮你处理维修、医疗或失业。": "Cash is like a cushion for repairs, medical events, or job loss.",
    "第 4 回合：资产": "Round 4: Assets",
    "资产可能带来收入，但买入前也要看风险和成本。": "Assets may create income, but check risk and cost before buying.",
    "第 5 回合：负债": "Round 5: Liabilities",
    "借款不是坏事，但月付款会影响之后的现金流。": "Borrowing is not always bad, but monthly payments affect future cash flow.",
    "第 6 回合：投资基础": "Round 6: Investing Basics",
    "房产和股票都可能涨跌，不要只看开心的一面。": "Property and stocks can rise or fall. Do not only look at the happy side.",
    "第 7 回合：小生意": "Round 7: Small Business",
    "营收不是净利，扣掉成本后才是留下的钱。": "Revenue is not profit. Profit is what remains after costs.",
    "第 8 回合：市场变化": "Round 8: Market Changes",
    "市场会影响价格、租金和需求，变化不是保证。": "Markets affect prices, rent, and demand. Changes are not guarantees.",
    "第 9 回合：分散风险": "Round 9: Diversification",
    "不要把所有钱都放在同一种选择里，但分散也不能消除所有风险。": "Do not put everything in one choice, but diversification cannot remove all risk.",
    "第 10 回合：下一步": "Round 10: Next Step",
    "打开进度中心，看看你离财务自由还差多少。": "Open Progress Center to see how far you are from financial freedom.",
    "选择一位角色开始冒险。": "Choose a character to start.",
    "按下掷骰按钮并看角色逐格移动。": "Press roll and watch your character move space by space.",
    "查看现金、收入、支出和月现金流。": "Check cash, income, expenses, and monthly cash flow.",
    "找到每月收入减支出的结果。": "Find income minus expenses for each month.",
    "读完事件卡并完成一次选择。": "Read an event card and make one choice.",
    "打开学习说明，理解选择背后的原因。": "Open the learning note and understand why the choice matters.",
    "确认现金还能支撑几个月支出。": "Check how many months your cash cushion can cover.",
    "买入资产，或正确查看风险后放弃。": "Buy an asset, or pass after checking the risk.",
    "打开进度中心查看离目标还差多少。": "Open Progress Center to see what remains.",
    "完成或跳过完整教学流程。": "Complete or skip the full tutorial.",
    "适合第一次玩：收入和支出都比较稳定，适合从小机会开始练习。": "Good for first-time players: stable income and expenses.",
    "适合喜欢比较数字的人：收入较高，但支出也高，高薪不代表一定更轻松。": "Good for comparing numbers: higher income and higher expenses.",
    "适合喜欢尝试的人：收入较灵活，适合观察小生意和现金流。": "Good for trying things: flexible income and business choices.",
    "适合挑战规划的人：收入高、生活成本也高，需要认真管理负债。": "Good for planning practice: high income and high costs.",
    "这是格子预览，不会结算事件或改变资料。": "This is only a space preview. It will not settle an event or change data.",
    "类别": "Category",
    "状态": "Status",
    "说明": "Description",
    "位置": "Position",
    "地图控制": "Map Controls",
    "缩小地图": "Zoom Out",
    "放大地图": "Zoom In",
    "切换小地图": "Toggle Minimap",
    "小地图，点击移动视口": "Minimap. Click to move the view.",
    "可拖曳缩放的现金流城市地图": "Draggable and zoomable Cashflow City map",
    "对手": "opponent",
    "待掷骰": "Waiting to roll",
    "游戏快捷入口": "Game shortcuts",
    "数量": "Count",
    "难度": "Difficulty",
    "模式": "Mode",
    "继续游戏进度摘要": "Saved game progress summary",
    "当前进度": "Current Progress",
    "暂无当前任务": "No current mission",
    "最近徽章": "Recent Badge",
    "现金不足": "Not enough cash",
    "現金不足": "Not enough cash",
    "贷款未批准": "Loan not approved",
    "貸款未批准": "Loan not approved",
    "存档失败": "Save failed",
    "存檔失敗": "Save failed",
    "现在还不能掷骰": "You cannot roll yet",
    "現在還不能擲骰": "You cannot roll yet",
    "当前事件还没处理完，完成或关闭事件卡后就能继续。": "This event is not finished yet. Complete or close the event card to continue.",
    "角色正在前进，请等到到达格子并处理完事件。": "Your character is moving. Wait until they arrive and finish the event.",
    "看状态": "Check Status",
    "AI 等待行动": "AI waiting",
    "AI 正在行动": "AI is acting",
    "打开竞赛排名": "Open competition ranking",
    "打开当前任务": "Open current mission",
    "打开新手任务": "Open beginner mission",
    "观看": "Watch",
    "角色缩图": "Character thumbnails",
    "城市冒险家": "City Adventurer",
    "在城市中学习现金流选择。": "Learn cash-flow choices in the city.",
    "现金流挑战开始": "Cashflow Challenge Starts",
    "开始掷骰": "Start Rolling",
    "欢迎教学": "Welcome Tutorial",
    "第几步": "Step",
    "小提醒": "Small Note",
    "图示": "Icon",
    "财务自由是游戏里的简化目标，不是人生唯一答案。": "Financial freedom is a simplified game goal, not the only answer in life.",
    "每一步都可以跳过，之后也能重播。": "You can skip each step and replay it later.",
    "直接开始": "Start Directly",
    "做完以后，现金还够处理意外吗？": "After this, will cash still cover surprises?",
    "这个选择会让现金变多还是变少？": "Will this choice increase or decrease cash?",
    "每月现金流会增加还是减少？": "Will monthly cash flow rise or fall?",
    "之后每个月会不会多一笔固定支出？": "Will this add a fixed monthly payment?",
    "如果市场变差，这个选择可能有什么风险？": "If the market worsens, what risk could appear?",
    "它是资产、负债，还是一次性消费？": "Is it an asset, a liability, or a one-time expense?",
    "轻提示": "Small Hint",
    "计算提示": "Math Hint",
    "完整解释": "Full Explanation",
    "先比较现金、月现金流和风险，不需要急着做决定。": "Compare cash, monthly cash flow, and risk before deciding.",
    "看卡片里的真实数字：收入 − 支出 − 月付款，才是留下的钱。": "Use the real numbers: income minus expenses and payments is what remains.",
    "如果现金太少或负债太高，可以放弃机会、等待、查看银行或卖出资产。游戏不会保证任何投资赚钱。": "If cash is low or debt is high, you can pass, wait, visit the bank, or sell assets. The game never guarantees profit.",
    "财务名词提示": "Money Term Tips",
    "词典": "Glossary",
    "为什么重要": "Why it matters",
    "相关词": "Related terms",
    "提醒": "Reminder",
    "查看全部词典": "View Full Glossary",
    "用简单、准确、不承诺收益的话解释游戏中的财务名词。": "Simple, accurate money words without promising profit.",
    "无": "None",
    "自动存档": "Auto-save",
    "关键选择后会保存到这个浏览器": "Key choices are saved in this browser.",
    "尚未开始": "Not started yet",
    "保存进度": "Save Progress",
    "读取存档": "Load Save",
    "声音与画面": "Sound & Display",
    "游戏规则": "Game Rules",
    "重新开始": "Restart",
    "游戏选单": "Game Menu",
    "现金": "Cash",
    "現金": "Cash",
    "资产": "Assets",
    "資產": "Assets",
    "负债": "Liabilities",
    "負債": "Liabilities",
    "净资产": "Net Worth",
    "淨資產": "Net Worth",
    "收入": "Income",
    "支出": "Expenses",
    "月现金流": "Monthly Cash Flow",
    "月現金流": "Monthly Cash Flow",
    "被动收入": "Passive Income",
    "被動收入": "Passive Income",
    "主动收入": "Active Income",
    "主動收入": "Active Income",
    "财务自由": "Financial Freedom",
    "財務自由": "Financial Freedom",
    "房地产": "Real Estate",
    "房地產": "Real Estate",
    "房产": "Property",
    "房產": "Property",
    "房贷": "Mortgage",
    "房貸": "Mortgage",
    "贷款": "Loan",
    "貸款": "Loan",
    "银行": "Bank",
    "銀行": "Bank",
    "保险": "Insurance",
    "保險": "Insurance",
    "保费": "Premium",
    "保費": "Premium",
    "理赔": "Claim",
    "稅務": "Taxes",
    "税务": "Taxes",
    "税金": "Taxes",
    "股票": "Stocks",
    "股息": "Dividends",
    "小生意": "Small Business",
    "任务": "Missions",
    "任務": "Missions",
    "成就": "Achievements",
    "徽章": "Badges",
    "挑战": "Challenges",
    "挑戰": "Challenges",
    "报告": "Reports",
    "報告": "Reports",
    "进度": "Progress",
    "進度": "Progress",
    "市场": "Market",
    "市場": "Market",
    "事件": "Event",
    "学习": "Learning",
    "學習": "Learning",
    "玩家": "You",
    "关闭": "Close",
    "關閉": "Close",
    "返回": "Back",
    "知道了": "Got it",
    "暂无": "No",
    "暫無": "No",
    "记录": "records",
    "紀錄": "records",
    "当前": "Current",
    "目前": "Current",
    "选择": "Choose",
    "選擇": "Choose",
    "购买": "Buy",
    "購買": "Buy",
    "买入": "Buy",
    "買入": "Buy",
    "卖出": "Sell",
    "賣出": "Sell",
    "投资": "Invest",
    "投資": "Invest",
    "升级": "Upgrade",
    "升級": "Upgrade",
    "显示": "Show",
    "顯示": "Show",
    "为什么？": "Why?",
    "為什麼？": "Why?",
    "下一步": "Next",
    "例子": "Example",
    "查看计算": "See the Math",
    "放弃": "Pass",
    "知道了": "Got it",
    "完成": "Finish",
    "开始": "Start",
    "再开": "Restart",
    "开始挑战": "Start Challenge",
    "返回首页": "Home",
    "分享卡片": "Share Card",
    "继续自由模式": "Free Play",
    "开始新挑战": "New Challenge",
    "回合": "Round",
    "月": "Month",
    "个月": "months",
    "項": "items",
    "项": "items",
    "张": "policies",
    "張": "policies",
    "緊急預備金": "Emergency Fund",
    "应急储备金": "Emergency Fund",
    "紧急预备金": "Emergency Fund",
  },
};

const domain = {
  "zh-TW": {
    careers: {
      teacher: { name: "小學老師", icon: "師", note: "工資穩定，現金不多，適合練習從小機會開始累積資產。", guidance: "適合第一次玩：收入和支出都比較穩定，適合從小機會開始練習。", personality: "探險型老師", shortNote: "穩定起步，適合練習小額機會。" },
      engineer: { name: "軟體工程師", icon: "工", note: "現金流較寬裕，但生活支出高，容易被大額消費拖慢。", guidance: "適合喜歡比較數字的人：收入較高，但支出也高，高薪不代表一定更輕鬆。", personality: "系統發明家", shortNote: "現金流較寬，適合比較不同資產。" },
      designer: { name: "自由設計師", icon: "設", note: "收入中等，適合用小生意和版權收入建立被動收入。", guidance: "適合喜歡嘗試的人：收入較靈活，適合觀察小生意和現金流。", personality: "創意小店長", shortNote: "靈活經營，適合嘗試小生意。" },
      doctor: { name: "牙科醫生", icon: "醫", note: "收入高但開銷也高，需要控制負債和現金安全墊。", guidance: "適合挑戰規劃的人：收入高、生活成本也高，需要認真管理負債。", personality: "穩健規劃師", shortNote: "收入高，也要管理高支出。" },
    },
    boardTiles: [
      ["月", "月結日", "領取工資與被動收入，支付全部支出。"],
      ["機", "房地產機會", "評估租金、房貸和淨現金流。"],
      ["花", "額外支出", "生活消費會考驗現金儲備。"],
      ["市", "股票市場", "虛構股票會隨市場波動。"],
      ["學", "學習", "提升財商，降低之後的犯錯成本。"],
      ["醫", "人生事件", "醫療、家庭、工作和責任會影響現金。"],
      ["股", "股票機會", "買入虛構公司的一小部分。"],
      ["銀", "銀行", "可以借錢，也可以提前還債。"],
      ["帳", "帳單", "突發開銷直接扣現金。"],
      ["租", "租賃機會", "找到能產生租金的資產。"],
      ["價", "市場", "持有資產會被市場影響。"],
      ["店", "小生意機會", "投資能產生收入的小系統。"],
      ["保", "保險", "用固定保費分擔特定風險。"],
      ["課", "課程", "用知識換取更好的判斷力。"],
      ["修", "房產持有", "維修、空置、續約或翻修。"],
      ["投", "基金機會", "練習分散和價格波動。"],
      ["貸", "銀行", "借貸能加速，也會增加月支出。"],
      ["漲", "市場消息", "產業和公司事件影響價格。"],
      ["購", "消費", "想要和需要不總是一回事。"],
      ["營", "生意事件", "生意可能遇到機會或風險。"],
      ["稅", "稅務", "遊戲中的簡化稅務責任。"],
      ["需", "需求變化", "不同類型生意需求會改變。"],
      ["職", "工作發展", "加薪、升職、失業或再就業。"],
      ["管", "持有管理", "房產賺錢也需要維護。"],
      ["家", "家庭責任", "家庭選擇會影響現金與幸福。"],
      ["急", "醫療意外", "檢查保險和預備金是否夠用。"],
      ["房", "置產機會", "比較現金購買與房貸購買。"],
      ["善", "慈善分享", "練習在預算中安排分享。"],
      ["鋪", "小店機會", "評估營收、成本與時間投入。"],
      ["風", "房市風向", "地段與租金可能改變。"],
      ["險", "保障檢查", "看保費是否適合月現金流。"],
      ["券", "股票機會", "買入前先看風險和分散。"],
      ["書", "財商課堂", "知識會改善之後的選擇。"],
      ["票", "稅務整理", "用遊戲規則練習預留稅款。"],
      ["信", "信用櫃台", "信用分影響額度和利率。"],
      ["訊", "市場新聞", "價格波動不是最終結果。"],
      ["客", "客流事件", "需求會影響小生意利潤。"],
      ["工", "工作機會", "收入可能提高，也可能中斷。"],
      ["修", "生活維修", "小支出也會考驗現金墊。"],
      ["薪", "月結日", "再次結算現金流與房貸本金。"],
    ].map(([icon, title, text]) => ({ icon, title, text })),
    tileVisuals: {
      payday: { category: "薪水日", status: "月結", badge: "金幣" },
      opportunity: { category: "房地產", status: "機會", badge: "房屋" },
      propertyEvent: { category: "房地產", status: "持有", badge: "維修" },
      stockOpportunity: { category: "股票", status: "買賣", badge: "行情" },
      stockMarket: { category: "股票", status: "市場", badge: "波動" },
      businessOpportunity: { category: "小生意", status: "投資", badge: "店鋪" },
      businessEvent: { category: "小生意", status: "經營", badge: "客流" },
      businessMarket: { category: "市場", status: "需求", badge: "需求" },
      bank: { category: "銀行", status: "貸款", badge: "信用" },
      insurance: { category: "保險", status: "保障", badge: "盾牌" },
      lifeEvent: { category: "醫療", status: "人生", badge: "健康" },
      tax: { category: "稅務", status: "責任", badge: "文件" },
      jobEvent: { category: "失業", status: "工作", badge: "工作" },
      market: { category: "市場", status: "變化", badge: "風向" },
      doodad: { category: "意外支出", status: "扣款", badge: "帳單" },
      learn: { category: "學習", status: "成長", badge: "書本" },
      family: { category: "家庭", status: "責任", badge: "家庭" },
      charity: { category: "慈善", status: "分享", badge: "愛心" },
    },
  },
  "zh-CN": {
    careers: {
      teacher: { name: "小学老师", icon: "师", note: "工资稳定，现金不多，适合练习从小机会开始累积资产。", guidance: "适合第一次玩：收入和支出都比较稳定，适合从小机会开始练习。", personality: "探险型老师", shortNote: "稳定起步，适合练习小额机会。" },
      engineer: { name: "软件工程师", icon: "工", note: "现金流较宽裕，但生活支出高，容易被大额消费拖慢。", guidance: "适合喜欢比较数字的人：收入较高，但支出也高，高薪不代表一定更轻松。", personality: "系统发明家", shortNote: "现金流较宽，适合比较不同资产。" },
      designer: { name: "自由设计师", icon: "设", note: "收入中等，适合用小生意和版权收入建立被动收入。", guidance: "适合喜欢尝试的人：收入较灵活，适合观察小生意和现金流。", personality: "创意小店长", shortNote: "灵活经营，适合尝试小生意。" },
      doctor: { name: "牙科医生", icon: "医", note: "收入高但开销也高，需要控制负债和现金安全垫。", guidance: "适合挑战规划的人：收入高、生活成本也高，需要认真管理负债。", personality: "稳健规划师", shortNote: "收入高，也要管理高支出。" },
    },
    boardTiles: null,
    tileVisuals: null,
  },
  en: {
    careers: {
      teacher: { name: "Elementary Teacher", icon: "T", note: "Stable salary with limited cash. Good for practicing small opportunities.", guidance: "Good for first-time players: stable income and expenses make choices easier to read.", personality: "Explorer Teacher", shortNote: "A steady start for small opportunities." },
      engineer: { name: "Software Engineer", icon: "E", note: "More cash flow, but higher living costs can slow progress.", guidance: "Good for number-checkers: higher income, but higher expenses too.", personality: "Systems Inventor", shortNote: "More room to compare assets." },
      designer: { name: "Freelance Designer", icon: "D", note: "Flexible income. Good for learning business and cash flow.", guidance: "Good for experimenters: flexible income and business choices.", personality: "Creative Shopkeeper", shortNote: "Flexible and business-friendly." },
      doctor: { name: "Dentist", icon: "Dr", note: "High income and high costs. Debt and cash cushions matter.", guidance: "Good for planning practice: high income with high lifestyle costs.", personality: "Careful Planner", shortNote: "High income, high expenses." },
    },
    boardTiles: [
      ["Pay", "Payday", "Collect salary and passive income, then pay expenses."],
      ["Prop", "Property Deal", "Check rent, mortgage, and net cash flow."],
      ["Bill", "Extra Expense", "Spending tests your cash cushion."],
      ["Mkt", "Stock Market", "Fictional stocks move with the market."],
      ["Learn", "Learning", "Improve money judgment."],
      ["Life", "Life Event", "Health, family, work, and responsibility affect cash."],
      ["Stock", "Stock Deal", "Buy a small piece of a fictional company."],
      ["Bank", "Bank", "Borrow money or repay debt early."],
      ["Bill", "Bill", "Surprise costs reduce cash."],
      ["Rent", "Rental Deal", "Find assets that may create rent."],
      ["Mkt", "Market", "Held assets may be affected by the market."],
      ["Biz", "Business Deal", "Invest in systems that may create income."],
      ["Shield", "Insurance", "Use premiums to share certain risks."],
      ["Class", "Course", "Use learning to improve judgment."],
      ["Fix", "Property Holding", "Repairs, vacancies, renewals, or upgrades."],
      ["Fund", "Fund Deal", "Practice diversification and price changes."],
      ["Loan", "Bank", "Borrowing can speed up progress and add expenses."],
      ["News", "Market News", "Industry and company events affect prices."],
      ["Buy", "Spending", "Wants and needs are not always the same."],
      ["Biz", "Business Event", "Businesses may face opportunities or risks."],
      ["Tax", "Taxes", "Simplified game tax responsibility."],
      ["Need", "Demand Change", "Business demand can change."],
      ["Job", "Career Event", "Raises, promotions, job loss, or new jobs."],
      ["Care", "Property Care", "Property income also needs maintenance."],
      ["Home", "Family", "Family choices affect cash and well-being."],
      ["Med", "Medical Event", "Check insurance and emergency funds."],
      ["Home", "Buy Property", "Compare cash purchase and mortgage purchase."],
      ["Give", "Charity", "Practice sharing within a budget."],
      ["Shop", "Small Shop", "Check revenue, costs, and time."],
      ["Wind", "Housing Market", "Location and rent may change."],
      ["Safe", "Protection Check", "See if premiums fit monthly cash flow."],
      ["Stock", "Stock Deal", "Check risk and diversification before buying."],
      ["Book", "Money Class", "Knowledge can improve future choices."],
      ["Tax", "Tax Prep", "Practice setting aside money with game rules."],
      ["Score", "Credit Desk", "Credit affects limits and rates."],
      ["News", "Market News", "Price changes are not final results."],
      ["Cust", "Customer Flow", "Demand affects business profit."],
      ["Work", "Job Chance", "Income may rise or pause."],
      ["Fix", "Life Repair", "Small expenses test your cash cushion."],
      ["Pay", "Payday", "Settle cash flow and mortgage principal again."],
    ].map(([icon, title, text]) => ({ icon, title, text })),
    tileVisuals: {
      payday: { category: "Payday", status: "Monthly", badge: "Coins" },
      opportunity: { category: "Real Estate", status: "Deal", badge: "House" },
      propertyEvent: { category: "Real Estate", status: "Holding", badge: "Repair" },
      stockOpportunity: { category: "Stocks", status: "Trade", badge: "Ticker" },
      stockMarket: { category: "Stocks", status: "Market", badge: "Swing" },
      businessOpportunity: { category: "Business", status: "Invest", badge: "Shop" },
      businessEvent: { category: "Business", status: "Operate", badge: "Customers" },
      businessMarket: { category: "Market", status: "Demand", badge: "Demand" },
      bank: { category: "Bank", status: "Loan", badge: "Credit" },
      insurance: { category: "Insurance", status: "Cover", badge: "Shield" },
      lifeEvent: { category: "Health", status: "Life", badge: "Care" },
      tax: { category: "Taxes", status: "Duty", badge: "File" },
      jobEvent: { category: "Job", status: "Work", badge: "Career" },
      market: { category: "Market", status: "Change", badge: "Trend" },
      doodad: { category: "Expense", status: "Pay", badge: "Bill" },
      learn: { category: "Learning", status: "Grow", badge: "Book" },
      family: { category: "Family", status: "Care", badge: "Home" },
      charity: { category: "Giving", status: "Share", badge: "Heart" },
    },
  },
};

domain["zh-CN"].boardTiles = domain["zh-CN"].boardTiles || [];
domain["zh-CN"].tileVisuals = domain["zh-CN"].tileVisuals || {};
