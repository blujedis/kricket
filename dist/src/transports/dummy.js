"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const transport_1 = require("./transport");
class DummyTransport extends transport_1.Transport {
    constructor(options) {
        super({ label: 'dummy', ...options });
    }
    /**
     * Must override log method.
     *
     * @param payload the payload object to ouptut.
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    log(payload) {
        // does nothing.
    }
}
exports.DummyTransport = DummyTransport;
DummyTransport.Type = typeof DummyTransport;
//# sourceMappingURL=dummy.js.map