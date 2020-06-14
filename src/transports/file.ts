import { Transport } from './transport';
import rotator from 'file-stream-rotator';
import { ITransportOptions, EOL } from '../types';
import { WriteStream } from 'fs';
import { colorize } from '../utils';

export type Frequency = 'minute' | 'hourly' | 'daily' | 'custom' | 'test' | 'h' | 'm';

export interface IFileOptions {
  flags?: string;
  encoding?: string;
  fd?: number;
  mode?: number;
  autoClose?: boolean;
  start?: number;
  highWaterMark?: number;
}

export interface IFileTransportOptions<Level extends string> extends ITransportOptions<Level> {
  filename?: string;                                    // file path for logs
  frequency?: Frequency;                                // (default: YYYYMMDD)             
  verbose?: boolean;                                    // (default: true)
  date_format?: string;                                 // uses moment.js formatting.
  size?: string;                                        // numeric w/ k, m or g
  max_logs?: string | number;                           // numeric or num with d for days
  audit_file?: string;                                  // optional path to write audit file.
  end_stream?: boolean;                                 // use true if looping (default: false)
  file_options?: IFileOptions;                          // node file option flags.
  eol?: string;                                         // (default: os.EOL)define end of line.
  onRotate?(oldFile?: string, newFile?: string): void;  // callback on file rotation.
  onNew?(newFile?: string): void;                       // callback on file rotation.
}

const DEFAULTS: IFileTransportOptions<any> = {
  filename: './logs/%DATE%.log',
  frequency: 'daily',
  verbose: false,
  date_format: 'YYYY-MM-DD',
  size: '5m',
  max_logs: '7d',
  audit_file: './logs/_audit.json',
  file_options: { flags: 'a' },
  eol: EOL
};

export class FileTransport<Level extends string> extends Transport<IFileTransportOptions<Level>> {

  static Type = typeof FileTransport;

  rotator: WriteStream;

  constructor(options?: IFileTransportOptions<Level>, alias?: string) {

    super(alias || 'file', { ...DEFAULTS, ...options });

    options = this.options;

    if (['hourly', 'minute'].includes(options.frequency))
      options.frequency = options.frequency.charAt(0) as 'h' | 'm';

    this.rotator = rotator.getStream(options);

    if (options.onRotate)
      this.rotator.on('rotate', this.rotate.bind(this));

    if (options.onNew)
      this.rotator.on('new', this.newfile.bind(this));

    if (options.verbose)
      // eslint-disable-next-line no-console
      console.info(colorize(`Transport "${this.label}" logging to file: ${this.options.filename}`, 'cyan'));

  }

  /**
   * Callback handler on new file created.
   * 
   * @param filename the new filename that was created.
   */
  newfile(newFile: string) {
    if (this.options.onRotate)
      return this.options.onNew(newFile);
    // eslint-disable-next-line no-console
    console.info(colorize(`Transport "${this.label}" logging to NEW file: ${newFile}`, 'cyan'));
    return this;
  }

  /**
   * Callback handler on file rotated.
   * 
   * @param oldFile the previous file path.
   * @param newFile the new or current file path.
   */
  rotate(oldFile: string, newFile: string) {
    if (this.options.onRotate)
      return this.options.onRotate(oldFile, newFile);
    // PLACEHOLDER: add gzip archiving.
    return this;
  }

  /**
   * Method  alled by super.
   * 
   * @param payload the payload object to ouptut.
   */
  log(payload: string) {
    this.rotator.write(payload);
  }

}

