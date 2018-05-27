var FTPS = require('./lftp');
var fs = require('fs');
var Deluge = require('./deluge');
var Torrent = require('../model/torrent')
var Unrar = require('./unrar');
var logs = require('./logs');

if (!global.torrents) {
    global.torrents = [];
}

if (!global.isDownloading) {
    global.isDownloading = false;
}

module.exports = class Sync {
    constructor(config) {
        this.config = config;
        this.doneLabel = config.doneLabel;
        this.doneLabelDelay = (config.doneLabelDelay || 0) * 1000;
        this.verboseLogging = config.verboseLogging || false;
        this.nodeDownloadFolder = config.nodeDownloadFolder;
        this.rootDownloadFolder = config.rootDownloadFolder;

        this.deluge = new Deluge(config);

        const pgetCommand = 'set mirror:use-pget-n ' + config.pget + ';set pget:default-n ' + config.pget + ';set net:limit-total-rate 29360128:0';
        const tempCommand = 'set xfer:use-temp-file true;set xfer:temp-file-name *.tmp;set xfer:destination-directory ' + this.rootDownloadFolder;

        this.fileTypes = [
            "mkv",
            "avi",
            "mov",
            "mp4",
            "m4p",
            "mpeg",
            "mpg"
        ]

        this.ftps = new FTPS({
            host: config.host,
            username: config.user,
            password: config.pass,
            port: config.port,
            retries: 2,
            retryInterval: 10,
            protocol: 'sftp',
            autoConfirm: true,
            additionalLftpCommands: pgetCommand + ';' + tempCommand
        });

        this.unrar = new Unrar(config);
    }

    getTorrentCount(torrents) {
        let count = 0;
        for (let tor in torrents) {
            if (torrents.hasOwnProperty(tor)) {
                ++count;
            }
        }
        return count;
    }

    sync(label, location, doneLabel, callback) {
        logs.writeMessage("Getting Torrents");

        this.deluge.getTorrents(label)
            .then((data) => {
                if (data && data.error === null && data.result.torrents) {
                    var allTorrents = data.result.torrents;
                    logs.writeMessage(this.getTorrentCount(allTorrents) + " torrents with label " + label, callback);
                    for (var torrent in allTorrents) {
                        if (torrent in global.torrents) {
                            logs.writeMessage(global.torrents[torrent].Name + " already being handled by another call. Skipping", callback);
                        } else {
                            global.torrents[torrent] = new Torrent(allTorrents[torrent].progress === 100, this.isRemoteTorrentADirectory(allTorrents[torrent].name) ,allTorrents[torrent].name, allTorrents[torrent].save_path, this.rootDownloadFolder);

                            if (!global.torrents[torrent].ShouldDownload) {
                                logs.writeMessage(global.torrents[torrent] + " incomplete, waiting for torrent to complete", callback);
                                this.checkTorrentComplete(torrent);
                            } else {
                                logs.writeMessage("Torrent ready, adding " + allTorrents[torrent].name + " to download", callback);
                            }
                        }
                    }

                    logs.writeMessage("Starting Possible Download(s)", callback, true);
                    this.downloadNext();
                }

            }, (error) => {
                return logs.writeMessage('error: ', error);
            });
    }

    isRemoteTorrentADirectory(torrentName) {
        if (torrentName) {
            let fileType = torrentName.split('.').pop();
            return this.fileTypes.indexOf(fileType) === -1
        } else {
            return false;
        }
    }

    processDownload(torrentHash) {
        var item = global.torrents[torrentHash];
        global.isDownloading = true;

        // Check if we should even try downloading
        if (item.ShouldDownload) {
            if (item.IsDirectory == true) {
                var mirrorCommand = this.ftps.mirrorTorrent(item.RemotePath, this.rootDownloadFolder, item.Name);

            } else { // Otherwise use pget
                // let command = ('pget -c ' + this.ftps.escapeshell(item.RemotePath + "/" + item.Name));
                // this.ftps.raw(command);
                let pgetCommand = this.ftps.pget(item.RemotePath, item.Name);

            }

            // Mark torrent as should not download, since we are executing on it
            global.torrents[torrentHash].ShouldDownload = false;

            logs.writeMessage("Starting download for " + item.Name);

            // Finally execute the command
            // this.ftps.exec(console.log);
            this.ftps.exec((error, data) => {
                if (error) {
                    logs.writeMessage(error + " " + data.error + " " + data.data);
                } else {
                    logs.writeMessage("LFTP Response:");
                    console.log(data);
                    // logs.writeMessage(data.data);

                    this.postDownloadHandling(item.Name)
                        .then((postHandling) => {
                            logs.writeMessage("Post download handling done: " + postHandling);
                            return this.relabelTorrent(torrentHash, item.Name, this.doneLabel);
                        }, (error) => {
                            logs.writeError("Post download handling failed: " + error);
                            global.isDownloading = false;
                            this.downloadNext();
                        })
                        .then((relabled) => {
                            logs.writeMessage(item.Name + ' label changed to ' + this.doneLabel)
                            global.isDownloading = false;
                            delete global.torrents[torrentHash];
                            this.downloadNext();
                        }, (error) => {
                            logs.writeError("Re-label failed: " + error);
                            global.isDownloading = false;
                            this.downloadNext();
                        });
                }
            });
        }
    }

    postDownloadHandling(torrentName) {
        return new Promise((resolve, reject) => {
            if (fs.statSync(this.nodeDownloadFolder + "/" + torrentName).isDirectory()) {
                this.unrar.HandleFolder(this.nodeDownloadFolder + "/" + torrentName, (error, finished) => {
                    if (error) {
                        reject(error);
                    } else {
                        resolve(finished)
                    }
                });
            } else {
                resolve(true);
            }
        });
    }


    /**
     * @param {string} torrentHash Hash of torrent
     * @param {string} torrentName Name of torrent
     * @param {string} newLabel New label to assign to finished torrent
     */
    relabelTorrent(torrentHash, torrentName, newLabel) {
        logs.writeMessage("Relabelling " + torrentName);
        return this.deluge.changeTorrentLabel(torrentHash, newLabel);
    }

    // Method for just grabbing the next download and starting it if we are currently not downloading anything
    downloadNext() {
        // Check if we should try to download it immediately
        if (global.isDownloading == false) {
            var nextTorrentHash = this.getNextTorrent();
            if (nextTorrentHash) {
                this.processDownload(nextTorrentHash);
            }
        }
    }

    checkTorrentComplete(hash) {
        this.deluge.getSingleTorrent(hash)
            .then((data) => {
                if (data && data.result) {
                    let currentTorrent = data.result;
                    if (currentTorrent.progress === 100) {
                        logs.writeMessage(currentTorrent.name + ' now ready for download; addding to queue.');
                        global.torrents[hash].ShouldDownload = true;

                        this.downloadNext();
                    } else {
                        logs.writeMessage(currentTorrent.name + ' still not ready, checking again in 15 seconds');
                        setTimeout(() => {
                            this.checkTorrentComplete(hash);
                        }, 15000);
                    }
                }
            }, (error) => {
                return logs.writeError(error);
            });
    }

    getNextTorrent() {
        var keys = Object.keys(global.torrents);
        if (keys.length > 0) {
            return keys.filter((key) => {
                return global.torrents[key].ShouldDownload == true;
            })[0];
        }
        return null;
    }
}