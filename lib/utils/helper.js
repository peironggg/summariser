"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.writeLocalConfig = void 0;
var fs_1 = __importDefault(require("fs"));
var constants_1 = require("./constants");
var writeLocalConfig = function (config) {
    fs_1.default.writeFileSync(constants_1.LOCAL_CONFIG_PATH, JSON.stringify(config));
};
exports.writeLocalConfig = writeLocalConfig;
