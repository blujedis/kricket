import { Transport } from './transport';
import { ITransportOptions } from '../types';
import { Writable } from 'readable-stream';

export interface IStreamTransportOptions<Level extends string> extends ITransportOptions<Level> {
  stream: Writable;
}

export class StreamTransport<Level extends string> extends Transport<IStreamTransportOptions<Level>> {

  static Type = typeof StreamTransport;

  constructor(options?: IStreamTransportOptions<Level>, alias?: string) {
    super(alias || 'stream', options);
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

