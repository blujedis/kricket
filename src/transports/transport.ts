import { Writable } from 'readable-stream';
import { ITransportOptions, EOL, IPayload, ErrorCallback, NodeCallback } from '../types';
import { Logger } from '../logger';
import { colorize } from '../utils';

export abstract class Stream extends Writable {
  writable: boolean;
}

export abstract class Transport<K extends string = any, Options extends ITransportOptions<any> = ITransportOptions<any>> extends Stream {

  static Type;

  options: Options;
  buffer = '';

  constructor(public label: K, options?: Options) {
    super({ highWaterMark: (options || {} as any).highWaterMark || 16 });
    this.options = { ...{ level: null, highWaterMark: 16, filters: [], transforms: [], asJSON: true }, ...options };
  }

  /**
   * Gets the extended Type.
   */
  getType() {
    return Transport.Type;
  }

  /**
   * Formats as JSON or just message string.
   * 
   * @param chunk the currently logged chunk.
   */
  format(chunk: string) {
    // Loose check maybe should be more comprehensive.
    if (this.isJSON || chunk.charAt(0) !== '{')
      return chunk;
    const payload = JSON.parse(chunk) as IPayload<any>;
    return payload.message;
  }

  /**
   * Get the Transport's level.
   */
  get level() {
    return this.options.level;
  }

  /**
   * Gets if Transport is muted.
   */
  get muted() {
    return this.options.muted;
  }

  /**
   * Gets if Transport outputs JSON string.
   */
  get isJSON() {
    return this.options.asJSON;
  }

  /**
   * Gets Transport's Filters.
   */
  get filters() {
    return this.options.filters;
  }

  /**
   * Gets Transport's Transforms.
   */
  get transforms() {
    return this.options.transforms;
  }

  /**
   * Mutes the Transport.
   */
  mute() {
    this.options.muted = true;
    return this;
  }

  /**
   * Unmutes the Transport.
   */
  unmute() {
    this.options.muted = false;
    return this;
  }

  /**
   * Sets the Logger's log level.
   * 
   * @param level the level to set the Logger to.
   * @param logger the parent Logger containing log levels.
   */
  setLevel(level: string, logger: Logger<any>) {
    if (typeof level === 'undefined' || !logger.levels.includes(level)) {
      // eslint-disable-next-line no-console
      console.warn(colorize(`Level "${level}" is invalid or not found.`, 'yellow'));
      return this;
    }
    this.options.level = level;
    return this;
  }

  /**
   * Log method called by extended class to handle log messages.
   * @param payload the payload to be logged.
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  log(payload: string) {
    const err = new Error(`Transport "${this.label}" method "log" required but NOT implemented.`);
    console.error(colorize(err.stack, 'red'));
    process.exit(1);
  }

  /**
   * Writes to stream.
   * 
   * @param chunk the chunk to be written.
   * @param encoding the encoding to be used.
   * @param cb optional callback.
   */
  write(chunk: any, encoding: string, cb: ErrorCallback): boolean;

  /**
   * Writes to stream.
   * 
   * @param chunk the chunk to be written.
   * @param cb optional callback.
   */
  write(chunk: any, cb?: ErrorCallback): boolean;
  write(chunk: any, encoding: string | ErrorCallback, cb?: ErrorCallback): boolean {
    try {
      const s = this.buffer + String(this.format(chunk));
      const lines = s.split(EOL);
      let i = 0;
      for (i; i < lines.length - 1; i++) {
        this.log(lines[i] + EOL);
      }
      this.buffer = lines[i];
      if (cb) cb();
    }
    catch (ex) {
      if (cb) cb(ex);
    }
    return true;
  }

  /**
   * Destroys and emits close for the stream.
   * 
   * @param err an error on destroy.
   * @param cb optional callback.
   */
  destroy(err?: Error | null, cb?: ErrorCallback) {
    this.writable = false;
    this.buffer = '';
    if (cb)
      cb(err);
    this.emit('close');
    return this;
  }

  /**
   * Ends the stream, outputs if needed then calls destroy.
   * 
   * @param chunk optional chunk to output on end.
   * @param enc optional encoding.
   * @param cb optional callback.
   */
  end(chunk: any, enc: string, cb?: NodeCallback): void;

  /**
   * Ends the stream, outputs if needed then calls destroy.
   * 
   * @param chunk optional chunk to output on end.
   * @param cb optional callback.
   */
  end(chunk: any, cb?: NodeCallback): void;

  /**
   * Ends the stream, outputs if needed then calls destroy.
   * 
   * @param cb optional callback.
   */
  end(cb?: NodeCallback): void;
  end(chunk: any, enc?: string | NodeCallback, cb?: NodeCallback): void {

    if (typeof chunk === 'function') {
      cb = chunk;
      chunk = undefined;
    }

    if (typeof enc === 'function') {
      cb = enc;
      enc = undefined;
    }

    if (chunk)
      this.write(chunk, cb);

    let out;

    if (this.buffer && this.buffer.length) {
      out = this.buffer + EOL;
      this.log(out);
    }


    if (cb)
      cb(null, out);

    this.destroy();

  }


}