
import { Logger } from './logger';
import { ConsoleTransport } from './transports';
import core from './core';
import { prepareString, uuidv4 } from './utils';
import { LEVEL, LoggerOptions, LogMethods, TIMESTAMP } from './types';

const COLOR_MAP = {
  fatal: 'bgRedBright',
  error: 'redBright',
  warn: 'yellowBright',
  info: 'cyanBright',
  debug: 'magentaBright'
};

/**
 * Creates a new Logger.
 * 
 * @param options the options used to create the Logger.
 */
export function createLogger<Level extends string, Meta extends Record<string, unknown>, MetaKey extends string>(options?: LoggerOptions<Level, Meta, MetaKey>) {
  options.label = options.label || uuidv4();
  const logger = new Logger<Level, Meta, MetaKey>(options);
  core.loggers.set(options.label, logger);
  return logger as Logger<Level, Meta, MetaKey> & LogMethods<Level, Meta, MetaKey>;
}

/**
 * Creates a default logger with basic levels and settings.
 */
const defaultLogger = createLogger({
  label: 'default',
  level: (process.env.LOG_LEVEL || 'info') as 'info',
  levels: ['fatal', 'error', 'warn', 'info', 'debug'],
  transports: [
    new ConsoleTransport()
  ]
});

defaultLogger.filter('console', (payload) => {
  return !defaultLogger.isLevelActive(payload[LEVEL]);
});

defaultLogger.transform((payload) => {
  payload[TIMESTAMP] = (payload[TIMESTAMP] as Date).toUTCString();
  return defaultLogger.parsePayload(payload);
});

defaultLogger.transform('console', (payload) => {
  // timestamp, filename, level, message
  const template = `%s %s %s: %s`;
  payload.message = defaultLogger.formatMessage(
    payload, template,
    ['timestamp', 'greenBright'], 'filename',
    ['level', (value) => {
      return prepareString(value)
        .align('right', defaultLogger.options.levels)
        .uppercase()
        .colorize(COLOR_MAP[value] || '')
        .value();
    }], 'message', 'email', 'name'
  );
  return payload;
});

export { defaultLogger };