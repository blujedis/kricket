"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const logger_1 = require("./logger");
const transports_1 = require("./transports");
const core_1 = __importDefault(require("./core"));
function createLogger(label, options) {
    if (typeof label === 'object') {
        options = label;
        label = undefined;
    }
    label = label || '';
    const logger = new logger_1.Logger(label, options);
    core_1.default.loggers.set(label, logger);
    return logger;
}
exports.createLogger = createLogger;
exports.defaultLogger = createLogger('default', {
    level: 'info',
    levels: ['fatal', 'error', 'warn', 'info', 'debug'],
    transports: [
        new transports_1.ConsoleTransport()
    ]
});
//# sourceMappingURL=kricket.js.map