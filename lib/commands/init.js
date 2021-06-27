"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.init = void 0;
var ora_1 = __importDefault(require("ora"));
var fs_1 = __importDefault(require("fs"));
var helper_1 = require("../utils/helper");
var constants_1 = require("../utils/constants");
var init = function () {
    var spinner = ora_1.default({ spinner: 'circle' });
    spinner.start('Initializing');
    // Setup .summariser.json if does not exist
    !fs_1.default.existsSync(constants_1.LOCAL_CONFIG_PATH) && helper_1.writeLocalConfig(constants_1.DEFAULT_CONFIG);
    spinner.succeed('Done');
};
exports.init = init;
