import { Transport } from './transport';
import { ITransportOptions } from '../types';

export interface IConsoleOptions<Level extends string, Label extends string> extends ITransportOptions<Level, Label> {

}

export class ConsoleTransport<Level extends string, Label extends string> extends Transport<IConsoleOptions<Level, Label>> {

  static Type = typeof ConsoleTransport;

  constructor(options?: IConsoleOptions<Level, Label>) {
    super({ label: 'console', ...options, asJSON: false });
  }

  /**
   * Method called by super.
   * 
   * @param payload the payload object to ouptut.
   */
  log(payload: string) {
    process.stdout.write(payload, (err) => {
      if (err)
        throw err;
    });
  }

}

