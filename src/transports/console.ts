import { Transport } from './transport';
import { TransportOptions } from '../types';

export interface ConsoleOptions<Level extends string, Label extends string = string> extends TransportOptions<Level, Label> {

}

export class ConsoleTransport<Level extends string, Label extends string = string> extends Transport<ConsoleOptions<Level, Label>> {

  static Type = typeof ConsoleTransport;

  options: TransportOptions<Level, Label>;

  constructor(options?: ConsoleOptions<Level, Label>) {
    super({ label: 'console', ...options, asJSON: false });
    options = this._options;
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

