interface OrderConfig {
  ticker: string;
  purchaseDate: string;
  volume: number;
}

export interface PortfolioConfig {
  orders: [OrderConfig];
}
