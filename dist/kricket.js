"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.defaultLogger = exports.createLogger = void 0;
const logger_1 = require("./logger");
const transports_1 = require("./transports");
const core_1 = __importDefault(require("./core"));
const util_1 = require("util");
const utils_1 = require("./utils");
const types_1 = require("./types");
const COLOR_MAP = {
    fatal: 'bgRedBright',
    error: 'redBright',
    warn: 'yellowBright',
    info: 'cyanBright',
    debug: 'magentaBright'
};
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
/**
 * Creates a default logger with basic levels and settings.
 */
const defaultLogger = createLogger({
    label: 'default',
    level: (process.env.LOG_LEVEL || 'info'),
    levels: ['fatal', 'error', 'warn', 'info', 'debug'],
    meta: { age: 25 },
    transports: [
        new transports_1.ConsoleTransport()
    ]
});
exports.defaultLogger = defaultLogger;
defaultLogger.filter('console', (payload) => {
    return !defaultLogger.isLevelActive(payload[types_1.LEVEL]);
});
defaultLogger.transform((payload) => {
    return defaultLogger.parsePayload(payload);
});
defaultLogger.transform('console', (payload) => {
    // Make timestamp a hair more readable. 
    let timestamp = payload[types_1.TIMESTAMP].toISOString();
    let [date, time] = timestamp.split('T');
    date = date.split('-').slice(1).join('-');
    time = time.split(/\..+$/)[0];
    timestamp = `${date} ${time}`;
    // timestamp, level, message, filename, line, char
    const template = `%s %s: %s %s`;
    const filename = (0, utils_1.colorizeString)(`(${payload[types_1.FILENAME]}:${payload[types_1.LINE]}:${payload[types_1.CHAR]})`, 'gray');
    let level = (0, utils_1.alignString)(payload[types_1.LEVEL], 'right', defaultLogger.options.levels);
    level = (0, utils_1.colorizeString)(payload[types_1.LEVEL], COLOR_MAP[payload[types_1.LEVEL]]);
    payload.message = (0, util_1.format)(template, (0, utils_1.colorizeString)(timestamp, 'gray'), level, payload.message, filename);
    return payload;
});
//# sourceMappingURL=kricket.js.map