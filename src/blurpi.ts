
import { Logger } from './logger';
import { ConsoleTransport } from './transports';
import core from './core';
import { ILoggerOptions, LogMethods } from './types';

/**
 * Creates a new Logger.
 * 
 * @param label the name of the Logger. 
 * @param options the options used to create the Logger.
 */
export function createLogger<Level extends string>(label: string, options?: ILoggerOptions<Level>) {
  const logger = new Logger(label, options, null);
  core.loggers.set(label, logger);
  return logger as Logger<Level> & LogMethods<Logger<Level>, Level>;
}

export const defaultLogger = createLogger('default', {
  level: 'info',
  levels: ['fatal', 'error', 'warn', 'info', 'debug'],
  transports: [
    new ConsoleTransport({ asJSON: false }),
    new ConsoleTransport({ asJSON: true }, 'console2')
  ]
});
