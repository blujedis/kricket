"use strict";
/**
 * Simple internal logger.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.log = exports.colorize = exports.ANSI_COLORS = void 0;
const ansi_colors_1 = require("ansi-colors");
const util_1 = require("util");
exports.ANSI_COLORS = {
    red: ansi_colors_1.red,
    yellow: ansi_colors_1.yellow,
    cyan: ansi_colors_1.cyan,
    white: ansi_colors_1.white,
    bgBlue: ansi_colors_1.bgBlue
};
const TYPES = {
    error: 'red',
    warn: 'yellow',
    info: 'cyan'
};
const REVERSE_TYPES = {
    red: 'error',
    yellow: 'warn',
    cyan: 'info'
};
/**
 * Colorizes a string.
 *
 * @param str the string to be colorized.
 * @param color the ansi-color to apply.
 */
function colorize(str, color) {
    return exports.ANSI_COLORS[color](str);
}
exports.colorize = colorize;
function writer(str, shouldExit, cb) {
    if (typeof shouldExit === 'function') {
        cb = shouldExit;
        shouldExit = undefined;
    }
    // eslint-disable-next-line
    cb = cb || ((...args) => { });
    const onError = (err) => {
        if (err)
            throw err;
    };
    if (shouldExit) {
        process.stderr.write(str + '\n', onError);
        process.stderr.on('close', cb);
        process.stderr.emit('close');
    }
    else {
        process.stdout.write(str + '\n', onError);
    }
}
function log(message, { type, exit, prefix } = {}) {
    const color = TYPES[type];
    if (color)
        message = colorize(message, color);
    if (prefix)
        message = prefix + message;
    writer(message, exit, () => {
        if (exit)
            process.exit(1);
    });
    return log;
}
exports.log = log;
function write(color, message, ...args) {
    if (!Object.keys(exports.ANSI_COLORS).includes(color)) {
        if (typeof message !== 'undefined') {
            args.unshift(message);
            message = undefined;
        }
        message = color;
        color = undefined;
    }
    return log((0, util_1.format)(message, ...args));
}
log.write = write;
log.fatal = (message, ...args) => log((0, util_1.format)(message, ...args), { type: 'error', exit: true });
log.error = (message, ...args) => log((0, util_1.format)(message, ...args), { type: 'error' });
log.warn = (message, ...args) => log((0, util_1.format)(message, ...args), { type: 'warn' });
log.info = (message, ...args) => log((0, util_1.format)(message, ...args), { type: 'info' });
function group(title, color, compact) {
    let lines = [];
    let before = '';
    let after = '';
    if (typeof color === 'boolean') {
        compact = color;
        color = undefined;
    }
    if (title)
        lines.push([title + '\n', (color && REVERSE_TYPES[color]) || 'write']);
    const api = {
        write: (message, ...args) => {
            lines.push([(0, util_1.format)(message, ...args), 'write']);
            return api;
        },
        error: (message, ...args) => {
            lines.push([(0, util_1.format)(message, ...args), 'error']);
            return api;
        },
        warn: (message, ...args) => {
            lines.push([(0, util_1.format)(message, ...args), 'warn']);
            return api;
        },
        info: (message, ...args) => {
            lines.push([(0, util_1.format)(message, ...args), 'info']);
            return api;
        },
        before: (value) => {
            if (typeof value === 'number')
                before = '\n'.repeat(value);
            else
                before = value;
            return api;
        },
        /**
         * Adds value after group is logged.
         * if number repeats line returns.
         * @param value a string or number rep the number of line returns.
         */
        after: (value) => {
            if (typeof value === 'number')
                after = '\n'.repeat(value);
            else
                after = value;
            return api;
        },
        end: (indent = '', exit = false) => {
            if (typeof indent === 'boolean') {
                exit = indent;
                indent = '';
            }
            if (before)
                log.write(before);
            if (title && !compact)
                log.write('\n');
            if (typeof indent === 'number')
                indent = ' '.repeat(indent);
            lines.forEach(line => {
                line[0] = indent + line[0];
                const [msg, as] = line;
                log[as](msg);
            });
            lines = null;
            // When titles are used we prefix
            // both before and after with line return
            // for proper group display.
            if (title && !compact)
                log.write('\n');
            if (after)
                log.write(after);
            if (exit) {
                process.stderr.on('close', () => {
                    process.exit(1);
                });
                process.stderr.emit('close');
            }
        }
    };
    return api;
}
log.group = group;
//# sourceMappingURL=logger.js.map