export interface OrderConfig {
  ticker: string;
  purchaseDate: string;
  volume: number;
  cost: number;
}

export interface PortfolioConfig {
  orders: [OrderConfig];
}

export interface YahooDividendsRow {
  date: string;
  dividends: number;
}

export type YahooDividendsResponse = YahooDividendsRow[];

export interface ComputedProperties {
  totalVolume: number;
  totalCost: number;
}

export interface SummaryColumns {
  ticker: string;
  profit: string | undefined;
  currency: string | undefined;
  change: string | undefined;
}

export interface DividendColumns {
  dividends: string | undefined;
}

export type Columns = (SummaryColumns & DividendColumns)[];

export interface ErrorMessage {
  ticker: string;
  error: Error;
}
