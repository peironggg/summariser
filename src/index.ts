#! /usr/bin/env node
import { Command } from 'commander';
import { init } from './commands/init';
import { start } from './commands/start';
import { find } from './commands/find';
import { div } from './commands/div';

const program = new Command();

program.version('0.0.1');

program.command('init').description('initialises the portfolio config').action(init);

program.command('start').description('starts processing orders in portfolio config').action(start);

program.command('div').description('gets dividends').action(div);

program
  .command('find')
  .description('finds closest tickers related to argument')
  .argument('<ticker>')
  .action(find);

program.parse();
