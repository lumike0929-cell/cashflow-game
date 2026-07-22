export const supportedLocales = ["zh-TW", "zh-CN", "en"];
export const defaultLocale = "zh-TW";
export const localeStorageKey = "cashflow-game-locale-v1";
export const localeVersion = 1;
export const translationSchemaVersion = 1;

export function normalizeLocale(locale) {
  const value = String(locale || "").trim();
  if (supportedLocales.includes(value)) return value;
  const lower = value.toLowerCase();
  if (lower === "zh-tw" || lower === "zh-hk" || lower === "zh-mo" || lower.includes("hant")) return "zh-TW";
  if (lower === "zh-cn" || lower === "zh-sg" || lower.includes("hans")) return "zh-CN";
  if (lower.startsWith("en")) return "en";
  return defaultLocale;
}

export function detectLocale(navigatorLike = globalThis.navigator) {
  const candidates = [
    ...(Array.isArray(navigatorLike?.languages) ? navigatorLike.languages : []),
    navigatorLike?.language,
  ].filter(Boolean);
  return normalizeLocale(candidates[0] || defaultLocale);
}

export function readSavedLocale(storage, navigatorLike = globalThis.navigator) {
  try {
    const saved = JSON.parse(storage?.getItem(localeStorageKey) || "null");
    if (saved?.locale) return normalizeLocale(saved.locale);
  } catch {
    // Fall through to browser language.
  }
  return detectLocale(navigatorLike);
}

export function saveLocale(storage, locale) {
  try {
    storage?.setItem(localeStorageKey, JSON.stringify({
      locale: normalizeLocale(locale),
      localeVersion,
      translationSchemaVersion,
    }));
    return true;
  } catch {
    return false;
  }
}

export function finiteNumber(value) {
  const number = Number(value);
  if (!Number.isFinite(number)) return 0;
  const rounded = Math.round(number);
  return Object.is(rounded, -0) ? 0 : rounded;
}

export function formatCurrencyValue(value, locale = defaultLocale, options = {}) {
  const amount = finiteNumber(value);
  const sign = amount < 0 ? "-" : "";
  const currency = options.currency || "CNY";
  const abs = Math.abs(amount);
  try {
    const formatted = new Intl.NumberFormat(locale, {
      style: "currency",
      currency,
      currencyDisplay: "narrowSymbol",
      maximumFractionDigits: 0,
      minimumFractionDigits: 0,
    }).format(abs);
    return `${sign}${formatted.replace(/^CN¥/, "¥")}`;
  } catch {
    return `${sign}¥${abs.toLocaleString("en-US")}`;
  }
}

export function formatNumberValue(value, locale = defaultLocale, options = {}) {
  const number = Number(value);
  const safe = Number.isFinite(number) ? number : 0;
  try {
    return new Intl.NumberFormat(locale, {
      maximumFractionDigits: options.maximumFractionDigits ?? 0,
      minimumFractionDigits: options.minimumFractionDigits ?? 0,
    }).format(Object.is(safe, -0) ? 0 : safe);
  } catch {
    return String(Math.round(safe));
  }
}

export function formatPercentValue(value, locale = defaultLocale, options = {}) {
  const number = Number(value);
  const safe = Number.isFinite(number) ? number : 0;
  const normalized = options.ratio ? safe : safe / 100;
  try {
    return new Intl.NumberFormat(locale, {
      style: "percent",
      maximumFractionDigits: options.maximumFractionDigits ?? 1,
      minimumFractionDigits: options.minimumFractionDigits ?? 0,
    }).format(Object.is(normalized, -0) ? 0 : normalized);
  } catch {
    return `${Math.round(safe)}%`;
  }
}

export function formatDateValue(value, locale = defaultLocale, options = {}) {
  const date = value instanceof Date ? value : new Date(value || Date.now());
  if (Number.isNaN(date.getTime())) return "";
  try {
    return new Intl.DateTimeFormat(locale, {
      year: options.year || "numeric",
      month: options.month || "short",
      day: options.day || "numeric",
    }).format(date);
  } catch {
    return date.toISOString().slice(0, 10);
  }
}

export function formatMonthValue(month, locale = defaultLocale) {
  const safe = Math.max(1, finiteNumber(month));
  if (locale === "en") return `Month ${safe}`;
  if (locale === "zh-TW") return `第 ${safe} 月`;
  return `第 ${safe} 月`;
}
