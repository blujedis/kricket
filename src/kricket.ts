
import { Logger } from './logger';
import { ConsoleTransport } from './transports';
import core from './core';
import { LoggerOptions, LogMethods } from './types';
import { uuidv4 } from './utils';

/**
 * Creates a new Logger.
 * 
 * @param options the options used to create the Logger.
 */
// export function createLogger<Level extends string, M extends Record<string, unknown> = Record<string, unknown>>(options: LoggerOptions<Level, M>): Logger<Level, M> & LogMethods<Logger<Level, M>, Level>;

/**
 * Creates a new Logger.
 * 
 * @param label the name of the Logger. 
 * @param options the options used to create the Logger.
 */
// export function createLogger<Level extends string, M extends Record<string, unknown> = Record<string, unknown>>(label: string, options?: LoggerOptions<Level, M>): Logger<Level, M> & LogMethods<Logger<Level, M>, Level>;

// export function createLogger<Level extends string, M extends Record<string, unknown> = Record<string, unknown>>(labelOrOptions: string | LoggerOptions<Level, M>, options?: LoggerOptions<Level, M>) {

/**
 * Creates a new Logger.
 * 
 * @param options the options used to create the Logger.
 */
export function createLogger<Level extends string, Meta extends Record<string, unknown> = Record<string, unknown>>(options?: LoggerOptions<Level, Meta>) {
  options.label = options.label || uuidv4();
  const logger = new Logger<Level, Meta>(options);
  core.loggers.set(options.label, logger);
  return logger as Logger<Level, Meta> & LogMethods<Logger<Level, Meta>, Level>;
}

export const defaultLogger = createLogger({
  label: 'default',
  level: 'info',
  levels: ['fatal', 'error', 'warn', 'info', 'debug'],
  transports: [
    new ConsoleTransport()
  ]
});
