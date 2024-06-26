import { Transport } from './transport';
import rotator from 'file-stream-rotator';
import { TransportOptions, EOL } from '../types';
import FileStreamRotator from 'file-stream-rotator/lib/FileStreamRotator';

export type Frequency = 'minute' | 'hourly' | 'daily' | 'custom' | 'test' | 'h' | 'm';

export interface FileOptions {
  flags?: string;
  encoding?: string;
  fd?: number;
  mode?: number;
  autoClose?: boolean;
  start?: number;
  highWaterMark?: number;
}

export interface FileTransportOptions<Level extends string, Label extends string = string> extends TransportOptions<Level, Label> {
  filename?: string;                                    // file path for logs
  frequency?: Frequency;                                // (default: YYYYMMDD)             
  verbose?: boolean;                                    // (default: true)
  date_format?: string;                                 // uses moment.js formatting.
  size?: string;                                        // numeric w/ k, m or g
  max_logs?: string;                                    // string with d for days
  audit_file?: string;                                  // optional path to write audit file.
  end_stream?: boolean;                                 // use true if looping (default: false)
  file_options?: FileOptions;                          // node file option flags.
  eol?: string;                                         // (default: os.EOL)define end of line.
  onRotate?(oldFile?: string, newFile?: string): void;  // callback on file rotation.
  onNew?(newFile?: string): void;                       // callback on file rotation.
}

const DEFAULTS: FileTransportOptions<any, any> = {
  label: 'file',
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

export class FileTransport<Level extends string, Label extends string = string> extends Transport<FileTransportOptions<Level, Label>> {

  static Type = typeof FileTransport;

  rotator: FileStreamRotator;

  options: FileTransportOptions<Level, Label>

  constructor(options?: FileTransportOptions<Level, Label>) {

    super({ ...DEFAULTS, ...options });

    this.options = this._options;

    if (['hourly', 'minute'].includes(options.frequency))
      options.frequency = options.frequency.charAt(0) as 'h' | 'm';

    this.rotator = rotator.getStream(options);

    if (options.onRotate)
      this.rotator.on('rotate', this.rotate.bind(this));

    if (options.onNew)
      this.rotator.on('new', this.newfile.bind(this));

    if (options.verbose)
        console.info(`Transport "${this.label}" logging to file: ${this._options.filename}`);

  }

  /**
   * Callback handler on new file created.
   * 
   * @param newFile the new filename that was created.
   */
  newfile(newFile: string) {
    if (this._options.onRotate)
      return this._options.onNew(newFile);
    if (this._options.verbose)
      console.info(`Transport "${this.label}" logging to NEW file: ${newFile}`);
    return this;
  }

  /**
   * Callback handler on file rotated.
   * 
   * @param oldFile the previous file path.
   * @param newFile the new or current file path.
   */
  rotate(oldFile: string, newFile: string) {
    if (this._options.onRotate)
      return this._options.onRotate(oldFile, newFile);
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

