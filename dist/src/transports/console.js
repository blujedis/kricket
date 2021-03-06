"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const transport_1 = require("./transport");
class ConsoleTransport extends transport_1.Transport {
    constructor(options) {
        super({ label: 'console', ...options, asJSON: false });
    }
    /**
     * Method called by super.
     *
     * @param payload the payload object to ouptut.
     */
    log(payload) {
        process.stdout.write(payload, (err) => {
            if (err)
                throw err;
        });
    }
}
exports.ConsoleTransport = ConsoleTransport;
ConsoleTransport.Type = typeof ConsoleTransport;
//# sourceMappingURL=console.js.map