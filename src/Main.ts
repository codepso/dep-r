import { Service, Inject } from 'typedi';
import AppHelper from './helpers/AppHelper';
import {ArchiverException, ConfigException, FileException} from './exceptions';
import chalk from 'chalk';
import pkg from 'lodash';
import fs from 'fs-extra';
import {YAMLParseError, YAMLWarning} from 'yaml';
import ArchiverHelper from './helpers/ArchiverHelper';
import {set} from 'yaml/dist/schema/yaml-1.1/set';
const { get: _get, head: _head, has: _has, merge: _merge, set: _set } = pkg;

@Service()
export default class Main {

  @Inject()
  appHelper!: AppHelper;

  @Inject()
  archiverHelper!: ArchiverHelper;

  private _env: string = '';

  private _verbose: boolean = false;

  set env(value: string) {
    this._env = value;
  }

  set verbose(value: boolean) {
    this._verbose = value;
  }

  async init() {
    const file1 = 'dep-r.yml';
    const file2 = 'env.js';

    try {
      const rootPath = await this.appHelper.getRootPath(this._env);

      if (!fs.pathExistsSync(file1)) {
        fs.copySync(rootPath + 'assets/init/dep-r.yml',  file1);
        this.appHelper.logs.push(chalk.yellow(file1) + ' has been created');
      } else {
        this.appHelper.logs.push(chalk.yellow(file1) + ' hasn\'t been copied because it exists');
      }

      if (!fs.pathExistsSync(file2)) {
        fs.copySync(rootPath + 'assets/init/env.js',  file2);
        this.appHelper.logs.push(chalk.yellow(file2) + ' has been created');
      } else {
        this.appHelper.logs.push(chalk.yellow(file2) + ' hasn\'t been copied because it exists');
      }

      this.appHelper.checkList('s', 'init');

      if (this._verbose) {
        this.appHelper.renderLogs();
      }

    } catch (e) {
      if (e.code === 'ENOENT') {
        this.appHelper.logs.push(e.message);
      }

      this.appHelper.renderLogs();
    }
  }

  async deploy(stage: string): Promise<void> {
    const filePath = 'dep-r.yml';
    try {

      // Config
      const config = this.appHelper.readYAML(filePath);
      this.appHelper.logs.push('File ' + chalk.yellow(filePath) + ' found');
      this.appHelper.checkList('s', 'config');
      // Setup
      const setup = this.getSetup(config, stage);
      console.log(setup);
      this.appHelper.logs.push('get credentials from ' + stage + ' server');
      this.appHelper.checkList('s', 'setup');

      // Build
      this.appHelper.checkList('s', 'build');
      await this.archiverHelper.compress('demo.txt', 'demo12.txt');
      this.appHelper.checkList('s', 'upload');
      this.appHelper.checkList('s', 'deploy');
      console.log(chalk.blue('Successfully deployed!'));

      if (this._verbose) {
        this.appHelper.renderLogs();
      }
    } catch (e) {
      if (e instanceof FileException) {
        this.appHelper.logs.push(e.message);
        this.appHelper.logs.push('use ' + chalk.green('init') + ' command');
      } else if (e instanceof YAMLParseError || e instanceof YAMLWarning) {
        const line = _get(_head(e.linePos), 'line');
        const infoLine = line === undefined ? '' : ', line ' + chalk.green(line);
        this.appHelper.logs.push('syntax error in ' + filePath + infoLine);
      } else if (e instanceof ConfigException) {
        this.appHelper.logs.push(e.message);
      } else if (e instanceof ArchiverException) {
        this.appHelper.checkList('s', 'build');
      } else {
        this.appHelper.logs.push(e.message);
      }

      this.appHelper.renderLogs();
    }
  }

  getSetup(config: object, env: string): object {
    const app = _get(config, 'app');
    if (app === undefined) {
      throw new ConfigException('App definition not found');
    }

    const serverEnv = _get(config, 'servers.' + env);
    if (serverEnv === undefined) {
      throw new ConfigException('Server ' + chalk.green(env) + ' not found');
    }

    const serverMain = _get(config, 'servers.main');
    if (serverMain === undefined) {
      throw new ConfigException('Server ' + chalk.green('main') + ' not found');
    }

    const setup = _merge(app, serverMain, serverEnv);
    const protocol = _has(config, 'server.protocol') ? _get(config, 'server.protocol') : 'ssh';
    if (!_has(setup, 'protocol')) {
      _set(setup, 'protocol', protocol);
    }

    return setup;
  }
}
