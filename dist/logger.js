"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Logger = void 0;
const events_1 = require("events");
const fast_json_stable_stringify_1 = __importDefault(require("fast-json-stable-stringify"));
const util_1 = require("util");
const utils_1 = require("./utils");
const core_1 = __importDefault(require("./core"));
const trace_1 = __importDefault(require("./utils/trace"));
const types_1 = require("./types");
class Logger extends events_1.EventEmitter {
    options;
    isChild;
    core = core_1.default;
    children = new Map();
    constructor(options, isChild = false) {
        super();
        this.options = options;
        this.isChild = isChild;
        this.options = { ...{ levels: [], transports: [], filters: [], transforms: [], muted: false, level: null, defaultMetaKey: '' }, ...this.options };
        // Get the last level if no level has been provided. 
        if (!this.options.level)
            this.options.level = this.options.levels[this.options.levels.length - 1];
        // Bind levels
        this.levels.forEach(level => {
            this[level] = (message, ...args) => this.writer(level, message, ...args);
        });
        const dupes = this.checkUnique().dupes;
        if (dupes) {
            utils_1.log.fatal(`Duplicate Transports "${dupes.join(', ')}" detected, Transport labels must be unique.`);
        }
        // Ensure level for transports
        this.options.transports.forEach(transport => {
            if (typeof transport._options.level === 'undefined')
                transport._options.level = this.options.level;
        });
    }
    /**
     * Iterates Transports checks for duplicate labels.
     */
    checkUnique() {
        return this.options.transports.reduce((a, c) => {
            if (!a.known.includes(c.label)) {
                a.known.push(c.label);
            }
            else {
                a.dupes = a.dupes || [];
                if (!a.dupes.includes(c.label))
                    a.dupes.push(c.label);
            }
            return a;
        }, { known: [], dupes: null });
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
        const id = (0, utils_1.uuidv4)();
        const label = level;
        const index = this.options.levels.indexOf(label);
        const cb = typeof args[args.length - 1] === 'function' ? args.pop() : null;
        const meta = (0, utils_1.isPlainObject)(args[args.length - 1]) ? args.pop() : null;
        const trace = (0, trace_1.default)({ frames: 3 });
        const globalMeta = (0, utils_1.isPlainObject)(this.options.meta) ? { ...this.options.meta } : {};
        const timestamp = new Date();
        const initIncludes = {
            [types_1.UUID]: id,
            [types_1.LEVELINT]: index,
            [types_1.TIMESTAMP]: timestamp,
            [types_1.LOGGER]: this.label,
            [types_1.LINE]: trace.line,
            [types_1.CHAR]: trace.char,
            [types_1.METHOD]: trace.method,
            [types_1.FILEPATH]: trace.filepath,
            [types_1.FILENAME]: trace.filename,
            ...globalMeta
        };
        const rawPayload = {
            ...initIncludes,
            [types_1.LEVEL]: label,
            [types_1.MESSAGE]: message,
            [types_1.SPLAT]: meta ? [...args, meta] : args,
            message
        };
        // Emit raw payload.
        this.emit('log', rawPayload);
        this.emit(`log:${label}`, rawPayload);
        const event = (transport) => {
            return (done) => {
                try {
                    const transportIncludes = {
                        [types_1.UUID]: id,
                        [types_1.LEVELINT]: index,
                        [types_1.TIMESTAMP]: timestamp,
                        [types_1.LOGGER]: this.label,
                        [types_1.TRANSPORT]: transport.label,
                        [types_1.LINE]: trace.line,
                        [types_1.CHAR]: trace.char,
                        [types_1.METHOD]: trace.method,
                        [types_1.FILEPATH]: trace.filepath,
                        [types_1.FILENAME]: trace.filename,
                        ...globalMeta
                    };
                    const payload = {
                        ...transportIncludes,
                        [types_1.LEVEL]: label,
                        [types_1.MESSAGE]: message,
                        [types_1.SPLAT]: meta ? [...args, { ...meta }] : args,
                        message
                    };
                    // Inspect transport level.
                    if ((transport.level && !this.isLevelActive(transport.level)) || transport.muted || this.filtered(transport, payload))
                        return done();
                    const transformed = this.transformed(transport, { ...payload });
                    // Payload symbols now stripped.
                    transport.write((0, fast_json_stable_stringify_1.default)(transformed));
                    transport.emit('log', payload, transport);
                    transport.emit(`log:${label}`, payload, transport);
                    if (level !== 'write')
                        transport.write('\n');
                    done(null, payload);
                }
                catch (ex) {
                    const err = ex;
                    err.transport = transport.label;
                    done(ex, null);
                }
            };
        };
        (0, utils_1.asynceach)(this.transports.map(transport => event(transport)), (err, payloads) => {
            if (err) {
                if (!Array.isArray(err))
                    err = [err];
                err.forEach(e => {
                    const grp = utils_1.log.group(`Transport ${e.transport} Error`, 'yellow');
                    grp.error(e.stack);
                    grp.end();
                });
            }
            this.emit('log:end', rawPayload);
            this.emit(`log:${label}:end`, rawPayload);
            if (cb)
                cb(payloads);
        });
        return this;
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
                tname = (0, utils_1.getObjectName)(transformer);
                if (tname === 'function')
                    tname = 'anonymous';
                transformed = transformer(transformed); // TODO: fix types
                valid = (0, utils_1.isPlainObject)(transformed);
            }
            catch (ex) {
                valid = false;
                err = ex;
            }
        }
        if (err) {
            const grp = utils_1.log.group(`Transform ${tname} Invalid`, 'yellow');
            grp.error(err.stack);
            grp.end();
        }
        if (!valid) {
            // eslint-disable-next-line no-console
            utils_1.log.fatal(`Transform "${tname}" resulted in malformed type of "${typeof transformed}".\n`);
        }
        return transformed;
    }
    get label() {
        return this.options.label;
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
     * @param cascade when true all child Loggers are muted.
     */
    mute(cascade = true) {
        this.options.muted = true;
        if (cascade)
            [...this.children.values()].forEach(child => child.mute());
        return this;
    }
    /**
     * Unmute the Logger.
     * @param cascade when true all child Loggers are unmuted.
     */
    unmute(cascade = true) {
        this.options.muted = false;
        if (cascade)
            [...this.children.values()].forEach(child => child.unmute());
        return this;
    }
    /**
     * Mutes a Logger's Transport.
     *
     * @param labels the label(s) name of the Transport to unmute.
     */
    muteTransport(...labels) {
        if (!labels.length)
            labels = this.transports.map(t => t.label);
        labels.forEach(label => {
            const transport = this.getTransport(label);
            if (!transport)
                // eslint-disable-next-line no-console
                utils_1.log.warn(`Transport "${label}" undefined or NOT found.`);
            else
                transport.mute();
        });
        return this;
    }
    /**
     * Unmutes a Logger's Transport.
     *
     * @param labels the label(s) name of the Transport to unmute.
     */
    unmuteTransport(...labels) {
        if (!labels.length)
            labels = this.transports.map(t => t.label);
        labels.forEach(label => {
            const transport = this.getTransport(label);
            if (!transport)
                // eslint-disable-next-line no-console
                utils_1.log.warn(`Transport "${label}" undefined or NOT found.`);
            else
                transport.unmute();
        });
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
            utils_1.log.warn(`Level "${level}" is invalid or not found.`);
            return this;
        }
        this.options.level = level;
        if (cascade)
            [...this.children.values()].forEach(child => child.setLevel(level));
        return this;
    }
    setTransportLevel(transport, level) {
        const _transport = (typeof transport === 'string' ? this.getTransport(transport) : transport);
        _transport.setLevel(level, this);
        return this;
    }
    /**
     *
     * @param payload your current payload object.
     * @param level the level you wish to change to.
     */
    changeLevel(payload, level) {
        return {
            ...payload,
            [types_1.LEVEL]: level
        };
    }
    isLevelActive(level, levels = this.levels) {
        if (typeof level === 'object')
            level = level[types_1.LEVEL];
        if (['write', 'writeLn'].includes(level))
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
    child(label, meta = {}) {
        let child = this.children.get(label);
        if (child)
            return child;
        // eslint-disable-next-line @typescript-eslint/no-this-alias
        const self = this;
        const options = {
            label,
            level: this.level,
            muted: this.muted,
            get levels() {
                return self.options.levels;
            },
            // Get Transports from parent.
            get transports() {
                return self.options.transports;
            },
            transforms: [...this.transforms],
            filters: [...this.filters],
            meta: { ...this.options.meta, ...{ ...meta, [label]: true } }
        };
        child = new Logger(options, true);
        // eslint-disable-next-line no-console
        const disabled = type => (..._args) => utils_1.log.warn(`${type} disabled for child Loggers.`);
        child.setTransportLevel = disabled('setTransportLevel');
        child.addTransport = disabled('addTransport');
        child.muteTransport = disabled('muteTransport');
        child.unmuteTransport = disabled('unmuteTransport');
        this.children.set(label, child);
        return child;
    }
    filter(transport, fn) {
        if (typeof transport === 'function') {
            fn = transport;
            transport = undefined;
        }
        if (!transport) {
            this.options.filters.push(fn);
            return this;
        }
        const _transport = this.getTransport(transport);
        if (!_transport)
            throw new Error(`Transport ${transport} could NOT be found.`);
        _transport._options.filters.push(fn);
        return this;
    }
    transform(transport, fn) {
        if (typeof transport === 'function') {
            fn = transport;
            transport = undefined;
        }
        if (!transport) {
            this.options.transforms.push(fn);
        }
        else {
            const _transport = this.getTransport(transport);
            if (!_transport) {
                utils_1.log.fatal(`Transport ${transport} could NOT be found.`);
                return this;
            }
            _transport._options.transforms.push(fn);
        }
        return this;
    }
    mergeFilter(...fns) {
        const filters = (0, utils_1.flatten)(fns);
        return (payload) => filters.some(filter => filter(payload));
    }
    mergeTransform(...fns) {
        const arr = (0, utils_1.flatten)(fns);
        return (payload) => {
            return arr.reduce((result, transform) => {
                return transform(result);
            }, payload);
        };
    }
    /**
     * Writes a line to Transports.
     *
     * @param message the message to be written.
     * @param args optional format args.
     */
    writeLn(message, ...args) {
        message = (0, util_1.format)(message, ...args);
        this.writer('writeLn', message);
        return this;
    }
    /**
     * Writes to stream of Transport.
     *
     * @param message the message to write.
     * @param args optional format args.
     */
    write(message, ...args) {
        message = (0, util_1.format)(message, ...args);
        this.writer('write', message);
        return this;
    }
    /**
     * Ends and outputs buffer when using .write();
     *
     * @param cb optional callback on ending write.
     */
    async writeEnd(cb) {
        const transports = this.transports.map(t => t.end.bind(t));
        try {
            await (0, utils_1.asynceach)(transports, (err, data) => (cb || utils_1.noop)(data));
        }
        catch (ex) {
            //
        }
    }
    /**
     * Writes to stream of Transport.
     *
     * @param key optional group key name appended to metadata.
     */
    group(key) {
        // eslint-disable-next-line @typescript-eslint/no-this-alias
        const self = this;
        let buffer = [];
        const api = {
            get key() {
                return key || null;
            },
            /**
             * Writes to stream of Transport.
             *
             * @param message the message to write.
             * @param args optional format args.
             */
            write(message, ...args) {
                const meta = !buffer.length ? { [key]: true, groupStart: true } : { [key]: true };
                buffer.push([message, args, meta]);
            },
            /**
             * Ends the write stream and outputs to Transports.
             *
             * @param cb optional callback on write completed.
             */
            async end(cb) {
                if (!buffer) {
                    // eslint-disable-next-line no-console
                    utils_1.log.warn(`Attempted to end write stream but buffer is null.`);
                    return;
                }
                while (buffer.length) {
                    const item = buffer.shift();
                    const msg = (0, util_1.format)(item[0], ...(item[1] || []));
                    const meta = !buffer.length ? { ...item[2], groupEnd: true } : item[2];
                    self.writer('write', msg, meta);
                }
                buffer = null;
                const transports = self.transports.map(t => t.end.bind(t));
                try {
                    await (0, utils_1.asynceach)(transports, (err, data) => (cb || utils_1.noop)(data));
                }
                catch (ex) {
                    const err = ex;
                    utils_1.log.group(`Group ${key} Error`, 'yellow')
                        .error(err.stack)
                        .end();
                }
            }
        };
        return api;
    }
    /**
     * Gets a Transport by name.
     * Storing Transports in core just makes it easier to
     * retrive and clone them from any logger.
     *
     * @param label the label of the Transport to get.
     */
    getTransport(label) {
        return this.transports.find(transport => transport.label === label);
    }
    /**
     * Clones an existing Transport by options.
     *
     * @param label the Transport label/name to be cloned.
     * @param transport the Transport instance to be cloned.
     */
    cloneTransport(label, transport) {
        const options = transport._options;
        if (!transport.getType) {
            utils_1.log.fatal((new Error(`Transport missing static property getType, clone failed.`).stack));
            return;
        }
        const Klass = transport.getType;
        return new Klass(label, options);
    }
    /**
     * Useful helper to determine if payload contains a given Logger.
     *
     * @param payload the current payload to inspect.
     * @param label the label to match.
     */
    hasLogger(payload, label) {
        const logger = payload[types_1.LOGGER];
        return logger === label;
    }
    /**
     * Useful helper to determine if payload contains a given Transport.
     *
     * @param payload the current payload to inspect.
     * @param label the label to match.
     */
    hasTransport(payload, label) {
        const transport = payload[types_1.TRANSPORT];
        return transport === label;
    }
    /**
     * Useful helper to determine if Transport contains a given Level.
     *
     * @param payload the current payload to inspect.
     * @param compare the label to compare.
     */
    hasLevel(payload, compare) {
        const level = payload[types_1.LEVEL];
        return level === compare;
    }
    /**
     * Adds a Transport to Logger.
     *
     * @param transport the Transport to add to collection.
     */
    addTransport(transport) {
        // Can't allow custom child levels and therefore
        // probably shouldn't allow for adding Transports
        // to children. Favor new Logger at that point.
        if (this.isChild) {
            utils_1.log.fatal(`Cannot add Transport to child Logger, create new Logger instead.`);
            return this;
        }
        if (this.transports.find(t => t.label === transport.label)) {
            utils_1.log.fatal(`Duplicate Transport ${transport.label} detected, label names MUST be unique.`);
            return this;
        }
        this.transports.push(transport);
        return this;
    }
    removeTransport(transport) {
        if (typeof transport === 'string')
            transport = this.getTransport(transport);
        if (!transport) {
            utils_1.log.fatal(`Failed to remove Transport of unknown.`);
            return this;
        }
        const idx = this.transports.indexOf(transport);
        this.transports.splice(idx, 1);
        return this;
    }
    /**
     * Extend a payload object with additional properties optionally assigning exteded object at
     * property name defined as options.metaKey.
     *
     * @param payload the payload object to be extended.
     * @param extend the object to extend payload with.
     */
    extendPayload(payload, extend) {
        for (const k in extend) {
            if (!Object.prototype.hasOwnProperty.call(extend, k))
                continue;
            payload[k] = extend[k];
        }
        return payload;
    }
    /**
     * Parses payload inspecting for error argument as message and/or meta object within splat.
     *
     * @example
     * logger.transform(payload => {
     *  // type Payload will be extended with below
     *  // {
     *  //  error?: { name, message, stack },
     *  //  prop: 'value'
     *  // }
     *  // payload = parsePayload(payload, { prop: 'value' });
     * });
     *
     * @param payload the payload object to be parsed.
     */
    parsePayload(payload, extend = {}) {
        let meta = {};
        // Check if last arg in splat is an object. 
        if ((0, utils_1.isObject)(payload[types_1.SPLAT].slice(-1)[0]))
            meta = payload[types_1.SPLAT].pop();
        // if payload message is an error convert to object, set message to error's message.
        if ((payload[types_1.MESSAGE]) instanceof Error) {
            const err = payload[types_1.MESSAGE];
            payload.message = err.message;
            meta = { ...meta, error: (0, utils_1.errorToObject)(err) };
        }
        payload.message = (0, util_1.format)(payload.message, ...payload[types_1.SPLAT]);
        return this.extendPayload(payload, { ...meta, ...extend });
    }
}
exports.Logger = Logger;
//# sourceMappingURL=logger.js.map