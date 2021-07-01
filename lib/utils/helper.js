"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.computeSummary = exports.computeMetrics = exports.logErrors = exports.logSummary = exports.log = exports.writeLocalConfig = exports.readLocalConfig = void 0;
var fs_1 = __importDefault(require("fs"));
var chalk_1 = __importDefault(require("chalk"));
var lodash_1 = require("lodash");
var constants_1 = require("./constants");
// fs helpers
var readLocalConfig = function () {
    if (fs_1.default.existsSync(constants_1.LOCAL_CONFIG_PATH)) {
        return JSON.parse(fs_1.default.readFileSync(constants_1.LOCAL_CONFIG_PATH).toString());
    }
    else {
        exports.writeLocalConfig(constants_1.DEFAULT_CONFIG);
        return constants_1.DEFAULT_CONFIG;
    }
};
exports.readLocalConfig = readLocalConfig;
var writeLocalConfig = function (config) {
    fs_1.default.writeFileSync(constants_1.LOCAL_CONFIG_PATH, JSON.stringify(config));
};
exports.writeLocalConfig = writeLocalConfig;
// Logging helpers
var log = function (message) {
    console.log(chalk_1.default.bold.white(message));
};
exports.log = log;
var logSummary = function (data, summaryData) {
    console.log(chalk_1.default.bold.white("Date: " + new Date().toDateString()));
    console.table(data);
    console.table(summaryData);
};
exports.logSummary = logSummary;
var logErrors = function (errors) {
    errors.forEach(function (_a) {
        var ticker = _a.ticker, error = _a.error;
        return console.log(chalk_1.default.yellow("Skipping \"" + ticker + "\": [" + error.name + "] " + error.message));
    });
};
exports.logErrors = logErrors;
// `start` command helpers
var computeTickerMetrics = function (orders) {
    return orders.reduce(function (metrics, _a) {
        var cost = _a.cost, volume = _a.volume;
        return {
            totalVolume: metrics.totalVolume + volume,
            totalCost: metrics.totalCost + cost * volume,
        };
    }, constants_1.INITIAL_TICKER_METRIC);
};
var computeMetrics = function (ordersObj) {
    return Object.keys(ordersObj).reduce(function (metricsObj, ticker) {
        var _a;
        return (__assign(__assign({}, metricsObj), (_a = {}, _a[ticker] = computeTickerMetrics(ordersObj[ticker]), _a)));
    }, {});
};
exports.computeMetrics = computeMetrics;
var computeSummary = function (metrics, tableData) {
    var totalProfit = lodash_1.round(lodash_1.sumBy(tableData, 'profit'), 2);
    var totalDividends = lodash_1.round(lodash_1.sumBy(tableData, 'dividends'), 2);
    var totalCost = Object.keys(metrics).reduce(function (sum, ticker) { return sum + metrics[ticker].totalCost; }, 0);
    var profitWithDividends = totalProfit + totalDividends;
    return {
        totalCost: {
            value: totalCost,
        },
        profitSummary: {
            value: totalProfit,
            change: lodash_1.round((totalProfit / totalCost) * 100, 2),
        },
        profitWithDividendsSummary: {
            value: profitWithDividends,
            change: lodash_1.round((profitWithDividends / totalCost) * 100, 2),
        },
    };
};
exports.computeSummary = computeSummary;
