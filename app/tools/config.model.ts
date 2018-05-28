import * as fs from 'fs';
import { Logs } from './logging';

export class Config {
  public props = new ConfigProperties();

  constructor() {
    const configFile = '/config/config.json';

    try {
      const stats = fs.statSync(configFile);
    } catch (e) {
      Logs.writeMessage('Config file not found');
    }
    // read in and parse the config file
    this.props = JSON.parse(fs.readFileSync(configFile, 'utf8'));
  }
}

class ConfigProperties {
  mode: string;
  host: string;
  port: string;
  path: string;
  user: string;
  pass: string;
  chownUser: number;
  chownGroup: number;
  isSecure: boolean;
  pget: number;
  useTemp: boolean;
  rootDownloadFolder: string;
  nodeDownloadFolder: string;
  tvShowsDestination: string;
  labelDownloadFolders: Array<string>;
  doneLabel: string;
  doneLabelDelay: number;
  verboseLogging: boolean;
  syncRemoveSource: boolean;
}
