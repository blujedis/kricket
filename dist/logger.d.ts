/// <reference types="node" />
import { EventEmitter } from 'events';
import { Transport } from './transports';
import { Core } from './core';
import { LoggerOptions, Filter, Transform, Callback, ChildLogger, Payload, TypeOrValue, FormatArg, TokenKey } from './types';
export declare class Logger<Level extends string, Meta extends Record<string, unknown> = Record<string, unknown>, Key extends string = string> extends EventEmitter {
    options: LoggerOptions<Level, Meta, Key>;
    isChild: boolean;
    core: Core;
    children: Map<string, Logger<Level, Meta, Key>>;
    constructor(options: LoggerOptions<Level, Meta, Key>, isChild?: boolean);
    /**
     * Iterates Transports checks for duplicate labels.
     */
    private checkUnique;
    /**
     * Internal method to write to Transport streams.
     *
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
    get label(): string;
    /**
     * Gets Logger levels.
     */
    get levels(): Level[];
    /**
     * Gets Logger Transports.
     */
    get transports(): Transport<import("./types").TransportOptions>[];
    /**
     * Gets Logger's filters.
     */
    get filters(): Filter<Level, Record<string, any>>[];
    /**
     * Gets all Logger Transforms.
     */
    get transforms(): Transform<Level, Record<string, any>>[];
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
    setLevel(level: TypeOrValue<Level>, cascade?: boolean): this;
    /**
     * Sets the level for a Logger Transport.
     *
     * @param transport the Transport to set the level for.
     * @param level the level to be set on the Transport.
     */
    setTransportLevel(transport: Transport, level: TypeOrValue<Level>): this;
    /**
     * Sets the level for a Logger Transport.
     *
     * @param transport the Transport label to set the level for.
     * @param level the level to be set on the Transport.
     */
    setTransportLevel(transport: string, level: TypeOrValue<Level>): this;
    /**
     *
     * @param payload your current payload object.
     * @param level the level you wish to change to.
     */
    changeLevel(payload: Payload<Level>, level: Level): Payload<Level>;
    /**
     * Checks if a level is active.
     *
     * @param level the level to compare.
     * @param levels the optional levels to compare against.
     */
    isLevelActive(level: TypeOrValue<Level>, levels?: TypeOrValue<Level>[]): boolean;
    /**
     * Checks if a level is active by payload.
     *
     * @param payload the payload containing the level to inspect.
     * @param levels the optional levels to compare against.
     */
    isLevelActive(payload: Payload<Level>, levels?: TypeOrValue<Level>[]): boolean;
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
    filter<Extend extends Record<string, unknown> = Record<string, unknown>>(transport: string, fn: Filter<Level, Extend>): this;
    /**
     * Adds a global Filter function.
     *
     * @param fn the Filter function to be added.
     */
    filter<Extend extends Record<string, unknown> = Record<string, unknown>>(fn: Filter<Level, Extend>): this;
    /**
     * Adds a Transform function.
     *
     * @param transport the Transport to add the transform to.
     * @param fn the Transform function to be added.
     */
    transform<P extends Record<string, unknown> = Record<string, unknown>>(transport: string, fn: Transform<Level, P>): this;
    /**
     * Adds a global Transform function.
     *
     * @param fn the Transform function to be added.
     */
    transform<Extend extends Record<string, unknown> = Record<string, unknown>>(fn: Transform<Level, Extend>): this;
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
     * @param fn rest array of Filter functions to merge.
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
        write(message: string, ...args: any[]): void;
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
     * Useful helper to determine if payload contains a given Logger.
     *
     * @param payload the current payload to inspect.
     * @param label the label to match.
     */
    hasLogger(payload: Payload<Level>, label: string): boolean;
    /**
     * Useful helper to determine if payload contains a given Transport.
     *
     * @param payload the current payload to inspect.
     * @param label the label to match.
     */
    hasTransport(payload: Payload<Level>, label: string): boolean;
    /**
     * Useful helper to determine if Transport contains a given Level.
     *
     * @param payload the current payload to inspect.
     * @param compare the label to compare.
     */
    hasLevel(payload: Payload<Level>, compare: Level): boolean;
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
    /**
     * Extend a payload object with additional properties optionally assigning exteded object at
     * property name defined as options.metaKey.
     *
     * @param payload the payload object to be extended.
     * @param extend the object to extend payload with.
     * @param useMetaKey when true the extended object is assiged to metaKey name in payload.
     */
    extendPayload<P extends Payload<Level>, E extends Partial<P>>(payload: P, extend: E, useMetaKey?: boolean): (P & {
        [key: string]: E;
    }) | (P & E);
    /**
     * Parses payload inspecting for error argument as message and/or meta object within splat.
     *
     * @param payload the payload object to be parsed.
     */
    parsePayload<P extends Payload<Level>, E extends Partial<P>>(payload: P, extend?: E): (P & {
        [key: string]: E;
    }) | (P & E);
    /**
     * Formats a message using Node's util.format function.
     *
     * @param template the string template used to format the message.
     * @param args the additional arguments
     */
    formatMessage(template: string, ...args: FormatArg[]): string;
    /**
     * Formats a message using Node's util.format function. Arguments which match
     * payload token keys will be mapped to their corresponding values.
     *
     * @param payload the current payload use to parse tokens from.
     * @param template the string template used to format the message.
     * @param args the additional arguments
     */
    formatMessage(payload: Payload<Level>, template: string, ...args: FormatArg[]): string;
    getToken<P extends Payload<Level>>(payload: P, key: TokenKey | keyof P): void;
}
