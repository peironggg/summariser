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
var getProfit = function (orders, currPrice) {
    return currPrice
        ? orders
            .reduce(function (sum, _a) {
            var cost = _a.cost, volume = _a.volume;
            return (sum += (currPrice - cost) * volume);
        }, 0)
            .toFixed(2)
        : 0;
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
                var regularMarketPrice = _a.regularMarketPrice, symbol = _a.symbol, displayName = _a.displayName, financialCurrency = _a.financialCurrency;
                var profit = getProfit(groupedOrders_1[ticker], regularMarketPrice);
                return helper_1.indent((displayName !== null && displayName !== void 0 ? displayName : symbol) + ": " + profit + " " + financialCurrency);
            });
        })).then(function (allStringOutput) {
            spinner.succeed('Fetched successfully');
            helper_1.log(allStringOutput.join('\n'));
        });
    }
    catch (error) {
        spinner.fail();
        helper_1.errorLog(error);
    }
};
exports.start = start;
