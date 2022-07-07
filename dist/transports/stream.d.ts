import { Transport } from './transport';
import { ITransportOptions } from '../types';
import { Writable } from 'readable-stream';
export interface IStreamTransportOptions<Level extends string, Label extends string = string> extends ITransportOptions<Level, Label> {
    stream: Writable;
}
export declare class StreamTransport<Level extends string, Label extends string = string> extends Transport<IStreamTransportOptions<Level, Label>> {
    static Type: "string" | "number" | "bigint" | "boolean" | "symbol" | "undefined" | "object" | "function";
    constructor(options?: IStreamTransportOptions<Level, Label>);
    /**
     * Method  alled by super.
     *
     * @param payload the payload object to ouptut.
     */
    log(payload: string): void;
}
