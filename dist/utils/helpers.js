"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.prepareString = exports.alignString = exports.colorizeString = exports.ensureArray = exports.errorToObject = exports.uuidv4 = exports.flatten = exports.noop = exports.getObjectName = exports.isPlainObject = exports.isFunction = exports.isObject = void 0;
const ansi_colors_1 = __importStar(require("ansi-colors"));
/**
 * Checks if value is an object.
 *
 * @param value the value to inspect as object.
 */
function isObject(value) {
    return value != null && typeof value === 'object' && Array.isArray(value) === false;
}
exports.isObject = isObject;
/**
 * Checks if value is a function
 *
 * @param value the value to inspect as function.
 */
function isFunction(value) {
    return typeof value === 'function';
}
exports.isFunction = isFunction;
/**
 * Checks if object is plain object literal.
 *
 * @param value the object to inspect as object literal.
 */
function isPlainObject(value) {
    return (isObject(value) === true &&
        Object.prototype.toString.call(value) === '[object Object]') &&
        isFunction(value.constructor) &&
        value.constructor.name === 'Object';
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
 * Converts an error to object literal.
 *
 * @param err the error to convert to object
 */
function errorToObject(err) {
    if (!(err instanceof Error))
        return err;
    return Object.getOwnPropertyNames(err).reduce((a, c) => {
        a[c] = err[c];
        return a;
    }, {});
}
exports.errorToObject = errorToObject;
/**
 * If undefined empty array is returned otherwise the array or value wrapped as array is.
 *
 * @param value the value to inspect as any array.
 * @param clean when true and is array clean any undefined.
 */
function ensureArray(value, clean = true) {
    if (typeof value === 'undefined' || value === null || value === '')
        return [];
    if (Array.isArray(value))
        return (clean ? value.filter((v) => typeof v !== 'undefined') : value);
    return [value];
}
exports.ensureArray = ensureArray;
/**
 * Colorizes a value using ansi-colors.
 *
 * @param value the value to be colorized.
 * @param colors the style or stles to be applied.
 */
function colorizeString(value, ...colors) {
    return colors.reduce((a, c) => {
        const fn = ansi_colors_1.default[c];
        if (isFunction(fn))
            return fn(value);
        return a;
    }, String(value));
}
exports.colorizeString = colorizeString;
/**
 * Aligns a string based on all possible values.
 *
 *
 * @param value the value to be aligned.
 * @param align whether to align left right or center relative to all possible values.
 * @param values the possible values which alignment is relative to.
 */
function alignString(value, align, values) {
    const maxLen = values.reduce((a, c) => (c.length > a ? c.length : a), 0);
    value = String(value);
    value = (0, ansi_colors_1.stripColor)(value); // ensure we don't count any ansi color tokens. 
    const len = Math.max(0, maxLen - value.length);
    if (align === 'left')
        return value + ' '.repeat(len);
    else if (align === 'right')
        return ' '.repeat(len) + value;
    const floor = Math.floor(len / 2);
    const rem = len % 2;
    return ' '.repeat(rem) + ' '.repeat(floor) + value + ' '.repeat(floor);
}
exports.alignString = alignString;
function prepareString(value) {
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
    function align(alignment, values) {
        _value = alignString(_value, alignment, values);
        return api;
    }
    function colorize(...args) {
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
        return api;
    }
    function colorStrip() {
        _value = (0, ansi_colors_1.stripColor)(_value);
        return api;
    }
    function getValue() {
        return _value;
    }
    return api;
}
exports.prepareString = prepareString;
//# sourceMappingURL=helpers.js.map