
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
   * Clones an existing Logger using it's options.
   * 
   * @param label the label to use for the child logger.
   * @param from The Logger to use as source.
   * @param asChild When true the Logger is set with a parent.
   */
  cloneLogger<Level extends string>(label: string, from?: string | Logger<Level>, asChild: boolean = false) {
    const parent = (typeof from === 'string' ? this.getLogger(from as string) : from) as Logger<Level>;
    if (!parent)
      throw new Error(`Failed to lookup parent Logger "${from as string}".`);
    const options = { ...parent.options };
    const logger = asChild ? new Logger(label, options, parent) : new Logger(label, options);
    logger.core = this;
    return logger;
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