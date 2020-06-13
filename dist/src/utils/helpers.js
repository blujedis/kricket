"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function isObject(val) {
    return val != null && typeof val === 'object' && Array.isArray(val) === false;
}
exports.isObject = isObject;
function isFunction(val) {
    return typeof val === 'function';
}
exports.isFunction = isFunction;
function isPlainObject(obj) {
    return (isObject(obj) === true &&
        Object.prototype.toString.call(obj) === '[object Object]') &&
        isFunction(obj.constructor) &&
        obj.constructor.name === 'Object';
}
exports.isPlainObject = isPlainObject;
function isTruthy(value) {
    return typeof value !== 'undefined' &&
        value !== null &&
        value !== 0 &&
        value !== false &&
        !(value instanceof Error);
}
exports.isTruthy = isTruthy;
function getName(obj, lower = true) {
    const value = obj && (obj.name || (obj.constructor && obj.constructor.name) || null);
    if (typeof value === 'string' && lower)
        return value.toLowerCase();
    return value;
}
exports.getName = getName;
// eslint-disable-next-line 
function noop(...args) { }
exports.noop = noop;
/**
 * Flattens multi dimensional array.
 *
 * @param arr the array to be flattened.
 */
function flatten(arr) {
    return arr.reduce((a, c) => [...a, ...(Array.isArray(c) ? flatten(c) : [c])], []);
}
exports.flatten = flatten;
//# sourceMappingURL=helpers.js.map