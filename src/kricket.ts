
import { Logger } from './logger';
import { ConsoleTransport } from './transports';
import core from './core';
import { format } from 'util';
import { alignString, colorizeString, uuidv4 } from './utils';
import { AnsiColor, CHAR, FILENAME, LEVEL, LINE, LoggerOptions, LogMethods, TIMESTAMP } from './types';

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
export function createLogger<Level extends string, Meta extends Record<string, unknown> = undefined>(options?: LoggerOptions<Level, Meta>) {
  options.label = options.label || uuidv4();
  const logger = new Logger<Level, Meta>(options);
  core.loggers.set(options.label, logger);
  return logger as Logger<Level, Meta> & LogMethods<Level, Meta>;
}

/**
 * Creates a default logger with basic levels and settings.
 */
const defaultLogger = createLogger({
  label: 'default',
  level: (process.env.LOG_LEVEL || 'info') as 'fatal' | 'error' | 'warn' | 'info' | 'debug',
  levels: ['fatal', 'error', 'warn', 'info', 'debug'],
  meta: { age: 25 },
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

  // Make timestamp a hair more readable. 
  let timestamp = (payload[TIMESTAMP] as Date).toISOString();
  let [date, time] = timestamp.split('T');
  date = date.split('-').slice(1).join('-');
  time = time.split(/\..+$/)[0];
  timestamp = `${date} ${time}`;

  // timestamp, level, message, filename, line, char
  const template = `%s %s: %s %s`;
  const filename = colorizeString(`(${payload[FILENAME]}:${payload[LINE]}:${payload[CHAR]})`, 'gray');
  let level = alignString(payload[LEVEL], 'right', defaultLogger.options.levels);
  level = colorizeString(payload[LEVEL], COLOR_MAP[payload[LEVEL]] as AnsiColor);
  payload.message = format(template, colorizeString(timestamp, 'gray'), level, payload.message, filename)
  return payload;
});

export { defaultLogger }; 