const configFile = '/config/config.json';
import logs from './logging';
import { Config } from './config.model';

export default class Util {
  private static _instance: Util = new Util();

  public config: Config = new Config();

  constructor() {
    if (Util._instance) {
      throw new Error('Error: Instantiation failed: Use Util.getInstance() instead of new');
    }
    Util._instance = this;
  }

  public static getInstance(): Util {
    return Util._instance;
  }
}
