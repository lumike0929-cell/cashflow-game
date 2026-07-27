import assert from "node:assert/strict";
import test from "node:test";
import {
  defaultLocale,
  detectLocale,
  formatCurrency,
  formatMonth,
  formatPercent,
  getLocale,
  hasTranslation,
  localizeBoardTile,
  localizeCareer,
  localizedGlossary,
  localeStorageKey,
  localePacks,
  readSavedLocale,
  setLocale,
  supportedLocales,
  t,
  translateText,
  validateTranslations,
} from "../i18n/index.js";

test("detects and persists the preferred locale safely", () => {
  assert.equal(detectLocale({ languages: ["zh-HK", "en-US"] }), "zh-TW");
  assert.equal(detectLocale({ languages: ["zh-SG"] }), "zh-CN");
  assert.equal(detectLocale({ languages: ["fr-CA"] }), "zh-TW");
  const storage = new Map();
  const adapter = {
    getItem: (key) => storage.get(key) || null,
    setItem: (key, value) => storage.set(key, value),
  };
  adapter.setItem(localeStorageKey, JSON.stringify({ locale: "zh-CN", version: 1 }));
  assert.equal(readSavedLocale(adapter, { languages: ["en-US"] }), "zh-CN");
});

test("all locale packs share the same translation key set", () => {
  const results = validateTranslations();
  for (const result of results) {
    assert.deepEqual(result.missing, [], `${result.locale} missing keys`);
    assert.deepEqual(result.extra, [], `${result.locale} has extra keys`);
    assert.deepEqual(result.empty, [], `${result.locale} has empty keys`);
  }
});

test("core UI, finance glossary, and fallback translations are available in three languages", () => {
  for (const locale of supportedLocales) {
    setLocale(locale);
    assert.equal(getLocale(), locale);
    assert.equal(hasTranslation(locale, "home.heroTitle"), true);
    assert.equal(hasTranslation(locale, "finance.monthlyCashflow"), true);
    assert.equal(hasTranslation(locale, "glossary.passiveIncome.shortDefinition"), true);
    assert.notEqual(t("home.heroTitle"), "");
    assert.notEqual(t("hud.rollDice"), "");
    assert.notEqual(t("modal.tilePreview"), "");
    assert.equal(t("missing.internal.key", {}, { fallback: "safe" }), "safe");
    const terms = localizedGlossary();
    assert.equal(terms.length >= 20, true);
    assert.equal(terms.some((item) => item.id === "passiveIncome"), true);
  }
  setLocale(defaultLocale);
});

test("English setup sentences and glossary terms do not mix Chinese or internal icon tokens", () => {
  setLocale("en");
  const startText = t("setup.startSummary", {
    profession: "Freelance Designer",
    difficulty: t("setup.difficulty.standard"),
    mode: t("setup.mode.solo"),
  });
  assert.equal(/[\u3400-\u9fff]/.test(startText), false);
  assert.match(startText, /You are playing as a Freelance Designer/);
  assert.match(startText, /income-producing assets/);
  assert.equal(/你现在是|难度为|模式为|现金逐步|安全垫/.test(startText), false);

  const unknownChineseSentence = translateText("你现在是自由设计师，难度为标准，模式为单人学习。");
  assert.equal(/[\u3400-\u9fff]/.test(unknownChineseSentence), false);
  assert.equal(/Freelance Designer|Difficulty|Mode/.test(unknownChineseSentence), false);

  const terms = localizedGlossary();
  for (const id of ["cash", "income", "expense", "monthlyCashflow"]) {
    const term = terms.find((item) => item.id === id);
    assert.ok(term, `missing term ${id}`);
    assert.equal(/[\u3400-\u9fff]/.test(term.term), false);
    assert.equal(/^(¥|In|Ex|Flow)\s/.test(term.term), false);
  }
  setLocale(defaultLocale);
});

test("English finance HUD and panel labels translate from both simplified and traditional sources", () => {
  setLocale("en");
  const labels = [
    "準備中",
    "准备中",
    "保險保費",
    "保险保费",
    "人生持續支出",
    "人生持续支出",
    "房貸月供",
    "房贷月供",
    "房產支出",
    "房产支出",
    "其他貸款月供",
    "其他贷款月供",
    "貸款總額",
    "贷款总额",
    "信用分",
    "當前利率",
    "当前利率",
    "已購保單每月固定支出",
    "已购保单每月固定支出",
    "醫療、家庭或工作壓力持續影響",
    "医疗、家庭或工作压力持续影响",
    "銀行、個人貸款與房貸餘額",
    "银行、个人贷款与房贷余额",
  ];
  for (const label of labels) {
    const translated = translateText(label);
    assert.equal(/[\u3400-\u9fff]/.test(translated), false, `${label} -> ${translated}`);
    assert.notEqual(translated, "Translation unavailable", label);
  }
  setLocale(defaultLocale);
});

test("formats currency, percent, and month without invalid numeric output", () => {
  for (const locale of supportedLocales) {
    setLocale(locale);
    const samples = [
      formatCurrency(12000),
      formatCurrency(-0),
      formatPercent(75),
      formatPercent(1.25, { ratio: true }),
      formatMonth(3),
    ];
    for (const sample of samples) {
      assert.equal(sample.includes("NaN"), false);
      assert.equal(sample.includes("Infinity"), false);
      assert.equal(sample.includes("-0"), false);
    }
  }
});

test("localizes key game entities without changing their stable ids", () => {
  const career = { id: "teacher", name: "小学老师", icon: "师", salary: 32000 };
  const tile = { type: "bank", title: "银行", text: "可以借钱，也可以提前还债。" };
  setLocale("en");
  assert.equal(localizeCareer(career).id, "teacher");
  assert.equal(localizeCareer(career).name, "Elementary Teacher");
  assert.equal(localizeBoardTile(tile, 7).title, "Bank");
  assert.equal(translateText("现金不足"), "Not enough cash");
  setLocale("zh-TW");
  assert.equal(localizeCareer(career).name, "小學老師");
  assert.equal(localizeBoardTile(tile, 7).title, "銀行");
  setLocale("zh-CN");
  assert.equal(localizeCareer(career).name, "小学老师");
});

test("locale packs do not expose undefined, object placeholders, or blank important labels", () => {
  for (const locale of supportedLocales) {
    const serialized = JSON.stringify(localePacks[locale]);
    assert.equal(serialized.includes("[object Object]"), false);
    assert.equal(serialized.includes("undefined"), false);
    setLocale(locale);
    for (const key of ["ui.startAdventure", "ui.settings", "ui.confirm", "hud.currentTurn", "finance.netWorth"]) {
      const value = t(key);
      assert.equal(value.trim().length > 0, true, `${locale}:${key}`);
      assert.equal(value.includes("."), false, `${locale}:${key} should not display the key path`);
    }
  }
});
