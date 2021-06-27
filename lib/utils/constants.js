"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULT_CONFIG = exports.LOCAL_CONFIG_PATH = void 0;
var path_1 = __importDefault(require("path"));
exports.LOCAL_CONFIG_PATH = path_1.default.join(__dirname, '../..', '.summariser.json');
exports.DEFAULT_CONFIG = {
    orders: [{ ticker: 'AAPL', purchaseDate: '3/5/2019', volume: 1000 }],
};
