"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Checks if value is an object.
 *
 * @param val the value to inspect as object.
 */
function isObject(val) {
    return val != null && typeof val === 'object' && Array.isArray(val) === false;
}
exports.isObject = isObject;
/**
 * Checks if value is a function
 *
 * @param val the value to inspect as function.
 */
function isFunction(val) {
    return typeof val === 'function';
}
exports.isFunction = isFunction;
/**
 * Checks if object is plain object literal.
 *
 * @param obj the object to inspect as object literal.
 */
function isPlainObject(obj) {
    return (isObject(obj) === true &&
        Object.prototype.toString.call(obj) === '[object Object]') &&
        isFunction(obj.constructor) &&
        obj.constructor.name === 'Object';
}
exports.isPlainObject = isPlainObject;
/**
 * Gets name of an object.
 *
 * @param obj the object to inspect.
 * @param lower whether to convert resutl to lowercase.
 */
function getObjectName(obj, lower = true) {
    const value = obj && (obj.name || (obj.constructor && obj.constructor.name) || null);
    if (typeof value === 'string' && lower)
        return value.toLowerCase();
    return value;
}
exports.getObjectName = getObjectName;
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
/**
 * Generate uuid.
 */
function uuidv4(a) {
    return a ? (a ^ Math.random() * 16 >> a / 4).toString(16) : ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, uuidv4);
}
exports.uuidv4 = uuidv4;
/**
 * Generate simple random id.
 *
 * @param radix the numberic value used to convert to strings.
 */
function randomID(radix = 16) {
    return '#' + (Math.random() * 0xFFFFFF << 0).toString(radix);
}
exports.randomID = randomID;
//# sourceMappingURL=helpers.js.map