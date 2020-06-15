import { Logger } from './logger';
import { ILoggerOptions } from './types';
/**
 * Creates a new Logger.
 *
 * @param label the name of the Logger.
 * @param options the options used to create the Logger.
 */
export declare function createLogger<Level extends string, M extends object = {}>(label: string, options?: ILoggerOptions<Level, M>): Logger<Level, M> & Record<Level, import("./types").LogMethod<Logger<Level, M>>>;
export declare const defaultLogger: Logger<"error" | "warn" | "info" | "fatal" | "debug", {}> & Record<"error" | "warn" | "info" | "fatal" | "debug", import("./types").LogMethod<Logger<"error" | "warn" | "info" | "fatal" | "debug", {}>>>;
