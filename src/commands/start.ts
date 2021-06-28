import yahooFinance from 'yahoo-finance2';
import ora from 'ora';
import { Dictionary, groupBy, sumBy, zipWith } from 'lodash';
import { readLocalConfig, logSummary, errorLog } from '../utils/helper';
import { REQUIRED_YAHOO_FIELDS, INITIAL_COMPUTED_PROPERTIES } from '../utils/constants';
import {
  DividendColumns,
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
): Array<Promise<SummaryColumns>> =>
  Object.keys(groupedOrders).map((ticker) =>
    yahooFinance
      .quoteCombine(ticker, { fields: REQUIRED_YAHOO_FIELDS })
      .then(({ regularMarketPrice, symbol, displayName, currency }) => {
        const { totalCost, totalVolume } = computeMetrics(groupedOrders[ticker]);
        const profit = regularMarketPrice && regularMarketPrice * totalVolume - totalCost;
        const percentageChange = profit && (profit / totalCost) * 100;
        return {
          ticker: displayName ?? symbol,
          profit: profit?.toFixed(2),
          currency,
          change: percentageChange?.toFixed(2),
        };
      }),
  );

// n API calls sent for EACH order as `historical` does not support multiple symbols
const getDividendPromise = (
  groupedOrders: Dictionary<OrderConfig[]>,
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
      .catch(() => ({ dividends: undefined })),
  );

export const start = async (): Promise<void> => {
  const spinner = ora({ spinner: 'circle' });
  spinner.start('Fetching data from server');

  try {
    const portfolio = readLocalConfig();
    const groupedOrders = groupBy(portfolio.orders, 'ticker');
    // Get profit and summary of orders
    const resolvedSummaryArr = await Promise.all(getSummaryPromise(groupedOrders));
    const resolvedDividendArr = await Promise.all(getDividendPromise(groupedOrders));
    const zippedOutput = zipWith(resolvedSummaryArr, resolvedDividendArr, (summary, dividend) => ({
      ...summary,
      ...dividend,
    }));
    spinner.succeed('Fetched successfully');
    logSummary(zippedOutput);
  } catch (error) {
    let spinnerMessage = '';
    if (error instanceof yahooFinance.errors.FailedYahooValidationError) {
      spinnerMessage = 'Failed to validate Yahoo response';
    } else if (error instanceof yahooFinance.errors.HTTPError) {
      spinnerMessage = 'HTTP network issues';
    } else {
      spinnerMessage = 'General error issue';
    }
    spinner.fail(spinnerMessage);
    errorLog(error);
  }
};
