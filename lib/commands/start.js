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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.start = void 0;
var yahoo_finance2_1 = __importDefault(require("yahoo-finance2"));
var effector_1 = require("effector");
var ora_1 = __importDefault(require("ora"));
var lodash_1 = require("lodash");
var helper_1 = require("../utils/helper");
var constants_1 = require("../utils/constants");
var store_1 = require("../effector/store");
var computeSummary = function (_a) {
    var metrics = _a.metrics, tableData = _a.tableData;
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
// 1 API call sent for ALL orders due to use of quoteCombine
var getProfitPromise = function (groupedOrders, totalMetric) {
    return Object.keys(groupedOrders).map(function (ticker) {
        return yahoo_finance2_1.default
            .quoteCombine(ticker, { fields: constants_1.REQUIRED_YAHOO_FIELDS })
            .then(function (_a) {
            var regularMarketPrice = _a.regularMarketPrice, displayName = _a.displayName, currency = _a.currency;
            var _b = totalMetric[ticker], totalCost = _b.totalCost, totalVolume = _b.totalVolume;
            var profit = regularMarketPrice && regularMarketPrice * totalVolume - totalCost;
            var percentageChange = profit && (profit / totalCost) * 100;
            return {
                ticker: displayName !== null && displayName !== void 0 ? displayName : ticker,
                profit: profit && lodash_1.round(profit, 2),
                currency: currency,
                change: percentageChange && lodash_1.round(percentageChange, 2),
            };
        })
            .catch(function (error) {
            store_1.addError({ ticker: ticker, error: error });
            return {
                ticker: ticker,
                profit: undefined,
                currency: undefined,
                change: undefined,
            };
        });
    });
};
// n API calls sent for EACH order as `historical` does not support multiple symbols
var getDividendPromise = function (groupedOrders) {
    return Object.keys(groupedOrders).map(function (ticker) {
        return Promise.all(
        // This returns array of dividends for each order
        groupedOrders[ticker].map(function (_a) {
            var ticker = _a.ticker, purchaseDate = _a.purchaseDate, volume = _a.volume;
            return yahoo_finance2_1.default
                .historical(ticker, { period1: purchaseDate, events: 'div' }, { validateResult: false })
                .then(function (res) { return lodash_1.sumBy(res, 'dividends') * volume; });
        }))
            .then(function (orderDivArr) { return ({
            dividends: lodash_1.round(lodash_1.sumBy(orderDivArr), 2),
        }); })
            .catch(function (error) {
            store_1.addError({ ticker: ticker, error: error });
            return {
                dividends: undefined,
            };
        });
    });
};
var start = function () { return __awaiter(void 0, void 0, void 0, function () {
    var spinner, readPortfolioFx, computeMetricsFx, startFetchingFx, computeSummaryFx, logFx;
    return __generator(this, function (_a) {
        spinner = ora_1.default({ spinner: 'circle' });
        spinner.start('Fetching data from server');
        readPortfolioFx = effector_1.createEffect(function () { return lodash_1.groupBy(helper_1.readLocalConfig().orders, 'ticker'); });
        computeMetricsFx = effector_1.createEffect(computeMetrics);
        startFetchingFx = effector_1.createEffect(function (_a) {
            var groupedOrders = _a.groupedOrders, metrics = _a.metrics;
            return __awaiter(void 0, void 0, void 0, function () {
                var resolvedProfitData, resolvedDividendData;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0: return [4 /*yield*/, Promise.all(getProfitPromise(groupedOrders, metrics))];
                        case 1:
                            resolvedProfitData = _b.sent();
                            return [4 /*yield*/, Promise.all(getDividendPromise(groupedOrders))];
                        case 2:
                            resolvedDividendData = _b.sent();
                            return [2 /*return*/, lodash_1.zipWith(resolvedProfitData, resolvedDividendData, function (profit, dividend) { return (__assign(__assign({}, profit), dividend)); })];
                    }
                });
            });
        });
        computeSummaryFx = effector_1.createEffect(computeSummary);
        logFx = effector_1.createEffect(function (_a) {
            var tableData = _a.tableData, summaryData = _a.summaryData, errors = _a.errors;
            spinner.succeed('Fetched');
            helper_1.logErrors(errors);
            helper_1.logSummary(tableData, summaryData);
        });
        // Chain reactions
        effector_1.forward({ from: readPortfolioFx.doneData, to: store_1.addGroupedOrders });
        effector_1.forward({ from: store_1.$groupedOrders.updates, to: computeMetricsFx });
        effector_1.forward({ from: computeMetricsFx.doneData, to: store_1.addMetric });
        effector_1.sample({
            source: store_1.$groupedOrders,
            clock: store_1.$metrics.updates,
            target: startFetchingFx,
            fn: function (groupedOrders, metrics) { return ({ groupedOrders: groupedOrders, metrics: metrics }); },
        });
        effector_1.forward({ from: startFetchingFx.doneData, to: store_1.addTableData });
        effector_1.sample({
            source: store_1.$metrics,
            clock: store_1.$tableData.updates,
            target: computeSummaryFx,
            fn: function (metrics, tableData) { return ({ metrics: metrics, tableData: tableData }); },
        });
        effector_1.forward({ from: computeSummaryFx.doneData, to: store_1.$summaryData });
        effector_1.sample({
            source: [store_1.$tableData, store_1.$errors],
            clock: store_1.$summaryData.updates,
            target: logFx,
            fn: function (_a, summaryData) {
                var tableData = _a[0], errors = _a[1];
                return ({ tableData: tableData, summaryData: summaryData, errors: errors });
            },
        });
        // Start the ball rolling
        readPortfolioFx();
        return [2 /*return*/];
    });
}); };
exports.start = start;
