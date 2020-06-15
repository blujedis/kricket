
import { Logger } from './logger';

export class Core {

  /**
   * Map of Logger instances.
   */
  loggers = new Map<string, Logger<any, any>>();

  /**
   * Gets a logger stored in the collection.
   * 
   * @param label the Logger's label to lookup.
   */
  getLogger<Level extends string = any>(label: string) {
    return this.loggers.get(label) as Logger<Level>;
  }

}

let instance: Core;

function getInstance() {
  if (!instance)
    instance = new Core();
  return instance;
}

export default getInstance();