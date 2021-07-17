import { Service } from 'typedi';
import AppHelper from './helpers/AppHelper';
import {ArchiverException, ConfigException, FileException} from './exceptions';
import chalk from 'chalk';
import pkg from 'lodash';
import {YAMLParseError, YAMLWarning} from 'yaml';
const { get: _get, head: _head, has: _has, merge: _merge, set: _set } = pkg;

@Service()
export default class Main {
  logs: string[];

  constructor(public appHelper: AppHelper) {
    this.logs = [];
  }

  async deploy(env: string): Promise<void> {
    const filePath = 'dep-r.yml';
    try {
      const config = this.appHelper.readYAML(filePath);
      this.appHelper.logStatus('s', 'config');
      const setup = this.getSetup(config, env);
      this.appHelper.logStatus('s', 'setup');
      this.appHelper.logStatus('s', 'build');
      // Successfully deployed!
      let isCompress = false;
      await this.appHelper.compress('demo.txt', 'demo12.txt');
      this.appHelper.logStatus('s', 'upload');
      this.appHelper.logStatus('s', 'deploy');
      console.log(chalk.blue('Successfully deployed!'));

      // console.log(setup);
    } catch (e) {
      if (e instanceof FileException) {
        this.logs.push(e.message);
        this.logs.push(this.appHelper.alert('Use ' + chalk.green('init') + ' command', 'i'));
      } else if (e instanceof YAMLParseError || e instanceof YAMLWarning) {
        const line = _get(_head(e.linePos), 'line');
        const infoLine = line === undefined ? '' : ', line ' + chalk.green(line);
        this.logs.push(this.appHelper.alert('Syntax error in ' + filePath + infoLine, 'e'));
      } else if (e instanceof ConfigException) {
        this.logs.push(this.appHelper.alert(e.message, 'e'));
      } else if (e instanceof ArchiverException) {
        this.appHelper.logStatus('s', 'build');
      } else {
        console.log(e);
        this.logs.push(e.message);
      }

      this.appHelper.render(this.logs);
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
