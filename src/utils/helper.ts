import fs from 'fs';
import { PortfolioConfig } from './types';
import { LOCAL_CONFIG_PATH } from './constants';

export const writeLocalConfig = (config: PortfolioConfig): void => {
  fs.writeFileSync(LOCAL_CONFIG_PATH, JSON.stringify(config));
};
