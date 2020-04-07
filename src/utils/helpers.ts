
export function isObject(val) {
  return val != null && typeof val === 'object' && Array.isArray(val) === false;
};

export function isFunction(val) {
  return typeof val === 'function';
}

export function isPlainObject(obj) {
  return (isObject(obj) === true &&
      Object.prototype.toString.call(obj) === '[object Object]') &&
    isFunction(obj.constructor) &&
    obj.constructor.name === 'Object';
};

export function isTruthy(value: any) {
  return typeof value !== 'undefined' &&
    value !== null &&
    value !== 0 &&
    value !== false &&
    !(value instanceof Error);
}

export function getName (obj, lower = true) {
  return obj && (obj.name || (obj.constructor && obj.constructor.name) || null);
}

// eslint-disable-next-line @typescript-eslint/no-empty-function
export function noop(...args: any[]) {}

/**
 * Flattens multi dimensional array.
 * 
 * @param arr the array to be flattened. 
 */
export function flatten<T = any>(arr: T[]): T[] {
  return arr.reduce((a, c) => [ ...a, ...(Array.isArray(c) ? flatten(c) : [c])], []);
}