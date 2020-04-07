
import { Logger } from './logger';
import { Transport } from './transports';

export class Core {

  /**
   * Map of Logger instances.
   */
  loggers = new Map<string, Logger<any>>();


  /**
   * Gets a logger stored in the collection.
   * 
   * @param label the Logger's label to lookup.
   */
  getLogger(label: string) {
    return this.loggers.get(label);
  }

  /**
   * Looks up a Transport within a Logger.
   * 
   * @param label the Transport label/name to lookup.
   * @param logger the Logger the Transport is contained in.
   */
  getTransport<T extends Transport>(label: string, logger?: string | Logger<any>) {
    if (typeof logger === 'string')
      logger = this.loggers.get(logger as string);
    const find = (_logger: Logger<any>) => ((_logger && _logger.transports.find(t => t.label === label)) || null);
    const loggers = (logger ? [logger as Logger<any>] : [...this.loggers.values()]) as Logger<any>[];
    let found = null;
    while (!found && loggers.length) {
      found = find(loggers.shift());
    }
    return found as T;
  }

  /**
   * Clones an existing Transport by options.
   * 
   * @param label the Transport label/name to be cloned.
   * @param transport the Transport instance to be cloned.
   */
  cloneTransport<T extends Transport<any>>(
    label: string, transport: T) {
    const options = transport.options;
    const Klass: new(...args: any[]) => T = transport.getType as any;
    return new Klass(label, options);
  }

}

let instance: Core;

function getInstance() {
  if (!instance)
    instance = new Core();
  return instance;
}

export default getInstance();