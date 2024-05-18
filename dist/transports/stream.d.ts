import { Transport } from './transport';
import { TransportOptions } from '../types';
import { Writable } from 'readable-stream';
export interface StreamTransportOptions<Level extends string, Label extends string = string> extends TransportOptions<Level, Label> {
    stream: Writable;
}
export declare class StreamTransport<Level extends string, Label extends string = string> extends Transport<StreamTransportOptions<Level, Label>> {
    static Type: "string" | "number" | "bigint" | "boolean" | "symbol" | "undefined" | "object" | "function";
    options: StreamTransportOptions<Level, Label>;
    constructor(options?: StreamTransportOptions<Level, Label>);
    /**
     * Method  alled by super.
     *
     * @param payload the payload object to ouptut.
     */
    log(payload: string): void;
}
