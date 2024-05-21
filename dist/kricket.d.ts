import { Logger } from './logger';
import { LoggerOptions, LogMethods } from './types';
/**
 * Creates a new Logger.
 *
 * @param options the options used to create the Logger.
 */
export declare function createLogger<Level extends string, Meta extends Record<string, unknown> = Record<string, unknown>>(options?: LoggerOptions<Level, Meta>): Logger<Level, Meta, string> & LogMethods<Logger<Level, Meta, string>, Level>;
/**
 * Creates a default logger with basic levels and settings.
 */
declare const defaultLogger: Logger<string, Record<string, unknown>, string> & LogMethods<Logger<string, Record<string, unknown>, string>, string>;
export { defaultLogger };
