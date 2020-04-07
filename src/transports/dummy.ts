import { Transport } from './transport';
import { ITransportOptions } from '../types';

export class DummyTransport<Level extends string> extends Transport<ITransportOptions<Level>> {

  static Type = typeof DummyTransport;

  constructor(options?: ITransportOptions<Level>, alias?: string) {
    super(alias || 'dummy', options);
  }

  /**
   * Method called by super.
   * 
   * @param payload the payload object to ouptut.
   */
  log(payload: string) {
    // does nothing.
  }

}

