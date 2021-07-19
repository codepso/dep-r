#!/usr/bin/env node
import 'reflect-metadata';

import { config } from 'dotenv';
import { Container } from 'typedi';
import { Command } from 'commander';
import Main from './Main';
import pkg from 'lodash';

const { get: _get} = pkg;
const program = new Command();
config();

const env: string = process.env.APP_ENV ?? 'dev';
const main = Container.get(Main);
main.env = env;

/*import AppHelper from './helper/AppHelper';

const requiredPackages = new Map([ ['lodash', '4.18'] ]);

(async function init() {
  const appHelper = new AppHelper();
  try {
    // await appHelper.checkPackages(requiredPackages);
    // appHelper.readDepRjsConfig('');
  } catch (e) {
    console.log('message:', e.message);
    appHelper.renderLog();
  }
})();*/



program.version('0.0.1');

program
  .command('deploy')
  .argument('<stage>', 'server to deploy (dev, stage, prod, etc.)')
  .option('-v, --verbose', 'output extra logs')
  .description('deploy react project')
  .action((stage, options) => {
    main.deploy(stage).then(() => {});
  });

program
  .command('build')
  .description('build react project')
  .action(() => {
    console.log('build');
  });

program
  .command('init')
  .description('build reactjs project')
  .option('-v, --verbose', 'output extra logs')
  .action((options) => {
    main.verbose = _get(options, 'verbose', false);
    main.init().then(() => {});
  });

program.parse();

