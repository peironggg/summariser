"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.div = void 0;
var yahoo_finance2_1 = __importDefault(require("yahoo-finance2"));
var div = function () {
    yahoo_finance2_1.default
        .historical('D05.SI', { period1: '2019-6-1', events: 'div' }, { validateResult: false })
        .then(function (res) { return console.log(res); });
};
exports.div = div;
