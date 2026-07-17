export const interestProfiles = {
  low: {
    id: "low",
    label: "低利率",
    monthlyPersonalRate: 0.012,
    monthlyMortgageRate: 0.0042,
    description: "银行资金成本下降，借款月供会比较低。",
  },
  normal: {
    id: "normal",
    label: "普通",
    monthlyPersonalRate: 0.018,
    monthlyMortgageRate: 0.0056,
    description: "利率处在普通水平，贷款前仍要看月供。",
  },
  high: {
    id: "high",
    label: "高利率",
    monthlyPersonalRate: 0.026,
    monthlyMortgageRate: 0.0075,
    description: "借钱成本变高，贷款会让每月压力增加更多。",
  },
};

export const personalLoanProducts = [1000, 3000, 5000, 10000];

export const interestEvents = [
  {
    id: "rate-cut",
    title: "银行降息",
    level: "low",
    text: "利率下降，新的贷款和再融资月供会降低。",
  },
  {
    id: "rate-stable",
    title: "利率平稳",
    level: "normal",
    text: "利率维持普通水平，贷款成本没有明显变化。",
  },
  {
    id: "rate-hike",
    title: "银行升息",
    level: "high",
    text: "利率上升，新的贷款月供会变贵。",
  },
];

export const bankingLearningNotes = {
  credit:
    "信用分数像银行对你还款习惯的信任分，分数越高，通常越容易借到钱，利率也可能较低。",
  loan:
    "贷款会马上增加现金，但以后每个月都要还款，所以不是免费的钱。",
  mortgage:
    "房贷让你不用一次付完整房价，但每月租金要先扣掉月供和维护成本。",
  refinance:
    "再融资是在利率变低时重新安排贷款，目标是减少月供，但仍然要继续还本金。",
  bankruptcy:
    "现金变成负数代表钱不够付账，先想办法借款或出售资产，否则游戏会进入破产。",
};
