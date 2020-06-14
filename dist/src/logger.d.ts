/// <reference types="node" />
import { EventEmitter } from 'events';
import { ILoggerOptions, Filter, Transform, Callback, Payload, BaseLevel, ChildLogger } from './types';
import { Transport } from './transports';
import { Core } from './core';
export declare class Logger<Level extends string> extends EventEmitter {
    label: string;
    options: ILoggerOptions<Level>;
    isChild: boolean;
    core: Core;
    children: Map<string, Logger<Level>>;
    constructor(label: string, options: ILoggerOptions<Level>, isChild?: boolean);
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
     * Gets Logger levels.
     */
    get levels(): Level[];
    /**
     * Gets Logger Transports.
     */
    get transports(): Transport<any, import("./types").ITransportOptions<any>>[];
    /**
     * Gets Logger's filters.
     */
    get filters(): Filter<Level | "write" | "writeLn">[];
    /**
     * Gets all Logger Transforms.
     */
    get transforms(): Transform<Level | "write" | "writeLn">[];
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
     * Gets a new child Logger.
     *
     * @param label the Logger label to be used.
     * @param meta child metadata for child.
     */
    child(label: string, meta?: {
        [key: string]: any;
    }): ChildLogger<Level>;
    /**
     * Adds a Filter function.
     *
     * @param fn the Filter function to be added.
     */
    filter(fn: Filter<Level | BaseLevel>): this;
    /**
     * Adds a Transform function.
     *
     * @param fn the Transform function to be added.
     */
    transform(fn: Transform<Level | BaseLevel>): this;
    /**
     * Merges Filter functions into single group.
     *
     * @param fn a Filter function to merge.
     * @param fns rest array of Filter functions to merge.
     */
    mergeFilter(fn: Filter<Level | BaseLevel>, ...fns: Filter<Level | BaseLevel>[]): Filter<Level | BaseLevel>;
    /**
     * Merges Filter functions into single group.
     *
     * @param fns rest array of Filter functions to merge.
     */
    mergeFilter(fn: Filter<Level | BaseLevel>[]): Filter<Level | BaseLevel>;
    /**
     * Merges Transform functions into single group.
     *
     * @param fn a Transform function to merge.
     * @param fns rest array of Transform functions to merge.
     */
    mergeTransform(fn: Transform<Level | BaseLevel>, ...fns: Transform<Level | BaseLevel>[]): Transform<Level | BaseLevel>;
    /**
     * Merges Transform functions into single group.
     *
     * @param fns array of Transform functions to merge.
     */
    mergeTransform(fns: Transform<Level | BaseLevel>[]): Transform<Level | BaseLevel>;
    /**
     * Inpsects filters if should halt output of log message.
     *
     * @param transport the Transport to get filters for.
     * @param payload the payload to pass when filtering.
     */
    filtered(transport: Transport, payload: Payload<Level | BaseLevel>): boolean;
    /**
     * Transforms a payload for output.
     *
     * @param transport the Transport to include Transfroms from.
     * @param payload the payload object to be transformed.
     */
    transformed(transport: Transport, payload: Payload<Level | BaseLevel>): Payload<Level | "write" | "writeLn">;
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
    getTransport<T extends Transport, K extends string>(label: K): T;
    /**
     * Adds a Transport to Logger.
     *
     * @param transport the Transport to add to collection.
     */
    addTransport<T extends Transport>(transport: T): T;
    /**
     * Convenience method to generate simple uuid v4. Although this
     * works for most simple scenarios consider using a first class
     * UUIDV4 library.
     *
     * @see https://www.npmjs.com/package/uuid
     */
    uuidv4(): any;
}
