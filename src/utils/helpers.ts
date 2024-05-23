import ansiColors, { StyleFunction, stripColor } from 'ansi-colors';
import { AnsiColor } from '../types';

export type HandlerFunction = (...args: any[]) => any;

/**
 * Checks if value is an object.
 * 
 * @param value the value to inspect as object.
 */
export function isObject(value: unknown): value is object {
  return value != null && typeof value === 'object' && Array.isArray(value) === false;
}

/**
 * Checks if value is a function
 * 
 * @param value the value to inspect as function.
 */
export function isFunction(value: unknown): value is HandlerFunction {
  return typeof value === 'function';
}

/**
 * Checks if object is plain object literal.
 * 
 * @param value the object to inspect as object literal.
 */
export function isPlainObject(value: unknown): value is object {
  return (isObject(value) === true &&
    Object.prototype.toString.call(value) === '[object Object]') &&
    isFunction(value.constructor) &&
    value.constructor.name === 'Object';
}

/**
 * Gets name of an object.
 * 
 * @param obj the object to inspect.
 * @param lower whether to convert resutl to lowercase.
 */
export function getObjectName<T extends { [key: string]: any; } = object>(obj: T, lower = true): string {
  const value = obj && (obj.name || (obj.constructor && obj.constructor.name) || null);
  if (typeof value === 'string' && lower)
    return value.toLowerCase();
  return value;
}

// eslint-disable-next-line 
export function noop(...args: any[]) { }

/**
 * Flattens multi dimensional array.
 * 
 * @param arr the array to be flattened. 
 */
export function flatten<T = any>(arr: T[]): T[] {
  return arr.reduce((a, c) => [...a, ...(Array.isArray(c) ? flatten(c) : [c])], []);
}

/**
 * Generate uuid.
 */
export function uuidv4(a?) {
  return a ? (a ^ Math.random() * 16 >> a / 4).toString(16) : ([1e7] as any + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, uuidv4);
}

/**
 * Converts an error to object literal.
 * 
 * @param err the error to convert to object
 */
export function errorToObject<E extends Error>(err: E) {
  if (!(err instanceof Error))
    return err;
  return Object.getOwnPropertyNames(err).reduce((a, c) => {
    a[c] = err[c];
    return a;
  }, {} as Record<keyof E, any>);
}


/**
 * If undefined empty array is returned otherwise the array or value wrapped as array is.
 *
 * @param value the value to inspect as any array.
 * @param clean when true and is array clean any undefined.
 */
export function ensureArray<T = any>(value: null | undefined | T | T[], clean = true) {
  if (typeof value === 'undefined' || value === null || value === '') return [] as T[];
  if (Array.isArray(value))
    return (clean ? value.filter((v) => typeof v !== 'undefined') : value) as T[];
  return [value] as T[];
}

/**
 * Colorizes a value using ansi-colors.
 * 
 * @param value the value to be colorized.
 * @param colors the style or stles to be applied.
 */
export function colorizeString(value: any, ...colors: AnsiColor[]) {
  return colors.reduce((a, c) => {
    const fn = ansiColors[c] as StyleFunction;
    if (isFunction(fn))
      return fn(value);
    return a;
  }, String(value));
}

/**
 * Aligns a string based on all possible values.
 * 
 * 
 * @param value the value to be aligned. 
 * @param align whether to align left right or center relative to all possible values.
 * @param values the possible values which alignment is relative to.
 */
export function alignString(value: any, align: 'left' | 'right' | 'center', values: string[]) {
  const maxLen = values.reduce((a, c) => (c.length > a ? c.length : a), 0);
  value = String(value);
  value = stripColor(value); // ensure we don't count any ansi color tokens. 
  const len = Math.max(0, maxLen - value.length);
  if (align === 'left')
    return value + ' '.repeat(len);
  else if (align === 'right')
    return ' '.repeat(len) + value;
  const floor = Math.floor(len / 2);
  const rem = len % 2;
  return ' '.repeat(rem) + ' '.repeat(floor) + value + ' '.repeat(floor);
}

export function prepareString(value: any) {

  let _value = String(value);

  const api = {
    colorize,
    align,
    capitalize,
    uppercase,
    lowercase,
    stripColor: colorStrip,
    value: getValue
  };

  function align(alignment: Parameters<typeof alignString>[1], values: Parameters<typeof alignString>[2],) {
    _value = alignString(_value, alignment, values);
    return api;
  }

  function colorize(...args: Parameters<typeof colorizeString>[1][]) {
    if (!args.length)
      return api;
    _value = colorizeString(_value, ...args);
    return api;
  }

  function capitalize() {
    _value = _value.charAt(0).toUpperCase() + _value.slice(1);
    return api;
  }

  function uppercase() {
    _value = _value.toUpperCase();
    return api;
  }

  function lowercase() {
    _value = _value.toLowerCase();
    return api
  }

  function colorStrip() {
    _value = stripColor(_value);
    return api
  }

  function getValue() {
    return _value
  }

  return api;

}