"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DummyTransport = void 0;
const transport_1 = require("./transport");
class DummyTransport extends transport_1.Transport {
    static Type = typeof DummyTransport;
    options;
    constructor(options) {
        super({ label: 'dummy', ...options });
        this.options = this._options;
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
//# sourceMappingURL=dummy.js.map