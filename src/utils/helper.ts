import fs from 'fs';
import chalk from 'chalk';
import { PortfolioConfig, SummaryColumns } from './types';
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

export const logSummary = (rows: SummaryColumns[]): void => {
  console.log(chalk.bold.white(`Date: ${new Date().toDateString()}`));
  console.table(rows);
};

export const errorLog = (message: string): void => {
  console.log(chalk.bold.red(message));
};
