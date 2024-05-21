
import { Logger } from './logger';
import { ConsoleTransport } from './transports';
import core from './core';
import { uuidv4 } from './utils';
import { LEVEL, LoggerOptions, LogMethods } from './types';

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

/**
 * Creates a default logger with basic levels and settings.
 */
const defaultLogger = createLogger({
  label: 'default',
  level: process.env.LOG_LEVEL || 'info',
  levels: ['fatal', 'error', 'warn', 'info', 'debug'],
  transports: [
    new ConsoleTransport()
  ]
});

defaultLogger.filter('console', (payload) => {
  return !defaultLogger.isLevelActive(payload[LEVEL]);
});

defaultLogger.transform((payload) => {
  return defaultLogger.parsePayload(payload);
});

defaultLogger.transform('console', (payload) => {
  // timestamp, filename, level, message
  const template = `%s %s %s - %s`;
  payload.message = defaultLogger.formatMessage(payload, template, 'timestamp', 'filename', 'level', 'message');
  return payload;
});


export { defaultLogger };