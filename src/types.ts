import { Transport } from './transports';
import { Logger } from './logger';
import { type Location } from './utils/trace';
import type ansiColors from 'ansi-colors';

//  CONSTANTS
// ----------------------------------------------------------

export const UUID = Symbol.for('UUID');

export const LOGGER = Symbol.for('LOGGER');

export const TRANSPORT = Symbol.for('TRANSPORT');

export const LEVEL = Symbol.for('LEVEL');

export const LEVELINT = Symbol.for('LEVELINT');

export const LINE = Symbol.for('LINE');

export const CHAR = Symbol.for('CHAR');

export const METHOD = Symbol.for('METHOD');

export const FILEPATH = Symbol.for('METHOD');

export const FILENAME = Symbol.for('FILENAME');

export const TIMESTAMP = Symbol.for('FILENAME');

export const MESSAGE = Symbol.for('MESSAGE');

export const SPLAT = Symbol.for('SPLAT');

export const EOL = '\n';

export const TOKEN_MAP = {
  uuid: UUID,
  logger: LOGGER,
  transport: TRANSPORT,
  level: LEVEL,
  levelint: LEVELINT,
  char: CHAR,
  line: LINE,
  filepath: FILEPATH,
  filename: FILENAME,
  timestamp: TIMESTAMP,
  message: MESSAGE
};

//  TYPES
// ----------------------------------------------------------

type AnsiExcludes = 'ansiRegex' | 'symbols' | 'ok' | 'styles';

export type AnsiColor = Exclude<keyof typeof ansiColors, AnsiExcludes>;

export type TokenKey = keyof typeof TOKEN_MAP;

export type FormatArg = (TypeOrValue<TokenKey> | number | Date | boolean | any[]);

export type FormatTuple = [FormatArg, ...AnsiColor[]];

export type FormatArgs = FormatArg | FormatTuple;

export type TypeOrValue<Keys extends string | number | symbol> = Keys | (string & { value?: unknown });

export type KeyOf<T> = Extract<keyof T, string>;

export type ValueOf<K extends KeyOf<T>, T> = T[K];

export type ValuesOf<T extends any[]> = T[number];

export type NodeCallback<T = any, E extends object = {}> = (err?: (Error & E) | null | undefined, data?: T) => void;

export type Callback = (data?: any) => void;

export type ErrorCallback = (err?: Error | null | undefined) => void;

export type BaseLevel = 'write' | 'writeLn';

export type Filter<Level extends string, Extend extends Record<string, any> = Record<string, any>> = <P extends Payload<Level>>(payload: P & Extend) => boolean;

export type Transform<Level extends string, Extend extends Record<string, any> = Record<string, any>> = <P extends Payload<Level>>(payload: P & Extend) => Payload<Level> & Extend;

export type LogMethod<T> = (message: any, ...args: any[]) => T;

export type LogMethods<T, Level extends string> = Record<Level, LogMethod<T>>;

export type ChildOmits = 'setTransportLevel' | 'addTransport' | 'muteTransport' | 'unmuteTransport';

export type ChildLogger<Level extends string> = Omit<Logger<Level>, ChildOmits> & LogMethods<Logger<Level>, Level>;

export type PayloadMeta<Meta extends Record<string, unknown>, K extends string> = 
  K extends undefined 
  ? Meta 
  : Record<K, Meta>;
  
export interface Payload<Level extends string> {

  /**
   * The payload's log id.
   */
  [UUID]: string;

  /**
 * The payload's log id.
 */
  [TIMESTAMP]: Date;

  /**
   * The log message's line position.
   */
  [LINE]: Location['line'];

  /**
   * The log message's character position.
   */
  [CHAR]: Location['char'];

  /**
   * The log message's target method.
   */
  [METHOD]: Location['method'];

  /**
   * The log message's filepath.
   */
  [FILEPATH]: Location['filepath'];

  /**
   * The log message's filename.
   */
  [FILENAME]: Location['filename'];

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

export interface LoggerOptions<Level extends string, M extends Record<string, unknown> = Record<string, unknown>, Key extends string = string> extends TransformBase<Level> {

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

  /**
   * When a meta key is provided it is set as the property name in the meta object within the SPLAT.
   * If a meta key is not provided and no objects have been passed then there is no metadata object
   * passed to SPLAT. If no metadata exists but a metaKey exits it will be set to an empty object.
   * 
   * @example 
   * payload = { message: 'some message', [your_key]: { ...metadata here }}
   * 
   * @default undefined
   * 
   */
  metaKey?: Key;

  /**
   * When true default meta data is added to payload including, 
   * the Logger name, Transport name, Level name and uuid v4.
   * 
   * @default undefined
   */
  // defaultMeta?: boolean;

  /**
   * When defined the default metadata will be nested in this key.
   * otherwise each prop is extended on the root metadata object.
   * 
   * @default undefined
   */
  // defaultMetaKey?: string;

}