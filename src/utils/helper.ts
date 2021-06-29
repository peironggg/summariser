import fs from 'fs';
import chalk from 'chalk';
import { ErrorMessage, PortfolioConfig, SummaryData, TableData } from './types';
import { LOCAL_CONFIG_PATH, DEFAULT_CONFIG } from './constants';

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
