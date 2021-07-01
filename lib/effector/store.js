"use strict";
var __spreadArray = (this && this.__spreadArray) || function (to, from) {
    for (var i = 0, il = from.length, j = to.length; i < il; i++, j++)
        to[j] = from[i];
    return to;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.$summaryData = exports.$tableData = exports.$metrics = exports.$groupedOrders = exports.$errors = exports.addTableData = exports.addGroupedOrders = exports.addError = void 0;
var effector_1 = require("effector");
var helper_1 = require("../utils/helper");
// Events
exports.addError = effector_1.createEvent();
exports.addGroupedOrders = effector_1.createEvent();
exports.addTableData = effector_1.createEvent();
// Stores
exports.$errors = effector_1.createStore([]).on(exports.addError, function (state, error) { return __spreadArray(__spreadArray([], state), [
    error,
]); });
exports.$groupedOrders = effector_1.createStore({}).on(exports.addGroupedOrders, function (_, groupedOrders) { return groupedOrders; });
exports.$metrics = exports.$groupedOrders.map(helper_1.computeMetrics);
exports.$tableData = effector_1.createStore([]).on(exports.addTableData, function (_, data) { return data; });
exports.$summaryData = effector_1.combine(exports.$metrics, exports.$tableData, helper_1.computeSummary);
