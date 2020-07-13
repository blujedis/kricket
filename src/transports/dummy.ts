import { Transport } from './transport';
import { ITransportOptions } from '../types';

export class DummyTransport<Level extends string, Label extends string = string> extends Transport<ITransportOptions<Level, Label>> {

  static Type = typeof DummyTransport;

  constructor(options?: ITransportOptions<Level, Label>) {
    super({ label: 'dummy', ...options });
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

