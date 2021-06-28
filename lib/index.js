#! /usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var commander_1 = require("commander");
var init_1 = require("./commands/init");
var start_1 = require("./commands/start");
var find_1 = require("./commands/find");
var div_1 = require("./commands/div");
var program = new commander_1.Command();
program.version('0.0.1');
program.command('init').description('initialises the portfolio config').action(init_1.init);
program.command('start').description('starts processing orders in portfolio config').action(start_1.start);
program.command('div').description('gets dividends').action(div_1.div);
program
    .command('find')
    .description('finds closest tickers related to argument')
    .argument('<ticker>')
    .action(find_1.find);
program.parse();
