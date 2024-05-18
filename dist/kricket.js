"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.defaultLogger = exports.createLogger = void 0;
const logger_1 = require("./logger");
const transports_1 = require("./transports");
const core_1 = __importDefault(require("./core"));
const utils_1 = require("./utils");
/**
 * Creates a new Logger.
 *
 * @param options the options used to create the Logger.
 */
// export function createLogger<Level extends string, M extends Record<string, unknown> = Record<string, unknown>>(options: LoggerOptions<Level, M>): Logger<Level, M> & LogMethods<Logger<Level, M>, Level>;
/**
 * Creates a new Logger.
 *
 * @param label the name of the Logger.
 * @param options the options used to create the Logger.
 */
// export function createLogger<Level extends string, M extends Record<string, unknown> = Record<string, unknown>>(label: string, options?: LoggerOptions<Level, M>): Logger<Level, M> & LogMethods<Logger<Level, M>, Level>;
// export function createLogger<Level extends string, M extends Record<string, unknown> = Record<string, unknown>>(labelOrOptions: string | LoggerOptions<Level, M>, options?: LoggerOptions<Level, M>) {
/**
 * Creates a new Logger.
 *
 * @param options the options used to create the Logger.
 */
function createLogger(options) {
    options.label = options.label || (0, utils_1.uuidv4)();
    const logger = new logger_1.Logger(options);
    core_1.default.loggers.set(options.label, logger);
    return logger;
}
exports.createLogger = createLogger;
exports.defaultLogger = createLogger({
    label: 'default',
    level: 'info',
    levels: ['fatal', 'error', 'warn', 'info', 'debug'],
    transports: [
        new transports_1.ConsoleTransport()
    ]
});
//# sourceMappingURL=kricket.js.map