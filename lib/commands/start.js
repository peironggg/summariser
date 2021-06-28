"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.start = void 0;
var yahoo_finance2_1 = __importDefault(require("yahoo-finance2"));
var ora_1 = __importDefault(require("ora"));
var lodash_1 = require("lodash");
var helper_1 = require("../utils/helper");
var constants_1 = require("../utils/constants");
var computeMetrics = function (orders) {
    return orders.reduce(function (metrics, _a) {
        var cost = _a.cost, volume = _a.volume;
        return {
            totalVolume: metrics.totalVolume + volume,
            totalCost: metrics.totalCost + cost * volume,
        };
    }, constants_1.INITIAL_COMPUTED_PROPERTIES);
};
var start = function () {
    var spinner = ora_1.default({ spinner: 'circle' });
    spinner.start('Fetching data from server');
    try {
        var portfolio = helper_1.readLocalConfig();
        var groupedOrders_1 = lodash_1.groupBy(portfolio.orders, 'ticker');
        // Get profit of orders
        Promise.all(Object.keys(groupedOrders_1).map(function (ticker) {
            return yahoo_finance2_1.default
                .quoteCombine(ticker, { fields: constants_1.REQUIRED_YAHOO_FIELDS })
                .then(function (_a) {
                var regularMarketPrice = _a.regularMarketPrice, symbol = _a.symbol, displayName = _a.displayName, currency = _a.currency;
                var _b = computeMetrics(groupedOrders_1[ticker]), totalCost = _b.totalCost, totalVolume = _b.totalVolume;
                var profit = regularMarketPrice && regularMarketPrice * totalVolume - totalCost;
                var percentageChange = profit && (profit / totalCost) * 100;
                return {
                    ticker: displayName !== null && displayName !== void 0 ? displayName : symbol,
                    profit: profit === null || profit === void 0 ? void 0 : profit.toFixed(2),
                    currency: currency,
                    change: percentageChange === null || percentageChange === void 0 ? void 0 : percentageChange.toFixed(2),
                };
            });
        })).then(function (output) {
            spinner.succeed('Fetched successfully');
            helper_1.logSummary(output);
        });
    }
    catch (error) {
        spinner.fail();
        helper_1.errorLog(error);
    }
};
exports.start = start;
