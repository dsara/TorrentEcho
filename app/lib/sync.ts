import { SFTP } from './lftp';
import * as fs from 'fs';
import { Deluge } from './deluge';
import { Torrent, fileTypes } from './torrent.model';
import { Unrar } from './unrar';
import { Logs } from '../tools/logging';
import utilities from '../tools/util';
import { DelugeGeneralResult } from './deluge.model';
import { RTorrent } from './rtorrent';
import { RTorrentData } from '../tools/rtorrent.model';
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
  // deluge: Deluge = new Deluge();
  rtorrent: RTorrent = new RTorrent();
  sftp: SFTP = new SFTP();

  constructor() {}

  sync(label: string, location: string, doneLabel: string, callback: Function) {
    Logs.writeMessage('Getting Torrents');

    this.rtorrent.getTorrents(label).then(
      (data) => {
        if (data.length > 0) {
          const allTorrents = data;
          Logs.writeMessage(`${allTorrents.length} torrents with label ${label}`, callback);
          for (const torrent of allTorrents) {
            if (torrent.hash in global.torrents) {
              Logs.writeMessage(`${global.torrents[torrent.hash].name} already being handled by another call. Skipping`, callback);
            } else {
              global.torrents[torrent.hash] = new Torrent(
                torrent.complete,
                torrent.isMultiFile,
                torrent.torrentName,
                torrent.path,
                util.config.props.rootDownloadFolder
              );

              if (!global.torrents[torrent.hash].shouldDownload) {
                Logs.writeMessage(`${global.torrents[torrent.hash].name} incomplete, waiting for torrent to complete`, callback);
                this.checkTorrentComplete(torrent);
              } else {
                Logs.writeMessage(`Torrent ready, adding ${torrent.torrentName} to download`, callback);
              }
            }
          }

          Logs.writeMessage(`Starting Possible Download(s)`, callback, true);
          this.downloadNext();
        } else {
          Logs.writeMessage(`No torrents match`, callback, true);
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
            .then((relabled: boolean) => {
              Logs.writeMessage(`${item.name} label changed to ${util.config.props.doneLabel}`);
              delete global.torrents[torrentHash];
            })
            .catch((err) => {
              Logs.writeError(`Re-label failed: ${err}`);
              Logs.writeError(err);
            });

          this.moveTorrentForProcessing(torrentHash, item.name);
          this.processTorrentFiles(torrentHash);
        }
      });
    }
  }

  relabelTorrent(torrentHash: string, torrentName: string, newLabel: string) {
    Logs.writeMessage(`Relabelling ${torrentName} with hash ${torrentHash} and new label of ${newLabel}`);
    return this.rtorrent.changeTorrentLabel(torrentHash, newLabel)
      .catch(err => {
        Logs.writeError(`Torrent ${torrentName} failed on relabeling: ${err}`);
      });
  }

  moveTorrentForProcessing(torrentHash: string, torrentName: string) {
    try {
      if (util.doesPathExist(`./${torrentHash}`)) {
        Logs.writeMessage(`Torrent ${torrentName} already has a folder in location; skipping move.`);
      } else {
        util.copyToNewDirectory(`./${torrentName}`, torrentHash);
      }
    } catch (err) {
      Logs.writeError(`Torrent ${torrentName} failed at move for processing: ${err}`);
    }
  }

  processTorrentFiles(torrentHash: string) {
    if (util.doesPathExist(`./${torrentHash}`)) {
      try {
        util.renameTVFiles(`./${torrentHash}`);
        util.restructureTVFiles(`./${torrentHash}`);
        util.copyAllToTVDestination(`./${torrentHash}`);
      } catch (err) {
        Logs.writeError(`Torrent hash ${torrentHash} has failed in post processing: ${err}`);
      }
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

  checkTorrentComplete(torrent: RTorrentData) {
    this.rtorrent.isTorrentDone(torrent.hash).then(
      (isComplete) => {
        if (isComplete) {
          Logs.writeMessage(`${torrent.torrentName} now ready for download; addding to queue.`);
          global.torrents[torrent.hash].shouldDownload = true;

          this.downloadNext();
        } else {
          Logs.writeMessage(`${torrent.torrentName} still not ready, checking again in 15 seconds.`);
          setTimeout(() => {
            this.checkTorrentComplete(torrent);
          }, 15000);
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
