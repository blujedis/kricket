import { Logger } from './logger';
import { LoggerOptions, LogMethods } from './types';
/**
 * Creates a new Logger.
 *
 * @param options the options used to create the Logger.
 */
/**
 * Creates a new Logger.
 *
 * @param label the name of the Logger.
 * @param options the options used to create the Logger.
 */
/**
 * Creates a new Logger.
 *
 * @param options the options used to create the Logger.
 */
export declare function createLogger<Level extends string, Meta extends Record<string, unknown> = Record<string, unknown>>(options?: LoggerOptions<Level, Meta>): Logger<Level, Meta> & LogMethods<Logger<Level, Meta>, Level>;
export declare const defaultLogger: Logger<"error" | "warn" | "info" | "fatal" | "debug", Record<string, unknown>> & LogMethods<Logger<"error" | "warn" | "info" | "fatal" | "debug", Record<string, unknown>>, "error" | "warn" | "info" | "fatal" | "debug">;
