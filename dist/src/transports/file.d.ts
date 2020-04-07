/// <reference types="node" />
import { Transport } from './transport';
import { ITransportOptions } from '../types';
import { WriteStream } from 'fs';
export declare type Frequency = 'minute' | 'hourly' | 'daily' | 'custom' | 'test' | 'h' | 'm';
export interface IFileOptions {
    flags?: string;
    encoding?: string;
    fd?: number;
    mode?: number;
    autoClose?: boolean;
    start?: number;
    highWaterMark?: number;
}
export interface IFileTransportOptions<Level extends string> extends ITransportOptions<Level> {
    filename?: string;
    frequency?: Frequency;
    verbose?: boolean;
    date_format?: string;
    size?: string;
    max_logs?: string | number;
    audit_file?: string;
    end_stream?: boolean;
    file_options?: IFileOptions;
    eol?: string;
    onRotate?(oldFile?: string, newFile?: string): void;
    onNew?(newFile?: string): void;
}
export declare class FileTransport<Level extends string> extends Transport<IFileTransportOptions<Level>> {
    static Type: "string" | "number" | "bigint" | "boolean" | "symbol" | "undefined" | "object" | "function";
    rotator: WriteStream;
    constructor(options?: IFileTransportOptions<Level>, alias?: string);
    /**
     * Callback handler on new file created.
     *
     * @param filename the new filename that was created.
     */
    newfile(newFile: string): void | this;
    /**
     * Callback handler on file rotated.
     *
     * @param oldFile the previous file path.
     * @param newFile the new or current file path.
     */
    rotate(oldFile: string, newFile: string): void | this;
    /**
     * Method called by super.
     *
     * @param payload the payload object to ouptut.
     */
    log(payload: string): void;
}
