"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StreamTransport = void 0;
const transport_1 = require("./transport");
class StreamTransport extends transport_1.Transport {
    static Type = typeof StreamTransport;
    options;
    constructor(options) {
        super({ label: 'stream', ...options });
        options = this._options;
    }
    /**
     * Method  alled by super.
     *
     * @param payload the payload object to ouptut.
     */
    log(payload) {
        this.options.stream.write(payload);
    }
}
exports.StreamTransport = StreamTransport;
//# sourceMappingURL=stream.js.map