import { Service } from 'typedi';
import readPackageJson from '@pnpm/read-package-json';
import chalk from 'chalk';
import pkg from 'lodash';
import fs from 'fs';
import YAML from 'yaml';
import {ArchiverException, FileException} from '../exceptions';
import archiver from 'archiver';
import logSymbols from 'log-symbols';

const { has: _has, pick: _pick, get: _get, replace: _replace, isArray: _isArray } = pkg;

@Service()
export default class AppHelper {

  logs: string[];

  constructor() {
    this.logs = [];
  }

  throwException = (message: string) => {
    throw {message};
  };

  readYAML = (filePath: string): any => {
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

  getError = (error: any, params: any = {}): string => {
    let message = 'There was an unknown error';
    if (typeof error === 'string') {
      message = error;
    }
    if (_has(error, 'message')) {
      message = error.message;
    }
    if (_has(error, 'code')) {
      switch (error.code) {
        case 'ENOENT':
          const action = _has(error, 'syscall') ? error.syscall + ' ' : '';
          if (_has(error, 'path')) {
            message = 'No such file or directory ' + action + chalk.yellow(error.path);
          }
          break;
      }
    }

    if (_has(params, 'clean')) {
      return message;
    } else {
      return chalk.red('E: ') +  message;
    }
  }

  alert(message: string, type: string): string {
    switch (type) {
      case 'info':
      case 'i':
        message = chalk.yellow('I: ') + message;
        break;
      case 'error':
      case 'e':
        message = chalk.yellow('E: ') + message;
        break;
    }

    return message
  }

  compress(file: string, name: string): void {
    const self = this;
    const output = fs.createWriteStream('example.tar.gz');
    const archive = archiver('tar', {
      gzip: true,
      gzipOptions: {
        level: 1
      }
    });

    output.on('close', function() {
      self.logs.push(archive.pointer() + ' total bytes.');
      self.logs.push('archiver has been finalized and the output file  has closed.');
      self.logStatus('s', 'compress');
    });

    archive.on('error', function(e) {
      self.logs.push(e.message);
      self.logStatus('e', 'compress');
      throw new ArchiverException(self.getError(e));
    });

    archive.pipe(output);
    archive.append(fs.createReadStream(file), { name });
    archive.finalize().then(() => {});
  }

  logStatus(status: string, message: string): void {
    switch (status) {
      case 'success':
      case 's':
        console.log(logSymbols.success, 'Executing task ' + chalk.blue(message));
    }
  }
}
