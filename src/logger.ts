import { EventEmitter } from 'events';
import { ILoggerOptions, LEVEL, MESSAGE, SPLAT, Filter, Transform, LOGGER, TRANSPORT, Callback, Payload, LogMethods, BaseLevel, ChildLogger } from './types';
import { Transport } from './transports';
import fastJson from 'fast-json-stable-stringify';
import { format } from 'util';
import { getName, isPlainObject, asynceach, noop, flatten } from './utils';
import core, { Core } from './core';

export class Logger<Level extends string> extends EventEmitter {

  core: Core = core;
  children = new Map<string, Logger<Level>>();

  constructor(public label: string, public options: ILoggerOptions<Level>, public isChild = false) {

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
   * @param group optional log group.
   * @param level the level to be logged.
   * @param message the message to be logged.
   * @param args the optional format args to be applied.
   */
  private writer(level: Level | BaseLevel, message = '', ...args: any[]) {

    if (this.muted || (this.level && !this.isLevelActive(level)))
      return;

    const label = level;

    const cb = typeof args[args.length - 1] === 'function' ? args.pop() : null;
    let meta = isPlainObject(args[args.length - 1]) ? args.pop() : null;

    if (meta || this.options.meta) {
      meta = { ...meta, ...this.options.meta };
      args.push(meta);
    }

    type LoggedLevel = Level | BaseLevel;

    const rawPayload = {
      [LOGGER]: this,
      [LEVEL]: label as LoggedLevel,
      [MESSAGE]: message,
      [SPLAT]: args,
      message
    };

    // Emit raw payload.
    this.emit('log', rawPayload, this);
    this.emit(`log:${label}`, rawPayload, this);

    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const logger = this;

    const event = (transport) => {

      return (done) => {

        let payload = {
          [LOGGER]: logger as Logger<LoggedLevel>,
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

        if (level !== 'write')
          transport.write('\n');

        done(null, payload);

      };

    };

    asynceach(this.transports.map(transport => event(transport)), (err, payloads) => {
      if (err && console) {
        // eslint-disable-next-line no-console
        const _log = console.warn || console.log;
        if (!Array.isArray(err))
          err = [err];
        err.forEach(e => _log(e.stack));
      }
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
   * @param cascade when true all child Loggers are muted.
   */
  mute(cascade = true) {
    this.options.muted = true;
    if (cascade)
      [...this.children.values()].forEach(child => child.mute());
    return this;
  }

  /**
   * Unmute the Logger.
   * @param cascade when true all child Loggers are unmuted.
   */
  unmute(cascade = true) {
    this.options.muted = false;
    if (cascade)
      [...this.children.values()].forEach(child => child.unmute());
    return this;
  }

  /**
   * Mutes a Logger's Transport.
   * 
   * @param labels the label(s) name of the Transport to unmute.
   */
  muteTransport(...labels: string[]) {
    if (!labels.length)
      labels = this.transports.map(t => t.label);
    labels.forEach(label => {
      const transport = this.core.getTransport(label, this);
      if (!transport)
        // eslint-disable-next-line no-console
        console.warn(`Transport "${label}" undefined or NOT found.`);
      else
        transport.mute();
    });
    return this;
  }

  /**
   * Unmutes a Logger's Transport.
   * 
   * @param labels the label(s) name of the Transport to unmute.
   */
  unmuteTransport(...labels: string[]) {
    if (!labels.length)
      labels = this.transports.map(t => t.label);
    labels.forEach(label => {
      const transport = this.core.getTransport(label, this);
      if (!transport)
        // eslint-disable-next-line no-console
        console.warn(`Transport "${label}" undefined or NOT found.`);
      else
        transport.unmute();
    });
    return this;
  }

  /**
   * Sets the Logger's log level.
   * 
   * @param level the level to set the Logger to.
   * @param cascade when true apply to child Transports (default: true).
   */
  setLevel(level: Level, cascade = true) {
    if (typeof level === 'undefined' || !this.levels.includes(level)) {
      // eslint-disable-next-line no-console
      console.warn(`Level "${level}" is invalid or not found.`);
      return this;
    }
    this.options.level = level;
    if (cascade)
      [...this.children.values()].forEach(child => child.setLevel(level));
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
  isLevelActive(level: Level | BaseLevel, levels: Level[] = this.levels) {
    if (['write', 'writeLn'].includes(level))
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
  child(label: string, meta: { [key: string]: any; } = {}): ChildLogger<Level> {

    let child = this.children.get(label);

    if (child)
      return child as any;

    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const self = this;

    const options = {
      level: this.level,
      muted: this.muted,
      get levels() {
        return self.options.levels;
      },
      // Get Transports from parent.
      get transports() {
        return self.options.transports;
      },
      transforms: [...this.transforms],
      filters: [...this.filters],
      meta: { ...this.options.meta, ...{ ...meta, [label]: true } }
    };

    child = new Logger(label, options, true);

    // eslint-disable-next-line no-console
    const disabled = type => (...args) => console.warn(`${type} disabled for child Loggers.`) as any;

    child.setTransportLevel = disabled('setTransportLevel');
    child.addTransport = disabled('addTransport');
    child.muteTransport = disabled('muteTransport');
    child.unmuteTransport = disabled('unmuteTransport');

    this.children.set(label, child);

    return child as any;

  }

  /**
   * Adds a Filter function.
   * 
   * @param fn the Filter function to be added.
   */
  filter(fn: Filter<Level | BaseLevel>) {
    this.options.filters.push(fn);
    return this;
  }

  /**
   * Adds a Transform function.
   * 
   * @param fn the Transform function to be added.
   */
  transform(fn: Transform<Level | BaseLevel>) {
    this.options.transforms.push(fn);
    return this;
  }

  /**
   * Merges Filter functions into single group.
   * 
   * @param fn a Filter function to merge.
   * @param fns rest array of Filter functions to merge.
   */
  mergeFilter(fn: Filter<Level | BaseLevel>, ...fns: Filter<Level | BaseLevel>[]): Filter<Level | BaseLevel>;

  /**
   * Merges Filter functions into single group.
   * 
   * @param fns rest array of Filter functions to merge.
   */
  mergeFilter(fn: Filter<Level | BaseLevel>[]): Filter<Level | BaseLevel>;
  mergeFilter(...fns: (Filter<Level | BaseLevel> | Filter<Level | BaseLevel>[])[]) {
    const filters = flatten(fns) as Filter<Level | BaseLevel>[];
    return (payload: Payload<Level | BaseLevel>) => filters.some(filter => filter(payload));
  }

  /**
   * Merges Transform functions into single group.
   * 
   * @param fn a Transform function to merge.
   * @param fns rest array of Transform functions to merge.
   */
  mergeTransform(fn: Transform<Level | BaseLevel>, ...fns: Transform<Level | BaseLevel>[]): Transform<Level | BaseLevel>;

  /**
   * Merges Transform functions into single group.
   * 
   * @param fns array of Transform functions to merge.
   */
  mergeTransform(fns: Transform<Level | BaseLevel>[]): Transform<Level | BaseLevel>;
  mergeTransform(...fns: (Transform<Level | BaseLevel> | Transform<Level | BaseLevel>[])[]) {
    const arr = flatten(fns) as Transform<Level | BaseLevel>[];
    return (payload: Payload<Level | BaseLevel>) => {
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
  filtered(transport: Transport, payload: Payload<Level | BaseLevel>) {
    return [...this.filters, ...transport.filters]
      .some(filter => filter(payload));
  }

  /**
   * Transforms a payload for output.
   * 
   * @param transport the Transport to include Transfroms from.
   * @param payload the payload object to be transformed.
   */
  transformed(transport: Transport, payload: Payload<Level | BaseLevel>) {

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
      console.warn(`Transform "${tname}" resulted in error:`);
      // eslint-disable-next-line no-console
      console.error(err.stack);
      process.exit(1);
    }

    if (!valid) {
      // eslint-disable-next-line no-console
      console.warn(`Transform "${tname}" resulted in malfored type of "${typeof transformed}".`);
      process.exit(1);
    }

    return transformed;

  }

  /**
   * Writes a line to Transports.
   * 
   * @param message the message to be written.
   * @param args optional format args.
   */
  writeLn(message: string, ...args: any[]) {
    message = format(message, ...args);
    this.writer('writeLn', message);
    return this;
  }

  /**
   * Writes to stream of Transport.
   * 
   * @param message the message to write.
   * @param args optional format args.
   */
  write(message: string, ...args: any[]) {
    message = format(message, ...args);
    this.writer('write', message);
    return this;
  }

  /**
   * Ends and outputs buffer when using .write();
   * 
   * @param cb optional callback on ending write.
   */
  async writeEnd(cb?: Callback) {
    const transports = this.transports.map(t => t.end.bind(t));
    await asynceach(transports, (err, data) => (cb || noop)(data));
    return this;
  }

  /**
   * Gets a Transport by name.
   * Storing Transports in core just makes it easier to 
   * retrive and clone them from any logger.
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
    // Can't allow custom child levels and therefore
    // probably shouldn't allow for adding Transports
    // to children. Favor new Logger at that point.
    if (this.isChild)
      throw new Error(`Cannot add Transport to child Logger, create new Logger instead.`);
    this.transports.push(transport);
    return transport;
  }

}