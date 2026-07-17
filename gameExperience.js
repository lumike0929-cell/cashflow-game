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
  payday: { category: "薪水日", status: "月结", tone: "gold", badge: "金币" },
  opportunity: { category: "房地产", status: "机会", tone: "green", badge: "房屋" },
  propertyEvent: { category: "房地产", status: "持有", tone: "green", badge: "维修" },
  stockOpportunity: { category: "股票", status: "买卖", tone: "violet", badge: "行情" },
  stockMarket: { category: "股票", status: "市场", tone: "violet", badge: "波动" },
  businessOpportunity: { category: "小生意", status: "投资", tone: "amber", badge: "店铺" },
  businessEvent: { category: "小生意", status: "经营", tone: "amber", badge: "客流" },
  businessMarket: { category: "市场", status: "需求", tone: "blue", badge: "需求" },
  bank: { category: "银行", status: "贷款", tone: "slate", badge: "信用" },
  insurance: { category: "保险", status: "保障", tone: "blue", badge: "盾牌" },
  lifeEvent: { category: "医疗", status: "人生", tone: "red", badge: "健康" },
  tax: { category: "税务", status: "责任", tone: "slate", badge: "文件" },
  jobEvent: { category: "失业", status: "工作", tone: "red", badge: "工作" },
  market: { category: "市场", status: "变化", tone: "blue", badge: "风向" },
  doodad: { category: "意外支出", status: "扣款", tone: "red", badge: "账单" },
  learn: { category: "学习", status: "成长", tone: "violet", badge: "书本" },
  family: { category: "家庭", status: "责任", tone: "red", badge: "家庭" },
  charity: { category: "慈善", status: "分享", tone: "green", badge: "爱心" },
};

export const tutorialSteps = [
  { id: "goal", title: "目标", text: "让被动收入逐步接近或超过每月支出，这就是跳出打工循环的核心目标。", target: "hero" },
  { id: "map", title: "角色与城市", text: "你的角色会在城市棋盘上逐格前进，每个区域代表不同的财务选择。", target: "board" },
  { id: "dice", title: "掷骰前进", text: "按下主按钮后，骰子结果就是前进格数。移动中按钮会锁定，避免重复操作。", target: "dice" },
  { id: "move", title: "逐格移动", text: "角色会一步一步走，只有最后停下的格子会触发事件。", target: "board" },
  { id: "event", title: "落点事件", text: "事件卡会显示金钱变化、风险和学习说明。遇到“为什么？”可以先看解释。", target: "modal" },
  { id: "finance", title: "财务 HUD", text: "关注现金、收入、支出、资产、负债和净资产，数字会跟着你的选择更新。", target: "finance" },
  { id: "why", title: "为什么？", text: "学习按钮会用儿童能理解的话解释概念，不是真实投资、保险或税务建议。", target: "modal" },
  { id: "save", title: "自动保存", text: "游戏会保存到这个浏览器。你也可以随时按保存或读取继续。", target: "topbar" },
  { id: "first-roll", title: "开始第一回合", text: "准备好后，掷骰前进，看看现金流城市给你什么选择。", target: "dice" },
];

export const contextTipMessages = {
  cashShortage: {
    title: "第一次现金不足",
    text: "现金不够时，可以先查看银行、出售资产或减少支出。负债会影响之后的现金流。",
  },
  firstProperty: {
    title: "第一次买房",
    text: "买房要看首付款、贷款和每月现金流。卖价不等于真正拿到的钱。",
  },
  firstStock: {
    title: "第一次买股票",
    text: "股票价格会变动。还没卖出前，涨跌只是目前变化，不是最终结果。",
  },
  firstBusiness: {
    title: "第一次投资小生意",
    text: "营收是收到的钱，扣除固定成本和变动成本后，留下的才是净利。",
  },
  firstUnemployment: {
    title: "第一次失业",
    text: "收入中断时，紧急预备金、保险和较低固定支出会给你更多选择时间。",
  },
  firstDividend: {
    title: "第一次收到股息",
    text: "股息是部分公司分享成果给股东，但不是每家公司都会发，也不会保证增加。",
  },
  firstDebt: {
    title: "第一次产生负债",
    text: "负债能暂时解决现金压力，但之后通常会增加每月支出，要留意现金流。",
  },
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
        <linearGradient id="zoneGlow" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0" stop-color="#ffffff" stop-opacity="0.86" />
          <stop offset="1" stop-color="#ffffff" stop-opacity="0.28" />
        </linearGradient>
        <filter id="softShadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="14" stdDeviation="10" flood-color="#1b3128" flood-opacity="0.18" />
        </filter>
        <filter id="tinyShadow" x="-30%" y="-30%" width="160%" height="160%">
          <feDropShadow dx="0" dy="7" stdDeviation="4" flood-color="#24332d" flood-opacity="0.16" />
        </filter>
      </defs>
      <rect width="${mapSize.width}" height="${mapSize.height}" rx="48" fill="#dff2d7" />
      <g class="scene-layer background-layer">
        <circle cx="220" cy="250" r="190" fill="#fff8dc" opacity="0.28" />
        <circle cx="1430" cy="810" r="210" fill="#d8f0ff" opacity="0.26" />
        <path d="M0 910 C220 820 380 900 560 835 C780 755 950 850 1160 785 C1370 720 1500 790 1680 720 V1120 H0 Z" fill="#bfe4bd" opacity="0.42" />
      </g>
      <g class="scene-layer midground-layer">
      ${district(372, 360, 270, 225, "#e7f6ea", "住宅区", "花园小路")}
      ${district(690, 340, 260, 210, "#fff4cf", "金融区", "银行与行情")}
      ${district(1010, 365, 285, 225, "#e9f3ff", "商业区", "商店与办公")}
      ${district(405, 625, 285, 225, "#fff1ce", "创业区", "小店实验街")}
      ${district(735, 660, 255, 205, "#efe9ff", "教育区", "学校与课程")}
      ${district(1060, 645, 260, 205, "#ffe5e0", "医疗区", "医院与诊所")}
      ${district(730, 500, 230, 205, "#ccebd2", "公园休闲区", "喷泉与小桥")}
      ${district(520, 500, 170, 115, "#e9f3ff", "公共服务区", "邮局与路灯")}
      <path d="M80 600 C300 510 390 680 560 610 C750 530 890 590 1040 520 C1230 430 1370 520 1600 430" fill="none" stroke="url(#water)" stroke-width="92" stroke-linecap="round" opacity="0.9" />
      <path d="M80 600 C300 510 390 680 560 610 C750 530 890 590 1040 520 C1230 430 1370 520 1600 430" fill="none" stroke="#e8fbff" stroke-width="12" stroke-linecap="round" opacity="0.85" />
      <path d="M170 140 L1480 170 L1545 740 L1360 930 L230 890 L125 420 Z" fill="none" stroke="url(#road)" stroke-width="118" stroke-linejoin="round" stroke-linecap="round" opacity="0.78" />
      <path d="M170 140 L1480 170 L1545 740 L1360 930 L230 890 L125 420 Z" fill="none" stroke="#f8faf4" stroke-width="14" stroke-dasharray="32 28" stroke-linejoin="round" stroke-linecap="round" opacity="0.86" />
      ${roadDirections()}
      <path d="M450 330 L1240 330 M450 820 L1240 820 M620 330 L620 840 M1020 330 L1020 840" stroke="#f8faf4" stroke-width="34" stroke-linecap="round" opacity="0.42" />
      <path d="M450 330 L1240 330 M450 820 L1240 820 M620 330 L620 840 M1020 330 L1020 840" stroke="#becac4" stroke-width="4" stroke-dasharray="18 18" opacity="0.36" />
      ${flowerbeds()}
      </g>
      <g class="scene-layer building-layer">
      ${homeCluster(420, 420)}
      ${apartmentBlock(520, 360)}
      ${building(700, 390, "银行", "#ffe8a6", "#d8a21f", "¥")}
      ${building(875, 390, "股票", "#efe9ff", "#6c5aa8", "↗")}
      ${marketBoard(1045, 390)}
      ${building(595, 500, "房产中心", "#e7f8ee", "#1f7a52", "房")}
      ${building(1188, 602, "保险中心", "#e5f2fb", "#246b9f", "盾")}
      ${building(1325, 620, "税务中心", "#f2f5f4", "#53625c", "税")}
      ${building(1145, 440, "医院", "#ffe5e0", "#c84d42", "+")}
      ${ambulance(1260, 540)}
      ${building(515, 675, "创业街", "#fff1ce", "#b47718", "店")}
      ${building(765, 705, "学校", "#dff3ff", "#246b9f", "书")}
      ${building(1110, 700, "商业区", "#e9f3ff", "#3573a4", "商")}
      ${officeRow(1135, 610)}
      ${bridge(930, 535)}
      ${bench(730, 590)}
      ${bench(930, 615)}
      ${vehicle(332, 790, "#f0bb63")}
      ${vehicle(1390, 360, "#9ccfec")}
      </g>
      <g class="scene-layer foreground-layer">
      <circle cx="835" cy="555" r="72" fill="#ccebd2" filter="url(#softShadow)" />
      <circle cx="835" cy="555" r="36" fill="#8ed0eb" />
      <circle cx="835" cy="555" r="16" fill="#ffffff" opacity="0.85" />
      <text x="835" y="655" text-anchor="middle" class="city-label">公园喷泉</text>
      ${trees()}
      ${lamps()}
      ${coinsAndClouds()}
      ${foregroundDecor()}
      </g>
    </svg>
  `;
}

export function avatarMarkup(career, mood = "neutral", direction = "right") {
  const icon = career?.icon || "你";
  const id = career?.id || "teacher";
  const color = careerColor(id);
  const expression = expressionForMood(mood);
  const accessory = accessoryMarkup(id);
  return `
    <div class="player-avatar mood-${mood} facing-${direction}" aria-label="玩家角色">
      <span class="avatar-shadow"></span>
      <span class="avatar-leg left"></span>
      <span class="avatar-leg right"></span>
      <span class="avatar-body" style="--avatar-color:${color}">
        <span class="avatar-arm left"></span>
        <span class="avatar-arm right"></span>
        <span class="avatar-badge">${icon}</span>
      </span>
      <span class="avatar-head">
        <span class="avatar-hair ${id}"></span>
        ${accessory}
        <span class="avatar-eye left"></span>
        <span class="avatar-eye right"></span>
        <span class="avatar-brow left"></span>
        <span class="avatar-brow right"></span>
        <span class="avatar-mouth ${expression}"></span>
        <span class="avatar-face-label">${icon}</span>
      </span>
      <span class="avatar-spark"></span>
      <span class="avatar-direction" aria-hidden="true"></span>
    </div>
  `;
}

export function diceMarkup(value = 1, rolling = false) {
  const dots = Array.from({ length: 9 }, (_, index) => `<span class="${dotActive(index, value) ? "active" : ""}"></span>`).join("");
  return `
    <div class="dice3d ${rolling ? "rolling" : ""}" aria-label="骰子 ${value}">
      <span class="dice-flight-trail" aria-hidden="true"></span>
      <span class="dice-corner top"></span>
      <div class="dice-face">${dots}</div>
      <span class="dice-shadow"></span>
      <span class="dice-pop" aria-hidden="true">${value}</span>
      <strong class="dice-result-text">前进 ${value} 格</strong>
    </div>
  `;
}

export function eventIllustrationMarkup(type = "") {
  const key = illustrationKey(type);
  return `
    <div class="event-illustration art-${key}" aria-hidden="true">
      <span class="art-sun"></span>
      <span class="art-ground"></span>
      <span class="art-building one"></span>
      <span class="art-building two"></span>
      <span class="art-symbol">${illustrationSymbol(key)}</span>
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
  const seenTips = settings?.seenTips && typeof settings.seenTips === "object" ? settings.seenTips : {};
  return {
    muted: Boolean(settings?.muted),
    volume: Math.max(0, Math.min(1, Number(settings?.volume) || 0.55)),
    effectVolume: Math.max(0, Math.min(1, Number(settings?.effectVolume) || 0.75)),
    musicVolume: Math.max(0, Math.min(1, Number(settings?.musicVolume) || 0.22)),
    musicEnabled: settings?.musicEnabled !== false,
    hapticsEnabled: settings?.hapticsEnabled !== false,
    animationSpeed: settings?.animationSpeed === "fast" ? "fast" : "standard",
    visualQuality: ["high", "standard", "battery"].includes(settings?.visualQuality) ? settings.visualQuality : "standard",
    tutorialComplete: Boolean(settings?.tutorialComplete),
    seenTips: Object.fromEntries(Object.entries(seenTips).map(([key, value]) => [key, Boolean(value)])),
    camera: {
      x: finiteNumber(camera.x, 0),
      y: finiteNumber(camera.y, 0),
      scale: Math.max(0.58, Math.min(1.45, Number(camera.scale) || 0.78)),
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
  let effectVolume = 0.75;
  let musicVolume = 0.22;
  let musicEnabled = true;
  let musicGain = null;
  let musicOscillators = [];
  let lastPlayed = {};

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
    const now = Date.now();
    if (name === "step" && now - (lastPlayed.step || 0) < 140) return;
    if (name !== "step" && now - (lastPlayed[name] || 0) < 45) return;
    lastPlayed = { ...lastPlayed, [name]: now };
    const audio = ensureContext();
    if (!audio) return;
    const profile = soundProfiles[name] || soundProfiles.tap;
    const oscillator = audio.createOscillator();
    const gain = audio.createGain();
    oscillator.type = profile.type;
    oscillator.frequency.setValueAtTime(profile.start, audio.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(profile.end, audio.currentTime + profile.duration);
    gain.gain.setValueAtTime(0.0001, audio.currentTime);
    gain.gain.exponentialRampToValueAtTime(Math.max(0.0001, volume * effectVolume * profile.gain), audio.currentTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, audio.currentTime + profile.duration);
    oscillator.connect(gain);
    gain.connect(audio.destination);
    oscillator.start();
    oscillator.stop(audio.currentTime + profile.duration + 0.02);
  }

  function startMusic(scene = "board") {
    if (muted || !musicEnabled) return false;
    const audio = ensureContext();
    if (!audio) return false;
    if (musicOscillators.length) return true;
    const chord = scene === "home" ? [196, 247, 294] : scene === "event" ? [174, 220, 261] : [220, 277, 330];
    musicGain = audio.createGain();
    musicGain.gain.setValueAtTime(0.0001, audio.currentTime);
    musicGain.gain.linearRampToValueAtTime(volume * musicVolume * 0.18, audio.currentTime + 0.45);
    musicGain.connect(audio.destination);
    musicOscillators = chord.map((frequency, index) => {
      const oscillator = audio.createOscillator();
      oscillator.type = index === 0 ? "triangle" : "sine";
      oscillator.frequency.setValueAtTime(frequency, audio.currentTime);
      oscillator.connect(musicGain);
      oscillator.start();
      return oscillator;
    });
    return true;
  }

  function stopMusic() {
    if (!context || !musicOscillators.length) return;
    const stopAt = context.currentTime + 0.35;
    try {
      if (musicGain) musicGain.gain.linearRampToValueAtTime(0.0001, stopAt);
      musicOscillators.forEach((oscillator) => oscillator.stop(stopAt + 0.02));
    } catch {
      // Audio shutdown is best effort.
    }
    musicOscillators = [];
    musicGain = null;
  }

  function updateMusicLevel() {
    if (!context || !musicGain) return;
    musicGain.gain.setTargetAtTime(muted || !musicEnabled ? 0.0001 : volume * musicVolume * 0.18, context.currentTime, 0.18);
  }

  return {
    play,
    startMusic,
    stopMusic,
    setScene(scene) {
      if (!musicOscillators.length) return;
      stopMusic();
      setTimeout(() => startMusic(scene), 80);
    },
    handleVisibility(hidden) {
      if (hidden) stopMusic();
      else startMusic("board");
    },
    setMuted(nextMuted) {
      muted = Boolean(nextMuted);
      if (muted) stopMusic();
      else updateMusicLevel();
    },
    setVolume(nextVolume) {
      volume = Math.max(0, Math.min(1, Number(nextVolume) || 0));
      updateMusicLevel();
    },
    setEffectVolume(nextVolume) {
      effectVolume = Math.max(0, Math.min(1, Number(nextVolume) || 0));
    },
    setMusicVolume(nextVolume) {
      musicVolume = Math.max(0, Math.min(1, Number(nextVolume) || 0));
      updateMusicLevel();
    },
    setMusicEnabled(nextEnabled) {
      musicEnabled = Boolean(nextEnabled);
      if (!musicEnabled) stopMusic();
      else updateMusicLevel();
    },
    getSnapshot() {
      return {
        muted,
        volume,
        effectVolume,
        musicVolume,
        musicEnabled,
        musicPlaying: musicOscillators.length > 0,
      };
    },
  };
}

export function haptic(pattern, enabled = true) {
  if (!enabled) return;
  try {
    if (navigator?.vibrate) navigator.vibrate(pattern);
  } catch {
    // Vibration support varies; ignore quietly.
  }
}

function district(x, y, width, height, fill, title, subtitle) {
  return `
    <g class="city-district">
      <rect x="${x}" y="${y}" width="${width}" height="${height}" rx="34" fill="${fill}" stroke="#ffffff" stroke-width="8" opacity="0.78" />
      <rect x="${x + 12}" y="${y + 12}" width="${width - 24}" height="${height - 24}" rx="26" fill="url(#zoneGlow)" opacity="0.34" />
      <text x="${x + 24}" y="${y + 42}" class="district-label">${title}</text>
      <text x="${x + 24}" y="${y + 74}" class="district-subtitle">${subtitle}</text>
    </g>
  `;
}

function building(x, y, label, fill, stroke, sign = "") {
  return `
    <g class="map-building" filter="url(#softShadow)">
      <ellipse cx="${x + 82}" cy="${y + 126}" rx="88" ry="22" fill="#173126" opacity="0.12" />
      <path d="M${x + 12} ${y - 14} L${x + 148} ${y - 14} L${x + 160} ${y} L${x} ${y} Z" fill="${stroke}" opacity="0.48" />
      <rect x="${x}" y="${y}" width="160" height="118" rx="18" fill="${fill}" stroke="${stroke}" stroke-width="5" />
      <rect x="${x + 24}" y="${y - 29}" width="112" height="24" rx="10" fill="#ffffff" stroke="${stroke}" stroke-width="4" opacity="0.94" />
      <path d="M${x + 12} ${y + 12} H${x + 148}" stroke="#ffffff" stroke-width="6" stroke-linecap="round" opacity="0.62" />
      <rect x="${x + 28}" y="${y + 34}" width="32" height="28" rx="6" fill="#ffffff" opacity="0.86" />
      <rect x="${x + 94}" y="${y + 34}" width="32" height="28" rx="6" fill="#ffffff" opacity="0.86" />
      <rect x="${x + 68}" y="${y + 76}" width="28" height="42" rx="8" fill="${stroke}" opacity="0.72" />
      <text x="${x + 80}" y="${y - 10}" text-anchor="middle" class="building-sign">${sign}</text>
      <text x="${x + 80}" y="${y + 145}" text-anchor="middle" class="city-label">${label}</text>
    </g>
  `;
}

function apartmentBlock(x, y) {
  return `
    <g filter="url(#tinyShadow)">
      <rect x="${x}" y="${y}" width="88" height="150" rx="14" fill="#dff3ff" stroke="#246b9f" stroke-width="4" />
      <rect x="${x + 100}" y="${y + 30}" width="70" height="120" rx="14" fill="#e7f6ea" stroke="#1f7a52" stroke-width="4" />
      ${windowGrid(x + 18, y + 24)}
      ${windowGrid(x + 116, y + 52)}
      <text x="${x + 84}" y="${y + 180}" text-anchor="middle" class="city-label">公寓</text>
    </g>
  `;
}

function homeCluster(x, y) {
  return `
    <g filter="url(#softShadow)">
      ${smallHome(x, y, "#e7f6ea", "#1f7a52")}
      ${smallHome(x + 92, y + 32, "#fff4cf", "#d8a21f")}
      ${smallHome(x + 22, y + 96, "#e9f3ff", "#246b9f")}
      <rect x="${x + 126}" y="${y + 114}" width="36" height="22" rx="8" fill="#ffffff" stroke="#1f7a52" stroke-width="4" />
      <text x="${x + 86}" y="${y + 190}" text-anchor="middle" class="city-label">住宅花园</text>
    </g>
  `;
}

function smallHome(x, y, fill, stroke) {
  return `
    <g>
      <path d="M${x} ${y + 42} L${x + 42} ${y} L${x + 84} ${y + 42} Z" fill="${stroke}" />
      <rect x="${x + 8}" y="${y + 38}" width="68" height="58" rx="10" fill="${fill}" stroke="${stroke}" stroke-width="4" />
      <rect x="${x + 36}" y="${y + 58}" width="16" height="38" rx="5" fill="${stroke}" opacity="0.72" />
    </g>
  `;
}

function marketBoard(x, y) {
  return `
    <g filter="url(#softShadow)">
      <rect x="${x}" y="${y}" width="150" height="92" rx="16" fill="#253247" />
      <path d="M${x + 18} ${y + 58} L${x + 48} ${y + 42} L${x + 76} ${y + 50} L${x + 116} ${y + 22}" fill="none" stroke="#9fe0b9" stroke-width="8" stroke-linecap="round" />
      <text x="${x + 75}" y="${y + 122}" text-anchor="middle" class="city-label">行情板</text>
    </g>
  `;
}

function ambulance(x, y) {
  return `
    <g>
      <rect x="${x}" y="${y}" width="112" height="54" rx="12" fill="#ffffff" stroke="#c84d42" stroke-width="5" />
      <rect x="${x + 62}" y="${y + 10}" width="34" height="22" rx="6" fill="#e9f3ff" />
      <text x="${x + 34}" y="${y + 35}" text-anchor="middle" class="building-sign">+</text>
      <circle cx="${x + 28}" cy="${y + 58}" r="10" fill="#354740" />
      <circle cx="${x + 86}" cy="${y + 58}" r="10" fill="#354740" />
    </g>
  `;
}

function officeRow(x, y) {
  return `
    <g filter="url(#softShadow)">
      <rect x="${x}" y="${y}" width="62" height="126" rx="14" fill="#dff3ff" stroke="#3573a4" stroke-width="4" />
      <rect x="${x + 80}" y="${y + 24}" width="74" height="102" rx="14" fill="#fff1ce" stroke="#b47718" stroke-width="4" />
      ${windowGrid(x + 14, y + 20)}
      ${windowGrid(x + 96, y + 46)}
    </g>
  `;
}

function windowGrid(x, y) {
  return Array.from({ length: 6 }, (_, index) => {
    const column = index % 2;
    const row = Math.floor(index / 2);
    return `<rect x="${x + column * 22}" y="${y + row * 24}" width="14" height="14" rx="4" fill="#ffffff" opacity="0.86" />`;
  }).join("");
}

function bridge(x, y) {
  return `
    <g>
      <path d="M${x} ${y} C${x + 70} ${y - 34} ${x + 142} ${y - 34} ${x + 212} ${y}" fill="none" stroke="#b77e45" stroke-width="20" stroke-linecap="round" />
      <path d="M${x + 18} ${y - 2} L${x + 196} ${y - 2}" stroke="#fff4cf" stroke-width="6" stroke-dasharray="18 12" />
    </g>
  `;
}

function bench(x, y) {
  return `
    <g filter="url(#tinyShadow)">
      <rect x="${x}" y="${y}" width="76" height="14" rx="7" fill="#b77e45" />
      <rect x="${x + 10}" y="${y + 18}" width="56" height="10" rx="5" fill="#d8a21f" />
      <rect x="${x + 12}" y="${y + 28}" width="8" height="22" rx="4" fill="#53625c" />
      <rect x="${x + 56}" y="${y + 28}" width="8" height="22" rx="4" fill="#53625c" />
    </g>
  `;
}

function vehicle(x, y, color) {
  return `
    <g filter="url(#tinyShadow)">
      <rect x="${x}" y="${y}" width="92" height="42" rx="14" fill="${color}" stroke="#ffffff" stroke-width="4" />
      <rect x="${x + 48}" y="${y + 8}" width="28" height="16" rx="5" fill="#ffffff" opacity="0.72" />
      <circle cx="${x + 20}" cy="${y + 42}" r="9" fill="#354740" />
      <circle cx="${x + 70}" cy="${y + 42}" r="9" fill="#354740" />
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
      <path d="M1180 110 q18 -16 36 0 q18 -16 36 0" fill="none" stroke="#5f7770" stroke-width="6" stroke-linecap="round" />
      <path d="M395 90 q14 -12 28 0 q14 -12 28 0" fill="none" stroke="#5f7770" stroke-width="5" stroke-linecap="round" />
      <circle cx="720" cy="330" r="18" fill="#ffd86b" stroke="#d8a21f" stroke-width="5" />
      <circle cx="760" cy="340" r="14" fill="#ffd86b" stroke="#d8a21f" stroke-width="4" />
      <circle cx="1015" cy="330" r="18" fill="#ffd86b" stroke="#d8a21f" stroke-width="5" />
    </g>
  `;
}

function flowerbeds() {
  const beds = [
    [300, 515, "#f4aaa1"],
    [1225, 520, "#c7b9ff"],
    [675, 622, "#ffd86b"],
    [1010, 735, "#9fe0b9"],
  ];
  return beds
    .map(
      ([x, y, color]) => `
        <g class="flower-bed">
          <rect x="${x}" y="${y}" width="92" height="30" rx="15" fill="#77bf78" stroke="#ffffff" stroke-width="4" opacity="0.9" />
          <circle cx="${x + 20}" cy="${y + 14}" r="7" fill="${color}" />
          <circle cx="${x + 44}" cy="${y + 11}" r="7" fill="${color}" />
          <circle cx="${x + 68}" cy="${y + 16}" r="7" fill="${color}" />
        </g>
      `,
    )
    .join("");
}

function foregroundDecor() {
  return `
    <g class="foreground-detail" opacity="0.86">
      <path d="M70 1015 C210 980 320 1036 470 1002 C610 970 760 1018 910 994 C1070 966 1220 1016 1610 980" fill="none" stroke="#ffffff" stroke-width="18" stroke-linecap="round" opacity="0.38" />
      <rect x="118" y="988" width="108" height="18" rx="9" fill="#9b6a3a" />
      <rect x="138" y="1008" width="10" height="34" rx="5" fill="#53625c" />
      <rect x="194" y="1008" width="10" height="34" rx="5" fill="#53625c" />
      <circle cx="1510" cy="958" r="32" fill="#79c98b" />
      <circle cx="1542" cy="970" r="28" fill="#65b976" />
      <circle cx="1482" cy="976" r="26" fill="#8ad79a" />
    </g>
  `;
}

function roadDirections() {
  const arrows = [
    [370, 128, 0],
    [835, 122, 0],
    [1450, 285, 86],
    [1495, 680, 96],
    [1210, 948, 180],
    [610, 950, 180],
    [140, 650, -92],
    [154, 300, -76],
  ];
  return `
    <g class="road-directions" opacity="0.72">
      ${arrows
        .map(
          ([x, y, rotation]) => `
            <g transform="translate(${x} ${y}) rotate(${rotation})">
              <path d="M-22 -11 H14 L14 -22 L36 0 L14 22 L14 11 H-22 Z" fill="#ffffff" stroke="#d8a21f" stroke-width="4" stroke-linejoin="round" />
            </g>
          `,
        )
        .join("")}
      <g transform="translate(250 214)">
        <rect x="-48" y="-20" width="96" height="40" rx="14" fill="#ffffff" stroke="#1f7a52" stroke-width="5" />
        <text x="0" y="8" text-anchor="middle" class="road-sign">起点</text>
      </g>
      <g transform="translate(1375 826)">
        <rect x="-56" y="-20" width="112" height="40" rx="14" fill="#ffffff" stroke="#d8a21f" stroke-width="5" />
        <text x="0" y="8" text-anchor="middle" class="road-sign">现金流路</text>
      </g>
    </g>
  `;
}

function expressionForMood(mood = "neutral") {
  return {
    idle: "smile",
    neutral: "smile",
    happy: "smile",
    excited: "open",
    proud: "smile",
    celebrating: "open",
    celebrate: "open",
    worried: "worry",
    sad: "sad",
    surprised: "open",
    thinking: "flat",
    tired: "flat",
    walking: "smile",
  }[mood] || "smile";
}

function accessoryMarkup(id = "") {
  if (id === "teacher") return '<span class="avatar-accessory glasses"></span>';
  if (id === "engineer") return '<span class="avatar-accessory cap"></span>';
  if (id === "designer") return '<span class="avatar-accessory scarf"></span>';
  if (id === "doctor") return '<span class="avatar-accessory mirror"></span>';
  return "";
}

function illustrationKey(type = "") {
  const text = String(type).toLowerCase();
  if (text.includes("房") || text.includes("房地产")) return "property";
  if (text.includes("股") || text.includes("股票")) return "stock";
  if (text.includes("生意") || text.includes("投資") || text.includes("投资")) return "business";
  if (text.includes("银行") || text.includes("贷款")) return "bank";
  if (text.includes("保险") || text.includes("理赔")) return "insurance";
  if (text.includes("医疗") || text.includes("人生") || text.includes("健康")) return "medical";
  if (text.includes("失业") || text.includes("工作") || text.includes("升职")) return "job";
  if (text.includes("税")) return "tax";
  if (text.includes("家庭")) return "family";
  if (text.includes("市场")) return "market";
  if (text.includes("学习") || text.includes("為什麼") || text.includes("为什么")) return "learn";
  if (text.includes("慈善")) return "charity";
  if (text.includes("支出") || text.includes("账")) return "accident";
  return "event";
}

function illustrationSymbol(key) {
  return {
    property: "房",
    stock: "↗",
    business: "店",
    bank: "银",
    insurance: "盾",
    medical: "+",
    job: "职",
    tax: "税",
    family: "家",
    market: "风",
    learn: "书",
    accident: "账",
    charity: "心",
    event: "!",
  }[key] || "!";
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
  income: { type: "sine", start: 720, end: 1180, duration: 0.2, gain: 0.11 },
  expense: { type: "triangle", start: 360, end: 170, duration: 0.2, gain: 0.1 },
  property: { type: "triangle", start: 420, end: 720, duration: 0.22, gain: 0.12 },
  stock: { type: "sine", start: 520, end: 780, duration: 0.14, gain: 0.1 },
  bank: { type: "triangle", start: 260, end: 520, duration: 0.18, gain: 0.09 },
  buy: { type: "triangle", start: 460, end: 760, duration: 0.18, gain: 0.12 },
  sell: { type: "triangle", start: 540, end: 320, duration: 0.16, gain: 0.1 },
  error: { type: "sawtooth", start: 220, end: 120, duration: 0.18, gain: 0.08 },
  warning: { type: "square", start: 280, end: 180, duration: 0.14, gain: 0.08 },
  upgrade: { type: "sine", start: 520, end: 920, duration: 0.22, gain: 0.13 },
  win: { type: "triangle", start: 620, end: 1240, duration: 0.34, gain: 0.14 },
  sad: { type: "sine", start: 260, end: 140, duration: 0.22, gain: 0.08 },
  happy: { type: "sine", start: 520, end: 880, duration: 0.2, gain: 0.12 },
};
