import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode
} from 'react';
import { DEFAULT_EDUCATOR_SETTINGS } from './game/defaultEducatorSettings';
import type { GameSettings, MonthSummary } from './game/types';

export type AppLanguage = 'en' | 'zh-Hant' | 'zh-Hans';

type MessageParams = Record<string, number | string>;
type MessageValue = string | ((params: MessageParams) => string);

interface I18nContextValue {
  formatCurrency: (value: number) => string;
  formatNumber: (value: number) => string;
  formatPercent: (value: number) => string;
  language: AppLanguage;
  setLanguage: (language: AppLanguage) => void;
  t: (key: TranslationKey, params?: MessageParams) => string;
}

const LANGUAGE_STORAGE_KEY = 'ice-cream-game/language';

const languageLabels: Record<AppLanguage, string> = {
  en: 'English',
  'zh-Hant': '繁體中文',
  'zh-Hans': '简体中文'
};

const localeByLanguage: Record<AppLanguage, string> = {
  en: 'en-US',
  'zh-Hant': 'zh-Hant-TW',
  'zh-Hans': 'zh-Hans-CN'
};

const translations = {
  en: {
    actionGameActions: 'Game actions',
    actionNewGame: 'New Game',
    actionNextDay: 'Next Day',
    actionRunComplete: 'Run Complete',
    appGameStatus: 'Game status',
    appLoadingGame: 'Loading game...',
    appSkipToControls: 'Skip to game controls',
    appTitle: 'Ice-Cream Inventory Game',
    chartAxisDay: 'Day',
    chartAxisUnits: 'Units',
    chartDailyDemand: 'Daily Demand',
    chartInventoryLevel: 'Inventory Level',
    chartInventoryPosition: 'Inventory Position',
    chartInventoryTrend: 'Inventory Trend',
    commonCancel: 'Cancel',
    commonClose: 'Close',
    commonDay: ({ count }) => `${count} day${Number(count) === 1 ? '' : 's'}`,
    commonDayOf: ({ day, total }) => `Day ${day} of ${total}`,
    commonDaySummary: ({ day }) => `Day ${day} summary`,
    commonDayWithOrder: ({ day, order }) => `Day ${day} | Order ${order}`,
    commonNA: 'N/A',
    commonUnits: ({ count }) => `${count} units`,
    daySummaryDailyFeedback: 'Daily feedback',
    daySummaryDailyTotalCost: 'Daily total cost',
    daySummaryDemand: 'Demand',
    daySummaryDescription: 'Review demand, inventory, and today’s cost outcome.',
    daySummaryEndingInventory: 'Ending inventory',
    daySummaryFillRate: 'Fill rate',
    daySummaryHoldingCost: 'Holding cost',
    daySummaryOrderFee: 'Order fee',
    daySummaryReceived: 'Received',
    daySummarySoldUnits: 'Sold units',
    daySummaryStockoutCost: 'Stockout cost',
    daySummaryStockouts: 'Stockouts',
    footerEducatorControls: 'Educator controls',
    footerEducatorSettings: 'Educator Settings',
    footerShowUtilityPanel: 'Show Language & Settings',
    inventoryChartAria: 'Inventory level, inventory position, and daily demand over time',
    inventoryChartAriaExpanded: 'Expanded inventory level, inventory position, and daily demand over time',
    inventoryChartDescription: ({
      count,
      endDemand,
      endInventory,
      endPosition,
      startDemand,
      startInventory,
      startPosition
    }) =>
      `Inventory trend chart covering ${count} recorded ${Number(count) === 1 ? 'day' : 'days'}. Inventory level starts at ${startInventory} units and ends at ${endInventory} units. Inventory position starts at ${startPosition} units and ends at ${endPosition} units. Daily demand starts at ${startDemand} units and ends at ${endDemand} units.`,
    inventoryChartPlaceholder: 'Inventory trend chart will appear after the first day is recorded.',
    inventoryChooseTodayOrder: 'Choose today’s ordering quantity.',
    inventoryCustomers: 'Customers',
    inventoryEnlargeChart: 'Enlarge Chart',
    inventoryExpandedChartTitle: 'Inventory Level, Position & Daily Demand',
    inventoryFillRate: 'Fill Rate',
    inventoryGameLogic: 'Game Logic',
    inventoryHolding: 'Holding',
    inventoryHoldingValue: ({ cost }) => `${cost} / unit / day`,
    inventoryHowGameWorks: 'How the game works',
    inventoryInStore: 'In Store',
    inventoryInTransit: 'In Transit',
    inventoryInventoryLevelInStore: 'Inventory Level (in store).',
    inventoryInventoryPositionInStoreOnOrder: 'Inventory Position (in store + on order).',
    inventoryLeadTime: 'Lead Time',
    inventoryLogicIntro:
      'You manage the store’s inventory for 30 days. Each day, customers arrive with random demand (10-20 units). Your goal is to keep service high while controlling costs.',
    inventoryOnHand: 'On Hand',
    inventoryOrderArrivesAfterLeadTime: 'The order arrives after the lead time.',
    inventoryOrderCost: 'Order Cost',
    inventoryOrderCostDetail: ({ cost }) => `${cost} / 250 units`,
    inventoryOrderingCostValue: ({ cost }) => `${cost} / 250`,
    inventoryParameter: 'Parameter',
    inventoryParametersFromSettings: 'Parameters (from Educator Settings)',
    inventorySalesAndFillRate: 'Sales and fill rate.',
    inventoryStockout: 'Stockout',
    inventoryStockoutValue: ({ cost }) => `${cost} / unit`,
    inventoryStore: 'Store',
    inventorySupplier: 'Supplier',
    inventoryStoreChart: 'Store Chart',
    inventorySupplyChain: 'Supply Chain',
    inventorySupplyChainTitle: 'Supplier, store, customers.',
    inventoryTodayDemand: 'Today’s Demand',
    inventoryTodayOrder: 'Today’s Order',
    inventoryTodaySales: 'Today’s Sales',
    inventoryValue: 'Value',
    inventoryWhatUpdatesEachDay: 'What updates each day',
    inventoryYourDecision: 'Your decision',
    inventoryYouChooseTodayOrder: 'Choose today’s ordering quantity.',
    languageLabel: 'Language',
    latestRecordedUpdate: ({
      cost,
      day,
      demand,
      endingInventory,
      received,
      sold
    }) =>
      `Day ${day} recorded. Received ${received}, demand ${demand}, sold ${sold}, ending inventory ${endingInventory}, daily cost ${cost}.`,
    latestReadyUpdate: ({ day }) => `Day ${day} ready. Set today’s ordering quantity.`,
    monthResult30Day: '30-day result',
    monthResultCostPerUnitSold: 'Cost per unit sold',
    monthResultMinimumDescription: ({ minimum, sold }) =>
      `You sold ${sold} units, which is below the required minimum of ${minimum}.`,
    monthResultStartNewRun: 'Start a New 30-Day Run',
    monthResultTotalFillRate: 'Total fill rate',
    monthResultTotalInventoryCost: 'Total inventory cost',
    monthResultTotalSoldUnits: 'Total sold units',
    orderControlsAria: 'Order controls',
    orderControlsLabel: 'Order quantity',
    orderControlsPill: ({ count }) => `${count} units`,
    orderControlsPlan: 'Order Plan',
    orderControlsQuantityControls: 'Order quantity controls',
    orderControlsSlider: 'Order quantity slider',
    settingsAdjustGame: 'Adjust game settings',
    settingsBand: ({ index }) => `Band ${index}`,
    settingsClose: 'Close',
    settingsCostValuesError: 'Cost values must be zero or greater.',
    settingsDescription:
      'Update the cost parameters, lead time, and end-of-run evaluation bands.',
    settingsEducatorAccess: 'Educator access',
    settingsEnterPassword: 'Enter the settings password',
    settingsHoldingCostPerUnit: 'Holding cost per unit',
    settingsIncorrectPassword: 'That password did not unlock the settings panel.',
    settingsLabel: 'Label',
    settingsLeadTimeDays: 'Lead time in days',
    settingsLeadTimeError: 'Lead time must be at least 1 day.',
    settingsMaximumCostRatio: 'Maximum cost-per-unit ratio',
    settingsMinimumSoldError: 'Minimum sold units must be zero or greater.',
    settingsMinimumTotalUnitsSold: 'Minimum total units sold',
    settingsOrderingCostPer250: 'Ordering cost per 250 units',
    settingsPassword: 'Password',
    settingsSave: 'Save Settings',
    settingsScoringSettings: 'Scoring settings',
    settingsStockoutCostPerUnit: 'Stockout cost per unit',
    settingsThresholdError: 'Thresholds must rise from band 1 to band 3.',
    settingsUnlock: 'Unlock',
    thresholdDescription0:
      'You balanced ordering, leftovers, and stockouts very well. Your cost per unit sold stayed lean.',
    thresholdDescription1:
      'You kept the shop moving, but there is still room to reduce cost or improve availability.',
    thresholdDescription2:
      'Your strategy created too much waste or too many stockouts. Review the trade-off between risk and buffer stock.',
    thresholdLabel0: 'Excellent',
    thresholdLabel1: 'Not Bad',
    thresholdLabel2: 'Needs A Good Strategy',
    topbarMinimise: 'Minimise',
    topbarMinimizePanelAria: 'Minimize order and status panel',
    topbarResumePanel: 'Resume Panel',
    topbarResumePanelAria: 'Resume order and status panel',
    topbarTodayOrderingQuantity: 'Today’s Ordering Quantity',
    topbarTotalCost: 'Total Cost'
  },
  'zh-Hant': {
    actionGameActions: '遊戲操作',
    actionNewGame: '重新開始',
    actionNextDay: '下一天',
    actionRunComplete: '本輪完成',
    appGameStatus: '遊戲狀態',
    appLoadingGame: '正在載入遊戲...',
    appSkipToControls: '跳至遊戲控制區',
    appTitle: '冰淇淋庫存遊戲',
    chartAxisDay: '天數',
    chartAxisUnits: '單位',
    chartDailyDemand: '每日需求',
    chartInventoryLevel: '庫存水位',
    chartInventoryPosition: '庫存部位',
    chartInventoryTrend: '庫存趨勢',
    commonCancel: '取消',
    commonClose: '關閉',
    commonDay: ({ count }) => `${count} 天`,
    commonDayOf: ({ day, total }) => `第 ${day} 天 / 共 ${total} 天`,
    commonDaySummary: ({ day }) => `第 ${day} 天摘要`,
    commonDayWithOrder: ({ day, order }) => `第 ${day} 天 | 訂購 ${order}`,
    commonNA: '不適用',
    commonUnits: ({ count }) => `${count} 單位`,
    daySummaryDailyFeedback: '每日回饋',
    daySummaryDailyTotalCost: '當日總成本',
    daySummaryDemand: '需求量',
    daySummaryDescription: '查看今日的需求、庫存與成本結果。',
    daySummaryEndingInventory: '期末庫存',
    daySummaryFillRate: '滿足率',
    daySummaryHoldingCost: '持有成本',
    daySummaryOrderFee: '訂購費',
    daySummaryReceived: '到貨量',
    daySummarySoldUnits: '銷售量',
    daySummaryStockoutCost: '缺貨成本',
    daySummaryStockouts: '缺貨量',
    footerEducatorControls: '教師控制',
    footerEducatorSettings: '教師設定',
    footerShowUtilityPanel: '顯示語言與設定',
    inventoryChartAria: '庫存水位、庫存部位與每日需求隨時間變化',
    inventoryChartAriaExpanded: '放大的庫存水位、庫存部位與每日需求圖表',
    inventoryChartDescription: ({
      count,
      endDemand,
      endInventory,
      endPosition,
      startDemand,
      startInventory,
      startPosition
    }) =>
      `庫存趨勢圖涵蓋 ${count} 天記錄。庫存水位從 ${startInventory} 單位變化到 ${endInventory} 單位。庫存部位從 ${startPosition} 單位變化到 ${endPosition} 單位。每日需求從 ${startDemand} 單位變化到 ${endDemand} 單位。`,
    inventoryChartPlaceholder: '記錄第一天之後會顯示庫存趨勢圖。',
    inventoryChooseTodayOrder: '設定今天的訂購數量。',
    inventoryCustomers: '顧客',
    inventoryEnlargeChart: '放大圖表',
    inventoryExpandedChartTitle: '庫存水位、庫存部位與每日需求',
    inventoryFillRate: '滿足率',
    inventoryGameLogic: '遊戲規則',
    inventoryHolding: '持有成本',
    inventoryHoldingValue: ({ cost }) => `${cost} / 單位 / 天`,
    inventoryHowGameWorks: '遊戲玩法',
    inventoryInStore: '店內庫存',
    inventoryInTransit: '運送中',
    inventoryInventoryLevelInStore: '庫存水位（店內庫存）。',
    inventoryInventoryPositionInStoreOnOrder: '庫存部位（店內庫存 + 已下單未到貨）。',
    inventoryLeadTime: '前置時間',
    inventoryLogicIntro:
      '你要管理商店 30 天的庫存。每天都會有顧客帶著隨機需求（10-20 單位）到來。你的目標是在控制成本的同時維持高服務水準。',
    inventoryOnHand: '現有庫存',
    inventoryOrderArrivesAfterLeadTime: '訂單會在前置時間後到貨。',
    inventoryOrderCost: '訂購成本',
    inventoryOrderCostDetail: ({ cost }) => `${cost} / 250 單位`,
    inventoryOrderingCostValue: ({ cost }) => `${cost} / 250`,
    inventoryParameter: '參數',
    inventoryParametersFromSettings: '參數（來自教師設定）',
    inventorySalesAndFillRate: '銷售量與滿足率。',
    inventoryStockout: '缺貨',
    inventoryStockoutValue: ({ cost }) => `${cost} / 單位`,
    inventoryStore: '商店',
    inventorySupplier: '供應商',
    inventoryStoreChart: '商店圖表',
    inventorySupplyChain: '供應鏈',
    inventorySupplyChainTitle: '供應商、商店、顧客。',
    inventoryTodayDemand: '今日需求',
    inventoryTodayOrder: '今日訂單',
    inventoryTodaySales: '今日銷售',
    inventoryValue: '數值',
    inventoryWhatUpdatesEachDay: '每天會更新什麼',
    inventoryYourDecision: '你的決策',
    inventoryYouChooseTodayOrder: '選擇今天的訂購數量。',
    languageLabel: '語言',
    latestRecordedUpdate: ({
      cost,
      day,
      demand,
      endingInventory,
      received,
      sold
    }) =>
      `已記錄第 ${day} 天。到貨 ${received}、需求 ${demand}、售出 ${sold}、期末庫存 ${endingInventory}、當日成本 ${cost}。`,
    latestReadyUpdate: ({ day }) => `第 ${day} 天已準備就緒。請設定今天的訂購數量。`,
    monthResult30Day: '30 天結果',
    monthResultCostPerUnitSold: '每售出單位成本',
    monthResultMinimumDescription: ({ minimum, sold }) =>
      `你售出 ${sold} 單位，低於規定最低 ${minimum} 單位。`,
    monthResultStartNewRun: '開始新的 30 天回合',
    monthResultTotalFillRate: '總滿足率',
    monthResultTotalInventoryCost: '總庫存管理成本',
    monthResultTotalSoldUnits: '總售出單位',
    orderControlsAria: '訂單控制',
    orderControlsLabel: '訂購數量',
    orderControlsPill: ({ count }) => `${count} 單位`,
    orderControlsPlan: '訂購計畫',
    orderControlsQuantityControls: '訂購數量控制',
    orderControlsSlider: '訂購數量滑桿',
    settingsAdjustGame: '調整遊戲設定',
    settingsBand: ({ index }) => `區間 ${index}`,
    settingsClose: '關閉',
    settingsCostValuesError: '成本數值必須大於或等於 0。',
    settingsDescription: '更新成本參數、前置時間，以及回合結束的評分區間。',
    settingsEducatorAccess: '教師權限',
    settingsEnterPassword: '輸入設定密碼',
    settingsHoldingCostPerUnit: '每單位持有成本',
    settingsIncorrectPassword: '此密碼無法解鎖設定面板。',
    settingsLabel: '標籤',
    settingsLeadTimeDays: '前置時間（天）',
    settingsLeadTimeError: '前置時間至少要 1 天。',
    settingsMaximumCostRatio: '每單位最高成本比率',
    settingsMinimumSoldError: '最低售出單位必須大於或等於 0。',
    settingsMinimumTotalUnitsSold: '最低總售出單位',
    settingsOrderingCostPer250: '每 250 單位訂購成本',
    settingsPassword: '密碼',
    settingsSave: '儲存設定',
    settingsScoringSettings: '評分設定',
    settingsStockoutCostPerUnit: '每單位缺貨成本',
    settingsThresholdError: '區間門檻必須由區間 1 到區間 3 依序遞增。',
    settingsUnlock: '解鎖',
    thresholdDescription0: '你在訂購、剩餘庫存與缺貨之間取得很好的平衡，每售出單位成本維持得很精實。',
    thresholdDescription1: '你讓商店運作順暢，但仍有空間降低成本或提高供貨能力。',
    thresholdDescription2: '你的策略造成過多浪費或太多缺貨。請重新檢視風險與安全庫存的取捨。',
    thresholdLabel0: '表現優秀',
    thresholdLabel1: '還不錯',
    thresholdLabel2: '需要更好的策略',
    topbarMinimise: '縮小',
    topbarMinimizePanelAria: '縮小訂單與狀態面板',
    topbarResumePanel: '展開面板',
    topbarResumePanelAria: '展開訂單與狀態面板',
    topbarTodayOrderingQuantity: '今日訂購數量',
    topbarTotalCost: '總成本'
  },
  'zh-Hans': {
    actionGameActions: '游戏操作',
    actionNewGame: '重新开始',
    actionNextDay: '下一天',
    actionRunComplete: '本轮完成',
    appGameStatus: '游戏状态',
    appLoadingGame: '正在加载游戏...',
    appSkipToControls: '跳到游戏控制区',
    appTitle: '冰淇淋库存游戏',
    chartAxisDay: '天数',
    chartAxisUnits: '单位',
    chartDailyDemand: '每日需求',
    chartInventoryLevel: '库存水平',
    chartInventoryPosition: '库存位置',
    chartInventoryTrend: '库存趋势',
    commonCancel: '取消',
    commonClose: '关闭',
    commonDay: ({ count }) => `${count} 天`,
    commonDayOf: ({ day, total }) => `第 ${day} 天 / 共 ${total} 天`,
    commonDaySummary: ({ day }) => `第 ${day} 天摘要`,
    commonDayWithOrder: ({ day, order }) => `第 ${day} 天 | 订购 ${order}`,
    commonNA: '不适用',
    commonUnits: ({ count }) => `${count} 单位`,
    daySummaryDailyFeedback: '每日反馈',
    daySummaryDailyTotalCost: '当日总成本',
    daySummaryDemand: '需求量',
    daySummaryDescription: '查看今天的需求、库存和成本结果。',
    daySummaryEndingInventory: '期末库存',
    daySummaryFillRate: '满足率',
    daySummaryHoldingCost: '持有成本',
    daySummaryOrderFee: '订购费',
    daySummaryReceived: '到货量',
    daySummarySoldUnits: '销售量',
    daySummaryStockoutCost: '缺货成本',
    daySummaryStockouts: '缺货量',
    footerEducatorControls: '教师控制',
    footerEducatorSettings: '教师设置',
    footerShowUtilityPanel: '显示语言与设置',
    inventoryChartAria: '库存水平、库存位置和每日需求随时间变化',
    inventoryChartAriaExpanded: '放大的库存水平、库存位置和每日需求图表',
    inventoryChartDescription: ({
      count,
      endDemand,
      endInventory,
      endPosition,
      startDemand,
      startInventory,
      startPosition
    }) =>
      `库存趋势图涵盖 ${count} 天记录。库存水平从 ${startInventory} 单位变化到 ${endInventory} 单位。库存位置从 ${startPosition} 单位变化到 ${endPosition} 单位。每日需求从 ${startDemand} 单位变化到 ${endDemand} 单位。`,
    inventoryChartPlaceholder: '记录第一天之后会显示库存趋势图。',
    inventoryChooseTodayOrder: '设置今天的订购数量。',
    inventoryCustomers: '顾客',
    inventoryEnlargeChart: '放大图表',
    inventoryExpandedChartTitle: '库存水平、库存位置与每日需求',
    inventoryFillRate: '满足率',
    inventoryGameLogic: '游戏规则',
    inventoryHolding: '持有成本',
    inventoryHoldingValue: ({ cost }) => `${cost} / 单位 / 天`,
    inventoryHowGameWorks: '游戏玩法',
    inventoryInStore: '店内库存',
    inventoryInTransit: '运输中',
    inventoryInventoryLevelInStore: '库存水平（店内库存）。',
    inventoryInventoryPositionInStoreOnOrder: '库存位置（店内库存 + 已下单未到货）。',
    inventoryLeadTime: '提前期',
    inventoryLogicIntro:
      '你要管理商店 30 天的库存。每天都会有顾客带着随机需求（10-20 单位）到来。你的目标是在控制成本的同时保持高服务水平。',
    inventoryOnHand: '现有库存',
    inventoryOrderArrivesAfterLeadTime: '订单会在提前期后到货。',
    inventoryOrderCost: '订购成本',
    inventoryOrderCostDetail: ({ cost }) => `${cost} / 250 单位`,
    inventoryOrderingCostValue: ({ cost }) => `${cost} / 250`,
    inventoryParameter: '参数',
    inventoryParametersFromSettings: '参数（来自教师设置）',
    inventorySalesAndFillRate: '销售量与满足率。',
    inventoryStockout: '缺货',
    inventoryStockoutValue: ({ cost }) => `${cost} / 单位`,
    inventoryStore: '商店',
    inventorySupplier: '供应商',
    inventoryStoreChart: '商店图表',
    inventorySupplyChain: '供应链',
    inventorySupplyChainTitle: '供应商、商店、顾客。',
    inventoryTodayDemand: '今日需求',
    inventoryTodayOrder: '今日订单',
    inventoryTodaySales: '今日销售',
    inventoryValue: '数值',
    inventoryWhatUpdatesEachDay: '每天会更新什么',
    inventoryYourDecision: '你的决策',
    inventoryYouChooseTodayOrder: '选择今天的订购数量。',
    languageLabel: '语言',
    latestRecordedUpdate: ({
      cost,
      day,
      demand,
      endingInventory,
      received,
      sold
    }) =>
      `已记录第 ${day} 天。到货 ${received}、需求 ${demand}、售出 ${sold}、期末库存 ${endingInventory}、当日成本 ${cost}。`,
    latestReadyUpdate: ({ day }) => `第 ${day} 天已准备就绪。请设置今天的订购数量。`,
    monthResult30Day: '30 天结果',
    monthResultCostPerUnitSold: '每售出单位成本',
    monthResultMinimumDescription: ({ minimum, sold }) =>
      `你售出 ${sold} 单位，低于要求的最低 ${minimum} 单位。`,
    monthResultStartNewRun: '开始新的 30 天回合',
    monthResultTotalFillRate: '总满足率',
    monthResultTotalInventoryCost: '总库存管理成本',
    monthResultTotalSoldUnits: '总售出单位',
    orderControlsAria: '订单控制',
    orderControlsLabel: '订购数量',
    orderControlsPill: ({ count }) => `${count} 单位`,
    orderControlsPlan: '订购计划',
    orderControlsQuantityControls: '订购数量控制',
    orderControlsSlider: '订购数量滑杆',
    settingsAdjustGame: '调整游戏设置',
    settingsBand: ({ index }) => `区间 ${index}`,
    settingsClose: '关闭',
    settingsCostValuesError: '成本数值必须大于或等于 0。',
    settingsDescription: '更新成本参数、提前期，以及回合结束时的评分区间。',
    settingsEducatorAccess: '教师权限',
    settingsEnterPassword: '输入设置密码',
    settingsHoldingCostPerUnit: '每单位持有成本',
    settingsIncorrectPassword: '该密码无法解锁设置面板。',
    settingsLabel: '标签',
    settingsLeadTimeDays: '提前期（天）',
    settingsLeadTimeError: '提前期至少要 1 天。',
    settingsMaximumCostRatio: '每单位最高成本比率',
    settingsMinimumSoldError: '最低售出单位必须大于或等于 0。',
    settingsMinimumTotalUnitsSold: '最低总售出单位',
    settingsOrderingCostPer250: '每 250 单位订购成本',
    settingsPassword: '密码',
    settingsSave: '保存设置',
    settingsScoringSettings: '评分设置',
    settingsStockoutCostPerUnit: '每单位缺货成本',
    settingsThresholdError: '区间阈值必须从区间 1 到区间 3 依次上升。',
    settingsUnlock: '解锁',
    thresholdDescription0: '你在订购、剩余库存和缺货之间取得了很好的平衡，每售出单位成本保持得很精简。',
    thresholdDescription1: '你让商店持续运转，但仍有空间降低成本或提高供货能力。',
    thresholdDescription2: '你的策略造成过多浪费或太多缺货。请重新审视风险与安全库存之间的权衡。',
    thresholdLabel0: '表现优秀',
    thresholdLabel1: '还不错',
    thresholdLabel2: '需要更好的策略',
    topbarMinimise: '缩小',
    topbarMinimizePanelAria: '缩小订单与状态面板',
    topbarResumePanel: '展开面板',
    topbarResumePanelAria: '展开订单与状态面板',
    topbarTodayOrderingQuantity: '今日订购数量',
    topbarTotalCost: '总成本'
  }
} satisfies Record<AppLanguage, Record<string, MessageValue>>;

type TranslationKey = keyof typeof translations.en;

const interpolate = (template: string, params: MessageParams = {}) =>
  template.replace(/\{(\w+)\}/g, (_, key) => String(params[key] ?? ''));

const getMessage = (language: AppLanguage, key: TranslationKey, params?: MessageParams) => {
  const message = translations[language][key];

  if (typeof message === 'function') {
    return message(params ?? {});
  }

  return interpolate(message, params);
};

const getStoredLanguage = (): AppLanguage => {
  if (typeof window === 'undefined') {
    return 'en';
  }

  const language = window.localStorage.getItem(LANGUAGE_STORAGE_KEY);
  return language === 'zh-Hant' || language === 'zh-Hans' ? language : 'en';
};

const defaultContext: I18nContextValue = {
  formatCurrency: (value) =>
    new Intl.NumberFormat(localeByLanguage.en, {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 2
    }).format(value),
  formatNumber: (value) => new Intl.NumberFormat(localeByLanguage.en).format(value),
  formatPercent: (value) =>
    new Intl.NumberFormat(localeByLanguage.en, {
      style: 'percent',
      maximumFractionDigits: 0
    }).format(value),
  language: 'en',
  setLanguage: () => undefined,
  t: (key, params) => getMessage('en', key, params)
};

const I18nContext = createContext<I18nContextValue>(defaultContext);

export const I18nProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguage] = useState<AppLanguage>(getStoredLanguage);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
    }
  }, [language]);

  const value = useMemo<I18nContextValue>(() => {
    const locale = localeByLanguage[language];

    return {
      formatCurrency: (amount) =>
        new Intl.NumberFormat(locale, {
          style: 'currency',
          currency: 'USD',
          maximumFractionDigits: 2
        }).format(amount),
      formatNumber: (amount) => new Intl.NumberFormat(locale).format(amount),
      formatPercent: (amount) =>
        new Intl.NumberFormat(locale, {
          style: 'percent',
          maximumFractionDigits: 0
        }).format(amount),
      language,
      setLanguage,
      t: (key, params) => getMessage(language, key, params)
    };
  }, [language]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
};

export const useI18n = () => useContext(I18nContext);

export const availableLanguages = (
  Object.keys(languageLabels) as AppLanguage[]
).map((value) => ({
  label: languageLabels[value],
  value
}));

const defaultThresholdIndex = (label: string, description: string) =>
  DEFAULT_EDUCATOR_SETTINGS.thresholds.findIndex(
    (threshold) => threshold.label === label && threshold.description === description
  );

export const getTranslatedMonthEvaluation = (
  language: AppLanguage,
  summary: MonthSummary,
  settings: GameSettings
) => {
  if (summary.evaluation.enforcedMinimum) {
    return {
      description: getMessage(language, 'monthResultMinimumDescription', {
        minimum: settings.minTotalUnitsSold,
        sold: summary.totalUnitsSold
      }),
      label: translateThresholdLabel(language, settings.thresholds[2].label, settings.thresholds[2].description)
    };
  }

  const matchedThreshold =
    settings.thresholds.find((threshold) => summary.performanceRatio <= threshold.maxRatio) ??
    settings.thresholds[settings.thresholds.length - 1];

  return {
    description: translateThresholdDescription(language, matchedThreshold.label, matchedThreshold.description),
    label: translateThresholdLabel(language, matchedThreshold.label, matchedThreshold.description)
  };
};

export const translateThresholdLabel = (
  language: AppLanguage,
  label: string,
  description: string
) => {
  const thresholdIndex = defaultThresholdIndex(label, description);
  return thresholdIndex === -1
    ? label
    : getMessage(language, `thresholdLabel${thresholdIndex}` as TranslationKey);
};

export const translateThresholdDescription = (
  language: AppLanguage,
  label: string,
  description: string
) => {
  const thresholdIndex = defaultThresholdIndex(label, description);
  return thresholdIndex === -1
    ? description
    : getMessage(language, `thresholdDescription${thresholdIndex}` as TranslationKey);
};
