import { Service } from 'typedi';
import readPackageJson from '@pnpm/read-package-json';
import chalk from 'chalk';
import pkg from 'lodash';
import fs from 'fs';
import YAML from 'yaml';
import util from 'util';
import { exec } from 'child_process'
import {FileException} from '../exceptions';
import Helper from './Helper';

const { has: _has, pick: _pick, get: _get, replace: _replace, isArray: _isArray } = pkg;

@Service()
export default class AppHelper extends Helper {

  readYAML(filePath: string): any  {
    try {
      const file = fs.readFileSync(filePath, 'utf8');
      return YAML.parse(file);
    } catch (e) {
      if (e.code === 'ENOENT') {
        throw new FileException(this.getError(e));
      }
      throw e;
    }
  }

  async getRootPath(env: string): Promise<string> {
    const shell = util.promisify(exec);
    const {stdout} = await shell('npm root -g');
    const globalPath = stdout.replace(/\n$/, '') + '/@codepso/rn-rad/';
    return (env === 'prod') ? globalPath : './src/';
  }

  checkPackages = async (requiredPackages: Map<string, string>, continueFlow: boolean = false) => {
    try {
      const keys = Array.from(requiredPackages.keys());
      const currentPackages = await readPackageJson('package.json');
      const r = _pick(currentPackages['dependencies'], keys);

      keys.forEach(key => {
        if (!_has(r, key)) {
          this.logs.push('Package ' + chalk.yellow(key) + ' not found');
        }
      });

      if (this.logs.length > 0 && !continueFlow) {
        this.throwException('Some packages weren\'t found');
      }

      keys.forEach(key => {
        const required = requiredPackages.get(key);
        const current = this.sanitizePackageVersion(_get(currentPackages, 'dependencies.' + key));
        if (required && _has(currentPackages, 'dependencies.' + key) && !this.isHigherVersion(current, required)) {
          this.logs.push('Package ' + chalk.yellow(key) + ' must be ' + chalk.yellow(required) + ' or gather');
        }
      });

      if (this.logs.length > 0 && !continueFlow) {
        this.throwException('Some packages have different versions');
      }

      return this.logs.length <= 0;
    } catch (e) {
      throw e;
    }
  }

  isHigherVersion = (current: string, required: string) => {
    const lA = required.split('.'), lB = current.split('.');
    for (let i = 0; i < lA.length; i ++) {
      const vA = parseInt(lA[i]), vB = parseInt(lB[i]);
      if (vA > vB) {
        return false;
      }
      if (vB > vA) {
        return true;
      }
    }

    return true;
  }

  sanitizePackageVersion = (version: string): string => {
    return _replace(version, '^', '');
  };

  /**
   * Render.
   * @param {(string|string[])} result - Lists or string.
   * @param {string} as - Type: plain, list, etc.
   * @returns {string}
   */
  render = (result: string[]|string, as: string = 'list') => {
    const prefix = as === 'list' ? '- ' : '';
    if (_isArray(result) && result.length > 0) {
      result.forEach(element => console.log(prefix + element));
    }

    if (!_isArray(result)) {
      console.log(prefix + result);
    }
  }

  alert(message: string, type: string, render: boolean = false): string {
    switch (type) {
      case 'info':
      case 'i':
        message = chalk.yellow('Info: ') + message;
        break;
      case 'error':
      case 'e':
        message = chalk.red('Error: ') + message;
        break;
      case 'note':
      case 'n':
        message = chalk.blue('Note: ') + message;
        break;
    }

    if (render) {
      console.log(message);
    }
    return message;
  }

  renderLogs() {
    console.log('');
    console.log('Logs');
    console.log('----');
    this.render(this.logs);
  }

  getFilenameToCompress(setup: object): string {
    console.log(setup);
    return '';
  }
}
