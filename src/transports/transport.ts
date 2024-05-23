import { Writable } from 'readable-stream';
import { TransportOptions, EOL, Payload, ErrorCallback, NodeCallback } from '../types';
import { Logger } from '../logger';


export abstract class Stream extends Writable {
  // writable: boolean;
}

export abstract class Transport<Options extends TransportOptions = TransportOptions> extends Stream {

  static Type;

  _options: Options;
  _buffer = '';

  constructor(options?: Options) {
    super({ highWaterMark: ({ ...options }).highWaterMark || 16 });
    this._options = { level: null, highWaterMark: 16, asJSON: true, filters: [], transforms: [], ...options };
    if (!this._options.label)
      throw new Error('Failed to construct Transport using label/name of undefined');

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
   * @param chunk the current logged chunk.
   */
  format(chunk: string) {
    // Loose check maybe should be more comprehensive.
    if (this.isJSON || chunk.charAt(0) !== '{')
      return chunk;
    const payload = JSON.parse(chunk) as Payload<any, any>;
    return payload.message;
  }

  /**
   * Gets the label for the Transport.
   */
  get label() {
    return this._options.label;
  }

  /**
   * Get the Transport's level.
   */
  get level() {
    return this._options.level;
  }

  /**
   * Gets if Transport is muted.
   */
  get muted() {
    return this._options.muted;
  }

  /**
   * Gets if Transport outputs JSON string.
   */
  get isJSON() {
    return this._options.asJSON;
  }

  /**
   * Gets Transport's Filters.
   */
  get filters() {
    return this._options.filters;
  }

  /**
   * Gets Transport's Transforms.
   */
  get transforms() {
    return this._options.transforms;
  }

  /**
   * Mutes the Transport.
   */
  mute() {
    this._options.muted = true;
    return this;
  }

  /**
   * Unmutes the Transport.
   */
  unmute() {
    this._options.muted = false;
    return this;
  }

  /**
   * Sets the Logger's log level.
   * 
   * @param level the level to set the Logger to.
   * @param logger the parent Logger containing log levels.
   */
  setLevel(level: string, logger: Logger<any, any>) {
    if (typeof level === 'undefined' || !logger.levels.includes(level))
      throw new Error(`Level "${level}" is invalid or not found.`);
    this._options.level = level;
    return this;
  }

  /**
   * Log method called by extended class to handle log messages.
   * 
   * @param payload the payload to be logged.
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  log(payload: string) {
    throw new Error(`Method "log" is required for Transport ${this.label} but was NOT implemented.`);
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
      const s = this._buffer + String(this.format(chunk));
      const lines = s.split(EOL);
      let i = 0;
      for (i; i < lines.length - 1; i++) {
        this.log(lines[i] + EOL);
      }
      this._buffer = lines[i];
      if (cb) cb();
    }
    catch (ex) {
      if (cb) cb(ex as Error);
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
    this._buffer = '';
    if (cb)
      cb(err);
    this.emit('close');
    return this;
  }

  /**
  * Ends the stream, outputs if needed then calls destroy.
  * 
  * @param cb optional callback.
  */
  end(cb?: NodeCallback): this;


  /**
   * Ends the stream, outputs if needed then calls destroy.
   * 
   * @param chunk optional chunk to output on end.
   * @param cb optional callback.
   */
  end(chunk: any, cb?: NodeCallback): this;

  /**
   * Ends the stream, outputs if needed then calls destroy.
   * 
   * @param chunk optional chunk to output on end.
   * @param enc optional encoding.
   * @param cb optional callback.
   */
  end(chunk: any, enc: string, cb?: NodeCallback): this;
  end(chunk: any, enc?: string | NodeCallback, cb?: NodeCallback) {
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

    if (this._buffer && this._buffer.length) {
      out = this._buffer + EOL;
      this.log(out);
    }


    if (cb)
      cb(null, out);

    this.destroy();

    return this;

  }



}