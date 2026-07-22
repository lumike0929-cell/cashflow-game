export const releaseInfo = {
  appVersion: "1.24.0-rc.1",
  releaseChannel: "Release Candidate 1",
  releaseLabel: "RC1",
  saveSchemaVersion: 4,
  backupSchemaVersion: 1,
  translationSchemaVersion: 1,
  serviceWorkerVersion: "cashflow-game-shell-rc1",
  buildDate: "2026-07-22",
  releaseNotes: {
    "zh-TW": [
      "整合單人財商遊戲、AI 競賽、動態市場、任務成就與報告。",
      "加入三語、PWA 離線模式、安裝提示與本機存檔備份恢復。",
      "目前是發布候選測試版；資料保存在本機，建議定期匯出備份。",
      "遊戲是簡化財商學習模型，不是真實投資建議。",
    ],
    "zh-CN": [
      "整合单人财商游戏、AI 竞赛、动态市场、任务成就与报告。",
      "加入三语、PWA 离线模式、安装提示与本机存档备份恢复。",
      "目前是发布候选测试版；数据保存在本机，建议定期导出备份。",
      "游戏是简化财商学习模型，不是真实投资建议。",
    ],
    en: [
      "Combines solo play, AI races, dynamic markets, missions, achievements, and reports.",
      "Adds three languages, PWA offline play, install guidance, and local save backup/restore.",
      "This is a release candidate; data stays on this device, so export backups regularly.",
      "The game is a simplified learning model, not real investment advice.",
    ],
  },
};

export function releaseNotesForLocale(locale = "zh-TW") {
  return releaseInfo.releaseNotes[locale] || releaseInfo.releaseNotes["zh-TW"];
}
