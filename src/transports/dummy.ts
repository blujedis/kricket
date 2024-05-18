import { Transport } from './transport';
import { TransportOptions as TransportOptions } from '../types';

export class DummyTransport<Level extends string, Label extends string = string> extends Transport<TransportOptions<Level, Label>> {

  static Type = typeof DummyTransport;

  options: TransportOptions<Level, Label>;

  constructor(options?: TransportOptions<Level, Label>) {
    super({ label: 'dummy', ...options });
    options = this._options;
  }

  /**
   * Must override log method.
   * 
   * @param payload the payload object to ouptut.
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  log(payload: string) {
    // does nothing.
  }

}

