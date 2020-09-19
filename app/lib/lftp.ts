// import * as FTP from 'ftps';
import { FTP, FtpsConfigOptions } from '../tools/ftps-new';
import { Logs } from '../tools/logging';
import utilities from '../tools/util';

// const logs = logging.getInstance();
const util = utilities.getInstance();

export class SFTP {
  ftpsInstance: any;

  constructor() {
    const pgetCommand = `set mirror:use-pget-n ${util.config.props.pget};
                         set pget:default-n ${util.config.props.pget};
                         set net:limit-total-rate 29360128:0`;
    const tempCommand = `set xfer:use-temp-file true;
                         set xfer:temp-file-name *.tmp;
                         set xfer:destination-directory ${util.config.props.rootDownloadFolder}`;

    this.ftpsInstance = new FTP({
      host: util.config.props.sshHost,
      username: util.config.props.user,
      password: util.config.props.pass,
      port: util.config.props.sshPort,
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

      Logs.writeMessage(`Wrote lftp mirror command: mirror -c "${this.ftpsInstance.escapeshell(remotePath + '/' + torrentName)}"`);
      this.ftpsInstance.raw(`mirror -c ${this.ftpsInstance.escapeshell(remotePath + '/' + torrentName)}`);
    }
  }

  addPGetCommand(remotePath: string, torrentName: string): void {
    if (remotePath && torrentName) {
      Logs.writeMessage(`Wrote lftp pget command: pget -c ${this.ftpsInstance.escapeshell(remotePath + '/' + torrentName)}`);
      this.ftpsInstance.raw(`pget -c ${this.ftpsInstance.escapeshell(remotePath + '/' + torrentName)}`);
    }
  }

  executeCommands(callback: (error, result) => void): void {
    Logs.writeMessage('Executing stored lftp commands');
    let lftpProcess = this.ftpsInstance.exec(callback);
    // lftpProcess.on('close', function (code) {
    //   lftpProcess.kill();
    // });
  }
}
