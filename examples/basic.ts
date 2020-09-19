import { createLogger, ConsoleTransport, FileTransport, LEVEL, MESSAGE, SPLAT } from 'kricket';
import { stripColor, redBright, bgRedBright, blueBright, yellowBright, cyanBright } from 'ansi-colors';
import { format, inspect } from 'util';

const META = Symbol.for('META');

type Level = keyof typeof COLOR_MAP;

const COLOR_MAP = {
  fatal: bgRedBright,
  error: redBright,
  warn: yellowBright,
  info: cyanBright,
  verbose: blueBright
};

const logger = createLogger<Level>({
  level: 'info',
  levels: Object.keys(COLOR_MAP) as Level[],
  transports: [
    new ConsoleTransport<Level>({ label: 'console', asJSON: false }),
    new FileTransport<Level>({ label: 'file', level: 'warn' })
  ]
});

/**
 * Converts an error to object literal.
 * 
 * @param err the error to convert to object
 */
function errToObj<E extends Error>(err: E) {
  if (!(err instanceof Error))
    return err;
  return Object.getOwnPropertyNames(err).reduce((a, c) => {
    a[c] = err[c];
    return a;
  }, {} as Record<keyof E, any>);
}

logger.filter('console', (payload) => {
  return !logger.isLevelActive(payload[LEVEL]);
});

logger.transform((payload) => {

  let meta = {};

  if (typeof payload[SPLAT].slice(-1)[0] === 'object')
    meta = payload[SPLAT].pop();

  // if payload message is an error.
  if ((payload[MESSAGE] as any) instanceof Error) {
    const err = payload[MESSAGE] as any;
    payload.message = err.message;
    meta = { ...meta, err: errToObj(err) };
  }

  // Store meta we'll use in console.
  payload = {
    ...payload,
    [META]: meta
  };

  // format args add metadata.
  payload.message = format(payload.message, ...payload[SPLAT]);
  payload = { ...payload, ...meta };

  return payload;

});

logger.transform('console', (payload) => {
  let label = '';
  if (logger.levels.includes(payload[LEVEL] as any))
    label = COLOR_MAP[payload[LEVEL]](payload[LEVEL]) + ': ';
  if (payload[META as any]) {
    // Strip out error as it would display stack and fill console.
    const { err, ...clean } = payload[META as any];
    if (Object.keys(clean).length)
      payload.message += (' ' + inspect(clean, null, null, true));
  }
  payload.message = label + payload.message;
  return payload;
});

logger.transform('file', (payload) => {
  payload.message = stripColor(payload.message);
  return payload;
});

export default logger;