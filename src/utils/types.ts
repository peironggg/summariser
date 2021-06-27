interface OrderConfig {
  ticker: string;
  purchaseDate: string;
  volume: number;
  cost: number;
}

export interface PortfolioConfig {
  orders: [OrderConfig];
}
