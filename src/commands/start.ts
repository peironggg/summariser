import yahooFinance from 'yahoo-finance2';
import ora from 'ora';
import chalk from 'chalk';
import { readLocalConfig, indent, log, errorLog } from '../utils/helper';
import { REQUIRED_YAHOO_FIELDS } from '../utils/constants';

export const start = (): void => {
  const spinner = ora({ spinner: 'circle' });
  spinner.start('Fetching data from server');

  try {
    const portfolio = readLocalConfig();
    const promises: Array<Promise<string>> = [];
    // Get profit of orders
    portfolio.orders.forEach(({ ticker, cost, volume }) => {
      promises.push(
        yahooFinance
          .quoteCombine(ticker, { fields: REQUIRED_YAHOO_FIELDS })
          .then(({ regularMarketPrice, symbol, displayName, financialCurrency }) => {
            const profit = (((regularMarketPrice as number) - cost) * volume).toFixed(2);
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
