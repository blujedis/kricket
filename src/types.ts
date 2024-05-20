import { Transport } from './transports';
import { Logger } from './logger';
import { type Location } from 'get-current-line';

export type KeyOf<T> = Extract<keyof T, string>;

export type ValueOf<K extends KeyOf<T>, T> = T[K];

export type ValuesOf<T extends any[]> = T[number];

export type NodeCallback<T = any, E extends object = {}> = (err?: (Error & E) | null | undefined, data?: T) => void;

export type Callback = (data?: any) => void;

export type ErrorCallback = (err?: Error | null | undefined) => void;

export type BaseLevel = 'write' | 'writeLn';

export type Filter<Level extends string, P extends Record<string, any> = Record<string, any>> = (payload: Payload<Level, P>) => boolean;

export type Transform<Level extends string, P extends Record<string, any> = Record<string, any>> = (payload: Payload<Level, P>) => Payload<Level, P>;

export type LogMethod<T> = (message: any, ...args: any[]) => T;

export type LogMethods<T, Level extends string> = Record<Level, LogMethod<T>>;

export type ChildOmits = 'setTransportLevel' | 'addTransport' | 'muteTransport' | 'unmuteTransport';

export type ChildLogger<Level extends string> = Omit<Logger<Level>, ChildOmits> & LogMethods<Logger<Level>, Level>;

export type Payload<Level extends string, E extends Record<string, unknown> = Record<string, unknown>> = PayloadBase<Level & BaseLevel> & E;

export const LOGGER = Symbol.for('LOGGER');

export const TRANSPORT = Symbol.for('TRANSPORT');

export const LEVEL = Symbol.for('LEVEL');

export const MESSAGE = Symbol.for('MESSAGE');

export const SPLAT = Symbol.for('SPLAT');

export const TRACE = Symbol.for('TRACE');

export const EOL = '\n';

export interface PayloadBase<Level extends string> {

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
   * The payload's message.
   */
  [MESSAGE]: string | Error;

  /**
   * Array containing payload arguments beyond the primary message.
   */
  [SPLAT]: any[];

  /**
   * Object containing trace information for the logged message location.
   */
  [TRACE]: Location;

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