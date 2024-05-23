import { Logger } from './logger';
import { LoggerOptions, LogMethods } from './types';
/**
 * Creates a new Logger.
 *
 * @param options the options used to create the Logger.
 */
export declare function createLogger<Level extends string, Meta extends Record<string, unknown> = undefined>(options?: LoggerOptions<Level, Meta>): Logger<Level, Meta> & LogMethods<Level, Meta>;
/**
 * Creates a default logger with basic levels and settings.
 */
declare const defaultLogger: Logger<"error" | "warn" | "info" | "fatal" | "debug", {
    age: number;
}> & LogMethods<"error" | "warn" | "info" | "fatal" | "debug", {
    age: number;
}>;
export { defaultLogger };
