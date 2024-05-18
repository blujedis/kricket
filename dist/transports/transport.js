"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Transport = exports.Stream = void 0;
const readable_stream_1 = require("readable-stream");
const types_1 = require("../types");
class Stream extends readable_stream_1.Writable {
}
exports.Stream = Stream;
class Transport extends Stream {
    static Type;
    _options;
    _buffer = '';
    constructor(options) {
        super({ highWaterMark: ({ ...options }).highWaterMark || 16 });
        this._options = { level: null, highWaterMark: 16, asJSON: true, filters: [], transforms: [], ...options };
        if (!this._options.label)
            throw new Error('Failed to construct Transport using label/name of undefined');
    }
    /**
     * Gets the extended Type.
     */
    getType() {
        return Transport.Type;
    }
    /**
     * Formats as JSON or just message string.
     *
     * @param chunk the currently logged chunk.
     */
    format(chunk) {
        // Loose check maybe should be more comprehensive.
        if (this.isJSON || chunk.charAt(0) !== '{')
            return chunk;
        const payload = JSON.parse(chunk);
        return payload.message;
    }
    /**
     * Gets the label for the Transport.
     */
    get label() {
        return this._options.label;
    }
    /**
     * Get the Transport's level.
     */
    get level() {
        return this._options.level;
    }
    /**
     * Gets if Transport is muted.
     */
    get muted() {
        return this._options.muted;
    }
    /**
     * Gets if Transport outputs JSON string.
     */
    get isJSON() {
        return this._options.asJSON;
    }
    /**
     * Gets Transport's Filters.
     */
    get filters() {
        return this._options.filters;
    }
    /**
     * Gets Transport's Transforms.
     */
    get transforms() {
        return this._options.transforms;
    }
    /**
     * Mutes the Transport.
     */
    mute() {
        this._options.muted = true;
        return this;
    }
    /**
     * Unmutes the Transport.
     */
    unmute() {
        this._options.muted = false;
        return this;
    }
    /**
     * Sets the Logger's log level.
     *
     * @param level the level to set the Logger to.
     * @param logger the parent Logger containing log levels.
     */
    setLevel(level, logger) {
        if (typeof level === 'undefined' || !logger.levels.includes(level))
            throw new Error(`Level "${level}" is invalid or not found.`);
        this._options.level = level;
        return this;
    }
    /**
     * Log method called by extended class to handle log messages.
     *
     * @param payload the payload to be logged.
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    log(payload) {
        throw new Error(`Method "log" is required for Transport ${this.label} but was NOT implemented.`);
    }
    write(chunk, encoding, cb) {
        try {
            const s = this._buffer + String(this.format(chunk));
            const lines = s.split(types_1.EOL);
            let i = 0;
            for (i; i < lines.length - 1; i++) {
                this.log(lines[i] + types_1.EOL);
            }
            this._buffer = lines[i];
            if (cb)
                cb();
        }
        catch (ex) {
            if (cb)
                cb(ex);
        }
        return true;
    }
    /**
     * Destroys and emits close for the stream.
     *
     * @param err an error on destroy.
     * @param cb optional callback.
     */
    destroy(err, cb) {
        this.writable = false;
        this._buffer = '';
        if (cb)
            cb(err);
        this.emit('close');
        return this;
    }
    end(chunk, enc, cb) {
        if (typeof chunk === 'function') {
            cb = chunk;
            chunk = undefined;
        }
        if (typeof enc === 'function') {
            cb = enc;
            enc = undefined;
        }
        if (chunk)
            this.write(chunk, cb);
        let out;
        if (this._buffer && this._buffer.length) {
            out = this._buffer + types_1.EOL;
            this.log(out);
        }
        if (cb)
            cb(null, out);
        this.destroy();
        return this;
    }
}
exports.Transport = Transport;
//# sourceMappingURL=transport.js.map