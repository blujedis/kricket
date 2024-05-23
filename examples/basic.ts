import { createLogger, ConsoleTransport, FileTransport, LEVEL, MESSAGE, SPLAT } from '../src';
import { StyleFunction } from 'ansi-colors';
import { stripColor, redBright, bgRedBright, blueBright, yellowBright, cyanBright } from 'ansi-colors';
import { format, inspect } from 'util';
import { errorToObject } from '../src/utils';

type Level = keyof typeof COLOR_MAP;

const COLOR_MAP = {
  fatal: bgRedBright,
  error: redBright,
  warn: yellowBright,
  info: cyanBright,
  silly: blueBright
};

// We'll use the color map above for formatting
// but for now use it's keys as the typed levels
// for our logger.
const logger = createLogger<Level>({
  // if no level is provided the most verbose one will be used.
  level: 'info',
  levels: Object.keys(COLOR_MAP) as Level[],
  transports: [

    // For console we likely want a little more verbosity.
    new ConsoleTransport<Level>({ label: 'console' }),

    // For file we probably don't want to log every message.
    new FileTransport<Level>({ label: 'file', level: 'error' })
  ]
});

// Filter logs if the current payload's level is not active.
logger.filter('console', (payload) => {
  return !logger.isLevelActive(payload[LEVEL]);
});

// [NOTE] !!!!!!!
// The below is intentionally verbose so you understand
// how to use the transforms. You can use built in helpers
// for sane parsing that simply do internally what the below
// is showing.

// coloredString = colorize(value, ...colorFunctions);
// payload = logger.parsePayload(payload) - handles what you see below in global transform.
// formattedString = logger.formatMessage(payload, template, ...args) - formats and colorizes payload.message

// This is a global transform that will run 
// before named transforms.
logger.transform((payload) => {

  let meta = {};

  // First or last value in Splat array can be an object.
  // if it is remove it and treat it as an object/meta information.
  if (typeof payload[SPLAT].slice(-1)[0] === 'object')
    meta = payload[SPLAT].pop();

  // if payload message is an error.
  // convert it to an object literal
  // using a built in helper.
  if ((payload[MESSAGE]) instanceof Error) {
    const err = payload[MESSAGE] as any;
    payload.message = err.message;
    meta = { ...meta, err: errorToObject(err) };
  }

  // Using Node's format utility we format our 
  // payload's message, this could also be skipped
  // here if you didn't want to format remaining args.
  // you would then do this in the transform below
  // specific to the console transport.
  payload.message = format(payload.message, ...payload[SPLAT]);

  // Update the payload with our parsed/updated
  // payload so other transports can consume it.
  payload = { ...payload, ...meta };

  return payload;

});

logger.transform('console', (payload) => {

  let label = '';

  // colorizes the level for the message.
  if (logger.levels.includes(payload[LEVEL])) {
    const styleFunc = COLOR_MAP[payload[LEVEL]] as StyleFunction;
    label = styleFunc(payload[LEVEL]) + ': ';
  }

  // Adds the label and the payload's message. 
  payload.message = label + payload.message;
  return payload;

});

logger.transform('file', (payload) => {
  // Shouldn't be required but just as an example
  // the below helper strips ansi chars from your message
  // in the event it was colorized.
  payload.message = stripColor(payload.message);
  return payload;
});

export default logger;