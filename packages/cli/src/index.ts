#!/usr/bin/env node

import { Command } from 'commander';
import { init } from './commands/init.js';
import { add } from './commands/add.js';
import { diff } from './commands/diff.js';

const program = new Command();

program
  .name('basis-ui')
  .description('Add beautiful Astro + Alpine.js components to your project')
  .version('0.1.4');

program
  .command('init')
  .description('Initialize your Astro project for basis-ui')
  .option('-y, --yes', 'Skip confirmation prompts')
  .option('-c, --cwd <cwd>', 'Current working directory', process.cwd())
  .action(init);

program
  .command('add')
  .description('Add components to your project')
  .argument('[components...]', 'Components to add')
  .option('-y, --yes', 'Skip confirmation prompts')
  .option('-o, --overwrite', 'Overwrite existing files')
  .option('-c, --cwd <cwd>', 'Current working directory', process.cwd())
  .option('-p, --path <path>', 'Path to components folder', './src/components/ui')
  .action(add);

program
  .command('diff')
  .description('Check for component updates')
  .argument('[component]', 'Component to check')
  .option('-c, --cwd <cwd>', 'Current working directory', process.cwd())
  .action(diff);

program.parse();