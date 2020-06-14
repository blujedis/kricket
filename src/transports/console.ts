import { Transport } from './transport';
import { ITransportOptions } from '../types';

export class ConsoleTransport<Level extends string, K extends string = 'console'> extends Transport<K, ITransportOptions<Level>> {

  static Type = typeof ConsoleTransport;

  constructor(options?: ITransportOptions<Level>, alias?: K) {
    super(alias || 'console' as K, { ...{ asJSON: false }, ...options });
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

