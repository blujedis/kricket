/// <reference types="node" />
import { EventEmitter } from 'events';
import { ILoggerOptions, Filter, Transform, Callback, BaseLevel, ChildLogger, IPayload } from './types';
import { Transport } from './transports';
import { Core } from './core';
export declare class Logger<Level extends string, M extends object = {}> extends EventEmitter {
    label: string;
    options: ILoggerOptions<Level, M>;
    isChild: boolean;
    core: Core;
    children: Map<string, Logger<Level, M>>;
    constructor(label: string, options: ILoggerOptions<Level, M>, isChild?: boolean);
    /**
     * Iterates Transports checks for duplicate labels.
     */
    private checkUnique;
    /**
     * Internal method to write to Transport streams.
     *
     * @param group optional log group.
     * @param level the level to be logged.
     * @param message the message to be logged.
     * @param args the optional format args to be applied.
     */
    private writer;
    /**
     * Inpsects filters if should halt output of log message.
     *
     * @param transport the Transport to get filters for.
     * @param payload the payload to pass when filtering.
     */
    private filtered;
    /**
     * Transforms a payload for output.
     *
     * @param transport the Transport to include Transfroms from.
     * @param payload the payload object to be transformed.
     */
    private transformed;
    /**
     * Gets Logger levels.
     */
    get levels(): Level[];
    /**
     * Gets Logger Transports.
     */
    get transports(): Transport<import("./types").ITransportOptions<any, any>>[];
    /**
     * Gets Logger's filters.
     */
    get filters(): Filter<Level>[];
    /**
     * Gets all Logger Transforms.
     */
    get transforms(): Transform<Level>[];
    /**
     * Gets whether the Logger is muted.
     */
    get muted(): boolean;
    /**
     * Gets the Logger's level.
     */
    get level(): Level;
    /**
     * Mute the Logger.
     * @param cascade when true all child Loggers are muted.
     */
    mute(cascade?: boolean): this;
    /**
     * Unmute the Logger.
     * @param cascade when true all child Loggers are unmuted.
     */
    unmute(cascade?: boolean): this;
    /**
     * Mutes a Logger's Transport.
     *
     * @param labels the label(s) name of the Transport to unmute.
     */
    muteTransport(...labels: string[]): this;
    /**
     * Unmutes a Logger's Transport.
     *
     * @param labels the label(s) name of the Transport to unmute.
     */
    unmuteTransport(...labels: string[]): this;
    /**
     * Sets the Logger's log level.
     *
     * @param level the level to set the Logger to.
     * @param cascade when true apply to child Transports (default: true).
     */
    setLevel(level: Level, cascade?: boolean): this;
    /**
     * Sets the level for a Logger Transport.
     *
     * @param transport the Transport to set the level for.
     * @param level the level to be set on the Transport.
     */
    setTransportLevel(transport: Transport, level: Level): this;
    /**
     * Sets the level for a Logger Transport.
     *
     * @param transport the Transport label to set the level for.
     * @param level the level to be set on the Transport.
     */
    setTransportLevel(transport: string, level: Level): this;
    /**
     * Checks if a level is active.
     *
     * @param level the level to compare.
     * @param levels the optional levels to compare against.
     */
    isLevelActive(level: Level | BaseLevel, levels?: Level[]): boolean;
    /**
     * Checks if a level is active by payload.
     *
     * @param payload the payload containing the level to inspect.
     * @param levels the optional levels to compare against.
     */
    isLevelActive(payload: IPayload<Level>, levels?: Level[]): boolean;
    /**
     * Gets a new child Logger.
     *
     * @param label the Logger label to be used.
     * @param meta child metadata for child.
     */
    child(label: string, meta?: {
        [key: string]: any;
    }): ChildLogger<Level>;
    /**
     * Adds a Filter function to specified Transport.
     *
     * @param transport the transport to add the filter to.
     * @param fn the Filter function to be added.
     */
    filter(transport: string, fn: Filter<Level>): this;
    /**
     * Adds a global Filter function.
     *
     * @param fn the Filter function to be added.
     */
    filter(fn: Filter<Level>): this;
    /**
     * Adds a Transform function.
     *
     * @param transport the Transport to add the transform to.
     * @param fn the Transform function to be added.
     */
    transform(transport: string, fn: Transform<Level>): this;
    /**
     * Adds a global Transform function.
     *
     * @param fn the Transform function to be added.
     */
    transform(fn: Transform<Level>): this;
    /**
     * Merges Filter functions into single group.
     *
     * @param fn a Filter function to merge.
     * @param fns rest array of Filter functions to merge.
     */
    mergeFilter(fn: Filter<Level>, ...fns: Filter<Level>[]): Filter<Level>;
    /**
     * Merges Filter functions into single group.
     *
     * @param fns rest array of Filter functions to merge.
     */
    mergeFilter(fn: Filter<Level>[]): Filter<Level>;
    /**
     * Merges Transform functions into single group.
     *
     * @param fn a Transform function to merge.
     * @param fns rest array of Transform functions to merge.
     */
    mergeTransform(fn: Transform<Level>, ...fns: Transform<Level>[]): Transform<Level>;
    /**
     * Merges Transform functions into single group.
     *
     * @param fns array of Transform functions to merge.
     */
    mergeTransform(fns: Transform<Level>[]): Transform<Level>;
    /**
     * Writes a line to Transports.
     *
     * @param message the message to be written.
     * @param args optional format args.
     */
    writeLn(message: string, ...args: any[]): this;
    /**
     * Writes to stream of Transport.
     *
     * @param message the message to write.
     * @param args optional format args.
     */
    write(message: string, ...args: any[]): this;
    /**
     * Ends and outputs buffer when using .write();
     *
     * @param cb optional callback on ending write.
     */
    writeEnd(cb?: Callback): Promise<void>;
    /**
     * Writes to stream of Transport.
     *
     * @param key optional group key name appended to metadata.
     */
    group(key?: string): {
        readonly key: string;
        /**
         * Writes to stream of Transport.
         *
         * @param message the message to write.
         * @param args optional format args.
         */
        write(msg: string, ...args: any[]): void;
        /**
         * Ends the write stream and outputs to Transports.
         *
         * @param cb optional callback on write completed.
         */
        end(cb?: Callback): Promise<void>;
    };
    /**
     * Gets a Transport by name.
     * Storing Transports in core just makes it easier to
     * retrive and clone them from any logger.
     *
     * @param label the label of the Transport to get.
     */
    getTransport<Label extends string, T extends Transport>(label: Label): T;
    /**
     * Clones an existing Transport by options.
     *
     * @param label the Transport label/name to be cloned.
     * @param transport the Transport instance to be cloned.
     */
    cloneTransport<Label extends string, T extends Transport>(label: Label, transport: T): T;
    /**
     * Convenience method to generate simple uuid v4. Although this
     * works for most simple scenarios consider using a first class
     * UUIDV4 library.
     *
     * @see https://www.npmjs.com/package/uuid
     */
    uuidv4(): any;
    /**
     * Useful helper to determine if payload contains a given Logger.
     *
     * @param payload the current payload to inspect.
     * @param label the label to match.
     */
    hasLogger(payload: IPayload<Level>, label: string): boolean;
    /**
     * Useful helper to determine if payload contains a given Transport.
     *
     * @param payload the current payload to inspect.
     * @param label the label to match.
     */
    hasTransport(payload: IPayload<Level>, label: string): boolean;
    /**
     * Useful helper to determine if Transport contains a given Level.
     *
     * @param payload the current payload to inspect.
     * @param label the label to match.
     */
    hasLevel(payload: IPayload<Level>, compare: Level | BaseLevel): boolean;
    /**
     * Converts Symbols on payload to a simple mapped object.
     * This can be used if you wish to output Symbols as metadata to
     * your final output.
     *
     * Defaults to Symbols [LOGGER, TRANSPORT, LEVEL]
     *
     * @example
     * defaultLogger.transform(payload => {
     *    payload.metadata = defaultLogger.symbolsToMap(payload);
     *    return payload;
     * });
     *
     * @param payload a log payload containing symbols.
     */
    symbolsToMap(payload: IPayload<Level>, ...symbols: symbol[]): {};
    /**
     * Simply extends the payload object with additional properties while also
     * maintaining typings.
     *
     * @param payload the payload object to be extended.
     * @param obj the object to extend payload with.
     */
    extendPayload<T extends object>(payload: IPayload<Level>, obj: T): IPayload<Level> & T;
    /**
     * Adds a Transport to Logger.
     *
     * @param transport the Transport to add to collection.
     */
    addTransport<T extends Transport>(transport: T): this;
    /**
     * Removes a Transport.
     *
     * @param transport the transport to be removed.
     */
    removeTransport<T extends Transport>(transport: string | T): this;
    /**
     * Removes a Transport.
     *
     * @param transport the Transport name/label to be removed.
     */
    removeTransport(transport: string): this;
}
