
/**
 * Checks if value is an object.
 * 
 * @param val the value to inspect as object.
 */
export function isObject(val: unknown) {
  return val != null && typeof val === 'object' && Array.isArray(val) === false;
}

/**
 * Checks if value is a function
 * 
 * @param val the value to inspect as function.
 */
export function isFunction(val: unknown) {
  return typeof val === 'function';
}

/**
 * Checks if object is plain object literal.
 * 
 * @param obj the object to inspect as object literal.
 */
export function isPlainObject(obj: unknown) {
  return (isObject(obj) === true &&
    Object.prototype.toString.call(obj) === '[object Object]') &&
    isFunction(obj.constructor) &&
    obj.constructor.name === 'Object';
}

/**
 * Gets name of an object.
 * 
 * @param obj the object to inspect.
 * @param lower whether to convert resutl to lowercase.
 */
export function getObjectName<T extends { [key: string]: any; } = {}>(obj: T, lower = true): string {
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

