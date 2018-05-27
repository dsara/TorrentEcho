import * as ftps from 'ftps';
import { Logs } from '../tools/logging';
import utilities from '../tools/util';

// const logs = logging.getInstance();
const util = utilities.getInstance();

export class SFTP {
  ftpsInstance: any;

  constructor(config) {
    const pgetCommand = `set mirror:use-pget-n ${util.config.props.pget};
                         set pget:default-n ${util.config.props.pget};
                         set net:limit-total-rate 29360128:0`;
    const tempCommand = `set xfer:use-temp-file true;
                         set xfer:temp-file-name *.tmp;
                         set xfer:destination-directory ${util.config.props.rootDownloadFolder}`;

    this.ftpsInstance = new ftps({
      host: util.config.props.host,
      username: util.config.props.user,
      password: util.config.props.pass,
      port: util.config.props.port,
      retries: 2,
      retryInterval: 10,
      protocol: 'sftp',
      autoConfirm: true,
      additionalLftpCommands: pgetCommand + ';' + tempCommand
    });
  }

  addMirrorCommand(remotePath: string, rootDownloadFolder: string, torrentName: string): void {
    if (remotePath && torrentName) {

      const lastChar = rootDownloadFolder.substr(-1);
      if (lastChar !== '/') {
        rootDownloadFolder = rootDownloadFolder + '/';
      }

      Logs.writeMessage('Wrote lftp mirror command: ' + 'mirror -c ' + ftps.escapeshell(remotePath + '/' + torrentName));
      this.ftpsInstance.raw('mirror -c ' + remotePath + '/' + torrentName);
    }
  }

  addPGetCommand(remotePath: string, torrentName: string): void {
    if (remotePath && torrentName) {
      Logs.writeMessage(`Wrote lftp pget command: pget -c ${ftps.escapeshell(remotePath + '/' + torrentName)}`);
      this.ftpsInstance.raw(`pget -c ${ftps.escapeshell(remotePath + '/' + torrentName)}`);
    }
  }

  executeCommands(): any {
    Logs.writeMessage('Executing stored lftp commands');
    return this.ftpsInstance.exec();
  }
}
