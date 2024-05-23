
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
  const ts = (payload[TIMESTAMP] as Date).toISOString();
  let [date, time] = ts.split('T');
  date = date.split('-').slice(1).join('-');
  time = time.split(/\..+$/)[0];
  payload[TIMESTAMP] = `${time} ${date}`;
  return defaultLogger.parsePayload(payload);
});

defaultLogger.transform('console', (payload) => {
  // timestamp, filename, level, message
  const template = `%s %s: %s (%s-%s:%s)`;

  const fmtLevel = (value) => {
    return prepareString(value)
      .align('right', defaultLogger.options.levels)
      .colorize(COLOR_MAP[value] || '')
      .value();
  };
  payload.message = defaultLogger.formatMessage(
    payload, template,
    ['level', fmtLevel], ['filename', 'gray'],
    ['line', 'gray'], ['char', 'gray'],
    'timestamp', ['level', fmtLevel], 'message',
    ['filename', 'gray'], ['line', 'gray'], ['char', 'gray'],
  );
  return payload;
});

export { defaultLogger }; 