
import { Logger } from './logger';
import { ConsoleTransport } from './transports';
import core from './core';
import { randomID } from './utils';
import { ILoggerOptions, LogMethods } from './types';

/**
 * Creates a new Logger.
 * 
 * @param label the name of the Logger. 
 * @param options the options used to create the Logger.
 */
export function createLogger<Level extends string, M extends Record<string, unknown> = Record<string, unknown>>(label: string, options?: ILoggerOptions<Level, M>): Logger<Level, M> & LogMethods<Logger<Level, M>, Level>;

/**
 * Creates a new Logger.
 * 
 * @param options the options used to create the Logger.
 */
export function createLogger<Level extends string, M extends Record<string, unknown> = Record<string, unknown>>(options: ILoggerOptions<Level, M>): Logger<Level, M> & LogMethods<Logger<Level, M>, Level>;

export function createLogger<Level extends string, M extends Record<string, unknown> = Record<string, unknown>>(label: string | ILoggerOptions<Level, M>, options?: ILoggerOptions<Level, M>) {

  if (typeof label === 'object') {
    options = label as ILoggerOptions<Level, M>;
    label = undefined;
  }

  label = label || randomID();
  const logger = new Logger<Level, M>(label as string, options);
  core.loggers.set(label as string, logger);

  return logger as Logger<Level, M> & LogMethods<Logger<Level, M>, Level>;

}

export const defaultLogger = createLogger('default', {
  level: 'info',
  levels: ['fatal', 'error', 'warn', 'info', 'debug'],
  transports: [
    new ConsoleTransport()
  ]
});
