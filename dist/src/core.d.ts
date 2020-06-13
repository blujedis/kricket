import { Logger } from './logger';
import { Transport } from './transports';
export declare class Core {
    /**
     * Map of Logger instances.
     */
    loggers: Map<string, Logger<any>>;
    /**
     * Gets a logger stored in the collection.
     *
     * @param label the Logger's label to lookup.
     */
    getLogger(label: string): Logger<any>;
    /**
     * Looks up a Transport within a Logger.
     *
     * @param label the Transport label/name to lookup.
     * @param logger the Logger the Transport is contained in.
     */
    getTransport<T extends Transport>(label: string, logger?: string | Logger<any>): T;
    /**
     * Clones an existing Transport by options.
     *
     * @param label the Transport label/name to be cloned.
     * @param transport the Transport instance to be cloned.
     */
    cloneTransport<T extends Transport<any>>(label: string, transport: T): T;
}
declare const _default: Core;
export default _default;
