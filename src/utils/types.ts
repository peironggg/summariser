export interface OrderConfig {
  ticker: string;
  purchaseDate: string;
  volume: number;
  cost: number;
}

export interface PortfolioConfig {
  orders: [OrderConfig];
}

export interface ComputedProperties {
  totalVolume: number;
  totalCost: number;
}

export interface TableRowToPrint {
  ticker: string;
  profit: string | undefined;
  currency: string | undefined;
  change: string | undefined;
}
