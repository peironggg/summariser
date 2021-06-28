import path from 'path';
import { QuoteField } from 'yahoo-finance2/dist/esm/src/modules/quote';
import { ComputedProperties, PortfolioConfig } from './types';

export const LOCAL_CONFIG_PATH = path.join(__dirname, '../..', '.summariser.json');

export const DEFAULT_CONFIG: PortfolioConfig = {
  orders: [{ ticker: 'AAPL', purchaseDate: '2019-5-3', volume: 1000, cost: 124 }],
};

// https://github.com/gadicc/node-yahoo-finance2/blob/devel/docs/modules/quote.md
export const REQUIRED_YAHOO_FIELDS: QuoteField[] = [
  'displayName',
  'symbol',
  'currency',
  'regularMarketPrice',
  'regularMarketTime',
];

export const INITIAL_COMPUTED_PROPERTIES: ComputedProperties = {
  totalVolume: 0,
  totalCost: 0,
};
