import { Transport } from './transport';
import { ITransportOptions } from '../types';
export declare class DummyTransport<Level extends string> extends Transport<ITransportOptions<Level>> {
    static Type: "string" | "number" | "bigint" | "boolean" | "symbol" | "undefined" | "object" | "function";
    constructor(options?: ITransportOptions<Level>, alias?: string);
    /**
     * Must override log method.
     *
     * @param payload the payload object to ouptut.
     */
    log(payload: string): void;
}
