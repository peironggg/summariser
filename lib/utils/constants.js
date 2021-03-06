"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.INITIAL_TICKER_METRIC = exports.REQUIRED_YAHOO_FIELDS = exports.DEFAULT_CONFIG = exports.LOCAL_CONFIG_PATH = void 0;
var path_1 = __importDefault(require("path"));
var os_1 = require("os");
exports.LOCAL_CONFIG_PATH = path_1.default.join(os_1.homedir(), '.summariser.json');
exports.DEFAULT_CONFIG = {
    orders: [{ ticker: 'AAPL', purchaseDate: '2019-5-3', volume: 1000, cost: 124 }],
};
// https://github.com/gadicc/node-yahoo-finance2/blob/devel/docs/modules/quote.md
exports.REQUIRED_YAHOO_FIELDS = [
    'displayName',
    'currency',
    'regularMarketPrice',
    'regularMarketTime',
];
exports.INITIAL_TICKER_METRIC = {
    totalVolume: 0,
    totalCost: 0,
};
