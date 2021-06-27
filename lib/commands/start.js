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
var start = function () {
    var spinner = ora_1.default({ spinner: 'circle' });
    spinner.start('Fetching data from server');
    try {
        var portfolio = helper_1.readLocalConfig();
        var promises_1 = [];
        var groupedOrders_1 = lodash_1.groupBy(portfolio.orders, 'ticker');
        // Get profit of orders
        Object.keys(groupedOrders_1).forEach(function (ticker) {
            promises_1.push(yahoo_finance2_1.default
                .quoteCombine(ticker, { fields: constants_1.REQUIRED_YAHOO_FIELDS })
                .then(function (_a) {
                var regularMarketPrice = _a.regularMarketPrice, symbol = _a.symbol, displayName = _a.displayName, financialCurrency = _a.financialCurrency;
                var profit = groupedOrders_1[ticker]
                    .reduce(function (sum, _a) {
                    var cost = _a.cost, volume = _a.volume;
                    return (sum += (regularMarketPrice - cost) * volume);
                }, 0)
                    .toFixed(2);
                return helper_1.indent((displayName !== null && displayName !== void 0 ? displayName : symbol) + ": " + profit + " " + financialCurrency);
            }));
        });
        Promise.all(promises_1).then(function (allStringOutput) {
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
