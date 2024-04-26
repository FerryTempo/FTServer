import Logger from '../src/Logger.js';
import {jest} from '@jest/globals'

describe('Logger', () => {
  let logger;

  beforeEach(() => {
    logger = new Logger();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('info method logs message with level "info"', () => {
    const spy = jest.spyOn(logger.logger, 'log');
    const message = 'This is an info message';
    logger.info(message);
    expect(spy).toHaveBeenCalledWith('info', message);
  });

  test('warn method logs message with level "warn"', () => {
    const spy = jest.spyOn(logger.logger, 'log');
    const message = 'This is a warning message';
    logger.warn(message);
    expect(spy).toHaveBeenCalledWith('warn', message);
  });

  test('error method logs message with level "error"', () => {
    const spy = jest.spyOn(logger.logger, 'log');
    const message = 'This is an error message';
    logger.error(message);
    expect(spy).toHaveBeenCalledWith('error', message);
  });
});
