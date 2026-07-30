export const FUN_SCHEMA_VERSION = 1;

export const strategyEventDefinitions = [
  strategyEvent("stock-signal", "stock", "📈", {
    zhCN: "股票机会：社区科技股",
    zhTW: "股票機會：社區科技股",
    en: "Stock Opportunity: Community Tech",
  }, {
    zhCN: "一家公司推出新产品。你可以选择小额试水、分散买入，或冒险加码。",
    zhTW: "一家公司推出新產品。你可以選擇小額試水、分散買入，或冒險加碼。",
    en: "A company launches a new product. You can test with a small buy, diversify, or take a bigger risk.",
  }, [
    option("steady", "low", { cash: -800, financialIq: 1, successCash: 450, successChance: 0.9 }, "ticker", {
      zhCN: "小额试水",
      zhTW: "小額試水",
      en: "Small Test Buy",
    }, {
      zhCN: "花一点钱观察波动，学习成本低。",
      zhTW: "花一點錢觀察波動，學習成本低。",
      en: "Spend a little to watch price swings with a low learning cost.",
    }),
    option("balanced", "medium", { cash: -1800, financialIq: 1, successCash: 1500, failureCash: -600, successChance: 0.68 }, "ticker", {
      zhCN: "分散买入",
      zhTW: "分散買入",
      en: "Diversified Buy",
    }, {
      zhCN: "买入一小篮虚构股票，风险和机会都中等。",
      zhTW: "買入一小籃虛構股票，風險和機會都中等。",
      en: "Buy a small basket of fictional stocks with moderate risk and reward.",
    }),
    option("risky", "high", { cash: -3200, successCash: 4200, failureCash: -1800, successChance: 0.46 }, "ticker", {
      zhCN: "追逐热点",
      zhTW: "追逐熱點",
      en: "Chase the Trend",
    }, {
      zhCN: "可能赚得快，也可能遇到明显回撤。",
      zhTW: "可能賺得快，也可能遇到明顯回撤。",
      en: "It could pay off quickly, but a pullback would hurt.",
    }),
  ]),
  strategyEvent("property-neighborhood", "property", "🏠", {
    zhCN: "房产机会：小公寓评估",
    zhTW: "房產機會：小公寓評估",
    en: "Real Estate Opportunity: Small Apartment",
  }, {
    zhCN: "一间小公寓正在出租。不同做法会影响现金、安全垫和未来租金。",
    zhTW: "一間小公寓正在出租。不同做法會影響現金、安全墊和未來租金。",
    en: "A small apartment is available for rent. Each choice affects cash, cushion, and future rent.",
  }, [
    option("steady", "low", { cash: -900, financialIq: 1, baseExpenses: -120, successChance: 1 }, "home", {
      zhCN: "先做租金调查",
      zhTW: "先做租金調查",
      en: "Research Rent First",
    }, {
      zhCN: "少花钱做功课，降低之后判断错误的机会。",
      zhTW: "少花錢做功課，降低之後判斷錯誤的機會。",
      en: "Spend a little on research to reduce bad decisions later.",
    }),
    option("balanced", "medium", { cash: -2500, baseExpenses: -300, successCash: 900, successChance: 0.72 }, "home", {
      zhCN: "签下试租方案",
      zhTW: "簽下試租方案",
      en: "Start a Trial Rental Plan",
    }, {
      zhCN: "现金流可能改善，但需要先付管理成本。",
      zhTW: "現金流可能改善，但需要先付管理成本。",
      en: "Cash flow may improve, but you pay management costs first.",
    }),
    option("risky", "high", { cash: -4200, baseExpenses: -500, successCash: 2600, failureCash: -2200, successChance: 0.5 }, "home", {
      zhCN: "快速翻新抢租客",
      zhTW: "快速翻新搶租客",
      en: "Renovate Quickly",
    }, {
      zhCN: "若顺利出租，城市会出现你的房屋旗帜；若失败，会吃掉现金垫。",
      zhTW: "若順利出租，城市會出現你的房屋旗幟；若失敗，會吃掉現金墊。",
      en: "If it rents well, your flag appears in the city; if not, it eats your cushion.",
    }),
  ]),
  strategyEvent("business-pop-up", "business", "🏪", {
    zhCN: "小生意机会：周末摊位",
    zhTW: "小生意機會：週末攤位",
    en: "Small Business Opportunity: Weekend Booth",
  }, {
    zhCN: "有人邀请你一起试营运。你要控制成本，还是抓住成长机会？",
    zhTW: "有人邀請你一起試營運。你要控制成本，還是抓住成長機會？",
    en: "A friend invites you to test a booth. Will you control costs or push for growth?",
  }, [
    option("steady", "low", { cash: -700, successCash: 500, financialIq: 1, successChance: 0.86 }, "shop", {
      zhCN: "小规模试卖",
      zhTW: "小規模試賣",
      en: "Small Trial",
    }, {
      zhCN: "用少量库存测试需求。",
      zhTW: "用少量庫存測試需求。",
      en: "Use limited stock to test demand.",
    }),
    option("balanced", "medium", { cash: -2200, baseExpenses: -180, successCash: 1800, successChance: 0.66 }, "shop", {
      zhCN: "正常投入",
      zhTW: "正常投入",
      en: "Standard Launch",
    }, {
      zhCN: "成本更高，但有机会形成稳定小收入。",
      zhTW: "成本更高，但有機會形成穩定小收入。",
      en: "Costs more, but may build a small steady income.",
    }),
    option("risky", "high", { cash: -3600, baseExpenses: -320, successCash: 4100, failureCash: -1700, successChance: 0.48 }, "shop", {
      zhCN: "加码宣传",
      zhTW: "加碼宣傳",
      en: "Promote Heavily",
    }, {
      zhCN: "可能快速打响招牌，也可能库存卖不完。",
      zhTW: "可能快速打響招牌，也可能庫存賣不完。",
      en: "It may build buzz quickly, or leave you with unsold stock.",
    }),
  ]),
  strategyEvent("learning-workshop", "learn", "💡", {
    zhCN: "学习事件：财商工作坊",
    zhTW: "學習事件：財商工作坊",
    en: "Learning Event: Money Workshop",
  }, {
    zhCN: "你发现一个短课程。学习不会保证赚钱，但能改善之后的判断。",
    zhTW: "你發現一個短課程。學習不會保證賺錢，但能改善之後的判斷。",
    en: "You find a short workshop. Learning does not guarantee profit, but it can improve choices.",
  }, [
    option("steady", "low", { cash: -400, financialIq: 1, successChance: 1 }, "book", {
      zhCN: "读入门指南",
      zhTW: "讀入門指南",
      en: "Read a Starter Guide",
    }, {
      zhCN: "花费少，先建立基本概念。",
      zhTW: "花費少，先建立基本概念。",
      en: "Low cost, good for the basics.",
    }),
    option("balanced", "low", { cash: -1000, financialIq: 2, baseExpenses: -100, successChance: 1 }, "book", {
      zhCN: "参加工作坊",
      zhTW: "參加工作坊",
      en: "Attend the Workshop",
    }, {
      zhCN: "花时间练习现金流判断。",
      zhTW: "花時間練習現金流判斷。",
      en: "Practice judging cash-flow tradeoffs.",
    }),
    option("risky", "medium", { cash: -1800, financialIq: 2, successCash: 1300, failureCash: -700, successChance: 0.62 }, "book", {
      zhCN: "报名进阶营",
      zhTW: "報名進階營",
      en: "Join an Advanced Session",
    }, {
      zhCN: "费用较高，若吸收得好，会马上改善预算。",
      zhTW: "費用較高，若吸收得好，會馬上改善預算。",
      en: "Costs more, but strong learning can quickly improve your budget.",
    }),
  ]),
  strategyEvent("expense-repair", "expense", "🧾", {
    zhCN: "风险事件：家电维修",
    zhTW: "風險事件：家電維修",
    en: "Risk Event: Appliance Repair",
  }, {
    zhCN: "冰箱坏了。你需要在现金、安全和长期成本之间取舍。",
    zhTW: "冰箱壞了。你需要在現金、安全和長期成本之間取捨。",
    en: "The fridge breaks. You must balance cash, safety, and long-term cost.",
  }, [
    option("steady", "low", { cash: -900, successChance: 1 }, "bill", {
      zhCN: "基础维修",
      zhTW: "基礎維修",
      en: "Basic Repair",
    }, {
      zhCN: "马上解决，但没有额外好处。",
      zhTW: "馬上解決，但沒有額外好處。",
      en: "Fixes the problem now, with no extra benefit.",
    }),
    option("balanced", "medium", { cash: -1600, baseExpenses: -80, successChance: 1 }, "bill", {
      zhCN: "换节能零件",
      zhTW: "換節能零件",
      en: "Install Efficient Parts",
    }, {
      zhCN: "花多一点，之后每月支出略降。",
      zhTW: "花多一點，之後每月支出略降。",
      en: "Costs more now, slightly lowers future monthly expenses.",
    }),
    option("risky", "high", { cash: -300, successCash: 400, failureCash: -2200, successChance: 0.35 }, "bill", {
      zhCN: "自己尝试修",
      zhTW: "自己嘗試修",
      en: "Try a DIY Fix",
    }, {
      zhCN: "可能省钱，也可能修坏更多。",
      zhTW: "可能省錢，也可能修壞更多。",
      en: "Might save money, or make the repair worse.",
    }),
  ]),
  strategyEvent("medical-checkup", "medical", "🏥", {
    zhCN: "医疗选择：健康检查",
    zhTW: "醫療選擇：健康檢查",
    en: "Medical Choice: Health Check",
  }, {
    zhCN: "你感觉不舒服。不同做法会影响现金和之后的风险。",
    zhTW: "你感覺不舒服。不同做法會影響現金和之後的風險。",
    en: "You feel unwell. Different choices affect cash and future risk.",
  }, [
    option("steady", "low", { cash: -700, successChance: 1 }, "shield", {
      zhCN: "基础检查",
      zhTW: "基礎檢查",
      en: "Basic Checkup",
    }, {
      zhCN: "花费可控，避免问题变大。",
      zhTW: "花費可控，避免問題變大。",
      en: "A manageable cost that prevents bigger problems.",
    }),
    option("balanced", "medium", { cash: -1200, financialIq: 1, baseExpenses: -70, successChance: 1 }, "shield", {
      zhCN: "检查加预防",
      zhTW: "檢查加預防",
      en: "Checkup + Prevention",
    }, {
      zhCN: "多花一点，但未来生活支出更稳定。",
      zhTW: "多花一點，但未來生活支出更穩定。",
      en: "Costs a bit more, but makes future expenses steadier.",
    }),
    option("risky", "high", { cash: 0, successCash: 200, failureCash: -2600, successChance: 0.42 }, "shield", {
      zhCN: "先观察",
      zhTW: "先觀察",
      en: "Wait and Watch",
    }, {
      zhCN: "可能没事，也可能之后花更多。",
      zhTW: "可能沒事，也可能之後花更多。",
      en: "It may be fine, or it may cost more later.",
    }),
  ]),
  strategyEvent("insurance-choice", "insurance", "🛡", {
    zhCN: "保险选择：保障组合",
    zhTW: "保險選擇：保障組合",
    en: "Insurance Choice: Protection Mix",
  }, {
    zhCN: "保险能分担部分风险，但保费也会影响现金流。",
    zhTW: "保險能分擔部分風險，但保費也會影響現金流。",
    en: "Insurance can share risk, but premiums affect cash flow too.",
  }, [
    option("steady", "low", { cash: -600, financialIq: 1, successChance: 1 }, "shield", {
      zhCN: "了解保障范围",
      zhTW: "了解保障範圍",
      en: "Review Coverage",
    }, {
      zhCN: "先看懂条款，不急着买。",
      zhTW: "先看懂條款，不急著買。",
      en: "Understand the terms before buying.",
    }),
    option("balanced", "medium", { cash: -1300, baseExpenses: 90, successCash: 1100, successChance: 0.76 }, "shield", {
      zhCN: "买基础保障",
      zhTW: "買基礎保障",
      en: "Buy Basic Coverage",
    }, {
      zhCN: "每月支出略升，但危机时更有缓冲。",
      zhTW: "每月支出略升，但危機時更有緩衝。",
      en: "Monthly expenses rise a little, but you gain a buffer for emergencies.",
    }),
    option("risky", "medium", { cash: -2400, baseExpenses: 180, successCash: 2400, successChance: 0.64 }, "shield", {
      zhCN: "买完整保障",
      zhTW: "買完整保障",
      en: "Buy Full Coverage",
    }, {
      zhCN: "保障更强，但保费会压缩月现金流。",
      zhTW: "保障更強，但保費會壓縮月現金流。",
      en: "Stronger protection, but premiums squeeze monthly cash flow.",
    }),
  ]),
  strategyEvent("market-storm", "market", "🌧", {
    zhCN: "市场波动：消息满天飞",
    zhTW: "市場波動：消息滿天飛",
    en: "Market Swing: News Everywhere",
  }, {
    zhCN: "市场突然波动。你可以观望、分批行动，或逆势冒险。",
    zhTW: "市場突然波動。你可以觀望、分批行動，或逆勢冒險。",
    en: "The market swings suddenly. You can wait, act gradually, or take a contrarian risk.",
  }, [
    option("steady", "low", { financialIq: 1, successChance: 1 }, "chart", {
      zhCN: "先观察",
      zhTW: "先觀察",
      en: "Wait and Observe",
    }, {
      zhCN: "不急着行动，先保护现金。",
      zhTW: "不急著行動，先保護現金。",
      en: "Do not rush; protect your cash first.",
    }),
    option("balanced", "medium", { cash: -1000, successCash: 1300, failureCash: -500, financialIq: 1, successChance: 0.66 }, "chart", {
      zhCN: "分批尝试",
      zhTW: "分批嘗試",
      en: "Try in Small Batches",
    }, {
      zhCN: "把风险分散到几次行动。",
      zhTW: "把風險分散到幾次行動。",
      en: "Spread the risk across several smaller actions.",
    }),
    option("risky", "high", { cash: -2500, successCash: 3600, failureCash: -1900, successChance: 0.44 }, "chart", {
      zhCN: "逆势加码",
      zhTW: "逆勢加碼",
      en: "Contrarian Move",
    }, {
      zhCN: "如果判断对会很亮眼，判断错会伤到现金垫。",
      zhTW: "如果判斷對會很亮眼，判斷錯會傷到現金墊。",
      en: "A correct read can shine; a wrong one hurts your cushion.",
    }),
  ]),
  strategyEvent("job-offer", "job", "💼", {
    zhCN: "工作选择：短期项目",
    zhTW: "工作選擇：短期專案",
    en: "Work Choice: Short Project",
  }, {
    zhCN: "有人找你做一个短项目。收入、时间和学习机会需要权衡。",
    zhTW: "有人找你做一個短專案。收入、時間和學習機會需要權衡。",
    en: "You are offered a short project. You must balance income, time, and learning.",
  }, [
    option("steady", "low", { cash: 900, successChance: 1 }, "work", {
      zhCN: "接小任务",
      zhTW: "接小任務",
      en: "Take the Small Task",
    }, {
      zhCN: "现金增加一点，压力较低。",
      zhTW: "現金增加一點，壓力較低。",
      en: "Earn a little cash with low pressure.",
    }),
    option("balanced", "medium", { cash: 1600, financialIq: 1, successChance: 1 }, "work", {
      zhCN: "接标准项目",
      zhTW: "接標準專案",
      en: "Take the Standard Project",
    }, {
      zhCN: "收入和经验都不错。",
      zhTW: "收入和經驗都不錯。",
      en: "A good mix of income and experience.",
    }),
    option("risky", "high", { cash: 900, successCash: 2600, failureCash: -900, successChance: 0.52 }, "work", {
      zhCN: "挑战高难项目",
      zhTW: "挑戰高難專案",
      en: "Take the Hard Project",
    }, {
      zhCN: "成功很有成就感，失败会付出返工成本。",
      zhTW: "成功很有成就感，失敗會付出返工成本。",
      en: "Success feels great; failure means rework costs.",
    }),
  ]),
  strategyEvent("life-request", "life", "🎒", {
    zhCN: "人生选择：家人需要帮忙",
    zhTW: "人生選擇：家人需要幫忙",
    en: "Life Choice: Family Needs Help",
  }, {
    zhCN: "家人遇到小困难。你可以直接出钱，也可以用时间和计划帮忙。",
    zhTW: "家人遇到小困難。你可以直接出錢，也可以用時間和計畫幫忙。",
    en: "A family member needs help. You can give cash, or help with time and planning.",
  }, [
    option("steady", "low", { cash: -600, successChance: 1 }, "heart", {
      zhCN: "小额支持",
      zhTW: "小額支持",
      en: "Small Support",
    }, {
      zhCN: "帮助对方，也保护自己的现金垫。",
      zhTW: "幫助對方，也保護自己的現金墊。",
      en: "Help them while protecting your cushion.",
    }),
    option("balanced", "medium", { cash: -1000, financialIq: 1, successChance: 1 }, "heart", {
      zhCN: "一起做预算",
      zhTW: "一起做預算",
      en: "Plan a Budget Together",
    }, {
      zhCN: "花一点钱，也建立更好的习惯。",
      zhTW: "花一點錢，也建立更好的習慣。",
      en: "Spend a little and build better habits together.",
    }),
    option("risky", "medium", { cash: -2500, successCash: 700, failureCash: -900, successChance: 0.58 }, "heart", {
      zhCN: "一次解决",
      zhTW: "一次解決",
      en: "Cover It All",
    }, {
      zhCN: "很温暖，但可能让自己的现金吃紧。",
      zhTW: "很溫暖，但可能讓自己的現金吃緊。",
      en: "Generous, but it may make your own cash tight.",
    }),
  ]),
  strategyEvent("bank-credit-plan", "bank", "🏦", {
    zhCN: "银行选择：信用计划",
    zhTW: "銀行選擇：信用計畫",
    en: "Bank Choice: Credit Plan",
  }, {
    zhCN: "银行提供信用方案。借钱可以加速，也会增加压力。",
    zhTW: "銀行提供信用方案。借錢可以加速，也會增加壓力。",
    en: "The bank offers a credit plan. Borrowing can speed things up, but adds pressure.",
  }, [
    option("steady", "low", { financialIq: 1, successChance: 1 }, "bank", {
      zhCN: "只检查信用分",
      zhTW: "只檢查信用分",
      en: "Review Credit Score",
    }, {
      zhCN: "不借款，先了解规则。",
      zhTW: "不借款，先了解規則。",
      en: "Do not borrow yet; learn the rules first.",
    }),
    option("balanced", "medium", { cash: 1800, baseExpenses: 90, financialIq: 1, successChance: 1 }, "bank", {
      zhCN: "小额周转",
      zhTW: "小額週轉",
      en: "Small Working Loan",
    }, {
      zhCN: "现金变多，但每月支出也增加。",
      zhTW: "現金變多，但每月支出也增加。",
      en: "Cash increases, but monthly expenses rise too.",
    }),
    option("risky", "high", { cash: 4200, baseExpenses: 260, successCash: 800, failureCash: -1600, successChance: 0.5 }, "bank", {
      zhCN: "扩大额度",
      zhTW: "擴大額度",
      en: "Increase Credit Line",
    }, {
      zhCN: "现金充足但还款压力明显。",
      zhTW: "現金充足但還款壓力明顯。",
      en: "More cash, but the repayment pressure is real.",
    }),
  ]),
  strategyEvent("tax-planning", "tax", "🧾", {
    zhCN: "税务选择：预留税款",
    zhTW: "稅務選擇：預留稅款",
    en: "Tax Choice: Set Money Aside",
  }, {
    zhCN: "税务整理来了。你可以现在预留，也可以赌之后现金够用。",
    zhTW: "稅務整理來了。你可以現在預留，也可以賭之後現金夠用。",
    en: "Tax time is coming. You can set money aside now, or hope cash is enough later.",
  }, [
    option("steady", "low", { cash: -900, financialIq: 1, successChance: 1 }, "tax", {
      zhCN: "先预留",
      zhTW: "先預留",
      en: "Set Aside Now",
    }, {
      zhCN: "现金少一点，但之后更安心。",
      zhTW: "現金少一點，但之後更安心。",
      en: "Less cash now, more peace later.",
    }),
    option("balanced", "medium", { cash: -500, successCash: 700, failureCash: -600, successChance: 0.7 }, "tax", {
      zhCN: "分批预留",
      zhTW: "分批預留",
      en: "Set Aside in Parts",
    }, {
      zhCN: "保留一点弹性，也承担一点风险。",
      zhTW: "保留一點彈性，也承擔一點風險。",
      en: "Keep some flexibility, with some risk.",
    }),
    option("risky", "high", { cash: 0, successCash: 500, failureCash: -1800, successChance: 0.38 }, "tax", {
      zhCN: "先不处理",
      zhTW: "先不處理",
      en: "Delay It",
    }, {
      zhCN: "现金暂时不变，但可能之后一次补缴。",
      zhTW: "現金暫時不變，但可能之後一次補繳。",
      en: "Cash stays for now, but you may pay more later.",
    }),
  ]),
];

export const miniGameDefinitions = [
  miniGame("budget-allocation", "budget", "🎯", {
    zhCN: "小游戏：预算配置",
    zhTW: "小遊戲：預算配置",
    en: "Mini Game: Budget Mix",
  }, {
    zhCN: "把本月额外预算分配在生活、储蓄、学习和投资。必须留下生活底线。",
    zhTW: "把本月額外預算分配在生活、儲蓄、學習和投資。必須留下生活底線。",
    en: "Split this month's extra budget across living, savings, learning, and investing. Living needs must be covered.",
  }, [
    miniChoice("balanced-budget", { cash: 500, baseExpenses: -180, financialIq: 1 }, true, {
      zhCN: "生活 45%／储蓄 25%／学习 15%／投资 15%",
      zhTW: "生活 45%／儲蓄 25%／學習 15%／投資 15%",
      en: "Living 45% / Savings 25% / Learning 15% / Investing 15%",
    }, {
      zhCN: "生活需求够，储蓄和学习也有空间。现金流小幅改善。",
      zhTW: "生活需求夠，儲蓄和學習也有空間。現金流小幅改善。",
      en: "Needs are covered, with room for saving and learning. Cash flow improves a little.",
    }),
    miniChoice("too-much-fun", { cash: -600, financialIq: 0 }, false, {
      zhCN: "生活 80%／储蓄 5%／学习 5%／投资 10%",
      zhTW: "生活 80%／儲蓄 5%／學習 5%／投資 10%",
      en: "Living 80% / Savings 5% / Learning 5% / Investing 10%",
    }, {
      zhCN: "生活很舒服，但安全垫太薄。",
      zhTW: "生活很舒服，但安全墊太薄。",
      en: "Comfort is high, but the safety cushion is thin.",
    }),
    miniChoice("over-invest", { cash: -300, successCash: 900, failureCash: -900, successChance: 0.55, financialIq: 1 }, false, {
      zhCN: "生活 30%／储蓄 10%／学习 10%／投资 50%",
      zhTW: "生活 30%／儲蓄 10%／學習 10%／投資 50%",
      en: "Living 30% / Savings 10% / Learning 10% / Investing 50%",
    }, {
      zhCN: "投资很多，但生活底线太紧，波动会更痛。",
      zhTW: "投資很多，但生活底線太緊，波動會更痛。",
      en: "Investing is high, but basic needs are tight, so swings hurt more.",
    }),
  ]),
  miniGame("opportunity-spotting", "spotting", "🔎", {
    zhCN: "小游戏：机会辨识",
    zhTW: "小遊戲：機會辨識",
    en: "Mini Game: Spot the Opportunity",
  }, {
    zhCN: "三张卡里只有一张更适合当前现金流。先看每月影响，再看价格。",
    zhTW: "三張卡裡只有一張更適合當前現金流。先看每月影響，再看價格。",
    en: "Only one card fits your current cash flow best. Check monthly impact before price.",
  }, [
    miniChoice("positive-cashflow", { cash: 700, baseExpenses: -220, financialIq: 1 }, true, {
      zhCN: "租金收入高于月供的小套房",
      zhTW: "租金收入高於月供的小套房",
      en: "Small rental with rent above monthly payment",
    }, {
      zhCN: "你先看现金流，再看价格，判断更稳。",
      zhTW: "你先看現金流，再看價格，判斷更穩。",
      en: "You checked cash flow before price. Stronger decision.",
    }),
    miniChoice("shiny-expense", { cash: -500, financialIq: 1 }, false, {
      zhCN: "看起来很酷但没有收入的新设备",
      zhTW: "看起來很酷但沒有收入的新設備",
      en: "A cool gadget that produces no income",
    }, {
      zhCN: "它可能有用，但不是现金流机会。",
      zhTW: "它可能有用，但不是現金流機會。",
      en: "It may be useful, but it is not a cash-flow opportunity.",
    }),
    miniChoice("high-debt", { cash: -800, baseExpenses: 120 }, false, {
      zhCN: "月供高于租金的漂亮房子",
      zhTW: "月供高於租金的漂亮房子",
      en: "Pretty property with payment above rent",
    }, {
      zhCN: "漂亮不代表现金流健康。",
      zhTW: "漂亮不代表現金流健康。",
      en: "Pretty does not mean healthy cash flow.",
    }),
  ]),
  miniGame("cashflow-puzzle", "puzzle", "🧩", {
    zhCN: "小游戏：现金流快算",
    zhTW: "小遊戲：現金流快算",
    en: "Mini Game: Cash-Flow Quick Math",
  }, {
    zhCN: "收入 ¥3,000，支出 ¥2,200。这个选择每月现金流是多少？",
    zhTW: "收入 ¥3,000，支出 ¥2,200。這個選擇每月現金流是多少？",
    en: "Income is ¥3,000 and expenses are ¥2,200. What is the monthly cash flow?",
  }, [
    miniChoice("right-flow", { cash: 600, baseExpenses: -120, financialIq: 1 }, true, {
      zhCN: "+¥800",
      zhTW: "+¥800",
      en: "+¥800",
    }, {
      zhCN: "正确。收入减支出，就是月现金流。",
      zhTW: "正確。收入減支出，就是月現金流。",
      en: "Correct. Income minus expenses equals monthly cash flow.",
    }),
    miniChoice("wrong-revenue", { financialIq: 1 }, false, {
      zhCN: "+¥3,000",
      zhTW: "+¥3,000",
      en: "+¥3,000",
    }, {
      zhCN: "这是收入，不是扣掉支出后的现金流。",
      zhTW: "這是收入，不是扣掉支出後的現金流。",
      en: "That is income, not cash flow after expenses.",
    }),
    miniChoice("wrong-cost", { financialIq: 1 }, false, {
      zhCN: "-¥2,200",
      zhTW: "-¥2,200",
      en: "-¥2,200",
    }, {
      zhCN: "这是支出，不是净结果。",
      zhTW: "這是支出，不是淨結果。",
      en: "That is the expense, not the net result.",
    }),
  ]),
];

export const earlyPacePlan = [
  { turn: 1, kind: "strategy", categories: ["business", "property", "stock"] },
  { turn: 2, kind: "strategy", categories: ["job", "stock", "business"] },
  { turn: 3, kind: "ai" },
  { turn: 4, kind: "strategy", categories: ["expense", "medical", "life"] },
  { turn: 5, kind: "minigame", id: "budget-allocation" },
  { turn: 6, kind: "strategy", categories: ["property", "business", "insurance"] },
  { turn: 7, kind: "minigame", id: "opportunity-spotting" },
  { turn: 8, kind: "ai" },
  { turn: 9, kind: "minigame", id: "cashflow-puzzle" },
  { turn: 10, kind: "summary" },
];

export function migrateFunState(state) {
  if (!state || typeof state !== "object") return state;
  const saved = state.funPacing && typeof state.funPacing === "object" ? state.funPacing : {};
  state.funVersion = FUN_SCHEMA_VERSION;
  state.funPacing = {
    earlyPaceDone: uniqueStrings(saved.earlyPaceDone).slice(0, 12),
    seenEventIds: uniqueStrings(saved.seenEventIds).slice(0, 80),
    completedMiniGames: uniqueStrings(saved.completedMiniGames).slice(0, 20),
    strategyChoices: clampCount(saved.strategyChoices),
    riskEvents: clampCount(saved.riskEvents),
    successRewards: clampCount(saved.successRewards),
    crisisEvents: clampCount(saved.crisisEvents),
    aiInteractions: clampCount(saved.aiInteractions),
    goalCompletions: clampCount(saved.goalCompletions),
    comboStreak: clampCount(saved.comboStreak),
    bestCombo: clampCount(saved.bestCombo),
    lastOutcome: saved.lastOutcome || null,
    lastSummaryRound: clampCount(saved.lastSummaryRound),
  };
  state.shortTermFunGoals = normalizeFunGoals(state.shortTermFunGoals);
  state.cityUpgrades = Array.isArray(state.cityUpgrades) ? state.cityUpgrades.slice(-8).map(normalizeCityUpgrade).filter(Boolean) : [];
  return state;
}

export function selectPacedEngagement(state, tile, random = Math.random) {
  migrateFunState(state);
  const turn = currentEarlyTurn(state);
  if (turn < 1 || turn > 10) return null;
  if (state.funPacing.earlyPaceDone.includes(String(turn))) return null;
  const slot = earlyPacePlan.find((item) => item.turn === turn);
  if (!slot) return null;
  if (slot.kind === "strategy") {
    const categories = slot.categories?.length ? slot.categories : [categoryForTile(tile)];
    const pool = strategyEventDefinitions.filter((event) => categories.includes(event.category));
    const event = chooseFromPool(pool.length ? pool : strategyEventDefinitions, state, turn, random);
    return { kind: "strategy", turn, event };
  }
  if (slot.kind === "minigame") {
    const game = miniGameDefinitions.find((item) => item.id === slot.id) || chooseFromPool(miniGameDefinitions, state, turn, random);
    return { kind: "minigame", turn, game };
  }
  if (slot.kind === "ai") return { kind: "ai", turn };
  if (slot.kind === "summary") return { kind: "summary", turn };
  return null;
}

export function currentEarlyTurn(state) {
  const round = Number(state?.round || 1);
  return Math.max(1, round - 1);
}

export function markPacedTurnDone(state, turn) {
  migrateFunState(state);
  const key = String(turn);
  if (!state.funPacing.earlyPaceDone.includes(key)) state.funPacing.earlyPaceDone.push(key);
  state.funPacing.earlyPaceDone = state.funPacing.earlyPaceDone.slice(-12);
}

export function recordFunOutcome(state, outcome = {}) {
  migrateFunState(state);
  const pacing = state.funPacing;
  if (outcome.kind === "strategy") pacing.strategyChoices += 1;
  if (outcome.kind === "minigame" && outcome.id && !pacing.completedMiniGames.includes(outcome.id)) {
    pacing.completedMiniGames.push(outcome.id);
    pacing.completedMiniGames = pacing.completedMiniGames.slice(-20);
  }
  if (outcome.kind === "ai") pacing.aiInteractions += 1;
  if (outcome.riskLevel === "high" || outcome.isRisk) pacing.riskEvents += 1;
  if (outcome.isCrisis) pacing.crisisEvents += 1;
  if (outcome.success) {
    pacing.successRewards += 1;
    pacing.comboStreak += 1;
  } else {
    pacing.comboStreak = 0;
  }
  pacing.bestCombo = Math.max(pacing.bestCombo, pacing.comboStreak);
  pacing.lastOutcome = {
    kind: outcome.kind || "event",
    id: outcome.id || null,
    success: Boolean(outcome.success),
    round: Number(state.round || 0),
  };
  return updateFunGoals(state, outcome);
}

export function addCityUpgrade(state, upgrade = {}) {
  migrateFunState(state);
  const id = upgrade.id || `city-${Date.now()}`;
  if (state.cityUpgrades.some((item) => item.id === id)) return null;
  const marker = normalizeCityUpgrade({
    id,
    icon: upgrade.icon || "★",
    tone: upgrade.tone || "gold",
    label: upgrade.label || {
      zhCN: "城市有了新变化",
      zhTW: "城市有了新變化",
      en: "The city changed",
    },
    x: Number(upgrade.x || 760),
    y: Number(upgrade.y || 520),
    type: upgrade.type || "fun",
    round: Number(state.round || 0),
  });
  if (!marker) return null;
  state.cityUpgrades.push(marker);
  state.cityUpgrades = state.cityUpgrades.slice(-8);
  updateFunGoals(state, { kind: "city", success: true });
  return marker;
}

export function funStats(state) {
  migrateFunState(state);
  const goals = state.shortTermFunGoals || [];
  return {
    strategyChoices: state.funPacing.strategyChoices,
    miniGames: state.funPacing.completedMiniGames.length,
    goalCompletions: goals.filter((item) => item.completed).length,
    successRewards: state.funPacing.successRewards,
    riskEvents: state.funPacing.riskEvents,
    crisisEvents: state.funPacing.crisisEvents,
    aiInteractions: state.funPacing.aiInteractions,
    cityUpgrades: state.cityUpgrades.length,
    comboStreak: state.funPacing.comboStreak,
    bestCombo: state.funPacing.bestCombo,
    activeGoal: goals.find((item) => !item.completed) || goals[0] || null,
    firstTenComplete: state.funPacing.earlyPaceDone.length >= 10,
  };
}

export function funText(value, locale = "zh-CN") {
  if (!value || typeof value !== "object") return String(value ?? "");
  if (locale === "zh-TW") return value.zhTW || value.zhCN || value.en || "";
  if (locale === "en") return value.en || value.zhCN || value.zhTW || "";
  return value.zhCN || value.zhTW || value.en || "";
}

export function estimateOptionImpact(option) {
  const effects = option?.effects || {};
  const cash = Number(effects.cash || 0) + Math.round(Number(effects.successCash || 0) * Number(effects.successChance ?? 1)) + Math.round(Number(effects.failureCash || 0) * (1 - Number(effects.successChance ?? 1)));
  const baseExpenses = Number(effects.baseExpenses || 0);
  return { cash, baseExpenses, financialIq: Number(effects.financialIq || 0) };
}

function updateFunGoals(state, outcome) {
  const goals = normalizeFunGoals(state.shortTermFunGoals);
  const completedNow = [];
  const stats = {
    strategies: state.funPacing.strategyChoices,
    miniGames: state.funPacing.completedMiniGames.length,
    city: state.cityUpgrades.length,
    success: state.funPacing.successRewards,
  };
  goals.forEach((goal) => {
    if (goal.completed) return;
    goal.progress = Math.min(goal.target, Number(stats[goal.metric] || 0));
    if (goal.progress >= goal.target) {
      goal.completed = true;
      goal.completedAtRound = Number(state.round || 0);
      state.funPacing.goalCompletions += 1;
      completedNow.push(goal);
    }
  });
  state.shortTermFunGoals = goals;
  return completedNow;
}

function normalizeFunGoals(goals) {
  const existing = Array.isArray(goals) ? goals : [];
  return defaultFunGoals.map((goal) => {
    const saved = existing.find((item) => item.id === goal.id) || {};
    return {
      ...goal,
      progress: Math.max(0, Math.min(goal.target, Number(saved.progress || 0))),
      completed: Boolean(saved.completed),
      claimed: Boolean(saved.claimed),
      completedAtRound: saved.completedAtRound ? Number(saved.completedAtRound) : null,
    };
  });
}

const defaultFunGoals = [
  {
    id: "three-smart-choices",
    metric: "strategies",
    target: 3,
    title: { zhCN: "做出 3 次策略选择", zhTW: "做出 3 次策略選擇", en: "Make 3 strategy choices" },
    reward: { zhCN: "城市星光徽章", zhTW: "城市星光徽章", en: "City Spark badge" },
  },
  {
    id: "first-minigame",
    metric: "miniGames",
    target: 1,
    title: { zhCN: "完成 1 次财商小游戏", zhTW: "完成 1 次財商小遊戲", en: "Complete 1 money mini game" },
    reward: { zhCN: "现金流小奖章", zhTW: "現金流小獎章", en: "Cash-flow mini badge" },
  },
  {
    id: "city-feedback",
    metric: "city",
    target: 1,
    title: { zhCN: "让城市出现 1 个新变化", zhTW: "讓城市出現 1 個新變化", en: "Add 1 visible city change" },
    reward: { zhCN: "你的城市更热闹", zhTW: "你的城市更熱鬧", en: "Your city feels livelier" },
  },
  {
    id: "first-success",
    metric: "success",
    target: 1,
    title: { zhCN: "取得 1 次明显成功奖励", zhTW: "取得 1 次明顯成功獎勵", en: "Earn 1 clear success reward" },
    reward: { zhCN: "连击火花", zhTW: "連擊火花", en: "Combo spark" },
  },
];

function strategyEvent(id, category, icon, title, description, options) {
  return { id, category, icon, title, description, options };
}

function option(id, risk, effects, cityEffect, title, description) {
  return { id, risk, effects, cityEffect, title, description };
}

function miniGame(id, category, icon, title, description, choices) {
  return { id, category, icon, title, description, choices };
}

function miniChoice(id, effects, correct, title, feedback) {
  return { id, effects, correct: Boolean(correct), title, feedback };
}

function chooseFromPool(pool, state, turn, random) {
  const seen = new Set(state.funPacing?.seenEventIds || []);
  const fresh = pool.filter((item) => !seen.has(item.id));
  const candidates = fresh.length ? fresh : pool;
  const base = Number(state.position || 0) + turn + Math.floor(random() * candidates.length);
  return candidates[Math.abs(base) % candidates.length] || candidates[0];
}

function categoryForTile(tile) {
  const type = tile?.type || "";
  if (type.includes("stock")) return "stock";
  if (type.includes("business")) return "business";
  if (type.includes("property") || type === "opportunity" || type === "market") return "property";
  if (type === "bank") return "bank";
  if (type === "insurance") return "insurance";
  if (type === "tax") return "tax";
  if (type === "learn") return "learn";
  if (type === "jobEvent") return "job";
  if (type === "lifeEvent" || type === "family") return "life";
  if (type === "doodad") return "expense";
  return "market";
}

function normalizeCityUpgrade(item) {
  if (!item || typeof item !== "object") return null;
  return {
    id: String(item.id || ""),
    icon: String(item.icon || "★").slice(0, 4),
    tone: String(item.tone || "gold").replace(/[^a-z-]/gi, "") || "gold",
    label: item.label && typeof item.label === "object" ? item.label : { zhCN: String(item.label || "城市变化"), zhTW: String(item.label || "城市變化"), en: String(item.label || "City change") },
    x: Math.max(330, Math.min(1160, Number(item.x || 760))),
    y: Math.max(300, Math.min(725, Number(item.y || 520))),
    type: String(item.type || "fun"),
    round: Number(item.round || 0),
  };
}

function uniqueStrings(values) {
  return [...new Set((Array.isArray(values) ? values : []).map((item) => String(item)).filter(Boolean))];
}

function clampCount(value) {
  return Math.max(0, Math.min(999, Math.round(Number(value || 0))));
}
