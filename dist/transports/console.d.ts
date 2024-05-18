import { Transport } from './transport';
import { TransportOptions } from '../types';
export interface ConsoleOptions<Level extends string, Label extends string = string> extends TransportOptions<Level, Label> {
}
export declare class ConsoleTransport<Level extends string, Label extends string = string> extends Transport<ConsoleOptions<Level, Label>> {
    static Type: "string" | "number" | "bigint" | "boolean" | "symbol" | "undefined" | "object" | "function";
    options: TransportOptions<Level, Label>;
    constructor(options?: ConsoleOptions<Level, Label>);
    /**
     * Method called by super.
     *
     * @param payload the payload to ouptut.
     */
    log(payload: string): void;
}
