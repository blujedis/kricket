import { Writable } from 'readable-stream';
import { ITransportOptions, ErrorCallback, NodeCallback } from '../types';
import { Logger } from '../logger';
export declare abstract class Stream extends Writable {
    writable: boolean;
}
export declare abstract class Transport<Options extends ITransportOptions<any> = ITransportOptions<any>> extends Stream {
    label: string;
    static Type: any;
    options: Options;
    buffer: string;
    constructor(label: string, options?: Options);
    /**
     * Gets the extended Type.
     */
    getType(): any;
    /**
     * Formats as JSON or just message string.
     *
     * @param chunk the currently logged chunk.
     */
    format(chunk: string): string;
    /**
     * Get the Transport's level.
     */
    get level(): any;
    /**
     * Gets if Transport is muted.
     */
    get muted(): boolean;
    /**
     * Gets if Transport outputs JSON string.
     */
    get isJSON(): boolean;
    /**
     * Gets Transport's Filters.
     */
    get filters(): import("../types").Filter<any>[];
    /**
     * Gets Transport's Transforms.
     */
    get transforms(): import("../types").Transform<any>[];
    /**
     * Mutes the Transport.
     */
    mute(): this;
    /**
     * Unmutes the Transport.
     */
    unmute(): this;
    /**
     * Sets the Logger's log level.
     *
     * @param level the level to set the Logger to.
     * @param logger the parent Logger containing log levels.
     */
    setLevel(level: string, logger: Logger<any>): this;
    log(payload: string): void;
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
    /**
     * Destroys and emits close for the stream.
     *
     * @param err an error on destroy.
     * @param cb optional callback.
     */
    destroy(err?: Error | null, cb?: ErrorCallback): this;
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
}
