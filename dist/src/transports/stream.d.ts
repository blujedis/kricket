import { Transport } from './transport';
import { ITransportOptions } from '../types';
import { Writable } from 'readable-stream';
export interface IStreamTransportOptions<Level extends string> extends ITransportOptions<Level> {
    stream: Writable;
}
export declare class StreamTransport<Level extends string> extends Transport<IStreamTransportOptions<Level>> {
    static Type: "string" | "number" | "bigint" | "boolean" | "symbol" | "undefined" | "object" | "function";
    constructor(options?: IStreamTransportOptions<Level>, alias?: string);
    /**
     * Method  alled by super.
     *
     * @param payload the payload object to ouptut.
     */
    log(payload: string): void;
}
