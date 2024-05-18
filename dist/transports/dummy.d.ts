import { Transport } from './transport';
import { TransportOptions as TransportOptions } from '../types';
export declare class DummyTransport<Level extends string, Label extends string = string> extends Transport<TransportOptions<Level, Label>> {
    static Type: "string" | "number" | "bigint" | "boolean" | "symbol" | "undefined" | "object" | "function";
    options: TransportOptions<Level, Label>;
    constructor(options?: TransportOptions<Level, Label>);
    /**
     * Must override log method.
     *
     * @param payload the payload object to ouptut.
     */
    log(payload: string): void;
}
