import { Transport } from './transport';
import { ITransportOptions } from '../types';

export class ConsoleTransport<Level extends string> extends Transport<ITransportOptions<Level>> {

  static Type = typeof ConsoleTransport;

  constructor(options?: ITransportOptions<Level>, alias?: string) {
    super(alias || 'console', { ...{ asJSON: false }, ...options });
  }

  /**
   * Method called by super.
   * 
   * @param payload the payload object to ouptut.
   */
  log(payload: string) {
    process.stdout.write(payload);
  }

}

