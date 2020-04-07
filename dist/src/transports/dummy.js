"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const transport_1 = require("./transport");
class DummyTransport extends transport_1.Transport {
    constructor(options, alias) {
        super(alias || 'dummy', options);
    }
    /**
     * Method called by super.
     *
     * @param payload the payload object to ouptut.
     */
    log(payload) {
        // does nothing.
    }
}
exports.DummyTransport = DummyTransport;
DummyTransport.Type = typeof DummyTransport;
//# sourceMappingURL=dummy.js.map