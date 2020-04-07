import { EventEmitter } from 'events';
import { ILoggerOptions, LEVEL, MESSAGE, SPLAT, Filter, Transform, LOGGER, TRANSPORT, Callback, Payload, LogMethods } from './types';
import { Transport } from './transports';
import fastJson from 'fast-json-stable-stringify';
import { format } from 'util';
import { getName, isPlainObject, asynceach, noop, flatten } from './utils';
import core, { Core } from './core';

export class Logger<Level extends string> extends EventEmitter {

  core: Core = core;
  children = new Map<string, Logger<Level>>();

  constructor(public label: string, public options: ILoggerOptions<Level>) {

    super();

    this.options = { ...{ levels: [], transports: [], filters: [], transforms: [], muted: false, level: null }, ...this.options };

    // Bind levels
    this.levels.forEach(level => {
      this[level as string] = (message: string, ...args: any) => this.writer(level, message, ...args);
    });

    // Ensure level for transports
    this.options.transports.forEach(transport => {
      if (typeof transport.options.level === 'undefined')
        transport.options.level = this.options.level;
    });

  }

  /**
   * Internal method to write to Transport streams.
   * 
   * @param level the level to be logged.
   * @param message the message to be logged.
   * @param args the optional format args to be applied.
   */
  private writer(level: Level | '__write__' | '__writeLn__', message: string = '', ...args: any[]) {

    if (this.muted || (this.level && !this.isLevelActive(level as Level)))
      return;

    const label = ['__write__', '__writeLn__', '*'].includes(level) ? '*' : level;

    const cb = typeof args[args.length - 1] === 'function' ? args.pop() : null;

    type LoggedLevel = Level | '*';

    // Emit raw payload.
    this.emit('log', {
      [LOGGER]: this,
      [LEVEL]: label as LoggedLevel,
      [MESSAGE]: message,
      [SPLAT]: args,
      message
    }, this);

    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const logger = this;

    const event = (transport) => {

      return (done) => {

        let payload = {
          [LOGGER]: logger as unknown as Logger<LoggedLevel>,
          [LEVEL]: label as any,
          [MESSAGE]: message,
          [SPLAT]: args,
          message
        };

        // Inspect transport level.
        if ((transport.level && !this.isLevelActive(transport.level as Level)) || transport.muted || this.filtered(transport, payload))
          return done();

        payload[TRANSPORT] = transport;

        payload = this.transformed(transport, payload);
        transport.write(fastJson(payload));
        transport.emit('log', payload, transport, this);

        if (level !== '__write__')
          transport.write('\n');

        done(null, payload);

      };

    };

    asynceach(this.transports.map(transport => event(transport)), (err, payloads) => {
      if (cb)
        cb(payloads);
    });

    return this;

  }

  /**
   * Gets Logger levels.
   */
  get levels() {
    return this.options.levels;
  }

  /** 
   * Gets Logger Transports.
   */
  get transports() {
    return this.options.transports;
  }

  /**
   * Gets Logger's filters.
   */
  get filters() {
    return this.options.filters;
  }

  /**
   * Gets all Logger Transforms.
   */
  get transforms() {
    return this.options.transforms;
  }

  /**
   * Gets whether the Logger is muted.
   */
  get muted() {
    return this.options.muted;
  }

  /**
   * Gets the Logger's level.
   */
  get level() {
    return this.options.level;
  }

  /**
   * Mute the Logger.
   */
  mute() {
    this.options.muted = true;
    return this;
  }

  /**
   * Unmute the Logger.
   */
  unmute() {
    this.options.muted = false;
    return this;
  }

  /**
   * Mutes a Logger's Transport.
   * 
   * @param label the label name of the Transport to unmute.
   */
  muteTransport(label: string) {
    const transport = this.core.getTransport(label, this);
    if (!transport)
      throw new Error(`Transport "${label}" undefined or NOT found.`);
    transport.mute();
    return this;
  }

  /**
   * Unmutes a Logger's Transport.
   * 
   * @param label the label name of the Transport to unmute.
   */
  unmuteTransport(label: string) {
    const transport = this.core.getTransport(label, this);
    if (!transport)
      throw new Error(`Transport "${label}" undefined or NOT found.`);
    transport.unmute();
    return this;
  }

  /**
   * Sets the Logger's log level.
   * 
   * @param level the level to set the Logger to.
   * @param cascade when true apply to child Transports (default: true).
   */
  setLevel(level: Level, cascade: boolean = true) {
    if (typeof level === 'undefined' || !this.levels.includes(level)) {
      // eslint-disable-next-line no-console
      console.warn(`Level "${level}" is invalid or not found.`);
      return this;
    }
    this.options.level = level;
    if (cascade)
      this.transports.forEach(transport => transport.options.level = level);
    return this;
  }

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
  setTransportLevel(transport: string | Transport, level: Level) {
    const _transport = (typeof transport === 'string' ? this.core.getTransport(transport as string) : transport) as Transport;
    _transport.setLevel(level, this);
    return this;
  }

  /**
   * Checks if a level is active.
   * 
   * @param level the level to compare.
   * @param levels the optional levels to compare against.
   */
  isLevelActive(level: Level | '*' | '__write__' | '__writeLn__', levels: Level[] = this.levels) {
    if (['*', '__write__', '__writeLn__'].includes(level))
      return true;
    if (!levels.includes(level as Level))
      return false;
    const active = levels.indexOf(this.level);
    const compare = levels.indexOf(level as Level);
    return compare <= active;
  }

  /**
   * Gets a new child Logger.
   * 
   * @param label the Logger label to be used.
   * @param meta child metadata for child.
   */
  get(label: string, meta?: { [key: string]: any }): Logger<Level> & LogMethods<Logger<Level>, Level> {

    let child = this.children.get(label);
    if (child)
      return child as any;
    meta = meta || { [label]: true };
    child = Object.create(this, {
      label: {
        value: label
      },
      write: {
        value: (level: Level | '__write__' | '__writeLn__', message: string = '', ...args: any[]) => {
          args.push(meta);
          this.writer(level, message, ...args);
          return this;
        }
      }
    });
    this.children.set(label, child);
    return child as any;
  }

  /**
   * Adds a Filter function.
   * 
   * @param fn the Filter function to be added.
   */
  filter(fn: Filter<Level | '*'>) {
    this.options.filters.push(fn);
    return this;
  }

  /**
   * Adds a Transform function.
   * 
   * @param fn the Transform function to be added.
   */
  transform(fn: Transform<Level | '*'>) {
    this.options.transforms.push(fn);
    return this;
  }

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
  mergeFilter(...fns: (Filter<Level> | Filter<Level>[])[]) {
    const filters = flatten(fns) as Filter<Level>[];
    return (payload: Payload<Level>) => filters.some(filter => filter(payload));
  }

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
  mergeTransform(...fns: (Transform<Level> | Transform<Level>[])[]) {
    const arr = flatten(fns) as Transform<Level>[];
    return (payload: Payload<Level>) => {
      return arr.reduce((result, transform) => {
        return transform(result);
      }, payload);
    };
  }

  /**
   * Inpsects filters if should halt output of log message.
   * 
   * @param transport the Transport to get filters for.
   * @param payload the payload to pass when filtering.
   */
  filtered(transport: Transport, payload: Payload<Level>) {
    return [...this.filters, ...transport.filters]
      .some(filter => filter(payload));
  }

  /**
   * Transforms a payload for output.
   * 
   * @param transport the Transport to include Transfroms from.
   * @param payload the payload object to be transformed.
   */
  transformed(transport: Transport, payload: Payload<Level>) {

    const transforms = [...this.transforms, ...transport.transforms];

    let transformed = payload;
    let valid = true;
    let err;
    let tname;

    while (valid && transforms.length) {
      try {
        const transformer = transforms.shift();
        tname = getName(transformer);
        transformed = transformer(transformed);
        valid = isPlainObject(transformed);
      }
      catch (ex) {
        valid = false;
        err = ex;
      }
    }

    if (err) {
      // eslint-disable-next-line no-console
      console.log(`Transform "${tname}" resulted in error:`);
      // eslint-disable-next-line no-console
      console.error(err.stack);
      process.exit(1);
    }

    if (!valid) {
      // eslint-disable-next-line no-console
      console.log(`Transform "${tname}" resulted in malfored type of "${typeof transformed}".`);
      process.exit(1);
    }

    return transformed;

  }

  /**
   * Writes to stream of Transport.
   * 
   * @param message the message to write.
   * @param args optional format args.
   */
  write(message: string, ...args: any[]) {
    message = format(message, ...args);
    this.writer('__write__', message);
    return this;
  }

  /**
   * Writes a line to Transports.
   * 
   * @param message the message to be written.
   * @param args optional format args.
   */
  writeLn(message: string, ...args: any[]) {
    message = format(message, ...args);
    this.writer('__writeLn__', message);
    return this;
  }

  /**
   * Ends and outputs buffer when using .write();
   * 
   * @param cb optional callback on ending write.
   */
  writeEnd(cb?: Callback) {
    const transports = this.transports.map(t => t.end.bind(t));
    asynceach(transports, (err, data) => (cb || noop)(data));
    return this;
  }

  /**
   * Gets a Transport by name.
   * 
   * @param label the label of the Transport to get.
   */
  getTransport<T extends Transport>(label: string) {
    return this.core.getTransport<T>(label, this);
  }

  /**
   * Adds a Transport to Logger.
   * 
   * @param transport the Transport to add to collection.
   */
  addTransport<T extends Transport>(transport: T) {
    this.transports.push(transport);
    return transport;
  }

}