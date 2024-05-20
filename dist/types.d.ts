import { Transport } from './transports';
import { Logger } from './logger';
import { type Location } from './utils/trace';
export type KeyOf<T> = Extract<keyof T, string>;
export type ValueOf<K extends KeyOf<T>, T> = T[K];
export type ValuesOf<T extends any[]> = T[number];
export type NodeCallback<T = any, E extends object = {}> = (err?: (Error & E) | null | undefined, data?: T) => void;
export type Callback = (data?: any) => void;
export type ErrorCallback = (err?: Error | null | undefined) => void;
export type BaseLevel = 'write' | 'writeLn';
export type Filter<Level extends string, Extend extends Record<string, any> = Record<string, any>> = (payload: Payload<Level, Extend>) => boolean;
export type Transform<Level extends string, Extend extends Record<string, any> = Record<string, any>> = (payload: Payload<Level, Extend>) => Payload<Level, Extend>;
export type LogMethod<T> = (message: any, ...args: any[]) => T;
export type LogMethods<T, Level extends string> = Record<Level, LogMethod<T>>;
export type ChildOmits = 'setTransportLevel' | 'addTransport' | 'muteTransport' | 'unmuteTransport';
export type ChildLogger<Level extends string> = Omit<Logger<Level>, ChildOmits> & LogMethods<Logger<Level>, Level>;
export type Payload<Level extends string, Extend extends Record<string, unknown> = Record<string, unknown>, Meta extends Record<string, unknown> = Record<string, unknown>> = PayloadBase<Level & BaseLevel, Meta> & Extend;
export declare const UUID: unique symbol;
export declare const LOGGER: unique symbol;
export declare const TRANSPORT: unique symbol;
export declare const LEVEL: unique symbol;
export declare const TRACE: unique symbol;
export declare const META: unique symbol;
export declare const TIMESTAMP: unique symbol;
export declare const MESSAGE: unique symbol;
export declare const SPLAT: unique symbol;
export declare const EOL = "\n";
export interface PayloadBase<Level extends string, Meta extends Record<string, unknown> = Record<string, unknown>> {
    /**
     * The payload's log id.
     */
    [UUID]: string;
    /**
   * The payload's log id.
   */
    [TIMESTAMP]: Date;
    /**
     * The payload's message.
     */
    [TRACE]: Location;
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
    [LEVEL]: Level;
    /**
     * The payload's global metadata.
     */
    [META]: Meta;
    /**
     * Array containing payload arguments beyond the primary message.
     */
    [SPLAT]: any[];
    /**
     * The payload's message.
     */
    [MESSAGE]: string | Error;
    /**
     * Primary log payload message.
     */
    message: string;
    /**
     * Optional paylod key/values.
     */
    [key: string]: any;
}
interface TransformBase<Level extends string> {
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
export type TransportOptions<Level extends string = any, Label extends string = any> = TransportOptionsBase<Level, Label> & Record<string, any>;
export interface TransportOptionsBase<Level extends string = any, Label extends string = any> extends TransformBase<Level> {
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
export interface LoggerOptions<Level extends string, M extends Record<string, unknown> = Record<string, unknown>> extends TransformBase<Level> {
    /**
     * The label for the logger. If not provided a
     * random id will be generated.
     *
     * @default undefined
     */
    label?: string;
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
     * Built in included properties useful for logging.
     *
     * uuid, logger, transport, level, trace, timestamp
     */
    includes?: boolean;
}
export {};
