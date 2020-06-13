import { Transport } from './transports';
import { Logger } from './logger';

export type KeyOf<T> = Extract<keyof T, string>;

export type ValueOf<K extends KeyOf<T>, T> = T[K];

export type ValuesOf<T extends any[]> = T[number];

export type NodeCallback = (err?: Error | null | undefined, data?: any) => void;

export type Callback = (data?: any) => void;

export type ErrorCallback = (err?: Error | null | undefined) => void;

export type BaseLevel = 'write' | 'writeLn';

export type Payload<Level extends string> = IPayload<Level | BaseLevel>;

export type Filter<Level extends string> = (payload: Payload<Level | BaseLevel>) => boolean;

export type Transform<Level extends string> = (payload: Payload<Level | BaseLevel>) => Payload<Level | BaseLevel>;

export type LogMethod<T> = (message: string, ...args: any[]) => T;

export type LogMethods<T, Level extends string> = Record<Level, LogMethod<T>>;

export type ChildOmits = 'setTransportLevel' | 'addTransport' | 'muteTransport' | 'unmuteTransport';

export type ChildLogger<Level extends string> = Omit<Logger<Level>, ChildOmits> & LogMethods<Logger<Level>, Level>;

export const LOGGER = Symbol.for('LOGGER');

export const TRANSPORT = Symbol.for('TRANSPORT');

export const LEVEL = Symbol.for('LEVEL');

export const MESSAGE = Symbol.for('MESSAGE');

export const SPLAT = Symbol.for('SPLAT');

export const EOL = '\n';

export interface IPayload<Level extends string> {
  [LOGGER]: Logger<Level>;
  [TRANSPORT]?: Transport<any>;
  [LEVEL]: Level | BaseLevel;
  [MESSAGE]: string;
  [SPLAT]: any[];
  message: string;
  [key: string]: any;
}

export interface ITransportOptions<Level extends string> {
  asJSON?: boolean;
  filters?: Filter<Level | BaseLevel>[];
  transforms?: Transform<Level | BaseLevel>[];
  highWaterMark?: number;
  muted?: boolean;
  level?: Level;
}

export interface ILoggerOptions<Level extends string> {
  readonly levels: Level[];
  transports?: Transport[];
  filters?: Filter<Level | BaseLevel>[];
  transforms?: Transform<Level | BaseLevel>[];
  muted?: boolean;
  level?: Level;
  meta?: { [key: string]: any; }
}