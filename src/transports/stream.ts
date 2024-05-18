import { Transport } from './transport';
import { TransportOptions } from '../types';
import { Writable } from 'readable-stream';

export interface StreamTransportOptions<Level extends string, Label extends string = string> extends TransportOptions<Level, Label> {
  stream: Writable;
}

export class StreamTransport<Level extends string, Label extends string = string> extends Transport<StreamTransportOptions<Level, Label>> {

  static Type = typeof StreamTransport;

  options: StreamTransportOptions<Level, Label>;

  constructor(options?: StreamTransportOptions<Level, Label>) {
    super({ label: 'stream', ...options });
    this.options = this._options;
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

