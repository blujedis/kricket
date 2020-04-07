/// <reference types="node" />
import { EventEmitter } from 'events';
import { ILoggerOptions, Filter, Transform, Callback, Payload } from './types';
import { Transport } from './transports';
import { Core } from './core';
export declare class Logger<Level extends string> extends EventEmitter {
    label: string;
    options: ILoggerOptions<Level>;
    parent?: Logger<Level>;
    core: Core;
    children: Set<Logger<Level>>;
    constructor(label: string, options: ILoggerOptions<Level>, parent?: Logger<Level>);
    /**
     * Internal method to write to Transport streams.
     *
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
    get transports(): Transport<import("./types").ITransportOptions<any>>[];
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
     */
    mute(): this;
    /**
     * Unmute the Logger.
     */
    unmute(): this;
    /**
     * Mutes a Logger's Transport.
     *
     * @param label the label name of the Transport to unmute.
     */
    muteTransport(label: string): this;
    /**
     * Unmutes a Logger's Transport.
     *
     * @param label the label name of the Transport to unmute.
     */
    unmuteTransport(label: string): this;
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
    isLevelActive(level: Level, levels?: Level[]): boolean;
    /**
     * Gets a new child Logger.
     *
     * @param label the Logger label to be used.
     */
    get(label: string): Logger<Level>;
    /**
     * Adds a Filter function.
     *
     * @param fn the Filter function to be added.
     */
    filter(fn: Filter<Level>): this;
    /**
     * Adds a Transform function.
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
     * Inpsects filters if should halt output of log message.
     *
     * @param transport the Transport to get filters for.
     * @param payload the payload to pass when filtering.
     */
    filtered(transport: Transport, payload: Payload<Level>): boolean;
    /**
     * Transforms a payload for output.
     *
     * @param transport the Transport to include Transfroms from.
     * @param payload the payload object to be transformed.
     */
    transformed(transport: Transport, payload: Payload<Level>): Payload<Level>;
    /**
     * Writes to stream of Transport.
     *
     * @param message the message to write.
     * @param args optional format args.
     */
    write(message: string, ...args: any[]): this;
    /**
     * Writes a line to Transports.
     *
     * @param message the message to be written.
     * @param args optional format args.
     */
    writeLn(message: string, ...args: any[]): this;
    /**
     * Ends and outputs buffer when using .write();
     *
     * @param cb optional callback on ending write.
     */
    writeEnd(cb?: Callback): this;
    /**
     * Gets a Transport by name.
     *
     * @param label the label of the Transport to get.
     */
    getTransport<T extends Transport>(label: string): T;
    /**
     * Adds a Transport to Logger.
     *
     * @param transport the Transport to add to collection.
     */
    addTransport<T extends Transport>(transport: T): T;
}
