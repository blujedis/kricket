import { Logger } from './logger';
export declare class Core {
    /**
     * Map of Logger instances.
     */
    loggers: Map<string, Logger<any, any, string>>;
    /**
     * Gets a logger stored in the collection.
     *
     * @param label the Logger's label to lookup.
     */
    getLogger<Level extends string = any>(label: string): Logger<Level, Record<string, unknown>, string>;
}
declare const _default: Core;
export default _default;
