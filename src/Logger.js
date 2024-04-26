/**
 * Logger.js
 * ============
 * Wrapper around Winston logger capability that will allowus to standardize logging for FTServer more easily.
 *
 * For now I am keeping the console logger with default level of info. The log level can be overridden via an environment varaible.
 * I setup cli logging to keep things consistent with the way we had before, but we could switch to json logging and add a timestamp
 * by adding the following 
 * 
 * Winston logging guide used for configuration found here:
 * https://betterstack.com/community/guides/logging/how-to-install-setup-and-use-winston-and-morgan-to-log-node-js-applications/
 */
import { createLogger, format, transports } from 'winston';

class Logger {
  constructor() {
    this.logger = createLogger({
      level: process.env.LOG_LEVEL || 'info',
      format: format.cli(),
      transports: [
        new transports.Console(),
      ]
    });
  }

  info(message) {
    this.logger.log('info', message);
  }

  warn(message) {
    this.logger.log('warn', message);
  }

  error(message) {
    this.logger.log('error', message);
  }
}

export default Logger;