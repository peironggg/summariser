import yahooFinance from 'yahoo-finance2';
import { forward, sample, createEffect } from 'effector';
import ora from 'ora';
import { groupBy, sumBy, zipWith, round } from 'lodash';
import { readLocalConfig, logSummary, logErrors } from '../utils/helper';
import { REQUIRED_YAHOO_FIELDS } from '../utils/constants';
import {
  ComputedTotalMetric,
  DividendColumns,
  ErrorMessage,
  GroupedOrders,
  ProfitColumns,
  SummaryData,
  TableData,
  YahooDividendsResponse,
} from '../utils/types';
import {
  addError,
  addGroupedOrders,
  addTableData,
  $errors,
  $metrics,
  $groupedOrders,
  $tableData,
  $summaryData,
} from '../effector/store';

// 1 API call sent for ALL orders due to use of quoteCombine
const getProfitPromise = (
  groupedOrders: GroupedOrders,
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
        addError({ ticker, error });
        return {
          ticker,
          profit: undefined,
          currency: undefined,
          change: undefined,
        };
      }),
  );

// n API calls sent for EACH order as `historical` does not support multiple symbols
const getDividendPromise = (groupedOrders: GroupedOrders): Array<Promise<DividendColumns>> =>
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
        addError({ ticker, error });
        return {
          dividends: undefined,
        };
      }),
  );

export const start = async (): Promise<void> => {
  const spinner = ora({ spinner: 'circle' });
  spinner.start('Reading portfolio json');

  // Create effects
  const readPortfolioFx = createEffect(() => readLocalConfig().orders);
  const startFetchingFx = createEffect<
    {
      groupedOrders: GroupedOrders;
      metrics: ComputedTotalMetric;
    },
    TableData
  >(async ({ groupedOrders, metrics }) => {
    // Get profits and dividends of orders
    const resolvedProfitData = await Promise.all(getProfitPromise(groupedOrders, metrics));
    const resolvedDividendData = await Promise.all(getDividendPromise(groupedOrders));
    return zipWith(resolvedProfitData, resolvedDividendData, (profit, dividend) => ({
      ...profit,
      ...dividend,
    }));
  });
  const logFx = createEffect<
    { tableData: TableData; summaryData: SummaryData; errors: ErrorMessage[] },
    void
  >(({ tableData, summaryData, errors }) => {
    spinner.succeed('Fetched');
    logErrors(errors);
    logSummary(tableData, summaryData);
  });

  // Chain reaction
  sample({
    source: readPortfolioFx.doneData,
    target: addGroupedOrders,
    fn: (orders) => groupBy(orders, 'ticker'),
  });
  sample({
    source: $metrics,
    clock: $groupedOrders.updates,
    target: startFetchingFx,
    fn: (metrics, groupedOrders) => ({ groupedOrders, metrics }),
  });
  forward({ from: startFetchingFx.doneData, to: addTableData });
  sample({
    source: [$summaryData, $errors],
    clock: $tableData.updates,
    target: logFx,
    fn: ([summaryData, errors], tableData) => ({ tableData, summaryData, errors }),
  });

  // UI effects
  startFetchingFx.pending.watch((pending) => {
    if (pending) spinner.text = 'Fetching from server';
  });

  // Start the ball rolling
  readPortfolioFx();
};
