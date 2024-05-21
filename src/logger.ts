import { EventEmitter } from 'events';
import { Transport } from './transports';
import fastJson from 'fast-json-stable-stringify';
import { format } from 'util';
import { getObjectName, isPlainObject, asynceach, noop, flatten, uuidv4, log, isObject, errorToObject, ensureArray, colorizeString, isFunction } from './utils';
import core, { Core } from './core';
import currentLine from './utils/trace';
import { LoggerOptions, LEVEL, MESSAGE, SPLAT, Filter, Transform, LOGGER, TRANSPORT, Callback, BaseLevel, ChildLogger, Payload, UUID, TIMESTAMP, TypeOrValue, LEVELINT, TOKEN_MAP, FormatTuple, LINE, CHAR, METHOD, FILENAME, FILEPATH, TokenKey, PayloadMeta, FormatPrimitive } from './types';

export class Logger<Level extends string, Meta extends Record<string, unknown> = Record<string, unknown>, Key extends string = string> extends EventEmitter {

  core: Core = core;
  children = new Map<string, Logger<Level, Meta, Key>>();

  constructor(public options: LoggerOptions<Level, Meta, Key>, public isChild = false) {

    super();

    this.options = { ...{ levels: [], transports: [], filters: [], transforms: [], muted: false, level: null, defaultMetaKey: '' }, ...this.options };

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
      if (typeof transport._options.level === 'undefined')
        transport._options.level = this.options.level;
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
   * @param level the level to be logged.
   * @param message the message to be logged.
   * @param args the optional format args to be applied.
   */
  private writer(level: Level | BaseLevel, message: any = '', ...args: any[]) {

    type LoggedLevel = Level | BaseLevel;

    if (this.muted || (this.level && !this.isLevelActive(level)))
      return;

    const id = uuidv4();
    const label = level;
    const index = this.options.levels.indexOf(label as Level);
    const cb = typeof args[args.length - 1] === 'function' ? args.pop() : null;
    const meta = isPlainObject(args[args.length - 1]) ? args.pop() : null;
    const trace = currentLine({ frames: 2 });
    const globalMeta = isPlainObject(this.options.meta) ? { ...this.options.meta } : null;
    const timestamp = new Date();
    let mergedMeta = (!meta && !globalMeta ? null : { ...(globalMeta || {}), ...(meta || {}) }) as null | Record<string, unknown>;

    if (this.options.metaKey)
      mergedMeta = mergedMeta === null ? {} : { [this.options.metaKey]: mergedMeta };

    const initIncludes = this.options.includes ? {
      [UUID]: id,
      [LEVELINT]: index,
      [TIMESTAMP]: timestamp,
      [LOGGER]: this.label,
      [LINE]: trace.line,
      [CHAR]: trace.char,
      [METHOD]: trace.method,
      [FILEPATH]: trace.filepath,
      [FILENAME]: trace.filename,
    } : {};

    const rawPayload = {
      ...initIncludes,
      [LEVEL]: label as LoggedLevel,
      [MESSAGE]: message,
      [SPLAT]: mergedMeta ? [...args, { ...mergedMeta }] : args,
      message
    };

    // Emit raw payload.
    this.emit('log', rawPayload);
    this.emit(`log:${label}`, rawPayload);

    const event = (transport: Transport) => {

      return (done) => {

        try {

          const transportIncludes = this.options.includes ? {
            [UUID]: id,
            [LEVELINT]: index,
            [TIMESTAMP]: timestamp,
            [LOGGER]: this.label,
            [TRANSPORT]: transport.label,
            [LINE]: trace.line,
            [CHAR]: trace.char,
            [METHOD]: trace.method,
            [FILEPATH]: trace.filepath,
            [FILENAME]: trace.filename,
          } : {};

          const payload = {
            ...transportIncludes,
            [LEVEL]: label,
            [MESSAGE]: message,
            [SPLAT]: mergedMeta ? [...args, { ...mergedMeta }] : args,
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
          const err = ex as Error & { transport: string };
          err.transport = transport.label;
          done(ex, null);
        }

      };

    };

    asynceach<Payload<Level>>(this.transports.map(transport => event(transport)), (err, payloads) => {

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

  get label() {
    return this.options.label;
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
  setLevel(level: TypeOrValue<Level>, cascade = true) {

    if (typeof level === 'undefined' || !this.levels.includes(level as Level)) {
      // eslint-disable-next-line no-console
      log.warn(`Level "${level}" is invalid or not found.`);
      return this;
    }
    this.options.level = level as Level;
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
  setTransportLevel(transport: Transport, level: TypeOrValue<Level>): this;

  /**
   * Sets the level for a Logger Transport.
   * 
   * @param transport the Transport label to set the level for.
   * @param level the level to be set on the Transport.
   */
  setTransportLevel(transport: string, level: TypeOrValue<Level>): this;
  setTransportLevel(transport: string | Transport, level: Level) {
    const _transport = (typeof transport === 'string' ? this.getTransport(transport as string) : transport) as Transport;
    _transport.setLevel(level, this);
    return this;
  }

  /**
   * 
   * @param payload your current payload object. 
   * @param level the level you wish to change to.
   */
  changeLevel(payload: Payload<Level>, level: Level) {
    return {
      ...payload,
      [LEVEL]: level
    } as Payload<Level>;
  }

  /**
   * Checks if a level is active.
   * 
   * @param level the level to compare.
   * @param levels the optional levels to compare against.
   */
  isLevelActive(level: TypeOrValue<Level>, levels?: TypeOrValue<Level>[]): boolean;

  /**
   * Checks if a level is active by payload.
   * 
   * @param payload the payload containing the level to inspect.
   * @param levels the optional levels to compare against.
   */
  isLevelActive(payload: Payload<Level>, levels?: TypeOrValue<Level>[]): boolean;
  isLevelActive(level: TypeOrValue<Level> | Payload<Level>, levels: TypeOrValue<Level>[] = this.levels): boolean {
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
      label,
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


    child = new Logger(options, true);

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
  filter<Extend extends Record<string, unknown> = Record<string, unknown>>(transport: string, fn: Filter<Level, Extend>): this;

  /**
   * Adds a global Filter function.
   * 
   * @param fn the Filter function to be added.
   */
  filter<Extend extends Record<string, unknown> = Record<string, unknown>>(fn: Filter<Level, Extend>): this;
  filter(transport: string | Filter<Level>, fn?: Filter<Level>) {
    if (typeof transport === 'function') {
      fn = transport;
      transport = undefined;
    }
    if (!transport) {
      this.options.filters.push(fn);
      return this;
    }
    const _transport = this.getTransport(transport as string);
    if (!_transport)
      throw new Error(`Transport ${transport} could NOT be found.`);
    _transport._options.filters.push(fn);
    return this;
  }

  /**
   * Adds a Transform function.
   * 
   * @param transport the Transport to add the transform to.
   * @param fn the Transform function to be added.
   */
  transform<P extends Record<string, unknown> = Record<string, unknown>>(transport: string, fn: Transform<Level, P>): this;

  /**
   * Adds a global Transform function.
   * 
   * @param fn the Transform function to be added.
   */
  transform<Extend extends Record<string, unknown> = Record<string, unknown>>(fn: Transform<Level, Extend>): this;
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
      _transport._options.transforms.push(fn);
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
   * @param fn rest array of Filter functions to merge.
   */
  mergeFilter(fn: Filter<Level>[]): Filter<Level>;
  mergeFilter(...fns: (Filter<Level> | Filter<Level>[])[]) {
    const filters = flatten(fns) as Filter<Level>[];
    return (payload: Payload<Level> & Meta) => filters.some(filter => filter(payload));
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
      write(message: string, ...args: any[]) {
        const meta = !buffer.length ? { [key]: true, groupStart: true } : { [key]: true };
        buffer.push([message, args, meta]);
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
          const err = ex as Error;
          log.group(`Group ${key} Error`, 'yellow')
            .error(err.stack)
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
    const options = transport._options;
    if (!transport.getType) {
      log.fatal((new Error(`Transport missing static property getType, clone failed.`).stack));
      return;
    }
    const Klass: new (...args: any[]) => T = transport.getType as any;
    return new Klass(label, options);
  }

  /**
   * Useful helper to determine if payload contains a given Logger.
   * 
   * @param payload the current payload to inspect.
   * @param label the label to match.
   */
  hasLogger(payload: Payload<Level>, label: string) {
    const logger = payload[LOGGER];
    return logger === label;

  }

  /**
   * Useful helper to determine if payload contains a given Transport.
   * 
   * @param payload the current payload to inspect.
   * @param label the label to match.
   */
  hasTransport(payload: Payload<Level>, label: string) {
    const transport = payload[TRANSPORT];
    return transport === label;
  }

  /**
   * Useful helper to determine if Transport contains a given Level.
   * 
   * @param payload the current payload to inspect.
   * @param compare the label to compare.
   */
  hasLevel(payload: Payload<Level>, compare: Level) {
    const level = payload[LEVEL];
    return level === compare;
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

  /**
   * Extend a payload object with additional properties optionally assigning exteded object at 
   * property name defined as options.metaKey.
   * 
   * @param payload the payload object to be extended.
   * @param extend the object to extend payload with.
   * @param useMetaKey when true the extended object is assiged to metaKey name in payload.
   */
  extendPayload<P extends Payload<Level>, E extends Partial<P>>(payload: P, extend: E, useMetaKey = false) {
    if (useMetaKey) {
      if (!this.options.metaKey)
        throw new Error(`Cannot use "metaKey" of undefined. Is it set at "options.metaKey"?`)
      return (payload[this.options.metaKey as keyof P] = extend as any) as P & { [key: string]: typeof extend };
    }
    for (const k in extend) {
      if (!Object.prototype.hasOwnProperty.call(extend, k)) continue;
      payload[k] = extend[k] as any;
    }
    return payload as P & E;
  }


  /**
   * Parses payload inspecting for error argument as message and/or meta object within splat.
   * 
   * @param payload the payload object to be parsed. 
   */
  parsePayload<P extends Payload<Level>, E extends Partial<P>>(payload: P, extend = {} as E) {

    let meta = {} as E;

    // Check if last arg in splat is an object. 
    if (isObject(payload[SPLAT].slice(-1)[0]))
      meta = payload[SPLAT].pop();

    // if payload message is an error convert to object, set message to error's message.
    if ((payload[MESSAGE]) instanceof Error) {
      const err = payload[MESSAGE] as any;
      payload.message = err.message;
      meta = { ...meta, err: errorToObject(err) };
    }

    payload.message = format(payload.message, ...payload[SPLAT]);

    return this.extendPayload(payload, { ...meta, ...extend }, true);

  }

  /**
   * Formats a message using Node's util.format function. 
   * 
   * @param template the string template used to format the message.
   * @param args the additional arguments 
   */
  formatMessage(template: string, ...args: FormatPrimitive[]): string;
  /**
   * Formats a message using Node's util.format function. Arguments which match
   * payload token keys will be mapped to their corresponding values.
   * 
   * @param payload the current payload use to parse tokens from.
   * @param template the string template used to format the message.
   * @param args the additional arguments 
   */
  formatMessage(payload: Payload<Level>, template: string, ...args: FormatPrimitive[]): string;
  formatMessage(payloadOrTemplate: string | Payload<Level>, template: FormatPrimitive, ...args: FormatPrimitive[]) {

    let payload = {} as Payload<Level>;
    if (typeof payloadOrTemplate === 'string') {
      if (typeof template !== 'undefined')
        args.unshift(template);
      template = payloadOrTemplate as string;
    }

    else if (isObject(payloadOrTemplate)) {
      payload = payloadOrTemplate
    }

    const normalized = args.map(arg => {

      const [token, colorOrFn, ...rest] = ensureArray(arg) as FormatTuple;

      let ansiArgs = rest;

      if (typeof token === 'string' && typeof TOKEN_MAP[token] !== 'undefined') {

        let value = this.getToken(payload, token as TokenKey);

        if (value) {
          if (isFunction(colorOrFn)) { // callback func returns either value or Ansicolors.
            const result = colorOrFn(value, token);
            if (Array.isArray(result)) {
              const [resultVal, ...resultRest] = result;
              arg = resultVal;
              ansiArgs = [...ansiArgs, ...resultRest];
            }
          }
          else if (typeof colorOrFn !== 'undefined') {
            ansiArgs.unshift(colorOrFn);
            arg = value as FormatPrimitive;
          }
        }

        if (!ansiArgs.length) // if no color values return existing or mapped arg.
          return arg;

        return colorizeString(arg, ...ansiArgs); // colorize the argument.

      }
      else if (isFunction(colorOrFn)) {
        throw new Error(`Format arg for token/value "${token}" is invalid. Functions can only be called when using a known payload token e.g. ['uuid', 'timestamp'...]`)
      }

      return arg;

    });

    return format(template, ...normalized); // return formatted string using normalized args.

  }

  /**
   * Gets the value of a token within the payload.
   * 
   * @param payload the payload object to get token from.
   * @param key the key to get value for.
   */
  getToken(payload: Payload<Level>, key: TokenKey) {
    const sym = TOKEN_MAP[key];
    if (!sym) return null;
    return payload[sym as keyof Payload<Level>];
  }

}