import fs from 'fs';
import chalk from 'chalk';
import { round, sumBy } from 'lodash';
import {
  ErrorMessage,
  PortfolioConfig,
  SummaryData,
  TableData,
  OrderConfig,
  GroupedOrders,
  ComputedTotalMetric,
} from './types';
import { LOCAL_CONFIG_PATH, DEFAULT_CONFIG, INITIAL_TICKER_METRIC } from './constants';

// fs helpers
export const readLocalConfig = (): PortfolioConfig => {
  if (fs.existsSync(LOCAL_CONFIG_PATH)) {
    return JSON.parse(fs.readFileSync(LOCAL_CONFIG_PATH).toString());
  } else {
    writeLocalConfig(DEFAULT_CONFIG);
    return DEFAULT_CONFIG;
  }
};

export const writeLocalConfig = (config: PortfolioConfig): void => {
  fs.writeFileSync(LOCAL_CONFIG_PATH, JSON.stringify(config));
};

// Logging helpers
export const log = (message: string): void => {
  console.log(chalk.bold.white(message));
};

export const logSummary = (data: TableData, summaryData: SummaryData): void => {
  console.log(chalk.bold.white(`Date: ${new Date().toDateString()}`));
  console.table(data);
  console.table(summaryData);
};

export const logErrors = (errors: ErrorMessage[]): void => {
  errors.forEach(({ ticker, error }) =>
    console.log(chalk.yellow(`Skipping "${ticker}": [${error.name}] ${error.message}`)),
  );
};

// `start` command helpers
const computeTickerMetrics = (orders: OrderConfig[]) =>
  orders.reduce((metrics, { cost, volume }) => {
    return {
      totalVolume: metrics.totalVolume + volume,
      totalCost: metrics.totalCost + cost * volume,
    };
  }, INITIAL_TICKER_METRIC);

export const computeMetrics = (ordersObj: GroupedOrders): ComputedTotalMetric =>
  Object.keys(ordersObj).reduce(
    (metricsObj, ticker) => ({
      ...metricsObj,
      [ticker]: computeTickerMetrics(ordersObj[ticker]),
    }),
    {} as ComputedTotalMetric,
  );

export const computeSummary = (metrics: ComputedTotalMetric, tableData: TableData): SummaryData => {
  const totalProfit = round(sumBy(tableData, 'profit'), 2);
  const totalDividends = round(sumBy(tableData, 'dividends'), 2);
  const totalCost = Object.keys(metrics).reduce(
    (sum, ticker) => sum + metrics[ticker].totalCost,
    0,
  );
  const profitWithDividends = totalProfit + totalDividends;
  return {
    totalCost: {
      value: totalCost,
    },
    profitSummary: {
      value: totalProfit,
      change: round((totalProfit / totalCost) * 100, 2),
    },
    profitWithDividendsSummary: {
      value: profitWithDividends,
      change: round((profitWithDividends / totalCost) * 100, 2),
    },
  };
};
