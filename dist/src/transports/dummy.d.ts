import { Transport } from './transport';
import { ITransportOptions } from '../types';
export declare class DummyTransport<Level extends string, K extends string = 'dummy'> extends Transport<K, ITransportOptions<Level>> {
    static Type: "string" | "number" | "bigint" | "boolean" | "symbol" | "undefined" | "object" | "function";
    constructor(options?: ITransportOptions<Level>, alias?: K);
    /**
     * Must override log method.
     *
     * @param payload the payload object to ouptut.
     */
    log(payload: string): void;
}
