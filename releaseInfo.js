export const releaseInfo = {
  appVersion: "1.24.0-rc.1",
  releaseChannel: "Public Beta",
  releaseLabel: "RC1 Public Beta",
  nextFixTarget: "RC2",
  saveSchemaVersion: 4,
  backupSchemaVersion: 1,
  translationSchemaVersion: 1,
  serviceWorkerVersion: "cashflow-game-shell-rc1",
  buildDate: "2026-07-22",
  releaseNotes: {
    "zh-TW": [
      "整合單人財商遊戲、AI 競賽、動態市場、任務成就與報告。",
      "加入三語、PWA 離線模式、安裝提示與本機存檔備份恢復。",
      "目前是公開測試版；資料保存在本機，建議定期匯出備份。",
      "如果遇到卡住、畫面或存檔問題，可用回報功能匯出安全診斷。",
      "遊戲是簡化財商學習模型，不是真實投資建議。",
    ],
    "zh-CN": [
      "整合单人财商游戏、AI 竞赛、动态市场、任务成就与报告。",
      "加入三语、PWA 离线模式、安装提示与本机存档备份恢复。",
      "目前是公开测试版；数据保存在本机，建议定期导出备份。",
      "如果遇到卡住、画面或存档问题，可用回报功能导出安全诊断。",
      "游戏是简化财商学习模型，不是真实投资建议。",
    ],
    en: [
      "Combines solo play, AI races, dynamic markets, missions, achievements, and reports.",
      "Adds three languages, PWA offline play, install guidance, and local save backup/restore.",
      "This is a public beta; data stays on this device, so export backups regularly.",
      "If something gets stuck or looks wrong, use feedback to export safe diagnostics.",
      "The game is a simplified learning model, not real investment advice.",
    ],
  },
};

export function releaseNotesForLocale(locale = "zh-TW") {
  return releaseInfo.releaseNotes[locale] || releaseInfo.releaseNotes["zh-TW"];
}
