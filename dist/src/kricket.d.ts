import { Logger } from './logger';
import { ILoggerOptions } from './types';
/**
 * Creates a new Logger.
 *
 * @param label the name of the Logger.
 * @param options the options used to create the Logger.
 */
export declare function createLogger<Level extends string>(label: string, options?: ILoggerOptions<Level>): Logger<Level> & Record<Level, import("./types").LogMethod<Logger<Level>>>;
export declare const defaultLogger: Logger<"error" | "info" | "fatal" | "warn" | "debug"> & Record<"error" | "info" | "fatal" | "warn" | "debug", import("./types").LogMethod<Logger<"error" | "info" | "fatal" | "warn" | "debug">>>;
