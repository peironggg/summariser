#! /usr/bin/env node
import { Command } from 'commander';
import { init } from './commands/init';

const program = new Command();

program.version('0.0.1');

program.command('init').description('initialises the portfolio config').action(init);

program.parse();
