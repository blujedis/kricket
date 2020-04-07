"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Core {
    constructor() {
        /**
         * Map of Logger instances.
         */
        this.loggers = new Map();
    }
    /**
     * Gets a logger stored in the collection.
     *
     * @param label the Logger's label to lookup.
     */
    getLogger(label) {
        return this.loggers.get(label);
    }
    /**
     * Looks up a Transport within a Logger.
     *
     * @param label the Transport label/name to lookup.
     * @param logger the Logger the Transport is contained in.
     */
    getTransport(label, logger) {
        if (typeof logger === 'string')
            logger = this.loggers.get(logger);
        const find = (_logger) => ((_logger && _logger.transports.find(t => t.label === label)) || null);
        const loggers = (logger ? [logger] : [...this.loggers.values()]);
        let found = null;
        while (!found && loggers.length) {
            found = find(loggers.shift());
        }
        return found;
    }
    /**
     * Clones an existing Transport by options.
     *
     * @param label the Transport label/name to be cloned.
     * @param transport the Transport instance to be cloned.
     */
    cloneTransport(label, transport) {
        const options = transport.options;
        const Klass = transport.getType;
        return new Klass(label, options);
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