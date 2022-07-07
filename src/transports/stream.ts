import { Transport } from './transport';
import { ITransportOptions } from '../types';
import { Writable } from 'readable-stream';

export interface IStreamTransportOptions<Level extends string, Label extends string = string> extends ITransportOptions<Level, Label> {
  stream: Writable;
}

export class StreamTransport<Level extends string, Label extends string = string> extends Transport<IStreamTransportOptions<Level, Label>> {

  static Type = typeof StreamTransport;

  constructor(options?: IStreamTransportOptions<Level, Label>) {
    super({ label: 'stream', ...options });
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

