/**
 * Simple internal logger.
 * 
 * @deprecated favor throwing errors as that's all this was used for.
 */

import { red, yellow, cyan, white, bgBlue, blueBright } from 'ansi-colors';
import { format } from 'util';

export type LogGroup<T> = T & {
  end(indent: string, exit?: boolean): void;
  end(indent: number, exit?: boolean): void;
  end(exit: boolean): void;
  end(): void;
}

export type LogType = keyof typeof TYPES;

export type LogTypeExt = LogType | 'write';

export type Color = keyof typeof ANSI_COLORS;

export type ReverseType = keyof typeof REVERSE_TYPES;

export type WriterCallback<T = any, E extends object = object> = (err?: Error & E, data?: T) => void;


export const ANSI_COLORS = {
  red,
  yellow,
  cyan,
  white,
  bgBlue
};

const TYPES = {
  error: 'red',
  warn: 'yellow',
  info: 'cyan'
};

const REVERSE_TYPES = {
  red: 'error',
  yellow: 'warn',
  cyan: 'info'
};

/**
 * Colorizes a string.
 * 
 * @param str the string to be colorized.
 * @param color the ansi-color to apply.
 */
export function colorize(str: string, color: Color) {
  return ANSI_COLORS[color](str);
}

function writer(str: string, shouldExit: boolean | WriterCallback, cb?: WriterCallback) {
  if (typeof shouldExit === 'function') {
    cb = shouldExit as WriterCallback;
    shouldExit = undefined;
  }
  // eslint-disable-next-line
  cb = cb || ((...args) => { });

  const onError = (err) => {
    if (err)
      throw err;
  };

  if (shouldExit) {
    process.stderr.write(str + '\n', onError);
    process.stderr.on('close', cb);
    process.stderr.emit('close');
  }
  else {
    process.stdout.write(str + '\n', onError);
  }

}

export interface LogOptions {
  /**
   * Prefix line with this string or true uses [kricket]. (default: true)
   */
  prefix?: string;
  type?: LogTypeExt;
  exit?: boolean;
}

function log(message: string, { type, exit, prefix }: LogOptions = {}) {

  const color = TYPES[type] as Color;

  if (color)
    message = colorize(message, color);

  if (prefix)
    message = prefix + message;

  writer(message, exit, () => {
    if (exit)
      process.exit(1);
  });

  return log;

}

function write(color: Color, message: string, ...args: any[]): typeof log;
function write(message: string, ...args: any[]): typeof log;
function write(color: string, message: string, ...args: any[]) {
  if (!Object.keys(ANSI_COLORS).includes(color)) {
    if (typeof message !== 'undefined') {
      args.unshift(message);
      message = undefined;
    }
    message = color as string;
    color = undefined;
  }
  return log(format(message, ...args));
}

log.write = write;

log.fatal = (message: string, ...args: any[]) => log(format(message, ...args), { type: 'error', exit: true });

log.error = (message: string, ...args: any[]) => log(format(message, ...args), { type: 'error' });

log.warn = (message: string, ...args: any[]) => log(format(message, ...args), { type: 'warn' });

log.info = (message: string, ...args: any[]) => log(format(message, ...args), { type: 'info' });

function group(title?: string, color?: ReverseType | boolean, compact?: boolean) {

  let lines: [string, LogTypeExt, boolean?][] = [] as any;
  let before = '';
  let after = '';

  if (typeof color === 'boolean') {
    compact = color as boolean;
    color = undefined;
  }

  if (title)
    lines.push([title + '\n', (color && REVERSE_TYPES[color as ReverseType] as any) || 'write']);

  const api = {

    write: (message: string, ...args: any[]) => {
      lines.push([format(message, ...args), 'write']);
      return api;
    },

    error: (message: string, ...args: any[]) => {
      lines.push([format(message, ...args), 'error']);
      return api;
    },

    warn: (message: string, ...args: any[]) => {
      lines.push([format(message, ...args), 'warn']);
      return api;
    },

    info: (message: string, ...args: any[]) => {
      lines.push([format(message, ...args), 'info']);
      return api;
    },

    before: (value: string | number) => {
      if (typeof value === 'number')
        before = '\n'.repeat(value);
      else
        before = value;
      return api;
    },

    /**
     * Adds value after group is logged.
     * if number repeats line returns.
     * 
     * @param value a string or number rep the number of line returns.
     */
    after: (value: string | number) => {
      if (typeof value === 'number')
        after = '\n'.repeat(value);
      else
        after = value;
      return api;
    },

    end: (indent: number | string | boolean = '', exit = false) => {

      if (typeof indent === 'boolean') {
        exit = indent;
        indent = '';
      }

      if (before)
        log.write(before);

      if (title && !compact)
        log.write('\n');

      if (typeof indent === 'number')
        indent = ' '.repeat(indent);

      lines.forEach(line => {
        line[0] = indent + line[0];
        const [msg, as] = line;
        log[as](msg);
      });

      lines = null;

      // When titles are used we prefix
      // both before and after with line return
      // for proper group display.
      if (title && !compact)
        log.write('\n');

      if (after)
        log.write(after);

      if (exit) {
        process.stderr.on('close', () => {
          process.exit(1);
        });
        process.stderr.emit('close');
      }

    }

  };

  type Api = typeof api;

  return api as LogGroup<Api>;

}

interface Group {
  (title?: string, color?: ReverseType | boolean, compact?: boolean): ReturnType<typeof group>;
  (title?: string, compact?: boolean): ReturnType<typeof group>;
}

log.group = group as unknown as Group;

export { log };