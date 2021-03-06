import { Transport } from './transports';
import { Logger } from './logger';
export interface IMap<T = any> {
    [key: string]: T;
}
export declare type KeyOf<T> = Extract<keyof T, string>;
export declare type ValueOf<K extends KeyOf<T>, T> = T[K];
export declare type ValuesOf<T extends any[]> = T[number];
export declare type NodeCallback<T = any, E extends object = {}> = (err?: (Error & E) | null | undefined, data?: T) => void;
export declare type Callback = (data?: any) => void;
export declare type ErrorCallback = (err?: Error | null | undefined) => void;
export declare type BaseLevel = 'write' | 'writeLn';
export declare type Filter<Level extends string> = (payload: Payload<Level>) => boolean;
export declare type Transform<Level extends string> = (payload: Payload<Level>) => Payload<Level>;
export declare type LogMethod<T> = (message: any, ...args: any[]) => T;
export declare type LogMethods<T, Level extends string> = Record<Level, LogMethod<T>>;
export declare type ChildOmits = 'setTransportLevel' | 'addTransport' | 'muteTransport' | 'unmuteTransport';
export declare type ChildLogger<Level extends string> = Omit<Logger<Level>, ChildOmits> & LogMethods<Logger<Level>, Level>;
export declare type Payload<Level extends string, E extends object = {}> = IPayload<Level | BaseLevel> & E;
export declare const LOGGER: unique symbol;
export declare const TRANSPORT: unique symbol;
export declare const LEVEL: unique symbol;
export declare const MESSAGE: unique symbol;
export declare const SPLAT: unique symbol;
export declare const EOL = "\n";
export interface IPayload<Level extends string> {
    /**
     * The payload's Logger label.
     */
    [LOGGER]: string;
    /**
     * The payload's Transport label.
     */
    [TRANSPORT]?: string;
    /**
     * The payload's log level.
     */
    [LEVEL]: Level | BaseLevel;
    /**
     * The payload's message.
     */
    [MESSAGE]: string;
    /**
     * Array containing payload arguments beyond the primary message.
     */
    [SPLAT]: any[];
    /**
     * Primary log payload message.
     */
    message: string;
    /**
     * Optional paylod key/values.
     */
    [key: string]: any;
}
interface ITransformBase<Level extends string> {
    /**
     * The log Level that has been assigned.
     */
    level?: Level;
    /**
     * Whether or not Logger or Transform is muted.
     */
    muted?: boolean;
    /**
     * Array of Filters the payload must pass in order to be dispatched.
     *
     * @default []
     */
    filters?: Filter<Level>[];
    /**
     * Array of Transforms to be run when dispatching through transform.
     *
     * @default []
     */
    transforms?: Transform<Level>[];
}
export interface ITransportOptions<Level extends string = any, Label extends string = any> extends ITransformBase<Level> {
    /**
     * The name/label for the Transport.
     */
    label: Label;
    /**
     * Kricket on final dispatch can output JSON or the payload message. When "asJSON" is set
     * to false the payload contains only the message.
     *
     * @default true
     */
    asJSON?: boolean;
    /**
     * The stream limit which when reached we should pause writes until backpressure has been relieved.
     *
     * @default 16
     */
    highWaterMark?: number;
}
export interface ILoggerOptions<Level extends string, M extends object = {}> extends ITransformBase<Level> {
    /**
     * The Logger's log levels.
     * Once a Logger has been initialized these CANNOT be changed nor can a child change
     * it's log levels.
     *
     * @default []
     */
    readonly levels: Level[];
    /**
     * The Transport instances that this Logger should dispatch to.
     *
     * @default []
     */
    transports?: Transport[];
    /**
     * Default metadata that should be included in each log event.
     *
     * @default undefined
     */
    meta?: M;
    /**
     * When true default meta data is added to payload including,
     * the Logger name, Transport name, Level name and uuid v4.
     *
     * @default undefined
     */
    defaultMeta?: boolean;
    /**
     * When defined the default metadata will be nested in this key.
     * otherwise each prop is extended on the root metadata object.
     *
     * @default undefined
     */
    defaultMetaKey?: string;
}
export {};
