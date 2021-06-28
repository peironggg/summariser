import { Dictionary } from 'lodash';

export interface OrderConfig {
  ticker: string;
  purchaseDate: string;
  volume: number;
  cost: number;
}

export interface PortfolioConfig {
  orders: OrderConfig[];
}

export interface YahooDividendsRow {
  date: string;
  dividends: number;
}

export type YahooDividendsResponse = YahooDividendsRow[];

export interface ComputedTickerMetric {
  totalVolume: number;
  totalCost: number;
}

export type ComputedTotalMetric = Dictionary<ComputedTickerMetric>;

export interface ProfitColumns {
  ticker: string;
  profit: number | undefined;
  currency: string | undefined;
  change: number | undefined;
}

export interface DividendColumns {
  dividends: number | undefined;
}

export type TableData = (ProfitColumns & DividendColumns)[];

export interface SummaryColumns {
  totalCost: {
    value: number;
  };
  profitSummary: {
    value: number;
    change: number;
  };
  profitWithDividendsSummary: {
    value: number;
    change: number;
  };
}

export interface ErrorMessage {
  ticker: string;
  error: Error;
}
