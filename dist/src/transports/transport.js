"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const readable_stream_1 = require("readable-stream");
const types_1 = require("../types");
const utils_1 = require("../utils");
class Stream extends readable_stream_1.Writable {
}
exports.Stream = Stream;
class Transport extends Stream {
    constructor(label, options) {
        super({ highWaterMark: (options || {}).highWaterMark || 16 });
        this.label = label;
        this.buffer = '';
        this.options = { ...{ level: null, highWaterMark: 16, filters: [], transforms: [], asJSON: true }, ...options };
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
     * Get the Transport's level.
     */
    get level() {
        return this.options.level;
    }
    /**
     * Gets if Transport is muted.
     */
    get muted() {
        return this.options.muted;
    }
    /**
     * Gets if Transport outputs JSON string.
     */
    get isJSON() {
        return this.options.asJSON;
    }
    /**
     * Gets Transport's Filters.
     */
    get filters() {
        return this.options.filters;
    }
    /**
     * Gets Transport's Transforms.
     */
    get transforms() {
        return this.options.transforms;
    }
    /**
     * Mutes the Transport.
     */
    mute() {
        this.options.muted = true;
        return this;
    }
    /**
     * Unmutes the Transport.
     */
    unmute() {
        this.options.muted = false;
        return this;
    }
    /**
     * Sets the Logger's log level.
     *
     * @param level the level to set the Logger to.
     * @param logger the parent Logger containing log levels.
     */
    setLevel(level, logger) {
        if (typeof level === 'undefined' || !logger.levels.includes(level)) {
            // eslint-disable-next-line no-console
            console.warn(utils_1.colorize(`Level "${level}" is invalid or not found.`, 'yellow'));
            return this;
        }
        this.options.level = level;
        return this;
    }
    /**
     * Log method called by extended class to handle log messages.
     * @param payload the payload to be logged.
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    log(payload) {
        const err = new Error(`Transport "${this.label}" method "log" required but NOT implemented.`);
        console.error(utils_1.colorize(err.stack, 'red'));
        process.exit(1);
    }
    write(chunk, encoding, cb) {
        try {
            const s = this.buffer + String(this.format(chunk));
            const lines = s.split(types_1.EOL);
            let i = 0;
            for (i; i < lines.length - 1; i++) {
                this.log(lines[i] + types_1.EOL);
            }
            this.buffer = lines[i];
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
        this.buffer = '';
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
        if (this.buffer && this.buffer.length) {
            out = this.buffer + types_1.EOL;
            this.log(out);
        }
        if (cb)
            cb(null, out);
        this.destroy();
    }
}
exports.Transport = Transport;
//# sourceMappingURL=transport.js.map