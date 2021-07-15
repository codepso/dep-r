export class FileException extends Error {
  constructor(message: string) {
    super(message);
    Object.setPrototypeOf(this, FileException.prototype)
  }
}

export class ConfigException extends Error {
  constructor(message: string) {
    super(message);
    Object.setPrototypeOf(this, ConfigException.prototype)
  }
}

export class ArchiverException extends Error {
  constructor(message: string) {
    super(message);
    Object.setPrototypeOf(this, ArchiverException.prototype)
  }
}
