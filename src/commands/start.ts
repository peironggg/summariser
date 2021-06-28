import yahooFinance from 'yahoo-finance2';
import ora from 'ora';
import { Dictionary, groupBy, sumBy, zipWith, round } from 'lodash';
import { readLocalConfig, logSummary, logErrors } from '../utils/helper';
import { REQUIRED_YAHOO_FIELDS, INITIAL_TICKER_METRIC } from '../utils/constants';
import {
  ComputedTotalMetric,
  DividendColumns,
  ErrorMessage,
  OrderConfig,
  ProfitColumns,
  SummaryColumns,
  YahooDividendsResponse,
} from '../utils/types';

const computeTickerMetrics = (orders: OrderConfig[]) =>
  orders.reduce((metrics, { cost, volume }) => {
    return {
      totalVolume: metrics.totalVolume + volume,
      totalCost: metrics.totalCost + cost * volume,
    };
  }, INITIAL_TICKER_METRIC);

const computeMetrics = (ordersObj: Dictionary<OrderConfig[]>) =>
  Object.keys(ordersObj).reduce(
    (metricsObj, ticker) => ({
      ...metricsObj,
      [ticker]: computeTickerMetrics(ordersObj[ticker]),
    }),
    {} as ComputedTotalMetric,
  );

const computeSummary = (
  metrics: ComputedTotalMetric,
  profits: ProfitColumns[],
  dividends: DividendColumns[],
): SummaryColumns => {
  const totalProfit = round(sumBy(profits, 'profit'), 2);
  const totalDividends = round(sumBy(dividends, 'dividends'), 2);
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

// 1 API call sent for ALL orders due to use of quoteCombine
const getProfitPromise = (
  groupedOrders: Dictionary<OrderConfig[]>,
  errors: ErrorMessage[],
  totalMetric: ComputedTotalMetric,
): Array<Promise<ProfitColumns>> =>
  Object.keys(groupedOrders).map((ticker) =>
    yahooFinance
      .quoteCombine(ticker, { fields: REQUIRED_YAHOO_FIELDS })
      .then(({ regularMarketPrice, displayName, currency }) => {
        const { totalCost, totalVolume } = totalMetric[ticker];
        const profit = regularMarketPrice && regularMarketPrice * totalVolume - totalCost;
        const percentageChange = profit && (profit / totalCost) * 100;
        return {
          ticker: displayName ?? ticker,
          profit: profit && round(profit, 2),
          currency,
          change: percentageChange && round(percentageChange, 2),
        };
      })
      .catch((error) => {
        errors.push({ ticker, error });
        return {
          ticker,
          profit: undefined,
          currency: undefined,
          change: undefined,
        };
      }),
  );

// n API calls sent for EACH order as `historical` does not support multiple symbols
const getDividendPromise = (
  groupedOrders: Dictionary<OrderConfig[]>,
  errors: ErrorMessage[],
): Array<Promise<DividendColumns>> =>
  Object.keys(groupedOrders).map((ticker) =>
    Promise.all(
      // This returns array of dividends for each order
      groupedOrders[ticker].map(({ ticker, purchaseDate, volume }) =>
        yahooFinance
          .historical(ticker, { period1: purchaseDate, events: 'div' }, { validateResult: false })
          .then((res: YahooDividendsResponse) => sumBy(res, 'dividends') * volume),
      ),
    )
      .then((orderDivArr) => ({
        dividends: round(sumBy(orderDivArr), 2),
      }))
      .catch((error) => {
        errors.push({ ticker, error });
        return {
          dividends: undefined,
        };
      }),
  );

export const start = async (): Promise<void> => {
  const spinner = ora({ spinner: 'circle' });
  spinner.start('Fetching data from server');

  const errors: ErrorMessage[] = [];
  const portfolio = readLocalConfig();
  const groupedOrders = groupBy(portfolio.orders, 'ticker');
  const metrics = computeMetrics(groupedOrders);
  // Get profit and profit of orders
  const resolvedProfitData = await Promise.all(getProfitPromise(groupedOrders, errors, metrics));
  const resolvedDividendData = await Promise.all(getDividendPromise(groupedOrders, errors));
  const zippedOutput = zipWith(resolvedProfitData, resolvedDividendData, (profit, dividend) => ({
    ...profit,
    ...dividend,
  }));
  const summaryData = computeSummary(metrics, resolvedProfitData, resolvedDividendData);
  spinner.succeed('Fetched');
  logErrors(errors);
  logSummary(zippedOutput, summaryData);
};
