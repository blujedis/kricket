/**
 * Simple internal logger.
 *
 * @deprecated favor throwing errors as that's all this was used for.
 */
export type LogGroup<T> = T & {
    end(indent: string, exit?: boolean): void;
    end(indent: number, exit?: boolean): void;
    end(exit: boolean): void;
    end(): void;
};
export type LogType = keyof typeof TYPES;
export type LogTypeExt = LogType | 'write';
export type Color = keyof typeof ANSI_COLORS;
export type ReverseType = keyof typeof REVERSE_TYPES;
export type WriterCallback<T = any, E extends object = object> = (err?: Error & E, data?: T) => void;
export declare const ANSI_COLORS: {
    red: import("ansi-colors").StyleFunction;
    yellow: import("ansi-colors").StyleFunction;
    cyan: import("ansi-colors").StyleFunction;
    white: import("ansi-colors").StyleFunction;
    bgBlue: import("ansi-colors").StyleFunction;
};
declare const TYPES: {
    error: string;
    warn: string;
    info: string;
};
declare const REVERSE_TYPES: {
    red: string;
    yellow: string;
    cyan: string;
};
export interface LogOptions {
    /**
     * Prefix line with this string or true uses [kricket]. (default: true)
     */
    prefix?: string;
    type?: LogTypeExt;
    exit?: boolean;
}
declare function log(message: string, { type, exit, prefix }?: LogOptions): typeof log;
declare namespace log {
    var write: {
        (color: "cyan" | "red" | "white" | "yellow" | "bgBlue", message: string, ...args: any[]): typeof log;
        (message: string, ...args: any[]): typeof log;
    };
    var fatal: (message: string, ...args: any[]) => typeof log;
    var error: (message: string, ...args: any[]) => typeof log;
    var warn: (message: string, ...args: any[]) => typeof log;
    var info: (message: string, ...args: any[]) => typeof log;
    var group: Group;
}
declare function group(title?: string, color?: ReverseType | boolean, compact?: boolean): LogGroup<{
    write: (message: string, ...args: any[]) => any;
    error: (message: string, ...args: any[]) => any;
    warn: (message: string, ...args: any[]) => any;
    info: (message: string, ...args: any[]) => any;
    before: (value: string | number) => any;
    /**
     * Adds value after group is logged.
     * if number repeats line returns.
     *
     * @param value a string or number rep the number of line returns.
     */
    after: (value: string | number) => any;
    end: (indent?: number | string | boolean, exit?: boolean) => void;
}>;
interface Group {
    (title?: string, color?: ReverseType | boolean, compact?: boolean): ReturnType<typeof group>;
    (title?: string, compact?: boolean): ReturnType<typeof group>;
}
export { log };
