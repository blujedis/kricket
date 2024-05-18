"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConsoleTransport = void 0;
const transport_1 = require("./transport");
class ConsoleTransport extends transport_1.Transport {
    static Type = typeof ConsoleTransport;
    options;
    constructor(options) {
        super({ label: 'console', ...options, asJSON: false });
        options = this._options;
    }
    /**
     * Method called by super.
     *
     * @param payload the payload to ouptut.
     */
    log(payload) {
        process.stdout.write(payload, (err) => {
            if (err)
                throw err;
        });
    }
}
exports.ConsoleTransport = ConsoleTransport;
//# sourceMappingURL=console.js.map