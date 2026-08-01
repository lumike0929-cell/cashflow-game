export const FUN_SCHEMA_VERSION = 2;

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
  strategyEvent("unemployment-response", "job", "🌧", {
    zhCN: "危机事件：工作暂停",
    zhTW: "危機事件：工作暫停",
    en: "Crisis Event: Work Pause",
  }, {
    zhCN: "工作收入可能短暂停下。你需要选择如何守住现金流。",
    zhTW: "工作收入可能短暫停下。你需要選擇如何守住現金流。",
    en: "Work income may pause briefly. Choose how to protect cash flow.",
  }, [
    option("steady", "low", { cash: -600, baseExpenses: -220, financialIq: 1, successChance: 1 }, "work", {
      zhCN: "立刻缩减支出",
      zhTW: "立刻縮減支出",
      en: "Cut Expenses Now",
    }, {
      zhCN: "少一点舒服，多一点安全。",
      zhTW: "少一點舒服，多一點安全。",
      en: "Less comfort now, more safety.",
    }),
    option("balanced", "medium", { cash: -900, salary: 500, financialIq: 1, successChance: 0.72, failureCash: -700 }, "work", {
      zhCN: "投递短期项目",
      zhTW: "投遞短期專案",
      en: "Apply for Short Projects",
    }, {
      zhCN: "用行动争取收入，也保留一点现金。",
      zhTW: "用行動爭取收入，也保留一點現金。",
      en: "Act to rebuild income while preserving some cash.",
    }),
    option("risky", "high", { cash: -2200, salary: 1200, successCash: 1500, failureCash: -1800, successChance: 0.45 }, "work", {
      zhCN: "全力转型",
      zhTW: "全力轉型",
      en: "Full Pivot",
    }, {
      zhCN: "可能打开新收入，也可能让现金压力变大。",
      zhTW: "可能打開新收入，也可能讓現金壓力變大。",
      en: "May open new income, but can increase cash pressure.",
    }),
  ]),
  strategyEvent("asset-sale-choice", "assetSale", "🏷", {
    zhCN: "资产选择：是否出售",
    zhTW: "資產選擇：是否出售",
    en: "Asset Choice: Sell or Hold",
  }, {
    zhCN: "你有机会卖出一项小资产。现金会增加，但未来收入可能减少。",
    zhTW: "你有機會賣出一項小資產。現金會增加，但未來收入可能減少。",
    en: "You can sell a small asset. Cash rises, but future income may fall.",
  }, [
    option("steady", "low", { cash: 900, baseExpenses: 40, successChance: 1 }, "home", {
      zhCN: "卖出一小部分",
      zhTW: "賣出一小部分",
      en: "Sell a Small Part",
    }, {
      zhCN: "补现金，但保留多数未来机会。",
      zhTW: "補現金，但保留多數未來機會。",
      en: "Add cash while keeping most future upside.",
    }),
    option("balanced", "medium", { cash: 1900, baseExpenses: 120, successChance: 1 }, "chart", {
      zhCN: "卖出一半",
      zhTW: "賣出一半",
      en: "Sell Half",
    }, {
      zhCN: "现金明显增加，但现金流会弱一些。",
      zhTW: "現金明顯增加，但現金流會弱一些。",
      en: "Cash rises clearly, but cash flow weakens a little.",
    }),
    option("risky", "medium", { cash: 0, successCash: 1200, failureCash: -900, successChance: 0.56 }, "chart", {
      zhCN: "继续持有",
      zhTW: "繼續持有",
      en: "Keep Holding",
    }, {
      zhCN: "可能等到更好价格，也可能错过现金机会。",
      zhTW: "可能等到更好價格，也可能錯過現金機會。",
      en: "You may wait for a better price, or miss needed cash.",
    }),
  ]),
  strategyEvent("cash-reserve-check", "reserve", "🧰", {
    zhCN: "现金储备：安全垫检查",
    zhTW: "現金儲備：安全墊檢查",
    en: "Cash Reserve: Cushion Check",
  }, {
    zhCN: "你的现金垫决定遇到机会或意外时有多少选择。",
    zhTW: "你的現金墊決定遇到機會或意外時有多少選擇。",
    en: "Your cash cushion decides how many choices you have when opportunity or trouble appears.",
  }, [
    option("steady", "low", { cash: 500, financialIq: 1, successChance: 1 }, "bank", {
      zhCN: "先补安全垫",
      zhTW: "先補安全墊",
      en: "Build the Cushion",
    }, {
      zhCN: "现金增加，短期成长慢一点。",
      zhTW: "現金增加，短期成長慢一點。",
      en: "Cash rises; growth may be slower for now.",
    }),
    option("balanced", "medium", { cash: -700, baseExpenses: -180, financialIq: 1, successChance: 1 }, "book", {
      zhCN: "整理固定支出",
      zhTW: "整理固定支出",
      en: "Trim Fixed Expenses",
    }, {
      zhCN: "花时间调整预算，之后月现金流变轻。",
      zhTW: "花時間調整預算，之後月現金流變輕。",
      en: "Spend effort on the budget; future cash flow gets lighter.",
    }),
    option("risky", "high", { cash: -1600, successCash: 2600, failureCash: -1400, successChance: 0.5 }, "shop", {
      zhCN: "用现金抓机会",
      zhTW: "用現金抓機會",
      en: "Use Cash for an Opportunity",
    }, {
      zhCN: "有翻盘感，但安全垫会变薄。",
      zhTW: "有翻盤感，但安全墊會變薄。",
      en: "It can feel like a comeback, but the cushion gets thinner.",
    }),
  ]),
  strategyEvent("small-spending-choice", "spending", "🛍", {
    zhCN: "小额消费：想要还是需要",
    zhTW: "小額消費：想要還是需要",
    en: "Small Spending: Want or Need",
  }, {
    zhCN: "你看到一个很想买的小东西。它不会毁掉财务，但习惯会累积。",
    zhTW: "你看到一個很想買的小東西。它不會毀掉財務，但習慣會累積。",
    en: "You see something tempting. One purchase won't ruin finances, but habits add up.",
  }, [
    option("steady", "low", { cash: 300, financialIq: 1, successChance: 1 }, "heart", {
      zhCN: "等一天再决定",
      zhTW: "等一天再決定",
      en: "Wait One Day",
    }, {
      zhCN: "冲动降温，现金留下来。",
      zhTW: "衝動降溫，現金留下來。",
      en: "The impulse cools down, and cash stays.",
    }),
    option("balanced", "low", { cash: -350, successChance: 1 }, "bill", {
      zhCN: "用娱乐预算买",
      zhTW: "用娛樂預算買",
      en: "Use Fun Money",
    }, {
      zhCN: "有预算就可以享受，但仍要记录支出。",
      zhTW: "有預算就可以享受，但仍要記錄支出。",
      en: "Enjoy it if it fits the budget, and still record it.",
    }),
    option("risky", "medium", { cash: -1200, failureCash: -500, successChance: 0.5 }, "bill", {
      zhCN: "直接升级整套",
      zhTW: "直接升級整套",
      en: "Upgrade the Whole Set",
    }, {
      zhCN: "开心很快，但现金少得也快。",
      zhTW: "開心很快，但現金少得也快。",
      en: "It feels fun quickly, and cash drops quickly too.",
    }),
  ]),
];

const roleEventSeeds = {
  teacher: [
    ["teacher-tutoring", "job", "📚", ["课后辅导机会", "課後輔導機會", "After-School Tutoring"], ["几位家长想请你做小班辅导。你可以轻量接案，或设计更完整课程。", "幾位家長想請你做小班輔導。你可以輕量接案，或設計更完整課程。", "Families ask for small tutoring sessions. You can take a light gig or build a fuller course."], { cash: 900, salary: 120, successChance: 1 }, { cash: -900, salary: 520, financialIq: 1, successCash: 1000, failureCash: -500, successChance: 0.68 }],
    ["teacher-certificate", "learn", "🎓", ["进修证书", "進修證書", "Teaching Certificate"], ["一张证书可能提高未来收入，但会花掉本月现金。", "一張證書可能提高未來收入，但會花掉本月現金。", "A certificate may improve future income, but it costs cash this month."], { cash: -700, financialIq: 1, successChance: 1 }, { cash: -1800, salary: 700, financialIq: 2, successChance: 0.76 }],
    ["teacher-school-raise", "job", "🏫", ["学校调薪", "學校調薪", "School Raise Review"], ["学校评估岗位津贴。准备资料越完整，机会越好。", "學校評估崗位津貼。準備資料越完整，機會越好。", "The school reviews role allowances. Better preparation improves the chance."], { cash: 500, salary: 120, successChance: 1 }, { cash: -500, salary: 900, financialIq: 1, failureCash: -400, successChance: 0.7 }],
    ["teacher-class-trip", "life", "🚌", ["班级活动临时支出", "班級活動臨時支出", "Class Activity Cost"], ["班级活动需要你先垫一部分费用。你要控制预算或升级体验？", "班級活動需要你先墊一部分費用。你要控制預算或升級體驗？", "A class activity needs upfront cash. Will you keep it simple or upgrade the experience?"], { cash: -500, financialIq: 1, successChance: 1 }, { cash: -1400, successCash: 700, failureCash: -700, successChance: 0.58 }],
    ["teacher-supplies", "expense", "✏️", ["教育用品采购", "教育用品採購", "Classroom Supplies"], ["教材要补货。批量购买更便宜，但会压缩安全垫。", "教材要補貨。批量購買更便宜，但會壓縮安全墊。", "Class supplies need restocking. Bulk buying is cheaper, but uses cushion cash."], { cash: -450, successChance: 1 }, { cash: -1200, baseExpenses: -80, successChance: 1 }],
    ["teacher-holiday-income", "job", "☀️", ["寒暑假收入变化", "寒暑假收入變化", "Holiday Income Shift"], ["假期让主动收入变化。你可以休息、兼职或准备课程包。", "假期讓主動收入變化。你可以休息、兼職或準備課程包。", "Break time changes active income. You can rest, take gigs, or prepare a course pack."], { cash: 300, financialIq: 1, successChance: 1 }, { cash: -600, salary: 360, successCash: 900, successChance: 0.66 }],
  ],
  engineer: [
    ["engineer-certification", "learn", "🧠", ["技术认证", "技術認證", "Tech Certification"], ["新认证可能提高薪资，也需要投入时间与现金。", "新認證可能提高薪資，也需要投入時間與現金。", "A certification may lift salary, but takes time and cash."], { cash: -900, financialIq: 1, successChance: 1 }, { cash: -2200, salary: 1100, financialIq: 2, failureCash: -500, successChance: 0.7 }],
    ["engineer-overtime", "job", "💻", ["加班奖金", "加班獎金", "Overtime Bonus"], ["项目冲刺可以换现金，但过度加班会推高生活成本。", "專案衝刺可以換現金，但過度加班會推高生活成本。", "A project push can earn cash, but too much overtime raises life costs."], { cash: 1200, successChance: 1 }, { cash: 2700, baseExpenses: 180, successChance: 1 }],
    ["engineer-layoff-risk", "crisis", "⚠️", ["裁员风险", "裁員風險", "Layoff Risk"], ["公司缩编传闻出现。现金垫与技能准备会影响结果。", "公司縮編傳聞出現。現金墊與技能準備會影響結果。", "Layoff rumors appear. Your cash cushion and skill prep matter."], { cash: -500, financialIq: 1, successChance: 1 }, { cash: -1400, salary: 800, failureCash: -2200, successChance: 0.5 }],
    ["engineer-startup-offer", "stock", "🚀", ["新创公司邀约", "新創公司邀約", "Startup Offer"], ["一家新创公司提供现金少、成长空间大的方案。", "一家新創公司提供現金少、成長空間大的方案。", "A startup offers lower cash now with possible upside."], { cash: 700, successChance: 1 }, { cash: -1600, salary: 420, successCash: 3200, failureCash: -1600, successChance: 0.48 }],
    ["engineer-stock-grant", "stock", "📈", ["股票奖励", "股票獎勵", "Stock Grant"], ["公司给出虚构股票奖励。你要马上卖出还是分批持有？", "公司給出虛構股票獎勵。你要馬上賣出還是分批持有？", "The company grants fictional stock. Sell now or hold in batches?"], { cash: 1100, successChance: 1 }, { cash: -300, successCash: 2600, failureCash: -900, successChance: 0.58 }],
    ["engineer-remote-work", "job", "🏡", ["远程工作机会", "遠距工作機會", "Remote Work Chance"], ["远程工作可节省通勤，也可能需要升级设备。", "遠距工作可節省通勤，也可能需要升級設備。", "Remote work can cut commuting costs, but may need equipment."], { baseExpenses: -160, successChance: 1 }, { cash: -1600, baseExpenses: -360, salary: 260, successChance: 0.78 }],
  ],
  designer: [
    ["designer-big-client", "business", "🎨", ["大客户项目", "大客戶專案", "Major Client Project"], ["客户预算不错，但范围管理很重要。", "客戶預算不錯，但範圍管理很重要。", "A client has a good budget, but scope control matters."], { cash: 1100, financialIq: 1, successChance: 1 }, { cash: -800, successCash: 3400, failureCash: -1200, salary: 280, successChance: 0.58 }],
    ["designer-late-payment", "crisis", "⏳", ["客户拖款", "客戶拖款", "Late Client Payment"], ["项目完成了，但客户付款延迟。现金储备能帮你撑过去。", "專案完成了，但客戶付款延遲。現金儲備能幫你撐過去。", "The work is done, but payment is late. Your cushion helps you wait."], { cash: -500, financialIq: 1, successChance: 1 }, { cash: -1200, successCash: 1500, failureCash: -900, successChance: 0.52 }],
    ["designer-equipment", "learn", "🖥️", ["设备升级", "設備升級", "Equipment Upgrade"], ["新设备能提升效率，但不是每次升级都值得。", "新設備能提升效率，但不是每次升級都值得。", "New equipment can improve speed, but not every upgrade is worth it."], { cash: -700, financialIq: 1, successChance: 1 }, { cash: -2400, salary: 520, successCash: 900, failureCash: -800, successChance: 0.64 }],
    ["designer-partner", "business", "🤝", ["合作伙伴邀约", "合作夥伴邀約", "Partner Offer"], ["伙伴想一起接案。分工可以放大能力，也会分享收入。", "夥伴想一起接案。分工可以放大能力，也會分享收入。", "A partner wants to team up. Collaboration can scale work, but shares revenue."], { cash: 500, financialIq: 1, successChance: 1 }, { cash: -900, salary: 460, successCash: 1600, failureCash: -900, successChance: 0.6 }],
    ["designer-viral-portfolio", "lucky", "✨", ["作品爆红", "作品爆紅", "Portfolio Goes Viral"], ["一件作品突然被很多人看到。你要把热度变成稳定机会。", "一件作品突然被很多人看到。你要把熱度變成穩定機會。", "A piece of work gets attention. Try turning the buzz into steady opportunity."], { cash: 900, successChance: 1 }, { cash: -700, salary: 620, successCash: 2100, failureCash: -500, successChance: 0.66 }],
    ["designer-slow-season", "crisis", "🌧️", ["淡季收入下降", "淡季收入下降", "Slow Season"], ["接案变少。你可以缩支、学习，或推出小产品。", "接案變少。你可以縮支、學習，或推出小產品。", "Client work slows down. You can cut costs, learn, or launch a small product."], { baseExpenses: -180, successChance: 1 }, { cash: -1000, salary: 420, successCash: 900, failureCash: -1100, successChance: 0.55 }],
  ],
  entrepreneur: [
    ["entrepreneur-expand-shop", "business", "🏪", ["店铺扩张", "店鋪擴張", "Shop Expansion"], ["你的店有机会扩张。成长和现金压力会一起出现。", "你的店有機會擴張。成長和現金壓力會一起出現。", "Your shop can expand. Growth and cash pressure arrive together."], { cash: -900, salary: 220, successChance: 1 }, { cash: -3200, salary: 950, successCash: 1700, failureCash: -1800, successChance: 0.55 }],
    ["entrepreneur-materials", "crisis", "📦", ["原料涨价", "原料漲價", "Material Price Jump"], ["原料涨价会压缩利润。你要调价、换供应商或吸收成本。", "原料漲價會壓縮利潤。你要調價、換供應商或吸收成本。", "Materials get pricier. Adjust price, change supplier, or absorb the cost."], { cash: -500, financialIq: 1, successChance: 1 }, { cash: -1400, baseExpenses: 240, successCash: 1100, failureCash: -900, successChance: 0.56 }],
    ["entrepreneur-rush-orders", "lucky", "🔥", ["爆单", "爆單", "Order Rush"], ["订单突然增加。接得太多可能影响品质。", "訂單突然增加。接得太多可能影響品質。", "Orders spike. Taking too many may hurt quality."], { cash: 1300, successChance: 1 }, { cash: -1200, successCash: 3900, failureCash: -1300, salary: 280, successChance: 0.58 }],
    ["entrepreneur-new-rival", "market", "🏁", ["新竞争者", "新競爭者", "New Competitor"], ["附近出现新店。你可以稳住老客户，或做一次品牌升级。", "附近出現新店。你可以穩住老客戶，或做一次品牌升級。", "A nearby shop opens. Keep loyal customers or upgrade your brand."], { cash: -600, financialIq: 1, successChance: 1 }, { cash: -2100, salary: 520, successCash: 1600, failureCash: -1200, successChance: 0.57 }],
    ["entrepreneur-staffing", "life", "👥", ["员工问题", "員工問題", "Staffing Issue"], ["员工请假让营运变紧。制度和训练会减少未来风险。", "員工請假讓營運變緊。制度和訓練會減少未來風險。", "Staff absence strains operations. Systems and training reduce future risk."], { cash: -700, successChance: 1 }, { cash: -1600, baseExpenses: -120, financialIq: 1, successChance: 0.72 }],
    ["entrepreneur-second-location", "property", "🏬", ["新店机会", "新店機會", "Second Location"], ["一个小铺位空出来了。租金现金流和固定成本都要算。", "一個小鋪位空出來了。租金現金流和固定成本都要算。", "A small storefront opens up. Rent cash flow and fixed costs both matter."], { cash: -800, financialIq: 1, successChance: 1 }, { cash: -3600, salary: 850, baseExpenses: 360, successCash: 2200, failureCash: -1700, successChance: 0.52 }],
  ],
};

export const roleSpecificEventDefinitions = Object.entries(roleEventSeeds).flatMap(([roleId, seeds]) => seeds.map((seed) => {
  const [id, category, icon, title, description, steadyEffects, boldEffects] = seed;
  const steady = option("steady", "low", steadyEffects, category === "stock" ? "ticker" : category === "property" ? "home" : category === "business" ? "shop" : category === "learn" ? "book" : category === "crisis" ? "shield" : "work", {
    zhCN: "稳健处理",
    zhTW: "穩健處理",
    en: "Steady Move",
  }, {
    zhCN: "控制现金压力，保留下一回合选择权。",
    zhTW: "控制現金壓力，保留下回合選擇權。",
    en: "Control cash pressure and keep choices open next turn.",
  });
  const bold = option("bold", ["crisis", "expense"].includes(category) ? "medium" : "high", boldEffects, category === "business" ? "shop" : category === "property" ? "home" : category === "stock" ? "ticker" : category === "learn" ? "book" : "work", {
    zhCN: "积极推进",
    zhTW: "積極推進",
    en: "Push Ahead",
  }, {
    zhCN: "机会更大，但现金流和安全垫也要承受压力。",
    zhTW: "機會更大，但現金流和安全墊也要承受壓力。",
    en: "More upside, with more pressure on cash flow and cushion.",
  });
  return { ...strategyEvent(id, category, icon, tri(title), tri(description), [steady, bold]), roleId, roleSpecific: true };
}));

const chainSeeds = [
  ["street-booth", "business", "🏪", ["朋友邀请合作摆摊", "朋友邀請合作擺攤", "Friend's Booth Idea"], ["试摊", "試攤", "Test the Booth"], ["加宣传", "加宣傳", "Add Promotion"], ["变成稳定小收入", "變成穩定小收入", "Turns into Small Steady Income"]],
  ["starter-rental", "property", "🏠", ["看见一间小房产", "看見一間小房產", "Small Property Viewing"], ["做租金调查", "做租金調查", "Research Rent"], ["试租管理", "試租管理", "Trial Rental Management"], ["出租表现揭晓", "出租表現揭曉", "Rental Result"]],
  ["skill-course", "learn", "🎓", ["报名技能课程", "報名技能課程", "Enroll in a Skill Course"], ["完成练习", "完成練習", "Finish Practice"], ["参加测验", "參加測驗", "Take the Test"], ["能力转成收入", "能力轉成收入", "Skill Becomes Income"]],
  ["market-watch", "market", "📊", ["市场开始波动", "市場開始波動", "Market Starts Moving"], ["小额观察", "小額觀察", "Observe Small"], ["分批行动", "分批行動", "Act in Batches"], ["复盘仓位", "複盤倉位", "Review Position Size"]],
  ["family-budget", "life", "👪", ["家庭预算讨论", "家庭預算討論", "Family Budget Talk"], ["一起列支出", "一起列支出", "List Expenses Together"], ["调整固定支出", "調整固定支出", "Adjust Fixed Costs"], ["现金垫改善", "現金墊改善", "Cushion Improves"]],
  ["credit-rebuild", "bank", "🏦", ["信用分整理", "信用分整理", "Credit Reset Plan"], ["按时还款", "準時還款", "Pay on Time"], ["降低高息债", "降低高息債", "Reduce Costly Debt"], ["贷款条件改善", "貸款條件改善", "Better Loan Terms"]],
  ["insurance-shield", "insurance", "🛡️", ["检查保障缺口", "檢查保障缺口", "Check Protection Gap"], ["选择基础保障", "選擇基礎保障", "Choose Basic Cover"], ["危机中使用保障", "危機中使用保障", "Use Cover in Trouble"], ["损失被缓冲", "損失被緩衝", "Loss Is Cushioned"]],
  ["tax-prep", "tax", "🧾", ["税务资料混乱", "稅務資料混亂", "Messy Tax Papers"], ["先整理凭证", "先整理憑證", "Sort Receipts"], ["分批预留税款", "分批預留稅款", "Set Aside in Parts"], ["补缴压力降低", "補繳壓力降低", "Payment Pressure Drops"]],
];

export const eventChainDefinitions = chainSeeds.map(([chainId, category, icon, start, stage2, stage3, finish]) => ({
  id: chainId,
  category,
  icon,
  title: tri(start),
  stages: [start, stage2, stage3, finish].map((title, index) => ({
    id: `${chainId}-stage-${index + 1}`,
    title: tri(title),
    description: tri([
      `连续事件第 ${index + 1} 阶段：你的选择会影响后续结果。`,
      `連續事件第 ${index + 1} 階段：你的選擇會影響後續結果。`,
      `Story stage ${index + 1}: your choice affects what comes next.`,
    ]),
    options: [
      option("steady", "low", { cash: index === 0 ? -500 : 300, financialIq: 1, successChance: 1 }, category, tri(["稳健推进", "穩健推進", "Steady Progress"]), tri(["先保护现金流，让剧情稳稳前进。", "先保護現金流，讓劇情穩穩前進。", "Protect cash flow and move the story forward steadily."])),
      option("bold", index >= 2 ? "high" : "medium", { cash: -900 + index * 200, salary: category === "business" || category === "learn" ? 220 : 0, baseExpenses: category === "tax" || category === "bank" ? -90 : 0, successCash: 900 + index * 450, failureCash: -700 - index * 250, successChance: 0.64 - index * 0.04 }, category, tri(["加速推进", "加速推進", "Speed It Up"]), tri(["更有戏剧性，也更需要安全垫。", "更有戲劇性，也更需要安全墊。", "More dramatic, and it needs a stronger cushion."])),
    ],
  })),
}));

export const luckyCrisisDefinitions = [
  ...[
    ["bonus-envelope", "lucky", "🎁", ["临时奖金", "臨時獎金", "Surprise Bonus"], ["一笔小奖金出现。你可以补安全垫，或投入一个小机会。", "一筆小獎金出現。你可以補安全墊，或投入一個小機會。", "A small bonus appears. Build cushion or use a small opportunity."], { cash: 1000, successChance: 1 }, { cash: -600, successCash: 1800, financialIq: 1, successChance: 0.7 }],
    ["cheap-entry", "lucky", "💎", ["低价买入机会", "低價買入機會", "Lower Entry Price"], ["市场给出一个低门槛机会。低价不等于零风险。", "市場給出一個低門檻機會。低價不等於零風險。", "The market offers a lower entry. Cheap does not mean risk-free."], { financialIq: 1, successChance: 1 }, { cash: -1200, successCash: 2100, failureCash: -600, successChance: 0.62 }],
    ["mentor-help", "lucky", "🤝", ["贵人帮助", "貴人幫助", "Helpful Mentor"], ["有人愿意分享经验。你可以听建议，或一起行动。", "有人願意分享經驗。你可以聽建議，或一起行動。", "Someone shares experience. Take the advice or act with them."], { financialIq: 2, successChance: 1 }, { cash: -700, financialIq: 2, successCash: 1300, failureCash: -500, successChance: 0.67 }],
    ["repair-discount", "lucky", "🔧", ["折扣维修", "折扣維修", "Discount Repair"], ["维修师傅给出折扣。你可以修好，也可顺便升级。", "維修師傅給出折扣。你可以修好，也可順便升級。", "A repair discount appears. Fix it, or upgrade while it is cheaper."], { cash: -300, successChance: 1 }, { cash: -900, baseExpenses: -120, successChance: 1 }],
  ].map((seed) => buildLuckyCrisis(seed, false)),
  ...[
    ["medical-bill", "crisis", "🏥", ["医疗支出", "醫療支出", "Medical Bill"], ["突发医疗开销来了。保险和现金垫会降低冲击。", "突發醫療開銷來了。保險和現金墊會降低衝擊。", "A medical cost appears. Insurance and cushion reduce the hit."], { cash: -900, successChance: 1 }, { cash: -1800, financialIq: 1, successChance: 1 }],
    ["late-client", "crisis", "⏰", ["客户拖欠", "客戶拖欠", "Client Delay"], ["收入延迟到账。你要催款，还是先调整支出？", "收入延遲到帳。你要催款，還是先調整支出？", "Income arrives late. Follow up, or adjust expenses first?"], { baseExpenses: -150, successChance: 1 }, { cash: -700, successCash: 1200, failureCash: -900, successChance: 0.55 }],
    ["interest-jump", "crisis", "📉", ["利率上涨", "利率上漲", "Rate Increase"], ["贷款成本变高。先看月现金流，再决定是否借款。", "貸款成本變高。先看月現金流，再決定是否借款。", "Borrowing costs rise. Check monthly cash flow before borrowing."], { financialIq: 1, successChance: 1 }, { cash: -600, baseExpenses: 220, failureCash: -700, successChance: 0.58 }],
    ["family-emergency", "crisis", "🚨", ["家庭临时支出", "家庭臨時支出", "Family Emergency"], ["家庭支出突然出现。安全垫越好，选择越多。", "家庭支出突然出現。安全墊越好，選擇越多。", "A family cost appears. A stronger cushion creates more options."], { cash: -800, successChance: 1 }, { cash: -1600, successCash: 500, failureCash: -700, successChance: 0.54 }],
  ].map((seed) => buildLuckyCrisis(seed, true)),
];

export const competitionEventDefinitions = [
  competitionEvent("scarce-rental", "property", "🏠", ["稀缺出租房", "稀缺出租房", "Scarce Rental"], ["当前玩家先决定。若放弃，下一位玩家可抢机会。", "目前玩家先決定。若放棄，下一位玩家可搶機會。", "Current player decides first. If they pass, the next player may claim it."], -2200, 460),
  competitionEvent("shared-booth", "business", "🏪", ["热门摊位名额", "熱門攤位名額", "Popular Booth Slot"], ["城市只剩一个好摊位。可以小额出价，也可以保留现金。", "城市只剩一個好攤位。可以小額出價，也可以保留現金。", "Only one good booth spot is left. Bid lightly or keep cash."], -1400, 340),
  competitionEvent("market-tip", "stock", "📈", ["公共机会卡", "公共機會卡", "Shared Opportunity Card"], ["所有玩家看到同一个市场消息，但每个人现金垫不同。", "所有玩家看到同一個市場消息，但每個人現金墊不同。", "Everyone sees the same market signal, but each cushion is different."], -900, 0),
  competitionEvent("learning-seat", "learn", "🎓", ["课程剩余名额", "課程剩餘名額", "Last Course Seat"], ["课程名额有限。学习提升不会保证赚钱，但会改善判断。", "課程名額有限。學習提升不會保證賺錢，但會改善判斷。", "A course has one seat left. Learning does not guarantee profit, but improves judgment."], -800, 180),
];

export const educationFeedbackDefinitions = [
  tri(["保留现金能让你在危机和机会之间有更多选择。", "保留現金能讓你在危機和機會之間有更多選擇。", "Keeping cash gives you more choices during trouble and opportunity."]),
  tri(["高收入不等于高现金流；每月支出也要一起看。", "高收入不等於高現金流；每月支出也要一起看。", "High income is not the same as strong cash flow; expenses matter too."]),
  tri(["借钱投资前，先确认月供不会压垮现金流。", "借錢投資前，先確認月供不會壓垮現金流。", "Before borrowing to invest, check that payments do not crush cash flow."]),
  tri(["房产也可能有维修和空置风险。", "房產也可能有維修和空置風險。", "Real estate can also have repair and vacancy risk."]),
  tri(["投资不是只看涨跌，也要看现金流和仓位大小。", "投資不是只看漲跌，也要看現金流和部位大小。", "Investing is not only about price moves; cash flow and position size matter."]),
  tri(["保险是在转移重大风险，不是让风险消失。", "保險是在轉移重大風險，不是讓風險消失。", "Insurance transfers big risks; it does not make risk disappear."]),
];

export const comboDefinitions = [
  { id: "smart-2", threshold: 2, rewardCash: 250, title: tri(["财商判断 2 连击", "財商判斷 2 連擊", "Money Judgment Combo x2"]) },
  { id: "steady-3", threshold: 3, rewardCash: 420, title: tri(["稳健经营 3 连击", "穩健經營 3 連擊", "Steady Operator Combo x3"]) },
  { id: "asset-flow-2", threshold: 2, rewardCash: 300, title: tri(["现金流提升连击", "現金流提升連擊", "Cash-Flow Boost Combo"]) },
];

export const milestoneFeedbackDefinitions = [
  ["first-asset", ["第一项资产", "第一項資產", "First Asset"], "🏠"],
  ["first-passive-income", ["第一次被动收入", "第一次被動收入", "First Passive Income"], "💧"],
  ["positive-flow-1000", ["月现金流首次超过 1,000", "月現金流首次超過 1,000", "Cash Flow Above 1,000"], "✨"],
  ["freedom-25", ["财务自由进度 25%", "財務自由進度 25%", "Financial Freedom 25%"], "🥉"],
  ["freedom-50", ["财务自由进度 50%", "財務自由進度 50%", "Financial Freedom 50%"], "🥈"],
  ["freedom-75", ["财务自由进度 75%", "財務自由進度 75%", "Financial Freedom 75%"], "🥇"],
  ["freedom-100", ["财务自由进度 100%", "財務自由進度 100%", "Financial Freedom 100%"], "🏆"],
  ["first-minigame-win", ["第一次完成小游戏", "第一次完成小遊戲", "First Mini-Game Win"], "🎮"],
  ["crisis-recovery", ["第一次从危机恢复", "第一次從危機恢復", "First Crisis Recovery"], "🛡️"],
  ["first-rank-one", ["第一次排行榜第一", "第一次排行榜第一", "First Leaderboard Lead"], "⭐"],
  ["first-chain-complete", ["第一次完成事件链", "第一次完成事件鏈", "First Story Chain Complete"], "📖"],
].map(([id, title, icon]) => ({ id, title: tri(title), icon }));

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
  miniGame("business-operator", "business", "🏪", {
    zhCN: "小游戏：小生意经营",
    zhTW: "小遊戲：小生意經營",
    en: "Mini Game: Run a Small Business",
  }, {
    zhCN: "调整价格、成本和宣传。利润来自收入减成本，不是只看销量。",
    zhTW: "調整價格、成本和宣傳。利潤來自收入減成本，不是只看銷量。",
    en: "Set price, cost, and promotion. Profit is revenue minus cost, not just sales.",
  }, [
    miniChoice("balanced-shop", { cash: 700, salary: 180, financialIq: 1 }, true, {
      zhCN: "价格适中／控制成本／小额宣传",
      zhTW: "價格適中／控制成本／小額宣傳",
      en: "Fair price / controlled cost / small promotion",
    }, {
      zhCN: "顾客和利润都稳定，小生意现金流变好。",
      zhTW: "顧客和利潤都穩定，小生意現金流變好。",
      en: "Customers and profit stay steady, improving business cash flow.",
    }),
    miniChoice("cheap-growth", { cash: 250, failureCash: -500, successChance: 0.55 }, false, {
      zhCN: "低价冲销量／成本不变／大宣传",
      zhTW: "低價衝銷量／成本不變／大宣傳",
      en: "Low price / same cost / big promotion",
    }, {
      zhCN: "销量可能增加，但利润不一定跟着变好。",
      zhTW: "銷量可能增加，但利潤不一定跟著變好。",
      en: "Sales may rise, but profit may not improve.",
    }),
    miniChoice("premium-risk", { cash: -400, successCash: 1400, failureCash: -900, successChance: 0.5 }, false, {
      zhCN: "高价精品／高成本／少宣传",
      zhTW: "高價精品／高成本／少宣傳",
      en: "Premium price / high cost / little promotion",
    }, {
      zhCN: "定位清楚，但需求不足时现金会吃紧。",
      zhTW: "定位清楚，但需求不足時現金會吃緊。",
      en: "The position is clear, but weak demand can strain cash.",
    }),
  ]),
  miniGame("property-return", "property", "🏘️", {
    zhCN: "小游戏：房产回报比较",
    zhTW: "小遊戲：房產回報比較",
    en: "Mini Game: Compare Rentals",
  }, {
    zhCN: "三间房看起来都不错。重点是租金扣掉月供和管理成本后的现金流。",
    zhTW: "三間房看起來都不錯。重點是租金扣掉月供和管理成本後的現金流。",
    en: "All three rentals look decent. Focus on rent after payment and management cost.",
  }, [
    miniChoice("positive-rental", { cash: 800, salary: 120, financialIq: 1 }, true, {
      zhCN: "小公寓：租金略高于月供和管理费",
      zhTW: "小公寓：租金略高於月供和管理費",
      en: "Small apartment: rent is above payment and fees",
    }, {
      zhCN: "你选择了现金流比较健康的项目。",
      zhTW: "你選擇了現金流比較健康的項目。",
      en: "You chose the property with healthier cash flow.",
    }),
    miniChoice("price-only", { cash: -300, financialIq: 1 }, false, {
      zhCN: "豪华房：涨价故事好，但每月倒贴",
      zhTW: "豪華房：漲價故事好，但每月倒貼",
      en: "Fancy unit: exciting price story, but negative monthly flow",
    }, {
      zhCN: "只看房价故事，容易忽略每月现金流。",
      zhTW: "只看房價故事，容易忽略每月現金流。",
      en: "Looking only at price stories can hide monthly cash-flow problems.",
    }),
    miniChoice("too-tight", { cash: -600, baseExpenses: 80 }, false, {
      zhCN: "大房子：租金高，但首付吃光现金垫",
      zhTW: "大房子：租金高，但頭期款吃光現金墊",
      en: "Large home: high rent, but down payment drains cushion",
    }, {
      zhCN: "现金垫太薄，遇到维修会很被动。",
      zhTW: "現金墊太薄，遇到維修會很被動。",
      en: "A thin cushion makes repairs harder to handle.",
    }),
  ]),
  miniGame("loan-choice", "bank", "🏦", {
    zhCN: "小游戏：贷款选择",
    zhTW: "小遊戲：貸款選擇",
    en: "Mini Game: Choose a Loan",
  }, {
    zhCN: "比较月供、总成本和现金流压力。暂不贷款有时也是选择。",
    zhTW: "比較月供、總成本和現金流壓力。暫不貸款有時也是選擇。",
    en: "Compare payment, total cost, and cash-flow pressure. Passing can be a choice too.",
  }, [
    miniChoice("small-safe-loan", { cash: 700, baseExpenses: 40, financialIq: 1 }, true, {
      zhCN: "低利率长年期：月供较低，先保持弹性",
      zhTW: "低利率長年期：月供較低，先保持彈性",
      en: "Lower-rate longer term: lower payment, more flexibility",
    }, {
      zhCN: "你先控制月供，避免现金流被压住。",
      zhTW: "你先控制月供，避免現金流被壓住。",
      en: "You controlled the payment so cash flow stays flexible.",
    }),
    miniChoice("fast-expensive", { cash: 1000, baseExpenses: 220, financialIq: 1 }, false, {
      zhCN: "高利率短年期：总期数少，但月供很高",
      zhTW: "高利率短年期：總期數少，但月供很高",
      en: "Higher-rate short term: fewer months, much higher payment",
    }, {
      zhCN: "总期数少不代表每月压力小。",
      zhTW: "總期數少不代表每月壓力小。",
      en: "Fewer months does not mean lighter monthly pressure.",
    }),
    miniChoice("no-loan", { financialIq: 1 }, true, {
      zhCN: "暂不贷款：等现金流更稳再说",
      zhTW: "暫不貸款：等現金流更穩再說",
      en: "No loan yet: wait for steadier cash flow",
    }, {
      zhCN: "没有合适机会时，不借款也可能是好决定。",
      zhTW: "沒有合適機會時，不借款也可能是好決定。",
      en: "When the opportunity is not right, not borrowing can be smart.",
    }),
  ]),
  miniGame("market-timing", "market", "📊", {
    zhCN: "小游戏：市场时机判断",
    zhTW: "小遊戲：市場時機判斷",
    en: "Mini Game: Market Timing",
  }, {
    zhCN: "看到短趋势不等于能预测未来。重点是风险、仓位和现金垫。",
    zhTW: "看到短趨勢不等於能預測未來。重點是風險、部位和現金墊。",
    en: "A short trend is not a prediction. Focus on risk, position size, and cushion.",
  }, [
    miniChoice("observe", { financialIq: 1, cash: 250 }, true, {
      zhCN: "高波动：继续观察，保留现金",
      zhTW: "高波動：繼續觀察，保留現金",
      en: "High volatility: observe and keep cash",
    }, {
      zhCN: "你没有猜未来，而是先控制风险。",
      zhTW: "你沒有猜未來，而是先控制風險。",
      en: "You did not guess the future; you controlled risk first.",
    }),
    miniChoice("small-position", { cash: -500, successCash: 900, failureCash: -350, successChance: 0.62, financialIq: 1 }, true, {
      zhCN: "上涨但波动大：小额投入",
      zhTW: "上漲但波動大：小額投入",
      en: "Rising but volatile: take a small position",
    }, {
      zhCN: "小仓位让你参与机会，同时保留安全垫。",
      zhTW: "小部位讓你參與機會，同時保留安全墊。",
      en: "A small position lets you join the opportunity while keeping cushion.",
    }),
    miniChoice("all-in", { cash: -1800, successCash: 2400, failureCash: -1600, successChance: 0.42 }, false, {
      zhCN: "看到上涨就全力投入",
      zhTW: "看到上漲就全力投入",
      en: "Go big after seeing a rise",
    }, {
      zhCN: "追涨可能成功，也可能把现金垫用光。",
      zhTW: "追漲可能成功，也可能把現金墊用光。",
      en: "Chasing a rise may work, or drain your cushion.",
    }),
  ]),
];

export const earlyPacePlan = [
  { turn: 1, kind: "strategy", categories: ["business", "property", "stock"] },
  { turn: 2, kind: "strategy", categories: ["job", "stock", "business"] },
  { turn: 3, kind: "roleEvent" },
  { turn: 4, kind: "luckyCrisis", mood: "crisis" },
  { turn: 5, kind: "strategy", categories: ["expense", "medical", "life"] },
  { turn: 6, kind: "minigame", id: "budget-allocation" },
  { turn: 7, kind: "minigame", id: "opportunity-spotting" },
  { turn: 8, kind: "eventChain" },
  { turn: 9, kind: "competition" },
  { turn: 10, kind: "minigame", id: "business-operator" },
  { turn: 11, kind: "eventChain" },
  { turn: 12, kind: "ai" },
  { turn: 13, kind: "minigame", id: "property-return" },
  { turn: 14, kind: "roleEvent" },
  { turn: 15, kind: "summary" },
];

export function migrateFunState(state) {
  if (!state || typeof state !== "object") return state;
  const saved = state.funPacing && typeof state.funPacing === "object" ? state.funPacing : {};
  state.funVersion = FUN_SCHEMA_VERSION;
  state.funPacing = {
    earlyPaceDone: uniqueStrings(saved.earlyPaceDone).slice(0, 20),
    seenEventIds: uniqueStrings(saved.seenEventIds).slice(0, 120),
    completedMiniGames: uniqueStrings(saved.completedMiniGames).slice(0, 20),
    completedChains: uniqueStrings(saved.completedChains).slice(0, 20),
    claimedCombos: uniqueStrings(saved.claimedCombos).slice(0, 20),
    triggeredMilestones: uniqueStrings(saved.triggeredMilestones).slice(0, 30),
    strategyChoices: clampCount(saved.strategyChoices),
    riskEvents: clampCount(saved.riskEvents),
    successRewards: clampCount(saved.successRewards),
    crisisEvents: clampCount(saved.crisisEvents),
    aiInteractions: clampCount(saved.aiInteractions),
    competitionMoments: clampCount(saved.competitionMoments),
    comebackOffers: clampCount(saved.comebackOffers),
    luckyEvents: clampCount(saved.luckyEvents),
    goalCompletions: clampCount(saved.goalCompletions),
    comboStreak: clampCount(saved.comboStreak),
    bestCombo: clampCount(saved.bestCombo),
    lastOutcome: saved.lastOutcome || null,
    lastSummaryRound: clampCount(saved.lastSummaryRound),
  };
  state.shortTermFunGoals = normalizeFunGoals(state.shortTermFunGoals);
  state.funEventChains = normalizeEventChains(state.funEventChains);
  state.recentFunEvents = Array.isArray(state.recentFunEvents) ? state.recentFunEvents.slice(-24).map(normalizeRecentFunEvent).filter(Boolean) : [];
  state.turnFunSummaries = Array.isArray(state.turnFunSummaries) ? state.turnFunSummaries.slice(-20).map(normalizeTurnSummary).filter(Boolean) : [];
  state.cityUpgrades = Array.isArray(state.cityUpgrades) ? state.cityUpgrades.slice(-8).map(normalizeCityUpgrade).filter(Boolean) : [];
  return state;
}

export function selectPacedEngagement(state, tile, random = Math.random) {
  migrateFunState(state);
  const turn = currentEarlyTurn(state);
  if (turn < 1 || turn > 15) return null;
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
  if (slot.kind === "roleEvent") {
    const event = selectRoleSpecificEvent(state, random);
    return event ? { kind: "strategy", turn, event } : null;
  }
  if (slot.kind === "eventChain") {
    const event = selectEventChainStage(state, random);
    return event ? { kind: "strategy", turn, event } : null;
  }
  if (slot.kind === "luckyCrisis") {
    const event = selectLuckyCrisisEvent(state, { mood: slot.mood }, random);
    return event ? { kind: "strategy", turn, event } : null;
  }
  if (slot.kind === "competition") {
    const event = selectCompetitionEvent(state, random);
    return event ? { kind: "strategy", turn, event } : null;
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
  state.funPacing.earlyPaceDone = state.funPacing.earlyPaceDone.slice(-20);
}

export function recordFunOutcome(state, outcome = {}) {
  migrateFunState(state);
  const pacing = state.funPacing;
  if (outcome.kind === "strategy") pacing.strategyChoices += 1;
  if (outcome.kind === "competition") pacing.competitionMoments += 1;
  if (outcome.kind === "comeback") pacing.comebackOffers += 1;
  if (outcome.kind === "lucky" || outcome.isLucky) pacing.luckyEvents += 1;
  if (outcome.kind === "minigame" && outcome.id && !pacing.completedMiniGames.includes(outcome.id)) {
    pacing.completedMiniGames.push(outcome.id);
    pacing.completedMiniGames = pacing.completedMiniGames.slice(-20);
  }
  if (outcome.chainId && outcome.chainComplete && !pacing.completedChains.includes(outcome.chainId)) {
    pacing.completedChains.push(outcome.chainId);
    pacing.completedChains = pacing.completedChains.slice(-20);
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
  state.recentFunEvents = [{
    id: outcome.id || `fun-${Date.now()}`,
    kind: outcome.kind || "event",
    isCrisis: Boolean(outcome.isCrisis),
    isLucky: Boolean(outcome.isLucky),
    success: Boolean(outcome.success),
    round: Number(state.round || 0),
  }, ...(state.recentFunEvents || [])].slice(0, 24);
  const comboReward = evaluateComboReward(state, outcome);
  const milestones = evaluateMilestoneFeedback(state, outcome);
  const completedGoals = updateFunGoals(state, outcome);
  completedGoals.comboReward = comboReward;
  completedGoals.milestones = milestones;
  return completedGoals;
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
    eventChains: state.funPacing.completedChains.length,
    goalCompletions: goals.filter((item) => item.completed).length,
    successRewards: state.funPacing.successRewards,
    riskEvents: state.funPacing.riskEvents,
    crisisEvents: state.funPacing.crisisEvents,
    luckyEvents: state.funPacing.luckyEvents,
    aiInteractions: state.funPacing.aiInteractions,
    competitionMoments: state.funPacing.competitionMoments,
    comebackOffers: state.funPacing.comebackOffers,
    cityUpgrades: state.cityUpgrades.length,
    comboStreak: state.funPacing.comboStreak,
    bestCombo: state.funPacing.bestCombo,
    activeGoal: goals.find((item) => !item.completed) || goals[0] || null,
    firstTenComplete: state.funPacing.earlyPaceDone.length >= 10,
    firstFifteenComplete: state.funPacing.earlyPaceDone.length >= 15,
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

export function selectRoleSpecificEvent(state, random = Math.random) {
  migrateFunState(state);
  const roleId = state?.career?.id || state?.currentCareerId || "teacher";
  const pool = roleSpecificEventDefinitions.filter((event) => event.roleId === roleId);
  return chooseFromPool(pool.length ? pool : roleSpecificEventDefinitions, state, currentEarlyTurn(state), random);
}

export function selectEventChainStage(state, random = Math.random) {
  migrateFunState(state);
  const active = state.funEventChains.find((chain) => !chain.completed && !chain.abandoned && chain.stageIndex > 0);
  const chain = active || chooseChainForState(state, random);
  if (!chain) return null;
  const definition = eventChainDefinitions.find((item) => item.id === chain.chainId);
  const stage = definition?.stages?.[chain.stageIndex || 0];
  if (!definition || !stage) return null;
  return {
    ...strategyEvent(stage.id, definition.category, definition.icon, stage.title, stage.description, stage.options),
    chainId: definition.id,
    stageIndex: chain.stageIndex || 0,
    chainStageCount: definition.stages.length,
  };
}

export function advanceFunEventChain(state, chainId, choiceId = "steady") {
  migrateFunState(state);
  const chain = state.funEventChains.find((item) => item.chainId === chainId);
  const definition = eventChainDefinitions.find((item) => item.id === chainId);
  if (!chain || !definition || chain.completed || chain.abandoned) return { completed: Boolean(chain?.completed), stageIndex: chain?.stageIndex || 0 };
  chain.choices.push(String(choiceId || "pass"));
  chain.stageIndex += 1;
  chain.updatedAtRound = Number(state.round || 0);
  if (choiceId === "pass") chain.abandoned = true;
  if (chain.stageIndex >= definition.stages.length) {
    chain.completed = true;
    chain.completedAtRound = Number(state.round || 0);
    if (!state.funPacing.completedChains.includes(chainId)) state.funPacing.completedChains.push(chainId);
  }
  return { completed: chain.completed, abandoned: chain.abandoned, stageIndex: chain.stageIndex };
}

export function selectLuckyCrisisEvent(state, options = {}, random = Math.random) {
  migrateFunState(state);
  const recentCrises = (state.recentFunEvents || []).slice(0, 2).filter((event) => event.isCrisis).length;
  const isEarly = Number(state.round || 1) <= 5;
  let pool = luckyCrisisDefinitions;
  if (options.mood === "crisis") pool = pool.filter((event) => event.mood === "crisis");
  if (recentCrises >= 2 || isEarly) pool = pool.filter((event) => event.mood !== "crisis" || event.softCrisis);
  return chooseFromPool(pool.length ? pool : luckyCrisisDefinitions.filter((event) => event.mood === "lucky"), state, currentEarlyTurn(state), random);
}

export function selectCompetitionEvent(state, random = Math.random) {
  migrateFunState(state);
  return chooseFromPool(competitionEventDefinitions, state, currentEarlyTurn(state), random);
}

export function shouldOfferComeback(state, leaderboard = []) {
  migrateFunState(state);
  if (!Array.isArray(leaderboard) || leaderboard.length < 2) return false;
  const currentId = state.currentPlayerId || leaderboard.find((item) => item.isCurrent)?.playerId;
  const current = leaderboard.find((item) => item.playerId === currentId);
  const leader = leaderboard[0];
  if (!current || !leader || current.playerId === leader.playerId) return false;
  const freedomGap = Number(leader.freedomPercent || 0) - Number(current.freedomPercent || 0);
  const netWorthGap = Number(leader.netWorth || 0) - Number(current.netWorth || 0);
  return freedomGap >= 25 || netWorthGap >= 50000;
}

export function buildComebackOpportunity(state, leaderboard = []) {
  if (!shouldOfferComeback(state, leaderboard)) return null;
  return strategyEvent("comeback-learning-spark", "learn", "✨", {
    zhCN: "翻盘机会：低门槛学习机会",
    zhTW: "翻盤機會：低門檻學習機會",
    en: "Comeback Chance: Low-Cost Learning",
  }, {
    zhCN: "你发现一个成本不高的练习机会。它不会直接送钱，但能帮你做出更好选择。",
    zhTW: "你發現一個成本不高的練習機會。它不會直接送錢，但能幫你做出更好選擇。",
    en: "You find a low-cost practice chance. It does not give free money, but can improve your next choices.",
  }, [
    option("practice", "low", { cash: -300, financialIq: 2, successChance: 1 }, "book", tri(["练习判断", "練習判斷", "Practice Judgment"]), tri(["花一点现金换更清楚的判断。", "花一點現金換更清楚的判斷。", "Spend a little cash for clearer judgment."])),
    option("small-gig", "medium", { cash: -600, salary: 180, successCash: 800, failureCash: -400, successChance: 0.62 }, "work", tri(["小额副业", "小額副業", "Small Side Gig"]), tri(["不是系统送你赢，而是给你一个重新调整的机会。", "不是系統送你贏，而是給你一個重新調整的機會。", "This is not a free win, just a chance to adjust."])),
  ]);
}

export function buildTurnFunSummary(state, before = {}, after = {}) {
  migrateFunState(state);
  const summary = normalizeTurnSummary({
    id: `fun-summary-${state.currentPlayerId || "solo"}-${state.round || 0}-${Date.now()}`,
    round: Number(state.round || 0),
    playerId: state.currentPlayerId || "solo",
    cashDelta: safeDelta(after.cash, before.cash),
    cashflowDelta: safeDelta(after.monthlyCashflow, before.monthlyCashflow),
    rankDelta: safeDelta(before.rank, after.rank),
    newAssets: Math.max(0, Number(after.assets || 0) - Number(before.assets || 0)),
    riskNote: latestEducationFeedback(state),
  });
  state.turnFunSummaries = [summary, ...(state.turnFunSummaries || [])].slice(0, 20);
  return summary;
}

export function simulateFirstFifteenFunTurns(careerId = "teacher", random = Math.random) {
  const state = migrateFunState({ round: 2, position: 0, career: { id: careerId }, cash: 12000, salary: 18000, baseExpenses: 14500, settledEvents: [] });
  const kinds = [];
  for (let turn = 1; turn <= 15; turn += 1) {
    state.round = turn + 1;
    const engagement = selectPacedEngagement(state, { type: turn % 2 ? "businessOpportunity" : "market" }, random);
    if (!engagement) continue;
    kinds.push(engagement.kind);
    if (engagement.kind === "strategy") {
      const event = engagement.event;
      const selected = event.options.find((item) => item.id === "balanced" || item.id === "bold") || event.options[0];
      if (event.chainId) advanceFunEventChain(state, event.chainId, selected.id);
      recordFunOutcome(state, {
        kind: event.competition ? "competition" : event.mood || "strategy",
        id: event.id,
        chainId: event.chainId,
        chainComplete: event.chainId ? state.funEventChains.find((chain) => chain.chainId === event.chainId)?.completed : false,
        riskLevel: selected.risk,
        isCrisis: event.mood === "crisis",
        isLucky: event.mood === "lucky",
        success: selected.risk !== "high",
      });
    } else if (engagement.kind === "minigame") {
      recordFunOutcome(state, { kind: "minigame", id: engagement.game.id, success: true });
    } else if (engagement.kind === "ai") {
      recordFunOutcome(state, { kind: "ai", id: `ai-${turn}`, success: true });
    }
    markPacedTurnDone(state, turn);
  }
  return { state, kinds, stats: funStats(state) };
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

function tri(values) {
  return { zhCN: values[0], zhTW: values[1], en: values[2] };
}

function buildLuckyCrisis(seed, isCrisis) {
  const [id, category, icon, title, description, steadyEffects, boldEffects] = seed;
  return {
    ...strategyEvent(id, category, icon, tri(title), tri(description), [
      option("steady", "low", steadyEffects, isCrisis ? "shield" : "heart", tri(isCrisis ? ["先保护现金流", "先保護現金流", "Protect Cash Flow"] : ["稳稳接住好运", "穩穩接住好運", "Use the Good Luck Wisely"]), tri(isCrisis ? ["降低冲击，保住下一回合选择。", "降低衝擊，保住下一回合選擇。", "Reduce the hit and keep choices open."] : ["把好运转成稳定进步。", "把好運轉成穩定進步。", "Turn luck into steady progress."])),
      option("bold", isCrisis ? "medium" : "high", boldEffects, isCrisis ? "work" : "shop", tri(isCrisis ? ["主动处理", "主動處理", "Actively Respond"] : ["抓住机会", "抓住機會", "Take the Chance"]), tri(isCrisis ? ["可能恢复更快，但要承担额外现金压力。", "可能恢復更快，但要承擔額外現金壓力。", "May recover faster, with extra cash pressure."] : ["可能带来更明显奖励，也需要安全垫。", "可能帶來更明顯獎勵，也需要安全墊。", "May bring a clearer reward, and needs a cushion."])),
    ]),
    mood: isCrisis ? "crisis" : "lucky",
    softCrisis: ["late-client", "interest-jump"].includes(id),
  };
}

function competitionEvent(id, category, icon, title, description, cost, salaryGain) {
  return {
    ...strategyEvent(id, category, icon, tri(title), tri(description), [
      option("claim", "medium", { cash: cost, salary: salaryGain, successCash: Math.abs(cost) * 0.55, failureCash: Math.round(cost * 0.35), successChance: 0.64 }, category, tri(["优先争取", "優先爭取", "Claim First"]), tri(["当前玩家先决定，机会有限但不是必赢。", "目前玩家先決定，機會有限但不是穩贏。", "The current player gets first choice. It is limited, not guaranteed."])),
      option("bid-light", "medium", { cash: Math.round(cost * 0.55), salary: Math.round(salaryGain * 0.55), financialIq: 1, successChance: 1 }, category, tri(["小额出价", "小額出價", "Light Bid"]), tri(["保留现金垫，也参与竞争。", "保留現金墊，也參與競爭。", "Keep cushion while joining the competition."])),
      option("pass", "low", { financialIq: 1, successChance: 1 }, "book", tri(["让下一位决定", "讓下一位決定", "Let Next Player Decide"]), tri(["放弃不是失败，现金也有机会价值。", "放棄不是失敗，現金也有機會價值。", "Passing is not failure; cash has option value."])),
    ]),
    competition: true,
    publicPool: true,
    timeLimitSeconds: 15,
  };
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

function normalizeEventChains(chains) {
  const saved = Array.isArray(chains) ? chains : [];
  return eventChainDefinitions.map((definition) => {
    const item = saved.find((chain) => chain.chainId === definition.id || chain.id === definition.id) || {};
    return {
      chainId: definition.id,
      stageIndex: Math.max(0, Math.min(definition.stages.length, Math.round(Number(item.stageIndex || 0)))),
      choices: uniqueStrings(item.choices).slice(-definition.stages.length),
      completed: Boolean(item.completed),
      abandoned: Boolean(item.abandoned),
      ownerPlayerId: item.ownerPlayerId || null,
      updatedAtRound: Number(item.updatedAtRound || 0),
      completedAtRound: item.completedAtRound ? Number(item.completedAtRound) : null,
    };
  });
}

function normalizeRecentFunEvent(event) {
  if (!event || typeof event !== "object") return null;
  return {
    id: String(event.id || ""),
    kind: String(event.kind || "event"),
    isCrisis: Boolean(event.isCrisis),
    isLucky: Boolean(event.isLucky),
    success: Boolean(event.success),
    round: Number(event.round || 0),
  };
}

function normalizeTurnSummary(summary) {
  if (!summary || typeof summary !== "object") return null;
  return {
    id: String(summary.id || `summary-${summary.round || 0}`),
    round: Number(summary.round || 0),
    playerId: String(summary.playerId || "solo"),
    cashDelta: Number(summary.cashDelta || 0),
    cashflowDelta: Number(summary.cashflowDelta || 0),
    rankDelta: Number(summary.rankDelta || 0),
    newAssets: Math.max(0, Math.round(Number(summary.newAssets || 0))),
    riskNote: summary.riskNote && typeof summary.riskNote === "object" ? summary.riskNote : educationFeedbackDefinitions[0],
  };
}

function chooseChainForState(state, random) {
  const currentPlayerId = state.currentPlayerId || null;
  const activeForPlayer = state.funEventChains.find((chain) => !chain.completed && !chain.abandoned && chain.ownerPlayerId === currentPlayerId);
  if (activeForPlayer) return activeForPlayer;
  const unused = state.funEventChains.filter((chain) => !chain.completed && !chain.abandoned && chain.stageIndex === 0);
  const chain = chooseFromPool(unused, state, currentEarlyTurn(state), random);
  if (chain && !chain.ownerPlayerId) chain.ownerPlayerId = currentPlayerId;
  return chain;
}

function evaluateComboReward(state, outcome) {
  if (!outcome.success) return null;
  const pacing = state.funPacing;
  const combo = comboDefinitions.find((item) => pacing.comboStreak >= item.threshold && !pacing.claimedCombos.includes(item.id));
  if (!combo) return null;
  pacing.claimedCombos.push(combo.id);
  pacing.claimedCombos = pacing.claimedCombos.slice(-20);
  state.cash = safeMoney(Number(state.cash || 0) + combo.rewardCash);
  return combo;
}

function evaluateMilestoneFeedback(state, outcome) {
  const pacing = state.funPacing;
  const ownedAssets = countAssets(state);
  const passiveIncome = Math.max(0, Number(state.passiveIncome || 0) || ownedAssets.businesses * 650 + ownedAssets.properties * 400);
  const expenses = Math.max(1, Number(state.baseExpenses || state.monthlyExpenses || 1));
  const monthlyCashflow = Number(state.salary || 0) + passiveIncome - expenses;
  const freedomPercent = Math.round((passiveIncome / expenses) * 100);
  const checks = [
    ["first-asset", ownedAssets.total > 0],
    ["first-passive-income", passiveIncome > 0],
    ["positive-flow-1000", monthlyCashflow >= 1000],
    ["freedom-25", freedomPercent >= 25],
    ["freedom-50", freedomPercent >= 50],
    ["freedom-75", freedomPercent >= 75],
    ["freedom-100", freedomPercent >= 100],
    ["first-minigame-win", outcome.kind === "minigame" && outcome.success],
    ["crisis-recovery", outcome.isCrisis && outcome.success],
    ["first-rank-one", outcome.rank === 1],
    ["first-chain-complete", outcome.chainComplete],
  ];
  const unlocked = [];
  checks.forEach(([id, passed]) => {
    if (!passed || pacing.triggeredMilestones.includes(id)) return;
    const milestone = milestoneFeedbackDefinitions.find((item) => item.id === id);
    if (milestone) unlocked.push(milestone);
    pacing.triggeredMilestones.push(id);
  });
  pacing.triggeredMilestones = pacing.triggeredMilestones.slice(-30);
  return unlocked;
}

function countAssets(state) {
  const properties = Array.isArray(state.ownedProperties) ? state.ownedProperties.length : 0;
  const businesses = Array.isArray(state.businessHoldings) ? state.businessHoldings.length : 0;
  const stocks = Array.isArray(state.stockHoldings) ? state.stockHoldings.length : 0;
  return { properties, businesses, stocks, total: properties + businesses + stocks };
}

function latestEducationFeedback(state) {
  const index = Math.abs(Number(state.round || 0) + Number(state.position || 0)) % educationFeedbackDefinitions.length;
  return educationFeedbackDefinitions[index];
}

function safeDelta(after, before) {
  const delta = Number(after || 0) - Number(before || 0);
  return Number.isFinite(delta) && !Object.is(delta, -0) ? Math.round(delta) : 0;
}

function uniqueStrings(values) {
  return [...new Set((Array.isArray(values) ? values : []).map((item) => String(item)).filter(Boolean))];
}

function clampCount(value) {
  return Math.max(0, Math.min(999, Math.round(Number(value || 0))));
}

function safeMoney(value) {
  const number = Math.round(Number(value || 0));
  return Number.isFinite(number) && !Object.is(number, -0) ? number : 0;
}
