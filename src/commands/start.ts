import yahooFinance from 'yahoo-finance2';
import ora from 'ora';
import { Dictionary, groupBy, sumBy, zipWith } from 'lodash';
import { readLocalConfig, logSummary, logErrors } from '../utils/helper';
import { REQUIRED_YAHOO_FIELDS, INITIAL_COMPUTED_PROPERTIES } from '../utils/constants';
import {
  DividendColumns,
  ErrorMessage,
  OrderConfig,
  SummaryColumns,
  YahooDividendsResponse,
} from '../utils/types';

const computeMetrics = (orders: OrderConfig[]) =>
  orders.reduce((metrics, { cost, volume }) => {
    return {
      totalVolume: metrics.totalVolume + volume,
      totalCost: metrics.totalCost + cost * volume,
    };
  }, INITIAL_COMPUTED_PROPERTIES);

// 1 API call sent for ALL orders due to use of quoteCombine
const getSummaryPromise = (
  groupedOrders: Dictionary<OrderConfig[]>,
  errors: ErrorMessage[],
): Array<Promise<SummaryColumns>> =>
  Object.keys(groupedOrders).map((ticker) =>
    yahooFinance
      .quoteCombine(ticker, { fields: REQUIRED_YAHOO_FIELDS })
      .then(({ regularMarketPrice, displayName, currency }) => {
        const { totalCost, totalVolume } = computeMetrics(groupedOrders[ticker]);
        const profit = regularMarketPrice && regularMarketPrice * totalVolume - totalCost;
        const percentageChange = profit && (profit / totalCost) * 100;
        return {
          ticker: displayName ?? ticker,
          profit: profit?.toFixed(2),
          currency,
          change: percentageChange?.toFixed(2),
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
        dividends: sumBy(orderDivArr).toFixed(2),
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
  // Get profit and summary of orders
  const resolvedSummaryArr = await Promise.all(getSummaryPromise(groupedOrders, errors));
  const resolvedDividendArr = await Promise.all(getDividendPromise(groupedOrders, errors));
  const zippedOutput = zipWith(resolvedSummaryArr, resolvedDividendArr, (summary, dividend) => ({
    ...summary,
    ...dividend,
  }));
  spinner.succeed('Fetched');
  logErrors(errors);
  logSummary(zippedOutput);
};
