import { Logger } from './logger';
import { ILoggerOptions, LogMethods } from './types';
/**
 * Creates a new Logger.
 *
 * @param label the name of the Logger.
 * @param options the options used to create the Logger.
 */
export declare function createLogger<Level extends string, M extends Record<string, unknown> = Record<string, unknown>>(label: string, options?: ILoggerOptions<Level, M>): Logger<Level, M> & LogMethods<Logger<Level, M>, Level>;
/**
 * Creates a new Logger.
 *
 * @param options the options used to create the Logger.
 */
export declare function createLogger<Level extends string, M extends Record<string, unknown> = Record<string, unknown>>(options: ILoggerOptions<Level, M>): Logger<Level, M> & LogMethods<Logger<Level, M>, Level>;
export declare const defaultLogger: Logger<"error" | "warn" | "info" | "fatal" | "debug", Record<string, unknown>> & Record<"error" | "warn" | "info" | "fatal" | "debug", import("./types").LogMethod<Logger<"error" | "warn" | "info" | "fatal" | "debug", Record<string, unknown>>>>;
