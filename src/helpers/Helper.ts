import logSymbols from 'log-symbols';
import chalk from 'chalk';
import pkg from 'lodash';
const { has: _has } = pkg;

export default class Helper {

  logs: string[];

  constructor() {
    this.logs = [];
  }

  throwException = (message: string) => {
    throw {message};
  };

  checkList(status: string, message: string): void {
    switch (status) {
      case 'success':
      case 's':
        console.log(logSymbols.success, 'Task executed ' + chalk.blue(message));
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
}
