import path from 'path';
import { PortfolioConfig } from './types';

export const LOCAL_CONFIG_PATH = path.join(__dirname, '../..', '.summariser.json');

export const DEFAULT_CONFIG: PortfolioConfig = {
  orders: [{ ticker: 'AAPL', purchaseDate: '3/5/2019', volume: 1000 }],
};
