export declare function isObject(val: any): boolean;
export declare function isFunction(val: any): boolean;
export declare function isPlainObject(obj: any): boolean;
export declare function isTruthy(value: any): boolean;
export declare function getName(obj: any, lower?: boolean): string;
export declare function noop(...args: any[]): void;
/**
 * Flattens multi dimensional array.
 *
 * @param arr the array to be flattened.
 */
export declare function flatten<T = any>(arr: T[]): T[];
