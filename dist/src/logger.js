"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const events_1 = require("events");
const types_1 = require("./types");
const fast_json_stable_stringify_1 = __importDefault(require("fast-json-stable-stringify"));
const util_1 = require("util");
const utils_1 = require("./utils");
const core_1 = __importDefault(require("./core"));
class Logger extends events_1.EventEmitter {
    constructor(label, options) {
        super();
        this.label = label;
        this.options = options;
        this.core = core_1.default;
        this.children = new Map();
        this.options = { ...{ levels: [], transports: [], filters: [], transforms: [], muted: false, level: null }, ...this.options };
        // Bind levels
        this.levels.forEach(level => {
            this[level] = (message, ...args) => this.writer(level, message, ...args);
        });
        // Ensure level for transports
        this.options.transports.forEach(transport => {
            if (typeof transport.options.level === 'undefined')
                transport.options.level = this.options.level;
        });
    }
    /**
     * Internal method to write to Transport streams.
     *
     * @param level the level to be logged.
     * @param message the message to be logged.
     * @param args the optional format args to be applied.
     */
    writer(level, message = '', ...args) {
        if (this.muted || (this.level && !this.isLevelActive(level)))
            return;
        const label = ['__write__', '__writeLn__', '*'].includes(level) ? '*' : level;
        const cb = typeof args[args.length - 1] === 'function' ? args.pop() : null;
        // Emit raw payload.
        this.emit('log', {
            [types_1.LOGGER]: this,
            [types_1.LEVEL]: label,
            [types_1.MESSAGE]: message,
            [types_1.SPLAT]: args,
            message
        }, this);
        // eslint-disable-next-line @typescript-eslint/no-this-alias
        const logger = this;
        const event = (transport) => {
            return (done) => {
                let payload = {
                    [types_1.LOGGER]: logger,
                    [types_1.LEVEL]: label,
                    [types_1.MESSAGE]: message,
                    [types_1.SPLAT]: args,
                    message
                };
                // Inspect transport level.
                if ((transport.level && !this.isLevelActive(transport.level)) || transport.muted || this.filtered(transport, payload))
                    return done();
                payload[types_1.TRANSPORT] = transport;
                payload = this.transformed(transport, payload);
                transport.write(fast_json_stable_stringify_1.default(payload));
                transport.emit('log', payload, transport, this);
                if (level !== '__write__')
                    transport.write('\n');
                done(null, payload);
            };
        };
        utils_1.asynceach(this.transports.map(transport => event(transport)), (err, payloads) => {
            if (cb)
                cb(payloads);
        });
        return this;
    }
    /**
     * Gets Logger levels.
     */
    get levels() {
        return this.options.levels;
    }
    /**
     * Gets Logger Transports.
     */
    get transports() {
        return this.options.transports;
    }
    /**
     * Gets Logger's filters.
     */
    get filters() {
        return this.options.filters;
    }
    /**
     * Gets all Logger Transforms.
     */
    get transforms() {
        return this.options.transforms;
    }
    /**
     * Gets whether the Logger is muted.
     */
    get muted() {
        return this.options.muted;
    }
    /**
     * Gets the Logger's level.
     */
    get level() {
        return this.options.level;
    }
    /**
     * Mute the Logger.
     */
    mute() {
        this.options.muted = true;
        return this;
    }
    /**
     * Unmute the Logger.
     */
    unmute() {
        this.options.muted = false;
        return this;
    }
    /**
     * Mutes a Logger's Transport.
     *
     * @param label the label name of the Transport to unmute.
     */
    muteTransport(label) {
        const transport = this.core.getTransport(label, this);
        if (!transport)
            throw new Error(`Transport "${label}" undefined or NOT found.`);
        transport.mute();
        return this;
    }
    /**
     * Unmutes a Logger's Transport.
     *
     * @param label the label name of the Transport to unmute.
     */
    unmuteTransport(label) {
        const transport = this.core.getTransport(label, this);
        if (!transport)
            throw new Error(`Transport "${label}" undefined or NOT found.`);
        transport.unmute();
        return this;
    }
    /**
     * Sets the Logger's log level.
     *
     * @param level the level to set the Logger to.
     * @param cascade when true apply to child Transports (default: true).
     */
    setLevel(level, cascade = true) {
        if (typeof level === 'undefined' || !this.levels.includes(level)) {
            // eslint-disable-next-line no-console
            console.warn(`Level "${level}" is invalid or not found.`);
            return this;
        }
        this.options.level = level;
        if (cascade)
            this.transports.forEach(transport => transport.options.level = level);
        return this;
    }
    setTransportLevel(transport, level) {
        const _transport = (typeof transport === 'string' ? this.core.getTransport(transport) : transport);
        _transport.setLevel(level, this);
        return this;
    }
    /**
     * Checks if a level is active.
     *
     * @param level the level to compare.
     * @param levels the optional levels to compare against.
     */
    isLevelActive(level, levels = this.levels) {
        if (['*', '__write__', '__writeLn__'].includes(level))
            return true;
        if (!levels.includes(level))
            return false;
        const active = levels.indexOf(this.level);
        const compare = levels.indexOf(level);
        return compare <= active;
    }
    /**
     * Gets a new child Logger.
     *
     * @param label the Logger label to be used.
     * @param meta child metadata for child.
     */
    get(label, meta) {
        let child = this.children.get(label);
        if (child)
            return child;
        meta = meta || { [label]: true };
        child = Object.create(this, {
            label: {
                value: label
            },
            write: {
                value: (level, message = '', ...args) => {
                    args.push(meta);
                    this.writer(level, message, ...args);
                    return this;
                }
            }
        });
        this.children.set(label, child);
        return child;
    }
    /**
     * Adds a Filter function.
     *
     * @param fn the Filter function to be added.
     */
    filter(fn) {
        this.options.filters.push(fn);
        return this;
    }
    /**
     * Adds a Transform function.
     *
     * @param fn the Transform function to be added.
     */
    transform(fn) {
        this.options.transforms.push(fn);
        return this;
    }
    mergeFilter(...fns) {
        const filters = utils_1.flatten(fns);
        return (payload) => filters.some(filter => filter(payload));
    }
    mergeTransform(...fns) {
        const arr = utils_1.flatten(fns);
        return (payload) => {
            return arr.reduce((result, transform) => {
                return transform(result);
            }, payload);
        };
    }
    /**
     * Inpsects filters if should halt output of log message.
     *
     * @param transport the Transport to get filters for.
     * @param payload the payload to pass when filtering.
     */
    filtered(transport, payload) {
        return [...this.filters, ...transport.filters]
            .some(filter => filter(payload));
    }
    /**
     * Transforms a payload for output.
     *
     * @param transport the Transport to include Transfroms from.
     * @param payload the payload object to be transformed.
     */
    transformed(transport, payload) {
        const transforms = [...this.transforms, ...transport.transforms];
        let transformed = payload;
        let valid = true;
        let err;
        let tname;
        while (valid && transforms.length) {
            try {
                const transformer = transforms.shift();
                tname = utils_1.getName(transformer);
                transformed = transformer(transformed);
                valid = utils_1.isPlainObject(transformed);
            }
            catch (ex) {
                valid = false;
                err = ex;
            }
        }
        if (err) {
            // eslint-disable-next-line no-console
            console.log(`Transform "${tname}" resulted in error:`);
            // eslint-disable-next-line no-console
            console.error(err.stack);
            process.exit(1);
        }
        if (!valid) {
            // eslint-disable-next-line no-console
            console.log(`Transform "${tname}" resulted in malfored type of "${typeof transformed}".`);
            process.exit(1);
        }
        return transformed;
    }
    /**
     * Writes to stream of Transport.
     *
     * @param message the message to write.
     * @param args optional format args.
     */
    write(message, ...args) {
        message = util_1.format(message, ...args);
        this.writer('__write__', message);
        return this;
    }
    /**
     * Writes a line to Transports.
     *
     * @param message the message to be written.
     * @param args optional format args.
     */
    writeLn(message, ...args) {
        message = util_1.format(message, ...args);
        this.writer('__writeLn__', message);
        return this;
    }
    /**
     * Ends and outputs buffer when using .write();
     *
     * @param cb optional callback on ending write.
     */
    writeEnd(cb) {
        const transports = this.transports.map(t => t.end.bind(t));
        utils_1.asynceach(transports, (err, data) => (cb || utils_1.noop)(data));
        return this;
    }
    /**
     * Gets a Transport by name.
     *
     * @param label the label of the Transport to get.
     */
    getTransport(label) {
        return this.core.getTransport(label, this);
    }
    /**
     * Adds a Transport to Logger.
     *
     * @param transport the Transport to add to collection.
     */
    addTransport(transport) {
        this.transports.push(transport);
        return transport;
    }
}
exports.Logger = Logger;
//# sourceMappingURL=logger.js.map