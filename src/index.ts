#!/usr/bin/env node
import 'reflect-metadata';

import { Container } from 'typedi';
import { Command } from 'commander';
import Main from './Main';
const program = new Command();

//const main = new Main();
const main = Container.get(Main);

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
  .argument('<env>', 'server to deploy (dev, stage, prod, etc.)')
  .description('deploy react project')
  .action((env) => {
    main.deploy(env).then(() => {});
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
  .action(() => {
    console.log('build');
  });

program.parse();

