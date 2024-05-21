import { AnsiColor } from '../types';
/**
 * Checks if value is an object.
 *
 * @param value the value to inspect as object.
 */
export declare function isObject(value: unknown): value is object;
/**
 * Checks if value is a function
 *
 * @param value the value to inspect as function.
 */
export declare function isFunction(value: unknown): value is Function;
/**
 * Checks if object is plain object literal.
 *
 * @param value the object to inspect as object literal.
 */
export declare function isPlainObject(value: unknown): value is object;
/**
 * Gets name of an object.
 *
 * @param obj the object to inspect.
 * @param lower whether to convert resutl to lowercase.
 */
export declare function getObjectName<T extends {
    [key: string]: any;
} = object>(obj: T, lower?: boolean): string;
export declare function noop(...args: any[]): void;
/**
 * Flattens multi dimensional array.
 *
 * @param arr the array to be flattened.
 */
export declare function flatten<T = any>(arr: T[]): T[];
/**
 * Generate uuid.
 */
export declare function uuidv4(a?: any): any;
/**
 * Converts an error to object literal.
 *
 * @param err the error to convert to object
 */
export declare function errorToObject<E extends Error>(err: E): Record<keyof E, any>;
/**
 * If undefined empty array is returned otherwise the array or value wrapped as array is.
 *
 * @param value the value to inspect as any array.
 * @param clean when true and is array clean any undefined.
 */
export declare function ensureArray<T = any>(value?: null | T | T[], clean?: boolean): T[];
/**
 * Colorizes a value using ansi-colors.
 *
 * @param value the value to be colorized.
 * @param colors the style or stles to be applied.
 */
export declare function colorizeString(value: any, ...colors: AnsiColor[]): string;
/**
 * Aligns a string based on all possible values.
 *
 *
 * @param value the value to be aligned.
 * @param align whether to align left right or center relative to all possible values.
 * @param values the possible values which alignment is relative to.
 */
export declare function alignString(value: any, align: 'left' | 'right' | 'center', values: string[]): string;
export declare function prepareString(value: any): {
    colorize: (...args: Parameters<typeof colorizeString>[1][]) => void;
    align: (alignment: Parameters<typeof alignString>[1], values: Parameters<typeof alignString>[2]) => void;
    capitalize: () => void;
    uppercase: () => void;
    lowercase: () => void;
    stripColor: () => void;
    value: string;
};
