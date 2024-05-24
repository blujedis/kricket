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

export const TIMESTAMP = Symbol.for('TIMESTAMP');

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


export type FormatPrimitive = TypeOrValue<TokenKey> | number | Date | boolean;

export type AnsiColor = Exclude<keyof typeof ansiColors, 'ansiRegex' | 'symbols' | 'ok' | 'styles' | 'create'>;

export type TokenKey = keyof typeof TOKEN_MAP;

export type FormatFn<K> = (value: any, token: K) => K | [K, ...AnsiColor[]]

export type FormatTuple<K> = [K, ...AnsiColor[]] | [K, FormatFn<K>]

export type FormatArg<K> = K | FormatTuple<K>;

export type TypeOrValue<Keys extends string | number | symbol> = Keys | (string & { value?: unknown });

export type MetaKey<Meta extends Record<string, unknown> = undefined> = Meta extends object ? keyof Meta : never;

export type KeyOf<T> = Extract<keyof T, string>;

export type ValueOf<K extends KeyOf<T>, T> = T[K];

export type ValuesOf<T extends any[]> = T[number];

export type NodeCallback = <T, E>(err?: (Error & E) | null | undefined, data?: T) => void;

export type Callback = (data?: any) => void;

export type ErrorCallback = (err?: Error | null | undefined) => void;

export type BaseLevel = 'write' | 'writeLn';

export type Filter<Level extends string, Meta extends Record<string, unknown> = undefined> = (payload: Payload<Level, Meta>) => boolean;

export type Transform<Level extends string, Meta extends Record<string, unknown> = undefined> = (payload: Payload<Level, Meta>) => Payload<Level, Meta>;

export type LogMethod<L> = (message: any, ...args: any[]) => L;

export type LogMethods<Levels extends string, Meta extends Record<string, unknown> = undefined> = Record<Levels, LogMethod<Logger<Levels, Meta>>>;

export type ChildOmits = 'setTransportLevel' | 'addTransport' | 'muteTransport' | 'unmuteTransport';

export type ChildLogger<Level extends string, Meta extends Record<string, unknown>> =
  Omit<Logger<Level, Meta>, ChildOmits> & LogMethods<Level, Meta>;

export type Payload<Level extends string, Meta extends Record<string, unknown> = undefined> =
  Meta extends undefined
  ? PayloadBase<Level>
  : Meta extends object
  ? PayloadBase<Level> & Meta
  : PayloadBase<Level>;

export interface PayloadBase<Level extends string> {

  /**
   * The payload's log id.
   */
  [UUID]: string;

  /**
 * The payload's log id.
 */
  [TIMESTAMP]: Date | number | string;

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
   * The log level integer.
   */
  [LEVELINT]: number;

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

interface TransformBase<Level extends string, Meta extends Record<string, unknown> = undefined> {

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
  filters?: Filter<Level, Meta>[];

  /**
   * Array of Transforms to be run when dispatching through transform.
   * 
   * @default []
   */
  transforms?: Transform<Level, Meta>[];

}

export type TransportOptions<Level extends string = any, Label extends string = any, Meta extends Record<string, unknown> = undefined> = TransportOptionsBase<Level, Label, Meta> & Record<string, unknown>;

export interface TransportOptionsBase<Level extends string, Label extends string, Meta extends Record<string, unknown> = undefined> extends TransformBase<Level, Meta> {

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

export interface LoggerOptions<Level extends string, Meta extends Record<string, unknown> = undefined> extends TransformBase<Level, Meta> {

  /**
   * The label for the logger. If not provided a
   * random id will be generated.
   * 
   * @default undefined
   */
  label?: string;

  /**
   * The initial level to be set for the logger.
   * 
   * @default undefined
   */
  level?: Level;

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
  meta?: Meta;


}