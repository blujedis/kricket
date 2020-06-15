/**
 * Checks if value is an object.
 *
 * @param val the value to inspect as object.
 */
export declare function isObject(val: unknown): boolean;
/**
 * Checks if value is a function
 *
 * @param val the value to inspect as function.
 */
export declare function isFunction(val: unknown): boolean;
/**
 * Checks if object is plain object literal.
 *
 * @param obj the object to inspect as object literal.
 */
export declare function isPlainObject(obj: unknown): boolean;
/**
 * Gets name of an object.
 *
 * @param obj the object to inspect.
 * @param lower whether to convert resutl to lowercase.
 */
export declare function getObjectName<T extends {
    [key: string]: any;
} = {}>(obj: T, lower?: boolean): string;
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
