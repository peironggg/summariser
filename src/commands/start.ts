import yahooFinance from 'yahoo-finance2';
import ora from 'ora';
import { groupBy } from 'lodash';
import { readLocalConfig, indent, logSummary, errorLog } from '../utils/helper';
import { REQUIRED_YAHOO_FIELDS } from '../utils/constants';
import { OrderConfig } from '../utils/types';

const getProfit = (orders: OrderConfig[], currPrice: number | undefined) =>
  currPrice
    ? orders
        .reduce((sum, { cost, volume }) => (sum += ((currPrice as number) - cost) * volume), 0)
        .toFixed(2)
    : 0;

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
            const profit = getProfit(groupedOrders[ticker], regularMarketPrice);
            return indent(`${displayName ?? symbol}: ${profit} ${currency}`);
          }),
      ),
    ).then((allStringOutput) => {
      spinner.succeed('Fetched successfully');
      logSummary(allStringOutput.join('\n'));
    });
  } catch (error) {
    spinner.fail();
    errorLog(error);
  }
};
