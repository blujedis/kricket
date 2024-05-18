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
<<<<<<< HEAD:dist/src/kricket.d.ts
export declare function createLogger<Level extends string, M extends object = {}>(options: ILoggerOptions<Level, M>): Logger<Level, M> & LogMethods<Logger<Level, M>, Level>;
export declare const defaultLogger: Logger<"error" | "warn" | "info" | "fatal" | "debug", {}> & LogMethods<Logger<"error" | "warn" | "info" | "fatal" | "debug", {}>, "error" | "warn" | "info" | "fatal" | "debug">;
=======
export declare function createLogger<Level extends string, M extends Record<string, unknown> = Record<string, unknown>>(options: ILoggerOptions<Level, M>): Logger<Level, M> & LogMethods<Logger<Level, M>, Level>;
export declare const defaultLogger: Logger<"error" | "warn" | "info" | "fatal" | "debug", Record<string, unknown>> & LogMethods<Logger<"error" | "warn" | "info" | "fatal" | "debug", Record<string, unknown>>, "error" | "warn" | "info" | "fatal" | "debug">;
>>>>>>> 2fa12ad6deec034c156be9ad86464db58f1dfb7b:dist/kricket.d.ts
