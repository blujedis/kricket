import { Transport } from './transport';
import { ITransportOptions } from '../types';
export declare class ConsoleTransport<Level extends string> extends Transport<ITransportOptions<Level>> {
    static Type: "string" | "number" | "bigint" | "boolean" | "symbol" | "undefined" | "object" | "function";
    constructor(options?: ITransportOptions<Level>, alias?: string);
    /**
     * Method called by super.
     *
     * @param payload the payload object to ouptut.
     */
    log(payload: string): void;
}
