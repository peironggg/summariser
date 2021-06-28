import yahooFinance from 'yahoo-finance2';
import ora from 'ora';
import { groupBy } from 'lodash';
import { readLocalConfig, logSummary, errorLog } from '../utils/helper';
import { REQUIRED_YAHOO_FIELDS, INITIAL_COMPUTED_PROPERTIES } from '../utils/constants';
import { OrderConfig, TableRowToPrint } from '../utils/types';

const computeMetrics = (orders: OrderConfig[]) =>
  orders.reduce((metrics, { cost, volume }) => {
    return {
      totalVolume: metrics.totalVolume + volume,
      totalCost: metrics.totalCost + cost * volume,
    };
  }, INITIAL_COMPUTED_PROPERTIES);

export const start = (): void => {
  const spinner = ora({ spinner: 'circle' });
  spinner.start('Fetching data from server');

  try {
    const portfolio = readLocalConfig();

    const groupedOrders = groupBy(portfolio.orders, 'ticker');
    // Get profit of orders
    Promise.all(
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
      ),
    ).then((output: TableRowToPrint[]) => {
      spinner.succeed('Fetched successfully');
      logSummary(output);
    });
  } catch (error) {
    spinner.fail();
    errorLog(error);
  }
};
