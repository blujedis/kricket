import { Transport } from './transport';
import { ITransportOptions } from '../types';
export interface IConsoleOptions<Level extends string, Label extends string> extends ITransportOptions<Level, Label> {
}
export declare class ConsoleTransport<Level extends string, Label extends string> extends Transport<IConsoleOptions<Level, Label>> {
    static Type: "string" | "number" | "bigint" | "boolean" | "symbol" | "undefined" | "object" | "function";
    constructor(options?: IConsoleOptions<Level, Label>);
    /**
     * Method called by super.
     *
     * @param payload the payload object to ouptut.
     */
    log(payload: string): void;
}
