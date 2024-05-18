"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Logger = void 0;
const events_1 = require("events");
const types_1 = require("./types");
const fast_json_stable_stringify_1 = __importDefault(require("fast-json-stable-stringify"));
const util_1 = require("util");
const utils_1 = require("./utils");
const core_1 = __importDefault(require("./core"));
class Logger extends events_1.EventEmitter {
    label;
    options;
    isChild;
    core = core_1.default;
    children = new Map();
    constructor(label, options, isChild = false) {
        super();
        this.label = label;
        this.options = options;
        this.isChild = isChild;
        this.options = { ...{ levels: [], transports: [], filters: [], transforms: [], muted: false, level: null }, ...this.options };
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
     * @param group optional log group.
     * @param level the level to be logged.
     * @param message the message to be logged.
     * @param args the optional format args to be applied.
     */
    writer(level, message = '', ...args) {
        if (this.muted || (this.level && !this.isLevelActive(level)))
            return;
        const label = level;
        const cb = typeof args[args.length - 1] === 'function' ? args.pop() : null;
        const meta = (0, utils_1.isPlainObject)(args[args.length - 1]) ? args.pop() : null;
        const hasAnyMeta = !!meta || this.options.defaultMeta || !!this.options.meta;
        const defaultMetaKey = this.options.defaultMetaKey;
        // Build default metadata.
        let defaultMeta = this.options.defaultMeta ? {
            LOGGER: this.label,
            LEVEL: label,
            UUID: (0, utils_1.uuidv4)()
        } : null;
        // If Default meta is in nested key...
        if (defaultMetaKey && defaultMeta)
            defaultMeta = { [defaultMetaKey]: defaultMeta };
        const rawPayload = {
            [types_1.LOGGER]: this.label,
            [types_1.LEVEL]: label,
            [types_1.MESSAGE]: message,
            // ONlY add meta if exists.
            [types_1.SPLAT]: hasAnyMeta ? [...args, { ...meta, ...this.options.meta, ...defaultMeta }] : args,
            message
        };
        // Emit raw payload.
        this.emit('log', rawPayload);
        this.emit(`log:${label}`, rawPayload);
        // eslint-disable-next-line @typescript-eslint/no-this-alias
        const logger = this;
        const event = (transport) => {
            return (done) => {
                try {
                    // Update default metadata with the Transport label now that we have it.
                    if (defaultMeta) {
                        if (defaultMetaKey)
                            defaultMeta[defaultMetaKey].TRANSPORT = transport.label;
                        else
                            defaultMeta.TRANSPORT = transport.label;
                    }
                    const payload = {
                        [types_1.LOGGER]: logger.label,
                        [types_1.TRANSPORT]: transport.label,
                        [types_1.LEVEL]: label,
                        [types_1.MESSAGE]: message,
                        [types_1.SPLAT]: hasAnyMeta ? [...args, { ...meta, ...this.options.meta, ...defaultMeta }] : args,
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
                transformed = transformer(transformed);
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
        child = new Logger(label, options, true);
        // eslint-disable-next-line no-console
        const disabled = type => (...args) => utils_1.log.warn(`${type} disabled for child Loggers.`);
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
        }
        else {
            const _transport = this.getTransport(transport);
            if (!_transport) {
                utils_1.log.fatal(`Transport ${transport} could NOT be found.`);
                return this;
            }
            _transport._options.filters.push(fn);
        }
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
            write(msg, ...args) {
                const meta = !buffer.length ? { [key]: true, groupStart: true } : { [key]: true };
                buffer.push([msg, args, meta]);
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
     * Convenience method to generate simple uuid v4. Although this
     * works for most simple scenarios consider using a first class
     * UUIDV4 library.
     *
     * @see https://www.npmjs.com/package/uuid
     */
    uuidv4() {
        return (0, utils_1.uuidv4)();
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
     * @param label the label to match.
     */
    hasLevel(payload, compare) {
        const level = payload[types_1.LEVEL];
        return level === compare;
    }
    /**
     * Converts Symbols on payload to a simple mapped object.
     * This can be used if you wish to output Symbols as metadata to
     * your final output.
     *
     * Defaults to Symbols [LOGGER, TRANSPORT, LEVEL]
     *
     * @example
     * defaultLogger.transform(payload => {
     *    payload.metadata = defaultLogger.symbolsToMap(payload);
     *    return payload;
     * });
     *
     * @param payload a log payload containing symbols.
     */
    symbolsToMap(payload, ...symbols) {
        if (!symbols.length)
            symbols = [types_1.LOGGER, types_1.TRANSPORT, types_1.LEVEL];
        return symbols.reduce((a, c) => {
            const name = c.description;
            if (!name)
                throw new Error(`Symbols to Map failed accessing Symbol ${c.toString()} description.`);
            a[name] = payload[c];
            return a;
        }, {});
    }
    /**
     * Simply extends the payload object with additional properties while also
     * maintaining typings.
     *
     * @param payload the payload object to be extended.
     * @param obj the object to extend payload with.
     */
    extendPayload(payload, obj) {
        for (const k in obj) {
            if (!Object.prototype.hasOwnProperty.call(obj, k))
                continue;
            payload[k] = obj[k];
        }
        return payload;
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
}
exports.Logger = Logger;
//# sourceMappingURL=logger.js.map