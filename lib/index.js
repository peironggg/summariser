#! /usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var commander_1 = require("commander");
var init_1 = require("./commands/init");
var program = new commander_1.Command();
program.version('0.0.1');
program.command('init').description('initialises the portfolio config').action(init_1.init);
program.parse();
