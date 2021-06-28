import yahooFinance from 'yahoo-finance2';
import { log } from '../utils/helper';

export const find = async (ticker: string): Promise<void> => {
  const response = await yahooFinance.autoc(ticker);
  response.Result.forEach(({ symbol, name, exchDisp }) => log(`${symbol} ${name} ${exchDisp}`));
};
