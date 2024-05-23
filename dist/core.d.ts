import { Logger } from './logger';
export declare class Core {
    /**
     * Map of Logger instances.
     */
    loggers: Map<string, Logger<any, any>>;
    /**
     * Gets a logger stored in the collection.
     *
     * @param label the Logger's label to lookup.
     */
    getLogger<Level extends string, Meta extends Record<string, unknown> = undefined>(label: string): Logger<Level, Meta>;
}
declare const _default: Core;
export default _default;
