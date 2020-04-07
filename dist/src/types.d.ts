import { Transport } from './transports';
import { Logger } from './logger';
export declare type KeyOf<T> = Extract<keyof T, string>;
export declare type ValueOf<K extends KeyOf<T>, T> = T[K];
export declare type ValuesOf<T extends any[]> = T[number];
export declare type NodeCallback = (err?: Error | null | undefined, data?: any) => void;
export declare type Callback = (data?: any) => void;
export declare type ErrorCallback = (err?: Error | null | undefined) => void;
export declare type Payload<Level extends string> = IPayload<Level>;
export declare type Filter<Level extends string> = (payload: Payload<Level>) => boolean;
export declare type Transform<Level extends string> = (payload: Payload<Level>) => Payload<Level>;
export declare type LogMethod<T> = (message: string, ...args: any[]) => T;
export declare type LogMethods<T, Level extends string> = Record<Level, LogMethod<T>>;
export declare const LOGGER: unique symbol;
export declare const TRANSPORT: unique symbol;
export declare const LEVEL: unique symbol;
export declare const MESSAGE: unique symbol;
export declare const SPLAT: unique symbol;
export declare const EOL = "\n";
export interface IPayload<Level extends string> {
    [LOGGER]: Logger<Level>;
    [TRANSPORT]?: Transport<any>;
    [LEVEL]: Level | '*';
    [MESSAGE]: string;
    [SPLAT]: any[];
    message: string;
    [key: string]: any;
}
export interface ITransportOptions<Level extends string> {
    asJSON?: boolean;
    filters?: Filter<Level>[];
    transforms?: Transform<Level>[];
    highWaterMark?: number;
    muted?: boolean;
    level?: Level;
}
export interface ILoggerOptions<Level extends string> {
    readonly levels: Level[];
    transports?: Transport[];
    filters?: Filter<Level>[];
    transforms?: Transform<Level>[];
    muted?: boolean;
    level?: Level;
}
