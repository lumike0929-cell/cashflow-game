const CACHE_VERSION = "cashflow-game-shell-rc1";
const APP_SHELL = [
  "./",
  "./index.html",
  "./styles.css",
  "./game.js",
  "./gameExperience.js",
  "./progressSystem.js",
  "./aiCompetitionSystem.js",
  "./pwaSystem.js",
  "./feedbackSystem.js",
  "./releaseInfo.js",
  "./manifest.webmanifest",
  "./i18n/index.js",
  "./i18n/formatters.js",
  "./i18n/glossary.js",
  "./i18n/zh-TW.js",
  "./i18n/zh-CN.js",
  "./i18n/en.js",
  "./icons/app-icon-192.svg",
  "./icons/app-icon-512.svg",
  "./icons/app-icon-maskable.svg",
  "./icons/apple-touch-icon.svg",
  "./realEstateCalculator.js",
  "./realEstateData.js",
  "./realEstateEventResolver.js",
  "./realEstateStorageMigration.js",
  "./realEstateTransactions.js",
  "./stockCalculator.js",
  "./stockData.js",
  "./stockEventResolver.js",
  "./stockStorageMigration.js",
  "./stockTransactions.js",
  "./businessCalculator.js",
  "./businessData.js",
  "./businessEventResolver.js",
  "./businessStorageMigration.js",
  "./businessTransactions.js",
  "./bankingCalculator.js",
  "./bankingData.js",
  "./bankingStorageMigration.js",
  "./bankingTransactions.js",
  "./insuranceData.js",
  "./insuranceCalculator.js",
  "./insuranceTransactions.js",
  "./lifeEventData.js",
  "./lifeEventCalculator.js",
  "./lifeEventResolver.js",
  "./lifeEventTransactions.js",
  "./lifeEventStorageMigration.js",
  "./unemploymentEngine.js",
  "./taxCalculator.js",
  "./economyCycleEngine.js",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_VERSION).then((cache) => cache.addAll(APP_SHELL)),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(
      keys.filter((key) => key.startsWith("cashflow-game-") && key !== CACHE_VERSION).map((key) => caches.delete(key)),
    )).then(() => self.clients.claim()),
  );
});

self.addEventListener("message", (event) => {
  if (event.data?.type === "SKIP_WAITING") self.skipWaiting();
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  const url = new URL(request.url);
  if (request.method !== "GET" || url.origin !== self.location.origin) return;
  if (request.mode === "navigate" || request.headers.get("accept")?.includes("text/html")) {
    event.respondWith(networkFirst(request, "./index.html"));
    return;
  }
  event.respondWith(staleWhileRevalidate(request));
});

async function networkFirst(request, fallbackUrl) {
  const cache = await caches.open(CACHE_VERSION);
  try {
    const response = await fetch(request);
    if (safeToCache(response)) cache.put(request, response.clone());
    return response;
  } catch {
    return (await cache.match(request)) || cache.match(fallbackUrl);
  }
}

async function staleWhileRevalidate(request) {
  const cache = await caches.open(CACHE_VERSION);
  const cached = await cache.match(request);
  const refreshing = fetch(request).then((response) => {
    if (safeToCache(response)) cache.put(request, response.clone());
    return response;
  }).catch(() => cached);
  return cached || refreshing;
}

function safeToCache(response) {
  if (!response || !response.ok || response.status !== 200) return false;
  const type = response.headers.get("content-type") || "";
  if (type.includes("text/html") && response.url.includes("vercel.com")) return false;
  return true;
}
