"use strict";
var __spreadArray = (this && this.__spreadArray) || function (to, from) {
    for (var i = 0, il = from.length, j = to.length; i < il; i++, j++)
        to[j] = from[i];
    return to;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.$summaryData = exports.$tableData = exports.$groupedOrders = exports.$metrics = exports.$errors = exports.addSummaryData = exports.addTableData = exports.addGroupedOrders = exports.addError = exports.addMetric = void 0;
var effector_1 = require("effector");
// Initialize store
exports.addMetric = effector_1.createEvent();
exports.addError = effector_1.createEvent();
exports.addGroupedOrders = effector_1.createEvent();
exports.addTableData = effector_1.createEvent();
exports.addSummaryData = effector_1.createEvent();
exports.$errors = effector_1.createStore([]).on(exports.addError, function (state, error) { return __spreadArray(__spreadArray([], state), [
    error,
]); });
exports.$metrics = effector_1.createStore({}).on(exports.addMetric, function (_, metric) { return metric; });
exports.$groupedOrders = effector_1.createStore({}).on(exports.addGroupedOrders, function (_, groupedOrders) { return groupedOrders; });
exports.$tableData = effector_1.createStore([]).on(exports.addTableData, function (_, data) { return data; });
exports.$summaryData = effector_1.createStore({}).on(exports.addSummaryData, function (_, data) { return data; });
