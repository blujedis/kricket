import { Transport } from './transport';
import { ITransportOptions } from '../types';

export class DummyTransport<Level extends string> extends Transport<ITransportOptions<Level>> {

  static Type = typeof DummyTransport;

  constructor(options?: ITransportOptions<Level>, alias?: string) {
    super(alias || 'dummy', options);
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

