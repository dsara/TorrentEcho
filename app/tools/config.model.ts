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
  isSecure: boolean;
  webHost: string;
  webPath: string;
  webPort: number;
  sshHost: string;
  sshPort: string;
  user: string;
  pass: string;
  chownUser: number;
  chownGroup: number;
  pget: number;
  rootDownloadFolder: string;
  nodeDownloadFolder: string;
  tvShowsDestination: string;
  labelDownloadFolders: Array<string>;
  doneLabel: string;
  doneLabelDelay: number;
}
