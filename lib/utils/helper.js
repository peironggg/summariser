"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorLog = exports.logSummary = exports.log = exports.writeLocalConfig = exports.readLocalConfig = void 0;
var fs_1 = __importDefault(require("fs"));
var chalk_1 = __importDefault(require("chalk"));
var constants_1 = require("./constants");
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
var log = function (message) {
    console.log(chalk_1.default.bold.white(message));
};
exports.log = log;
var logSummary = function (rows) {
    console.log(chalk_1.default.bold.white("Date: " + new Date().toDateString()));
    console.table(rows);
};
exports.logSummary = logSummary;
var errorLog = function (message) {
    console.log(chalk_1.default.bold.red(message));
};
exports.errorLog = errorLog;
