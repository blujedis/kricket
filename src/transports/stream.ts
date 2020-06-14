import { Transport } from './transport';
import { ITransportOptions } from '../types';
import { Writable } from 'readable-stream';

export interface IStreamTransportOptions<Level extends string> extends ITransportOptions<Level> {
  stream: Writable;
}

export class StreamTransport<Level extends string, K extends string = 'stream'> extends Transport<K, IStreamTransportOptions<Level>> {

  static Type = typeof StreamTransport;

  constructor(options?: IStreamTransportOptions<Level>, alias?: K) {
    super(alias || 'stream' as K, options);
  }

  /**
   * Method  alled by super.
   * 
   * @param payload the payload object to ouptut.
   */
  log(payload: string) {
    this.options.stream.write(payload);
  }

}

