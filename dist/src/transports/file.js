"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileTransport = void 0;
const transport_1 = require("./transport");
const file_stream_rotator_1 = __importDefault(require("file-stream-rotator"));
const types_1 = require("../types");
const utils_1 = require("../utils");
const DEFAULTS = {
    label: 'file',
    filename: './logs/%DATE%.log',
    frequency: 'daily',
    verbose: false,
    date_format: 'YYYY-MM-DD',
    size: '5m',
    max_logs: '7d',
    audit_file: './logs/_audit.json',
    file_options: { flags: 'a' },
    eol: types_1.EOL
};
class FileTransport extends transport_1.Transport {
    static Type = typeof FileTransport;
    rotator;
    constructor(options) {
        super({ ...DEFAULTS, ...options });
        options = this._options;
        if (['hourly', 'minute'].includes(options.frequency))
            options.frequency = options.frequency.charAt(0);
        this.rotator = file_stream_rotator_1.default.getStream(options);
        if (options.onRotate)
            this.rotator.on('rotate', this.rotate.bind(this));
        if (options.onNew)
            this.rotator.on('new', this.newfile.bind(this));
        if (options.verbose)
            utils_1.log.info(`Transport "${this.label}" logging to file: ${this._options.filename}`);
    }
    /**
     * Callback handler on new file created.
     *
     * @param filename the new filename that was created.
     */
    newfile(newFile) {
        if (this._options.onRotate)
            return this._options.onNew(newFile);
        utils_1.log.info(`Transport "${this.label}" logging to NEW file: ${newFile}`);
        return this;
    }
    /**
     * Callback handler on file rotated.
     *
     * @param oldFile the previous file path.
     * @param newFile the new or current file path.
     */
    rotate(oldFile, newFile) {
        if (this._options.onRotate)
            return this._options.onRotate(oldFile, newFile);
        // PLACEHOLDER: add gzip archiving.
        return this;
    }
    /**
     * Method  alled by super.
     *
     * @param payload the payload object to ouptut.
     */
    log(payload) {
        this.rotator.write(payload);
    }
}
exports.FileTransport = FileTransport;
//# sourceMappingURL=file.js.map