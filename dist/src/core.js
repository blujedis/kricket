"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Core = void 0;
class Core {
    /**
     * Map of Logger instances.
     */
    loggers = new Map();
    /**
     * Gets a logger stored in the collection.
     *
     * @param label the Logger's label to lookup.
     */
    getLogger(label) {
        return this.loggers.get(label);
    }
}
exports.Core = Core;
let instance;
function getInstance() {
    if (!instance)
        instance = new Core();
    return instance;
}
exports.default = getInstance();
//# sourceMappingURL=core.js.map