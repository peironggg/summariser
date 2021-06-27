import yahooFinance from 'yahoo-finance2';
import ora from 'ora';
import { groupBy } from 'lodash';
import { readLocalConfig, indent, log, errorLog } from '../utils/helper';
import { REQUIRED_YAHOO_FIELDS } from '../utils/constants';

export const start = (): void => {
  const spinner = ora({ spinner: 'circle' });
  spinner.start('Fetching data from server');

  try {
    const portfolio = readLocalConfig();
    const promises: Array<Promise<string>> = [];

    const groupedOrders = groupBy(portfolio.orders, 'ticker');
    // Get profit of orders
    Object.keys(groupedOrders).forEach((ticker) => {
      promises.push(
        yahooFinance
          .quoteCombine(ticker, { fields: REQUIRED_YAHOO_FIELDS })
          .then(({ regularMarketPrice, symbol, displayName, financialCurrency }) => {
            const profit = groupedOrders[ticker]
              .reduce(
                (sum, { cost, volume }) =>
                  (sum += ((regularMarketPrice as number) - cost) * volume),
                0,
              )
              .toFixed(2);
            return indent(`${displayName ?? symbol}: ${profit} ${financialCurrency}`);
          }),
      );
    });
    Promise.all(promises).then((allStringOutput) => {
      spinner.succeed('Fetched successfully');
      log(allStringOutput.join('\n'));
    });
  } catch (error) {
    spinner.fail();
    errorLog(error);
  }
};
