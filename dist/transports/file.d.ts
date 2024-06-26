import { Transport } from './transport';
import { TransportOptions } from '../types';
import FileStreamRotator from 'file-stream-rotator/lib/FileStreamRotator';
export type Frequency = 'minute' | 'hourly' | 'daily' | 'custom' | 'test' | 'h' | 'm';
export interface FileOptions {
    flags?: string;
    encoding?: string;
    fd?: number;
    mode?: number;
    autoClose?: boolean;
    start?: number;
    highWaterMark?: number;
}
export interface FileTransportOptions<Level extends string, Label extends string = string> extends TransportOptions<Level, Label> {
    filename?: string;
    frequency?: Frequency;
    verbose?: boolean;
    date_format?: string;
    size?: string;
    max_logs?: string;
    audit_file?: string;
    end_stream?: boolean;
    file_options?: FileOptions;
    eol?: string;
    onRotate?(oldFile?: string, newFile?: string): void;
    onNew?(newFile?: string): void;
}
export declare class FileTransport<Level extends string, Label extends string = string> extends Transport<FileTransportOptions<Level, Label>> {
    static Type: "string" | "number" | "bigint" | "boolean" | "symbol" | "undefined" | "object" | "function";
    rotator: FileStreamRotator;
    options: FileTransportOptions<Level, Label>;
    constructor(options?: FileTransportOptions<Level, Label>);
    /**
     * Callback handler on new file created.
     *
     * @param newFile the new filename that was created.
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
     * Method  alled by super.
     *
     * @param payload the payload object to ouptut.
     */
    log(payload: string): void;
}
