"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StreamTransport = void 0;
const transport_1 = require("./transport");
class StreamTransport extends transport_1.Transport {
    static Type = typeof StreamTransport;
<<<<<<< HEAD:dist/src/transports/stream.js
    options;
=======
>>>>>>> 2fa12ad6deec034c156be9ad86464db58f1dfb7b:dist/transports/stream.js
    constructor(options) {
        super({ label: 'stream', ...options });
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