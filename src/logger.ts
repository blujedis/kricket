import { EventEmitter } from 'events';
import { ILoggerOptions, LEVEL, MESSAGE, SPLAT, Filter, Transform, LOGGER, TRANSPORT, Callback, BaseLevel, ChildLogger, IPayload, Payload } from './types';
import { Transport } from './transports';
import fastJson from 'fast-json-stable-stringify';
import { format } from 'util';
import { getObjectName, isPlainObject, asynceach, noop, flatten, uuidv4, log } from './utils';
import core, { Core } from './core';

export class Logger<Level extends string, M extends Record<string, unknown> = Record<string, unknown>> extends EventEmitter {

  core: Core = core;
  children = new Map<string, Logger<Level, M>>();

  constructor(public label: string, public options: ILoggerOptions<Level, M>, public isChild = false) {

    super();

    this.options = { ...{ levels: [], transports: [], filters: [], transforms: [], muted: false, level: null }, ...this.options };

    // Bind levels
    this.levels.forEach(level => {
      this[level as string] = (message: string, ...args: any) => this.writer(level, message, ...args);
    });

    const dupes = this.checkUnique().dupes;
    if (dupes) {
      log.fatal(`Duplicate Transports "${dupes.join(', ')}" detected, Transport labels must be unique.`);
    }

    // Ensure level for transports
    this.options.transports.forEach(transport => {
      if (typeof transport.options.level === 'undefined')
        transport.options.level = this.options.level;
    });

  }

  /**
   * Iterates Transports checks for duplicate labels.
   */
  private checkUnique() {
    return this.options.transports.reduce((a, c) => {
      if (!a.known.includes(c.label)) {
        a.known.push(c.label);
      }
      else {
        a.dupes = a.dupes || [];
        if (!a.dupes.includes(c.label))
          a.dupes.push(c.label);
      }
      return a;
    }, { known: [], dupes: null });
  }

  /**
   * Internal method to write to Transport streams.
   * 
   * @param group optional log group.
   * @param level the level to be logged.
   * @param message the message to be logged.
   * @param args the optional format args to be applied.
   */
  private writer(level: Level | BaseLevel, message: any = '', ...args: any[]) {

    if (this.muted || (this.level && !this.isLevelActive(level)))
      return;

    const label = level;
    const cb = typeof args[args.length - 1] === 'function' ? args.pop() : null;
    const meta = isPlainObject(args[args.length - 1]) ? args.pop() : null;
    const hasAnyMeta = !!meta || this.options.defaultMeta || !!this.options.meta;
    const defaultMetaKey = this.options.defaultMetaKey;

    // Build default metadata.
    let defaultMeta: any = this.options.defaultMeta ? {
      LOGGER: this.label,
      LEVEL: label,
      UUID: uuidv4()
    } : null;

    // If Default meta is in nested key...
    if (defaultMetaKey && defaultMeta)
      defaultMeta = { [defaultMetaKey]: defaultMeta };

    type LoggedLevel = Level | BaseLevel;

    const rawPayload = {
      [LOGGER]: this.label,
      [LEVEL]: label as LoggedLevel,
      [MESSAGE]: message,
      // ONlY add meta if exists.
      [SPLAT]: hasAnyMeta ? [...args, { ...meta, ...this.options.meta, ...defaultMeta }] : args,
      message
    };

    // Emit raw payload.
    this.emit('log', rawPayload);
    this.emit(`log:${label}`, rawPayload);

    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const logger = this;

    const event = (transport: Transport) => {

      return (done) => {

        try {

          // Update default metadata with the Transport label now that we have it.
          if (defaultMeta) {
            if (defaultMetaKey)
              defaultMeta[defaultMetaKey].TRANSPORT = transport.label;
            else
              defaultMeta.TRANSPORT = transport.label;
          }

          const payload = {
            [LOGGER]: logger.label,
            [TRANSPORT]: transport.label,
            [LEVEL]: label,
            [MESSAGE]: message,
            [SPLAT]: hasAnyMeta ? [...args, { ...meta, ...this.options.meta, ...defaultMeta }] : args,
            message
          } as Payload<Level>;

          // Inspect transport level.
          if ((transport.level && !this.isLevelActive(transport.level as Level)) || transport.muted || this.filtered(transport, payload))
            return done();

          const transformed = this.transformed(transport, { ...payload });

          // Payload symbols now stripped.
          transport.write(fastJson(transformed));

          transport.emit('log', payload, transport);
          transport.emit(`log:${label}`, payload, transport);

          if (level !== 'write')
            transport.write('\n');

          done(null, payload);

        }
        catch (ex) {
          ex.transport = transport.label;
          done(ex, null);
        }


      };

    };

    asynceach<IPayload<Level>>(this.transports.map(transport => event(transport)), (err, payloads) => {

      if (err) {
        if (!Array.isArray(err))
          err = [err];
        err.forEach(e => {
          const grp = log.group(`Transport ${(e as any).transport} Error`, 'yellow');
          grp.error(e.stack);
          grp.end();
        });
      }

      this.emit('log:end', rawPayload);
      this.emit(`log:${label}:end`, rawPayload);

      if (cb)
        cb(payloads);

    });

    return this;

  }

  /**
   * Inpsects filters if should halt output of log message.
   * 
   * @param transport the Transport to get filters for.
   * @param payload the payload to pass when filtering.
   */
  private filtered(transport: Transport, payload: Payload<Level>) {
    return [...this.filters, ...transport.filters]
      .some(filter => filter(payload));
  }

  /**
   * Transforms a payload for output.
   * 
   * @param transport the Transport to include Transfroms from.
   * @param payload the payload object to be transformed.
   */
  private transformed(transport: Transport, payload: Payload<Level>) {

    const transforms = [...this.transforms, ...transport.transforms];

    let transformed = payload;
    let valid = true;
    let err;
    let tname;

    while (valid && transforms.length) {
      try {
        const transformer = transforms.shift();
        tname = getObjectName(transformer);
        if (tname === 'function')
          tname = 'anonymous';
        transformed = transformer(transformed);
        valid = isPlainObject(transformed);
      }
      catch (ex) {
        valid = false;
        err = ex;
      }
    }

    if (err) {
      const grp = log.group(`Transform ${tname} Invalid`, 'yellow');
      grp.error(err.stack);
      grp.end();
    }

    if (!valid) {
      // eslint-disable-next-line no-console
      log.fatal(`Transform "${tname}" resulted in malformed type of "${typeof transformed}".\n`);
    }

    return transformed;

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
      const transport = this.getTransport(label);
      if (!transport)
        // eslint-disable-next-line no-console
        log.warn(`Transport "${label}" undefined or NOT found.`);
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
      const transport = this.getTransport(label);
      if (!transport)
        // eslint-disable-next-line no-console
        log.warn(`Transport "${label}" undefined or NOT found.`);
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
      log.warn(`Level "${level}" is invalid or not found.`);
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
    const _transport = (typeof transport === 'string' ? this.getTransport(transport as string) : transport) as Transport;
    _transport.setLevel(level, this);
    return this;
  }

  /**
   * Checks if a level is active.
   * 
   * @param level the level to compare.
   * @param levels the optional levels to compare against.
   */
  isLevelActive(level: Level | BaseLevel, levels?: Level[]): boolean;

  /**
   * Checks if a level is active by payload.
   * 
   * @param payload the payload containing the level to inspect.
   * @param levels the optional levels to compare against.
   */
  isLevelActive(payload: IPayload<Level>, levels?: Level[]): boolean;
  isLevelActive(level: Level | BaseLevel | IPayload<Level>, levels: Level[] = this.levels): boolean {
    if (typeof level === 'object')
      level = level[LEVEL];
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
    const disabled = type => (...args) => log.warn(`${type} disabled for child Loggers.`) as any;

    child.setTransportLevel = disabled('setTransportLevel');
    child.addTransport = disabled('addTransport');
    child.muteTransport = disabled('muteTransport');
    child.unmuteTransport = disabled('unmuteTransport');

    this.children.set(label, child);

    return child as any;

  }

  /**
   * Adds a Filter function to specified Transport.
   * 
   * @param transport the transport to add the filter to.
   * @param fn the Filter function to be added.
   */
  filter(transport: string, fn: Filter<Level>): this;

  /**
   * Adds a global Filter function.
   * 
   * @param fn the Filter function to be added.
   */
  filter(fn: Filter<Level>): this;
  filter(transport: string | Filter<Level>, fn?: Filter<Level>) {
    if (typeof transport === 'function') {
      fn = transport;
      transport = undefined;
    }
    if (!transport) {
      this.options.filters.push(fn);
    }
    else {
      const _transport = this.getTransport(transport as string);
      if (!_transport) {
        log.fatal(`Transport ${transport} could NOT be found.`);
        return this;
      }
      _transport.options.filters.push(fn);
    }
    return this;
  }

  /**
   * Adds a Transform function.
   * 
   * @param transport the Transport to add the transform to.
   * @param fn the Transform function to be added.
   */
  transform(transport: string, fn: Transform<Level>): this;

  /**
   * Adds a global Transform function.
   * 
   * @param fn the Transform function to be added.
   */
  transform(fn: Transform<Level>): this;
  transform(transport: string | Transform<Level>, fn?: Transform<Level>) {
    if (typeof transport === 'function') {
      fn = transport;
      transport = undefined;
    }
    if (!transport) {
      this.options.transforms.push(fn);
    }
    else {
      const _transport = this.getTransport(transport as string);
      if (!_transport) {
        log.fatal(`Transport ${transport} could NOT be found.`);
        return this;
      }
      _transport.options.transforms.push(fn);
    }
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
    return (payload: IPayload<Level | BaseLevel> & M) => filters.some(filter => filter(payload));
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
    return (payload: IPayload<Level | BaseLevel>) => {
      return arr.reduce((result, transform) => {
        return transform(result);
      }, payload);
    };
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
    try {
      await asynceach(transports, (err, data) => (cb || noop)(data));
    }
    catch (ex) {
      //
    }
  }

  /**
   * Writes to stream of Transport.
   * 
   * @param key optional group key name appended to metadata.
   */
  group(key?: string) {

    type LogTuple = [string, any[], object];

    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const self = this;
    let buffer: LogTuple[] = [];

    const api = {

      get key() {
        return key || null;
      },

      /**
       * Writes to stream of Transport.
       * 
       * @param message the message to write.
       * @param args optional format args.
       */
      write(msg: string, ...args: any[]) {
        const meta = !buffer.length ? { [key]: true, groupStart: true } : { [key]: true };
        buffer.push([msg, args, meta]);
      },

      /**
       * Ends the write stream and outputs to Transports.
       * 
       * @param cb optional callback on write completed.
       */
      async end(cb?: Callback) {
        if (!buffer) {
          // eslint-disable-next-line no-console
          log.warn(`Attempted to end write stream but buffer is null.`);
          return;
        }
        while (buffer.length) {
          const item = buffer.shift();
          const msg = format(item[0], ...(item[1] || []));
          const meta = !buffer.length ? { ...item[2], groupEnd: true } : item[2];
          self.writer('write', msg, meta);
        }
        buffer = null;
        const transports = self.transports.map(t => t.end.bind(t));
        try {
          await asynceach(transports, (err, data) => (cb || noop)(data));
        }
        catch (ex) {
          log.group(`Group ${key} Error`, 'yellow')
            .error(ex.stack)
            .end();
        }

      }

    };

    return api;

  }

  /**
   * Gets a Transport by name.
   * Storing Transports in core just makes it easier to 
   * retrive and clone them from any logger.
   * 
   * @param label the label of the Transport to get.
   */
  getTransport<Label extends string, T extends Transport>(label: Label) {
    return this.transports.find(transport => transport.label === label) as T;
  }

  /**
   * Clones an existing Transport by options.
   * 
   * @param label the Transport label/name to be cloned.
   * @param transport the Transport instance to be cloned.
   */
  cloneTransport<Label extends string, T extends Transport>(
    label: Label, transport: T) {
    const options = transport.options;
    if (!transport.getType) {
      log.fatal((new Error(`Transport missing static property getType, clone failed.`).stack));
      return;
    }
    const Klass: new (...args: any[]) => T = transport.getType as any;
    return new Klass(label, options);
  }

  /**
   * Convenience method to generate simple uuid v4. Although this
   * works for most simple scenarios consider using a first class
   * UUIDV4 library.
   * 
   * @see https://www.npmjs.com/package/uuid
   */
  uuidv4() {
    return uuidv4();
  }

  /**
   * Useful helper to determine if payload contains a given Logger.
   * 
   * @param payload the current payload to inspect.
   * @param label the label to match.
   */
  hasLogger(payload: IPayload<Level>, label: string) {
    const logger = payload[LOGGER];
    return logger === label;
  }

  /**
   * Useful helper to determine if payload contains a given Transport.
   * 
   * @param payload the current payload to inspect.
   * @param label the label to match.
   */
  hasTransport(payload: IPayload<Level>, label: string) {
    const transport = payload[TRANSPORT];
    return transport === label;
  }

  /**
   * Useful helper to determine if Transport contains a given Level.
   * 
   * @param payload the current payload to inspect.
   * @param label the label to match.
   */
  hasLevel(payload: IPayload<Level>, compare: Level | BaseLevel) {
    const level = payload[LEVEL];
    return level === compare;
  }

  /**
   * Converts Symbols on payload to a simple mapped object.
   * This can be used if you wish to output Symbols as metadata to
   * your final output.
   * 
   * Defaults to Symbols [LOGGER, TRANSPORT, LEVEL]
   * 
   * @example
   * defaultLogger.transform(payload => {
   *    payload.metadata = defaultLogger.symbolsToMap(payload);
   *    return payload;
   * });
   * 
   * @param payload a log payload containing symbols.
   */
  symbolsToMap(payload: IPayload<Level>, ...symbols: symbol[]) {

    if (!symbols.length)
      symbols = [LOGGER, TRANSPORT, LEVEL];

    return symbols.reduce((a, c) => {
      const name = (c as any).description;
      if (!name)
        throw new Error(`Symbols to Map failed accessing Symbol ${c.toString()} description.`);
      a[name] = payload[c as any];
      return a;
    }, {});

  }

  /**
   * Simply extends the payload object with additional properties while also
   * maintaining typings.
   * 
   * @param payload the payload object to be extended.
   * @param obj the object to extend payload with.
   */
  extendPayload<T extends object>(payload: IPayload<Level>, obj: T) {
    for (const k in obj) {
      if (!Object.prototype.hasOwnProperty.call(obj, k)) continue;
      payload[k] = obj[k];
    }
    return payload as IPayload<Level> & T;
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
    if (this.isChild) {
      log.fatal(`Cannot add Transport to child Logger, create new Logger instead.`);
      return this;
    }
    if (this.transports.find(t => t.label === transport.label)) {
      log.fatal(`Duplicate Transport ${transport.label} detected, label names MUST be unique.`);
      return this;
    }
    this.transports.push(transport);
    return this;
  }

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
  removeTransport<T extends Transport>(transport: string | T) {
    if (typeof transport === 'string')
      transport = this.getTransport(transport) as T;
    if (!transport) {
      log.fatal(`Failed to remove Transport of unknown.`);
      return this;
    }
    const idx = this.transports.indexOf(transport);
    this.transports.splice(idx, 1);
    return this;
  }

}