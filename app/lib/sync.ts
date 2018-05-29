import { SFTP } from './lftp';
import * as fs from 'fs';
import { Deluge } from './deluge';
import { Torrent, fileTypes } from './torrent.model';
import { Unrar } from './unrar';
import { Logs } from '../tools/logging';
import utilities from '../tools/util';
const util = utilities.getInstance();

declare var global: {
  torrents: { [key: string]: Torrent };
  isDownloading: boolean;
};

if (!global.torrents) {
  global.torrents = {};
}

if (!global.isDownloading) {
  global.isDownloading = false;
}

export class Sync {
  doneLabelDelay = (util.config.props.doneLabelDelay || 0) * 1000;
  deluge: Deluge = new Deluge();
  sftp: SFTP = new SFTP();

  constructor() {}

  getTorrentCount(torrents: Object) {
    let count = 0;
    for (const tor in torrents) {
      if (torrents.hasOwnProperty(tor)) {
        ++count;
      }
    }
    return count;
  }

  sync(label: string, location: string, doneLabel: string, callback: Function) {
    Logs.writeMessage('Getting Torrents');

    this.deluge.getTorrents(label).then(
      (data) => {
        if (data && data.error === null && data.result.torrents) {
          const allTorrents = data.result.torrents;
          Logs.writeMessage(`${this.getTorrentCount(allTorrents)} torrents with label ${label}`, callback);
          for (const torrent in allTorrents) {
            if (torrent in global.torrents) {
              Logs.writeMessage(`${global.torrents[torrent].name} already being handled by another call. Skipping`, callback);
            } else {
              global.torrents[torrent] = new Torrent(
                allTorrents[torrent].progress === 100,
                this.isRemoteTorrentADirectory(allTorrents[torrent].name),
                allTorrents[torrent].name,
                allTorrents[torrent].save_path,
                util.config.props.rootDownloadFolder
              );

              if (!global.torrents[torrent].shouldDownload) {
                Logs.writeMessage(`${global.torrents[torrent].name} incomplete, waiting for torrent to complete`, callback);
                this.checkTorrentComplete(torrent);
              } else {
                Logs.writeMessage(`Torrent ready, adding ${allTorrents[torrent].name} to download`, callback);
              }
            }
          }

          Logs.writeMessage(`Starting Possible Download(s)`, callback, true);
          this.downloadNext();
        }
      },
      (error) => {
        return Logs.writeMessage(`error: ${error}`, callback, true);
      }
    );
  }

  isRemoteTorrentADirectory(torrentName) {
    if (torrentName) {
      const fileType = torrentName.split('.').pop();
      return fileTypes.indexOf(fileType) === -1;
    } else {
      return false;
    }
  }

  processDownload(torrentHash) {
    const item = global.torrents[torrentHash];
    global.isDownloading = true;

    // Check if we should even try downloading
    if (item.shouldDownload) {
      if (item.isDirectory === true) {
        this.sftp.addMirrorCommand(item.remotePath, util.config.props.rootDownloadFolder, item.name);
      } else {
        this.sftp.addPGetCommand(item.remotePath, item.name);
      }

      // Mark torrent as should not download, since we are executing on it
      global.torrents[torrentHash].shouldDownload = false;

      Logs.writeMessage(`Starting download for ${item.name}`);

      // Finally execute the command
      // this.ftps.exec(console.log);
      this.sftp.executeCommands((error, data) => {
        if (error) {
          Logs.writeMessage(error + ' ' + data.error + ' ' + data.data);
          global.isDownloading = false;
        } else {
          Logs.writeMessage('LFTP Response:');
          console.log(data);
          global.isDownloading = false;
          this.downloadNext();

          this.relabelTorrent(torrentHash, item.name, util.config.props.doneLabel)
            .then((relabled) => {
              if (relabled.error) {
                throw new Error(relabled.error);
              } else {
                Logs.writeMessage(`${item.name} label changed to ${util.config.props.doneLabel}`);
                delete global.torrents[torrentHash];
              }
            })
            .catch((err) => {
              Logs.writeError(`Re-label failed: ${err}`);
              Logs.writeError(err);
            });

          this.moveTorrentForProcessing(torrentHash, item.name);
          this.processTorrentFiles(torrentHash);

          // this.postDownloadHandling(item.name)
          //   .then(
          //     (postHandling) => {
          //       Logs.writeMessage(`Post download handling done: ${postHandling}`);
          //       this.moveTorrentForProcessing(torrentHash, item.name);
          //       this.processTorrentFiles(torrentHash);

          //     }
          //   )
          //   .catch((err) => {
          //     Logs.writeError(`Post download handling failed: ${err}`);
          //   });
        }
      });
    }
  }

  postDownloadHandling(torrentName) {
    return new Promise((resolve, reject) => {
      if (fs.statSync(util.config.props.nodeDownloadFolder + '/' + torrentName).isDirectory()) {
        Unrar.HandleFolder(util.config.props.nodeDownloadFolder + '/' + torrentName, (error, finished) => {
          if (error) {
            reject(error);
          } else {
            resolve(finished);
          }
        });
      } else {
        resolve(true);
      }
    });
  }

  relabelTorrent(torrentHash: string, torrentName: string, newLabel: string) {
    Logs.writeMessage(`Relabelling ${torrentName}`);
    return this.deluge.changeTorrentLabel(torrentHash, newLabel);
  }

  moveTorrentForProcessing(torrentHash: string, torrentName: string) {
    if (util.doesPathExist(`./${torrentHash}`)) {
      Logs.writeMessage(`Torrent ${torrentName} already has a folder in location; skipping move.`);
    } else {
      util.copyToNewDirectory(`./${torrentName}`, torrentHash);
    }
  }

  processTorrentFiles(torrentHash: string) {
    if (util.doesPathExist(`./${torrentHash}`)) {
      util.renameTVFiles(`./${torrentHash}`);
      util.restructureTVFiles(`./${torrentHash}`);
      util.copyAllToTVDestination(`./${torrentHash}`);
    } else {
      Logs.writeMessage(`Torrent hash ${torrentHash} folder does not exist to be processed`);
    }
  }

  // Method for just grabbing the next download and starting it if we are currently not downloading anything
  downloadNext() {
    // Check if we should try to download it immediately
    if (global.isDownloading === false) {
      const nextTorrentHash = this.getNextTorrent();
      if (nextTorrentHash) {
        this.processDownload(nextTorrentHash);
      }
    }
  }

  checkTorrentComplete(hash) {
    this.deluge.getSingleTorrent(hash).then(
      (data) => {
        if (data && data.result) {
          const currentTorrent = data.result;
          if (currentTorrent.progress === 100) {
            Logs.writeMessage(`${currentTorrent.name} now ready for download; addding to queue.`);
            global.torrents[hash].shouldDownload = true;

            this.downloadNext();
          } else {
            Logs.writeMessage(`${currentTorrent.name} still not ready, checking again in 15 seconds.`);
            setTimeout(() => {
              this.checkTorrentComplete(hash);
            }, 15000);
          }
        }
      },
      (error) => {
        return Logs.writeError(error);
      }
    );
  }

  getNextTorrent() {
    const keys = Object.keys(global.torrents);
    if (keys.length > 0) {
      return keys.filter((key) => {
        return global.torrents[key].shouldDownload === true;
      })[0];
    }
    return null;
  }
}
