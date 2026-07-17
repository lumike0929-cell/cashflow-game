export const EXPERIENCE_SETTINGS_KEY = "cashflow-game-experience-v1";

export const mapSize = {
  width: 1680,
  height: 1120,
};

export const boardPath = [
  { x: 170, y: 140 },
  { x: 300, y: 110 },
  { x: 430, y: 105 },
  { x: 560, y: 120 },
  { x: 690, y: 105 },
  { x: 820, y: 130 },
  { x: 950, y: 105 },
  { x: 1080, y: 120 },
  { x: 1210, y: 110 },
  { x: 1340, y: 135 },
  { x: 1480, y: 170 },
  { x: 1530, y: 285 },
  { x: 1515, y: 395 },
  { x: 1540, y: 510 },
  { x: 1510, y: 625 },
  { x: 1545, y: 740 },
  { x: 1480, y: 865 },
  { x: 1360, y: 930 },
  { x: 1235, y: 960 },
  { x: 1110, y: 940 },
  { x: 985, y: 975 },
  { x: 860, y: 945 },
  { x: 735, y: 970 },
  { x: 610, y: 940 },
  { x: 485, y: 965 },
  { x: 360, y: 930 },
  { x: 230, y: 890 },
  { x: 150, y: 780 },
  { x: 125, y: 660 },
  { x: 150, y: 540 },
  { x: 125, y: 420 },
  { x: 155, y: 300 },
  { x: 275, y: 250 },
  { x: 430, y: 255 },
  { x: 590, y: 245 },
  { x: 750, y: 260 },
  { x: 910, y: 245 },
  { x: 1070, y: 260 },
  { x: 1230, y: 245 },
  { x: 1385, y: 265 },
];

export const tileVisuals = {
  payday: { category: "薪水日", status: "月结", tone: "gold" },
  opportunity: { category: "房地产", status: "机会", tone: "green" },
  propertyEvent: { category: "房地产", status: "持有", tone: "green" },
  stockOpportunity: { category: "股票", status: "买卖", tone: "violet" },
  stockMarket: { category: "股票", status: "市场", tone: "violet" },
  businessOpportunity: { category: "小生意", status: "投资", tone: "amber" },
  businessEvent: { category: "小生意", status: "经营", tone: "amber" },
  businessMarket: { category: "市场", status: "需求", tone: "blue" },
  bank: { category: "银行", status: "贷款", tone: "slate" },
  insurance: { category: "保险", status: "保障", tone: "blue" },
  lifeEvent: { category: "医疗", status: "人生", tone: "red" },
  tax: { category: "税务", status: "责任", tone: "slate" },
  jobEvent: { category: "失业", status: "工作", tone: "red" },
  market: { category: "市场", status: "变化", tone: "blue" },
  doodad: { category: "意外支出", status: "扣款", tone: "red" },
  learn: { category: "学习", status: "成长", tone: "violet" },
  family: { category: "家庭", status: "责任", tone: "red" },
  charity: { category: "慈善", status: "分享", tone: "green" },
};

export function tileVisual(type) {
  return tileVisuals[type] || { category: "机会", status: "事件", tone: "blue" };
}

export function indexAfter(position, steps, total) {
  const safeTotal = Math.max(1, Math.round(Number(total) || 1));
  return (Math.max(0, Math.round(Number(position) || 0)) + Math.max(0, Math.round(Number(steps) || 0))) % safeTotal;
}

export function nextIndices(position, count, total) {
  return Array.from({ length: Math.max(0, count) }, (_, index) => indexAfter(position, index + 1, total));
}

export function createCitySceneSvg() {
  return `
    <svg class="city-scene" viewBox="0 0 ${mapSize.width} ${mapSize.height}" role="img" aria-label="现金流城市地图">
      <defs>
        <linearGradient id="water" x1="0" x2="1">
          <stop offset="0" stop-color="#9bd8f0" />
          <stop offset="1" stop-color="#5bb3d8" />
        </linearGradient>
        <linearGradient id="road" x1="0" x2="1">
          <stop offset="0" stop-color="#c8d1ca" />
          <stop offset="1" stop-color="#e3e7df" />
        </linearGradient>
        <filter id="softShadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="14" stdDeviation="10" flood-color="#1b3128" flood-opacity="0.18" />
        </filter>
      </defs>
      <rect width="${mapSize.width}" height="${mapSize.height}" rx="48" fill="#dff2d7" />
      <path d="M80 600 C300 510 390 680 560 610 C750 530 890 590 1040 520 C1230 430 1370 520 1600 430" fill="none" stroke="url(#water)" stroke-width="92" stroke-linecap="round" opacity="0.9" />
      <path d="M80 600 C300 510 390 680 560 610 C750 530 890 590 1040 520 C1230 430 1370 520 1600 430" fill="none" stroke="#e8fbff" stroke-width="12" stroke-linecap="round" opacity="0.85" />
      <path d="M170 140 L1480 170 L1545 740 L1360 930 L230 890 L125 420 Z" fill="none" stroke="url(#road)" stroke-width="118" stroke-linejoin="round" stroke-linecap="round" opacity="0.78" />
      <path d="M170 140 L1480 170 L1545 740 L1360 930 L230 890 L125 420 Z" fill="none" stroke="#f8faf4" stroke-width="14" stroke-dasharray="32 28" stroke-linejoin="round" stroke-linecap="round" opacity="0.86" />
      ${building(445, 420, "银行", "#ffe8a6", "#d8a21f")}
      ${building(675, 390, "学校", "#dff3ff", "#246b9f")}
      ${building(930, 385, "股票", "#efe9ff", "#6c5aa8")}
      ${building(1145, 440, "医院", "#ffe5e0", "#c84d42")}
      ${building(500, 665, "住宅", "#e7f6ea", "#1f7a52")}
      ${building(805, 700, "小生意街", "#fff1ce", "#b47718")}
      ${building(1110, 700, "商业区", "#e9f3ff", "#3573a4")}
      <circle cx="835" cy="555" r="72" fill="#ccebd2" filter="url(#softShadow)" />
      <circle cx="835" cy="555" r="36" fill="#8ed0eb" />
      <circle cx="835" cy="555" r="16" fill="#ffffff" opacity="0.85" />
      <text x="835" y="655" text-anchor="middle" class="city-label">公园喷泉</text>
      ${trees()}
      ${lamps()}
      ${coinsAndClouds()}
    </svg>
  `;
}

export function avatarMarkup(career, mood = "idle") {
  const icon = career?.icon || "你";
  const color = careerColor(career?.id);
  return `
    <div class="player-avatar mood-${mood}" aria-label="玩家角色">
      <span class="avatar-shadow"></span>
      <span class="avatar-leg left"></span>
      <span class="avatar-leg right"></span>
      <span class="avatar-body" style="--avatar-color:${color}">
        <span class="avatar-arm left"></span>
        <span class="avatar-arm right"></span>
      </span>
      <span class="avatar-head">
        <span class="avatar-face">${icon}</span>
      </span>
    </div>
  `;
}

export function diceMarkup(value = 1, rolling = false) {
  const dots = Array.from({ length: 9 }, (_, index) => `<span class="${dotActive(index, value) ? "active" : ""}"></span>`).join("");
  return `
    <div class="dice3d ${rolling ? "rolling" : ""}" aria-label="骰子 ${value}">
      <div class="dice-face">${dots}</div>
      <span class="dice-shadow"></span>
    </div>
  `;
}

export function loadExperienceSettings(storage) {
  try {
    const parsed = JSON.parse(storage?.getItem(EXPERIENCE_SETTINGS_KEY) || "{}");
    return normalizeSettings(parsed);
  } catch {
    return normalizeSettings({});
  }
}

export function saveExperienceSettings(storage, settings) {
  try {
    storage?.setItem(EXPERIENCE_SETTINGS_KEY, JSON.stringify(normalizeSettings(settings)));
  } catch {
    // Settings are optional; storage failures should never block the game.
  }
}

export function normalizeSettings(settings) {
  const camera = settings?.camera || {};
  return {
    muted: Boolean(settings?.muted),
    volume: Math.max(0, Math.min(1, Number(settings?.volume) || 0.55)),
    camera: {
      x: finiteNumber(camera.x, 0),
      y: finiteNumber(camera.y, 0),
      scale: Math.max(0.58, Math.min(1.45, Number(camera.scale) || 0.86)),
      follow: camera.follow !== false,
    },
  };
}

export function clampCamera(camera, viewportWidth, viewportHeight) {
  const scale = Math.max(0.58, Math.min(1.45, Number(camera.scale) || 0.86));
  const minX = Math.min(80, viewportWidth - mapSize.width * scale - 80);
  const minY = Math.min(80, viewportHeight - mapSize.height * scale - 80);
  return {
    x: Math.max(minX, Math.min(120, finiteNumber(camera.x, 0))),
    y: Math.max(minY, Math.min(120, finiteNumber(camera.y, 0))),
    scale,
    follow: camera.follow !== false,
  };
}

export function cameraForTile(index, viewportWidth, viewportHeight, scale = 0.86) {
  const point = boardPath[index % boardPath.length] || boardPath[0];
  return clampCamera(
    {
      x: viewportWidth / 2 - point.x * scale,
      y: viewportHeight / 2 - point.y * scale,
      scale,
      follow: true,
    },
    viewportWidth,
    viewportHeight,
  );
}

export function createSoundManager() {
  let context = null;
  let muted = false;
  let volume = 0.55;

  function ensureContext() {
    if (muted) return null;
    try {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (!AudioContextClass) return null;
      if (!context) context = new AudioContextClass();
      if (context.state === "suspended") context.resume();
      return context;
    } catch {
      return null;
    }
  }

  function play(name) {
    if (muted) return;
    const audio = ensureContext();
    if (!audio) return;
    const profile = soundProfiles[name] || soundProfiles.tap;
    const oscillator = audio.createOscillator();
    const gain = audio.createGain();
    oscillator.type = profile.type;
    oscillator.frequency.setValueAtTime(profile.start, audio.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(profile.end, audio.currentTime + profile.duration);
    gain.gain.setValueAtTime(0.0001, audio.currentTime);
    gain.gain.exponentialRampToValueAtTime(Math.max(0.0001, volume * profile.gain), audio.currentTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, audio.currentTime + profile.duration);
    oscillator.connect(gain);
    gain.connect(audio.destination);
    oscillator.start();
    oscillator.stop(audio.currentTime + profile.duration + 0.02);
  }

  return {
    play,
    setMuted(nextMuted) {
      muted = Boolean(nextMuted);
    },
    setVolume(nextVolume) {
      volume = Math.max(0, Math.min(1, Number(nextVolume) || 0));
    },
  };
}

export function haptic(pattern) {
  try {
    if (navigator?.vibrate) navigator.vibrate(pattern);
  } catch {
    // Vibration support varies; ignore quietly.
  }
}

function building(x, y, label, fill, stroke) {
  return `
    <g filter="url(#softShadow)">
      <rect x="${x}" y="${y}" width="160" height="118" rx="18" fill="${fill}" stroke="${stroke}" stroke-width="5" />
      <rect x="${x + 28}" y="${y + 34}" width="32" height="28" rx="6" fill="#ffffff" opacity="0.86" />
      <rect x="${x + 94}" y="${y + 34}" width="32" height="28" rx="6" fill="#ffffff" opacity="0.86" />
      <rect x="${x + 68}" y="${y + 76}" width="28" height="42" rx="8" fill="${stroke}" opacity="0.72" />
      <text x="${x + 80}" y="${y + 145}" text-anchor="middle" class="city-label">${label}</text>
    </g>
  `;
}

function trees() {
  const points = [
    [330, 410],
    [360, 610],
    [1320, 430],
    [1290, 640],
    [290, 730],
    [1420, 785],
    [650, 560],
    [1010, 585],
    [705, 825],
    [1000, 825],
  ];
  return points
    .map(
      ([x, y]) => `
        <g>
          <rect x="${x - 6}" y="${y + 18}" width="12" height="28" rx="5" fill="#9b6a3a" />
          <circle cx="${x}" cy="${y + 6}" r="28" fill="#79c98b" />
          <circle cx="${x - 18}" cy="${y + 18}" r="22" fill="#65b976" />
          <circle cx="${x + 20}" cy="${y + 20}" r="21" fill="#8ad79a" />
        </g>
      `,
    )
    .join("");
}

function lamps() {
  return [
    [250, 165],
    [720, 150],
    [1260, 160],
    [1500, 475],
    [1210, 925],
    [590, 930],
    [145, 540],
  ]
    .map(
      ([x, y]) => `
        <g>
          <rect x="${x - 4}" y="${y}" width="8" height="54" rx="4" fill="#53625c" />
          <circle cx="${x}" cy="${y - 4}" r="15" fill="#ffe59c" stroke="#d8a21f" stroke-width="4" />
        </g>
      `,
    )
    .join("");
}

function coinsAndClouds() {
  return `
    <g opacity="0.78">
      <ellipse cx="270" cy="70" rx="52" ry="22" fill="#ffffff" />
      <ellipse cx="315" cy="66" rx="38" ry="18" fill="#ffffff" />
      <ellipse cx="1300" cy="74" rx="62" ry="24" fill="#ffffff" />
      <ellipse cx="1360" cy="72" rx="42" ry="18" fill="#ffffff" />
      <circle cx="720" cy="330" r="18" fill="#ffd86b" stroke="#d8a21f" stroke-width="5" />
      <circle cx="760" cy="340" r="14" fill="#ffd86b" stroke="#d8a21f" stroke-width="4" />
      <circle cx="1015" cy="330" r="18" fill="#ffd86b" stroke="#d8a21f" stroke-width="5" />
    </g>
  `;
}

function dotActive(index, value) {
  const dotMap = {
    1: [4],
    2: [0, 8],
    3: [0, 4, 8],
    4: [0, 2, 6, 8],
    5: [0, 2, 4, 6, 8],
    6: [0, 2, 3, 5, 6, 8],
  };
  return (dotMap[value] || dotMap[1]).includes(index);
}

function careerColor(id = "") {
  return {
    teacher: "#2b9467",
    engineer: "#246b9f",
    designer: "#6c5aa8",
    doctor: "#c84d42",
  }[id] || "#2b9467";
}

function finiteNumber(value, fallback) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

const soundProfiles = {
  tap: { type: "sine", start: 520, end: 620, duration: 0.08, gain: 0.1 },
  dice: { type: "square", start: 190, end: 420, duration: 0.18, gain: 0.08 },
  land: { type: "triangle", start: 180, end: 90, duration: 0.2, gain: 0.12 },
  step: { type: "sine", start: 310, end: 240, duration: 0.07, gain: 0.06 },
  coin: { type: "sine", start: 640, end: 1040, duration: 0.16, gain: 0.12 },
  buy: { type: "triangle", start: 460, end: 760, duration: 0.18, gain: 0.12 },
  sell: { type: "triangle", start: 540, end: 320, duration: 0.16, gain: 0.1 },
  error: { type: "sawtooth", start: 220, end: 120, duration: 0.18, gain: 0.08 },
  warning: { type: "square", start: 280, end: 180, duration: 0.14, gain: 0.08 },
  upgrade: { type: "sine", start: 520, end: 920, duration: 0.22, gain: 0.13 },
  win: { type: "triangle", start: 620, end: 1240, duration: 0.34, gain: 0.14 },
  sad: { type: "sine", start: 260, end: 140, duration: 0.22, gain: 0.08 },
  happy: { type: "sine", start: 520, end: 880, duration: 0.2, gain: 0.12 },
};
