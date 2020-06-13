"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const transport_1 = require("./transport");
class StreamTransport extends transport_1.Transport {
    constructor(options, alias) {
        super(alias || 'stream', options);
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
StreamTransport.Type = typeof StreamTransport;
//# sourceMappingURL=stream.js.map