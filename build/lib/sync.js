"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var lftp_1 = require("./lftp");
var fs = require("fs");
var deluge_1 = require("./deluge");
var torrent_model_1 = require("./torrent.model");
var unrar_1 = require("./unrar");
var logging_1 = require("../tools/logging");
var util_1 = require("../tools/util");
var util = util_1.default.getInstance();
if (!global.torrents) {
    global.torrents = {};
}
if (!global.isDownloading) {
    global.isDownloading = false;
}
var Sync = (function () {
    function Sync() {
        this.doneLabelDelay = (util.config.props.doneLabelDelay || 0) * 1000;
        this.deluge = new deluge_1.Deluge();
        this.sftp = new lftp_1.SFTP();
        this.unrar = new unrar_1.Unrar();
    }
    Sync.prototype.getTorrentCount = function (torrents) {
        var count = 0;
        for (var tor in torrents) {
            if (torrents.hasOwnProperty(tor)) {
                ++count;
            }
        }
        return count;
    };
    Sync.prototype.sync = function (label, location, doneLabel, callback) {
        var _this = this;
        logging_1.Logs.writeMessage('Getting Torrents');
        this.deluge.getTorrents(label).then(function (data) {
            if (data && data.error === null && data.result.torrents) {
                var allTorrents = data.result.torrents;
                logging_1.Logs.writeMessage(_this.getTorrentCount(allTorrents) + " torrents with label " + label, callback);
                for (var torrent in allTorrents) {
                    if (torrent in global.torrents) {
                        logging_1.Logs.writeMessage(global.torrents[torrent].name + " already being handled by another call. Skipping", callback);
                    }
                    else {
                        global.torrents[torrent] = new torrent_model_1.Torrent(allTorrents[torrent].progress === 100, _this.isRemoteTorrentADirectory(allTorrents[torrent].name), allTorrents[torrent].name, allTorrents[torrent].save_path, util.config.props.rootDownloadFolder);
                        if (!global.torrents[torrent].shouldDownload) {
                            logging_1.Logs.writeMessage(global.torrents[torrent].name + " incomplete, waiting for torrent to complete", callback);
                            _this.checkTorrentComplete(torrent);
                        }
                        else {
                            logging_1.Logs.writeMessage("Torrent ready, adding " + allTorrents[torrent].name + " to download", callback);
                        }
                    }
                }
                logging_1.Logs.writeMessage("Starting Possible Download(s)", callback, true);
                _this.downloadNext();
            }
        }, function (error) {
            return logging_1.Logs.writeMessage("error: " + error, callback, true);
        });
    };
    Sync.prototype.isRemoteTorrentADirectory = function (torrentName) {
        if (torrentName) {
            var fileType = torrentName.split('.').pop();
            return torrent_model_1.fileTypes.indexOf(fileType) === -1;
        }
        else {
            return false;
        }
    };
    Sync.prototype.processDownload = function (torrentHash) {
        var _this = this;
        var item = global.torrents[torrentHash];
        global.isDownloading = true;
        if (item.shouldDownload) {
            if (item.isDirectory === true) {
                this.sftp.addMirrorCommand(item.remotePath, util.config.props.rootDownloadFolder, item.name);
            }
            else {
                this.sftp.addPGetCommand(item.remotePath, item.name);
            }
            global.torrents[torrentHash].shouldDownload = false;
            logging_1.Logs.writeMessage("Starting download for " + item.name);
            this.sftp.executeCommands(function (error, data) {
                if (error) {
                    logging_1.Logs.writeMessage(error + ' ' + data.error + ' ' + data.data);
                }
                else {
                    logging_1.Logs.writeMessage('LFTP Response:');
                    console.log(data);
                    _this.postDownloadHandling(item.name)
                        .then(function (postHandling) {
                        logging_1.Logs.writeMessage("Post download handling done: " + postHandling);
                        return _this.relabelTorrent(torrentHash, item.name, util.config.props.doneLabel);
                    }, function (err) {
                        logging_1.Logs.writeError("Post download handling failed: " + err);
                        global.isDownloading = false;
                        _this.downloadNext();
                    })
                        .then(function (relabled) {
                        logging_1.Logs.writeMessage(item.name + " label changed to " + util.config.props.doneLabel);
                        global.isDownloading = false;
                        delete global.torrents[torrentHash];
                        _this.downloadNext();
                    }, function (err) {
                        logging_1.Logs.writeError("Re-label failed: " + err);
                        global.isDownloading = false;
                        _this.downloadNext();
                    });
                }
            });
        }
    };
    Sync.prototype.postDownloadHandling = function (torrentName) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            if (fs.statSync(util.config.props.nodeDownloadFolder + '/' + torrentName).isDirectory()) {
                _this.unrar.HandleFolder(util.config.props.nodeDownloadFolder + '/' + torrentName, function (error, finished) {
                    if (error) {
                        reject(error);
                    }
                    else {
                        resolve(finished);
                    }
                });
            }
            else {
                resolve(true);
            }
        });
    };
    Sync.prototype.relabelTorrent = function (torrentHash, torrentName, newLabel) {
        logging_1.Logs.writeMessage("Relabelling " + torrentName);
        return this.deluge.changeTorrentLabel(torrentHash, newLabel);
    };
    Sync.prototype.downloadNext = function () {
        if (global.isDownloading === false) {
            var nextTorrentHash = this.getNextTorrent();
            if (nextTorrentHash) {
                this.processDownload(nextTorrentHash);
            }
        }
    };
    Sync.prototype.checkTorrentComplete = function (hash) {
        var _this = this;
        this.deluge.getSingleTorrent(hash).then(function (data) {
            if (data && data.result) {
                var currentTorrent = data.result;
                if (currentTorrent.progress === 100) {
                    logging_1.Logs.writeMessage(currentTorrent.name + " now ready for download; addding to queue.");
                    global.torrents[hash].shouldDownload = true;
                    _this.downloadNext();
                }
                else {
                    logging_1.Logs.writeMessage(currentTorrent.name + " still not ready, checking again in 15 seconds.");
                    setTimeout(function () {
                        _this.checkTorrentComplete(hash);
                    }, 15000);
                }
            }
        }, function (error) {
            return logging_1.Logs.writeError(error);
        });
    };
    Sync.prototype.getNextTorrent = function () {
        var keys = Object.keys(global.torrents);
        if (keys.length > 0) {
            return keys.filter(function (key) {
                return global.torrents[key].shouldDownload === true;
            })[0];
        }
        return null;
    };
    return Sync;
}());
exports.Sync = Sync;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3luYy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL2FwcC9saWIvc3luYy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLCtCQUE4QjtBQUM5Qix1QkFBeUI7QUFDekIsbUNBQWtDO0FBQ2xDLGlEQUFxRDtBQUNyRCxpQ0FBZ0M7QUFDaEMsNENBQXdDO0FBQ3hDLHNDQUFzQztBQUN0QyxJQUFNLElBQUksR0FBRyxjQUFTLENBQUMsV0FBVyxFQUFFLENBQUM7QUFPckMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxRQUFRLEVBQUU7SUFDcEIsTUFBTSxDQUFDLFFBQVEsR0FBRyxFQUFFLENBQUM7Q0FDdEI7QUFFRCxJQUFJLENBQUMsTUFBTSxDQUFDLGFBQWEsRUFBRTtJQUN6QixNQUFNLENBQUMsYUFBYSxHQUFHLEtBQUssQ0FBQztDQUM5QjtBQUVEO0lBTUU7UUFMQSxtQkFBYyxHQUFHLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsY0FBYyxJQUFJLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQztRQUNoRSxXQUFNLEdBQVcsSUFBSSxlQUFNLEVBQUUsQ0FBQztRQUM5QixTQUFJLEdBQVMsSUFBSSxXQUFJLEVBQUUsQ0FBQztRQUN4QixVQUFLLEdBQVUsSUFBSSxhQUFLLEVBQUUsQ0FBQztJQUczQixDQUFDO0lBRUQsOEJBQWUsR0FBZixVQUFnQixRQUFnQjtRQUM5QixJQUFJLEtBQUssR0FBRyxDQUFDLENBQUM7UUFDZCxLQUFLLElBQU0sR0FBRyxJQUFJLFFBQVEsRUFBRTtZQUMxQixJQUFJLFFBQVEsQ0FBQyxjQUFjLENBQUMsR0FBRyxDQUFDLEVBQUU7Z0JBQ2hDLEVBQUUsS0FBSyxDQUFDO2FBQ1Q7U0FDRjtRQUNELE9BQU8sS0FBSyxDQUFDO0lBQ2YsQ0FBQztJQUVELG1CQUFJLEdBQUosVUFBSyxLQUFhLEVBQUUsUUFBZ0IsRUFBRSxTQUFpQixFQUFFLFFBQWtCO1FBQTNFLGlCQXFDQztRQXBDQyxjQUFJLENB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QztpQkFDckI7cUJBQU07b0JBQ0wsY0FBSSxDQUFDLFlBQVksQ0FBSSxjQUFjLENBQUMsSUFBSSxvREFBaUQsQ0FBQyxDQUFDO29CQUMzRixVQUFVLENBQUM7d0JBQ1QsS0FBSSxDQUFDLG9CQUFvQixDQUFDLElBQUksQ0FBQyxDQUFDO29CQUNsQyxDQUFDLEVBQUUsS0FBSyxDQUFDLENBQUM7aUJBQ1g7YUFDRjtRQUNILENBQUMsRUFDRCxVQUFDLEtBQUs7WUFDSixPQUFPLGNBQUksQ0FBQyxVQUFVLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDaEMsQ0FBQyxDQUNGLENBQUM7SUFDSixDQUFDO0lBRUQsNkJBQWMsR0FBZDtRQUNFLElBQU0sSUFBSSxHQUFHLE1BQU0sQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBQzFDLElBQUksSUFBSSxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUU7WUFDbkIsT0FBTyxJQUFJLENBQUMsTUFBTSxDQUFDLFVBQUMsR0FBRztnQkFDckIsT0FBTyxNQUFNLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxDQUFDLGNBQWMsS0FBSyxJQUFJLENBQUM7WUFDdEQsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7U0FDUDtRQUNELE9BQU8sSUFBSSxDQUFDO0lBQ2QsQ0FBQztJQUNILFdBQUM7QUFBRCxDQUFDLEFBN0xELElBNkxDO0FBN0xZLG9CQUFJIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgU0ZUUCB9IGZyb20gJy4vbGZ0cCc7XHJcbmltcG9ydCAqIGFzIGZzIGZyb20gJ2ZzJztcclxuaW1wb3J0IHsgRGVsdWdlIH0gZnJvbSAnLi9kZWx1Z2UnO1xyXG5pbXBvcnQgeyBUb3JyZW50LCBmaWxlVHlwZXMgfSBmcm9tICcuL3RvcnJlbnQubW9kZWwnO1xyXG5pbXBvcnQgeyBVbnJhciB9IGZyb20gJy4vdW5yYXInO1xyXG5pbXBvcnQgeyBMb2dzIH0gZnJvbSAnLi4vdG9vbHMvbG9nZ2luZyc7XHJcbmltcG9ydCB1dGlsaXRpZXMgZnJvbSAnLi4vdG9vbHMvdXRpbCc7XHJcbmNvbnN0IHV0aWwgPSB1dGlsaXRpZXMuZ2V0SW5zdGFuY2UoKTtcclxuXHJcbmRlY2xhcmUgdmFyIGdsb2JhbDoge1xyXG4gIHRvcnJlbnRzOiB7IFtrZXk6IHN0cmluZ106IFRvcnJlbnQgfTtcclxuICBpc0Rvd25sb2FkaW5nOiBib29sZWFuO1xyXG59O1xyXG5cclxuaWYgKCFnbG9iYWwudG9ycmVudHMpIHtcclxuICBnbG9iYWwudG9ycmVudHMgPSB7fTtcclxufVxyXG5cclxuaWYgKCFnbG9iYWwuaXNEb3dubG9hZGluZykge1xyXG4gIGdsb2JhbC5pc0Rvd25sb2FkaW5nID0gZmFsc2U7XHJcbn1cclxuXHJcbmV4cG9ydCBjbGFzcyBTeW5jIHtcclxuICBkb25lTGFiZWxEZWxheSA9ICh1dGlsLmNvbmZpZy5wcm9wcy5kb25lTGFiZWxEZWxheSB8fCAwKSAqIDEwMDA7XHJcbiAgZGVsdWdlOiBEZWx1Z2UgPSBuZXcgRGVsdWdlKCk7XHJcbiAgc2Z0cDogU0ZUUCA9IG5ldyBTRlRQKCk7XHJcbiAgdW5yYXI6IFVucmFyID0gbmV3IFVucmFyKCk7XHJcblxyXG4gIGNvbnN0cnVjdG9yKCkge1xyXG4gIH1cclxuXHJcbiAgZ2V0VG9ycmVudENvdW50KHRvcnJlbnRzOiBPYmplY3QpIHtcclxuICAgIGxldCBjb3VudCA9IDA7XHJcbiAgICBmb3IgKGNvbnN0IHRvciBpbiB0b3JyZW50cykge1xyXG4gICAgICBpZiAodG9ycmVudHMuaGFzT3duUHJvcGVydHkodG9yKSkge1xyXG4gICAgICAgICsrY291bnQ7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICAgIHJldHVybiBjb3VudDtcclxuICB9XHJcblxyXG4gIHN5bmMobGFiZWw6IHN0cmluZywgbG9jYXRpb246IHN0cmluZywgZG9uZUxhYmVsOiBzdHJpbmcsIGNhbGxiYWNrOiBGdW5jdGlvbikge1xyXG4gICAgTG9ncy53cml0ZU1lc3NhZ2UoJ0dldHRpbmcgVG9ycmVudHMnKTtcclxuXHJcbiAgICB0aGlzLmRlbHVnZS5nZXRUb3JyZW50cyhsYWJlbCkudGhlbihcclxuICAgICAgKGRhdGEpID0+IHtcclxuICAgICAgICBpZiAoZGF0YSAmJiBkYXRhLmVycm9yID09PSBudWxsICYmIGRhdGEucmVzdWx0LnRvcnJlbnRzKSB7XHJcbiAgICAgICAgICBjb25zdCBhbGxUb3JyZW50cyA9IGRhdGEucmVzdWx0LnRvcnJlbnRzO1xyXG4gICAgICAgICAgTG9ncy53cml0ZU1lc3NhZ2UoYCR7dGhpcy5nZXRUb3JyZW50Q291bnQoYWxsVG9ycmVudHMpfSB0b3JyZW50cyB3aXRoIGxhYmVsICR7bGFiZWx9YCwgY2FsbGJhY2spO1xyXG4gICAgICAgICAgZm9yIChjb25zdCB0b3JyZW50IGluIGFsbFRvcnJlbnRzKSB7XHJcbiAgICAgICAgICAgIGlmICh0b3JyZW50IGluIGdsb2JhbC50b3JyZW50cykge1xyXG4gICAgICAgICAgICAgIExvZ3Mud3JpdGVNZXNzYWdlKGAke2dsb2JhbC50b3JyZW50c1t0b3JyZW50XS5uYW1lfSBhbHJlYWR5IGJlaW5nIGhhbmRsZWQgYnkgYW5vdGhlciBjYWxsLiBTa2lwcGluZ2AsIGNhbGxiYWNrKTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICBnbG9iYWwudG9ycmVudHNbdG9ycmVudF0gPSBuZXcgVG9ycmVudChcclxuICAgICAgICAgICAgICAgIGFsbFRvcnJlbnRzW3RvcnJlbnRdLnByb2dyZXNzID09PSAxMDAsXHJcbiAgICAgICAgICAgICAgICB0aGlzLmlzUmVtb3RlVG9ycmVudEFEaXJlY3RvcnkoYWxsVG9ycmVudHNbdG9ycmVudF0ubmFtZSksXHJcbiAgICAgICAgICAgICAgICBhbGxUb3JyZW50c1t0b3JyZW50XS5uYW1lLFxyXG4gICAgICAgICAgICAgICAgYWxsVG9ycmVudHNbdG9ycmVudF0uc2F2ZV9wYXRoLFxyXG4gICAgICAgICAgICAgICAgdXRpbC5jb25maWcucHJvcHMucm9vdERvd25sb2FkRm9sZGVyXHJcbiAgICAgICAgICAgICAgKTtcclxuXHJcbiAgICAgICAgICAgICAgaWYgKCFnbG9iYWwudG9ycmVudHNbdG9ycmVudF0uc2hvdWxkRG93bmxvYWQpIHtcclxuICAgICAgICAgICAgICAgIExvZ3Mud3JpdGVNZXNzYWdlKGAke2dsb2JhbC50b3JyZW50c1t0b3JyZW50XS5uYW1lfSBpbmNvbXBsZXRlLCB3YWl0aW5nIGZvciB0b3JyZW50IHRvIGNvbXBsZXRlYCwgY2FsbGJhY2spO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5jaGVja1RvcnJlbnRDb21wbGV0ZSh0b3JyZW50KTtcclxuICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgTG9ncy53cml0ZU1lc3NhZ2UoYFRvcnJlbnQgcmVhZHksIGFkZGluZyAke2FsbFRvcnJlbnRzW3RvcnJlbnRdLm5hbWV9IHRvIGRvd25sb2FkYCwgY2FsbGJhY2spO1xyXG4gICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfVxyXG5cclxuICAgICAgICAgIExvZ3Mud3JpdGVNZXNzYWdlKGBTdGFydGluZyBQb3NzaWJsZSBEb3dubG9hZChzKWAsIGNhbGxiYWNrLCB0cnVlKTtcclxuICAgICAgICAgIHRoaXMuZG93bmxvYWROZXh0KCk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9LFxyXG4gICAgICAoZXJyb3IpID0+IHtcclxuICAgICAgICByZXR1cm4gTG9ncy53cml0ZU1lc3NhZ2UoYGVycm9yOiAke2Vycm9yfWAsIGNhbGxiYWNrLCB0cnVlKTtcclxuICAgICAgfVxyXG4gICAgKTtcclxuICB9XHJcblxyXG4gIGlzUmVtb3RlVG9ycmVudEFEaXJlY3RvcnkodG9ycmVudE5hbWUpIHtcclxuICAgIGlmICh0b3JyZW50TmFtZSkge1xyXG4gICAgICBjb25zdCBmaWxlVHlwZSA9IHRvcnJlbnROYW1lLnNwbGl0KCcuJykucG9wKCk7XHJcbiAgICAgIHJldHVybiBmaWxlVHlwZXMuaW5kZXhPZihmaWxlVHlwZSkgPT09IC0xO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgcHJvY2Vzc0Rvd25sb2FkKHRvcnJlbnRIYXNoKSB7XHJcbiAgICBjb25zdCBpdGVtID0gZ2xvYmFsLnRvcnJlbnRzW3RvcnJlbnRIYXNoXTtcclxuICAgIGdsb2JhbC5pc0Rvd25sb2FkaW5nID0gdHJ1ZTtcclxuXHJcbiAgICAvLyBDaGVjayBpZiB3ZSBzaG91bGQgZXZlbiB0cnkgZG93bmxvYWRpbmdcclxuICAgIGlmIChpdGVtLnNob3VsZERvd25sb2FkKSB7XHJcbiAgICAgIGlmIChpdGVtLmlzRGlyZWN0b3J5ID09PSB0cnVlKSB7XHJcbiAgICAgICAgdGhpcy5zZnRwLmFkZE1pcnJvckNvbW1hbmQoaXRlbS5yZW1vdGVQYXRoLCB1dGlsLmNvbmZpZy5wcm9wcy5yb290RG93bmxvYWRGb2xkZXIsIGl0ZW0ubmFtZSk7XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgdGhpcy5zZnRwLmFkZFBHZXRDb21tYW5kKGl0ZW0ucmVtb3RlUGF0aCwgaXRlbS5uYW1lKTtcclxuICAgICAgfVxyXG5cclxuICAgICAgLy8gTWFyayB0b3JyZW50IGFzIHNob3VsZCBub3QgZG93bmxvYWQsIHNpbmNlIHdlIGFyZSBleGVjdXRpbmcgb24gaXRcclxuICAgICAgZ2xvYmFsLnRvcnJlbnRzW3RvcnJlbnRIYXNoXS5zaG91bGREb3dubG9hZCA9IGZhbHNlO1xyXG5cclxuICAgICAgTG9ncy53cml0ZU1lc3NhZ2UoYFN0YXJ0aW5nIGRvd25sb2FkIGZvciAke2l0ZW0ubmFtZX1gKTtcclxuXHJcbiAgICAgIC8vIEZpbmFsbHkgZXhlY3V0ZSB0aGUgY29tbWFuZFxyXG4gICAgICAvLyB0aGlzLmZ0cHMuZXhlYyhjb25zb2xlLmxvZyk7XHJcbiAgICAgIHRoaXMuc2Z0cC5leGVjdXRlQ29tbWFuZHMoKGVycm9yLCBkYXRhKSA9PiB7XHJcbiAgICAgICAgaWYgKGVycm9yKSB7XHJcbiAgICAgICAgICBMb2dzLndyaXRlTWVzc2FnZShlcnJvciArICcgJyArIGRhdGEuZXJyb3IgKyAnICcgKyBkYXRhLmRhdGEpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICBMb2dzLndyaXRlTWVzc2FnZSgnTEZUUCBSZXNwb25zZTonKTtcclxuICAgICAgICAgIGNvbnNvbGUubG9nKGRhdGEpO1xyXG4gICAgICAgICAgLy8gTG9ncy53cml0ZU1lc3NhZ2UoZGF0YS5kYXRhKTtcclxuXHJcbiAgICAgICAgICB0aGlzLnBvc3REb3dubG9hZEhhbmRsaW5nKGl0ZW0ubmFtZSlcclxuICAgICAgICAgICAgLnRoZW4oXHJcbiAgICAgICAgICAgICAgKHBvc3RIYW5kbGluZykgPT4ge1xyXG4gICAgICAgICAgICAgICAgTG9ncy53cml0ZU1lc3NhZ2UoYFBvc3QgZG93bmxvYWQgaGFuZGxpbmcgZG9uZTogJHtwb3N0SGFuZGxpbmd9YCk7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5yZWxhYmVsVG9ycmVudCh0b3JyZW50SGFzaCwgaXRlbS5uYW1lLCB1dGlsLmNvbmZpZy5wcm9wcy5kb25lTGFiZWwpO1xyXG4gICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgKGVycikgPT4ge1xyXG4gICAgICAgICAgICAgICAgTG9ncy53cml0ZUVycm9yKGBQb3N0IGRvd25sb2FkIGhhbmRsaW5nIGZhaWxlZDogJHtlcnJ9YCk7XHJcbiAgICAgICAgICAgICAgICBnbG9iYWwuaXNEb3dubG9hZGluZyA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5kb3dubG9hZE5leHQoKTtcclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIClcclxuICAgICAgICAgICAgLnRoZW4oXHJcbiAgICAgICAgICAgICAgKHJlbGFibGVkKSA9PiB7XHJcbiAgICAgICAgICAgICAgICBMb2dzLndyaXRlTWVzc2FnZShgJHtpdGVtLm5hbWV9IGxhYmVsIGNoYW5nZWQgdG8gJHt1dGlsLmNvbmZpZy5wcm9wcy5kb25lTGFiZWx9YCk7XHJcbiAgICAgICAgICAgICAgICBnbG9iYWwuaXNEb3dubG9hZGluZyA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgZGVsZXRlIGdsb2JhbC50b3JyZW50c1t0b3JyZW50SGFzaF07XHJcbiAgICAgICAgICAgICAgICB0aGlzLmRvd25sb2FkTmV4dCgpO1xyXG4gICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgKGVycikgPT4ge1xyXG4gICAgICAgICAgICAgICAgTG9ncy53cml0ZUVycm9yKGBSZS1sYWJlbCBmYWlsZWQ6ICR7ZXJyfWApO1xyXG4gICAgICAgICAgICAgICAgZ2xvYmFsLmlzRG93bmxvYWRpbmcgPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgIHRoaXMuZG93bmxvYWROZXh0KCk7XHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICApO1xyXG4gICAgICAgIH1cclxuICAgICAgfSk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBwb3N0RG93bmxvYWRIYW5kbGluZyh0b3JyZW50TmFtZSkge1xyXG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcclxuICAgICAgaWYgKGZzLnN0YXRTeW5jKHV0aWwuY29uZmlnLnByb3BzLm5vZGVEb3dubG9hZEZvbGRlciArICcvJyArIHRvcnJlbnROYW1lKS5pc0RpcmVjdG9yeSgpKSB7XHJcbiAgICAgICAgdGhpcy51bnJhci5IYW5kbGVGb2xkZXIodXRpbC5jb25maWcucHJvcHMubm9kZURvd25sb2FkRm9sZGVyICsgJy8nICsgdG9ycmVudE5hbWUsIChlcnJvciwgZmluaXNoZWQpID0+IHtcclxuICAgICAgICAgIGlmIChlcnJvcikge1xyXG4gICAgICAgICAgICByZWplY3QoZXJyb3IpO1xyXG4gICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgcmVzb2x2ZShmaW5pc2hlZCk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgcmVzb2x2ZSh0cnVlKTtcclxuICAgICAgfVxyXG4gICAgfSk7XHJcbiAgfVxyXG5cclxuICByZWxhYmVsVG9ycmVudCh0b3JyZW50SGFzaDogc3RyaW5nLCB0b3JyZW50TmFtZTogc3RyaW5nLCBuZXdMYWJlbDogc3RyaW5nKSB7XHJcbiAgICBMb2dzLndyaXRlTWVzc2FnZShgUmVsYWJlbGxpbmcgJHt0b3JyZW50TmFtZX1gKTtcclxuICAgIHJldHVybiB0aGlzLmRlbHVnZS5jaGFuZ2VUb3JyZW50TGFiZWwodG9ycmVudEhhc2gsIG5ld0xhYmVsKTtcclxuICB9XHJcblxyXG4gIC8vIE1ldGhvZCBmb3IganVzdCBncmFiYmluZyB0aGUgbmV4dCBkb3dubG9hZCBhbmQgc3RhcnRpbmcgaXQgaWYgd2UgYXJlIGN1cnJlbnRseSBub3QgZG93bmxvYWRpbmcgYW55dGhpbmdcclxuICBkb3dubG9hZE5leHQoKSB7XHJcbiAgICAvLyBDaGVjayBpZiB3ZSBzaG91bGQgdHJ5IHRvIGRvd25sb2FkIGl0IGltbWVkaWF0ZWx5XHJcbiAgICBpZiAoZ2xvYmFsLmlzRG93bmxvYWRpbmcgPT09IGZhbHNlKSB7XHJcbiAgICAgIGNvbnN0IG5leHRUb3JyZW50SGFzaCA9IHRoaXMuZ2V0TmV4dFRvcnJlbnQoKTtcclxuICAgICAgaWYgKG5leHRUb3JyZW50SGFzaCkge1xyXG4gICAgICAgIHRoaXMucHJvY2Vzc0Rvd25sb2FkKG5leHRUb3JyZW50SGFzaCk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9XHJcblxyXG4gIGNoZWNrVG9ycmVudENvbXBsZXRlKGhhc2gpIHtcclxuICAgIHRoaXMuZGVsdWdlLmdldFNpbmdsZVRvcnJlbnQoaGFzaCkudGhlbihcclxuICAgICAgKGRhdGEpID0+IHtcclxuICAgICAgICBpZiAoZGF0YSAmJiBkYXRhLnJlc3VsdCkge1xyXG4gICAgICAgICAgY29uc3QgY3VycmVudFRvcnJlbnQgPSBkYXRhLnJlc3VsdDtcclxuICAgICAgICAgIGlmIChjdXJyZW50VG9ycmVudC5wcm9ncmVzcyA9PT0gMTAwKSB7XHJcbiAgICAgICAgICAgIExvZ3Mud3JpdGVNZXNzYWdlKGAke2N1cnJlbnRUb3JyZW50Lm5hbWV9IG5vdyByZWFkeSBmb3IgZG93bmxvYWQ7IGFkZGRpbmcgdG8gcXVldWUuYCk7XHJcbiAgICAgICAgICAgIGdsb2JhbC50b3JyZW50c1toYXNoXS5zaG91bGREb3dubG9hZCA9IHRydWU7XHJcblxyXG4gICAgICAgICAgICB0aGlzLmRvd25sb2FkTmV4dCgpO1xyXG4gICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgTG9ncy53cml0ZU1lc3NhZ2UoYCR7Y3VycmVudFRvcnJlbnQubmFtZX0gc3RpbGwgbm90IHJlYWR5LCBjaGVja2luZyBhZ2FpbiBpbiAxNSBzZWNvbmRzLmApO1xyXG4gICAgICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHtcclxuICAgICAgICAgICAgICB0aGlzLmNoZWNrVG9ycmVudENvbXBsZXRlKGhhc2gpO1xyXG4gICAgICAgICAgICB9LCAxNTAwMCk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICB9LFxyXG4gICAgICAoZXJyb3IpID0+IHtcclxuICAgICAgICByZXR1cm4gTG9ncy53cml0ZUVycm9yKGVycm9yKTtcclxuICAgICAgfVxyXG4gICAgKTtcclxuICB9XHJcblxyXG4gIGdldE5leHRUb3JyZW50KCkge1xyXG4gICAgY29uc3Qga2V5cyA9IE9iamVjdC5rZXlzKGdsb2JhbC50b3JyZW50cyk7XHJcbiAgICBpZiAoa2V5cy5sZW5ndGggPiAwKSB7XHJcbiAgICAgIHJldHVybiBrZXlzLmZpbHRlcigoa2V5KSA9PiB7XHJcbiAgICAgICAgcmV0dXJuIGdsb2JhbC50b3JyZW50c1trZXldLnNob3VsZERvd25sb2FkID09PSB0cnVlO1xyXG4gICAgICB9KVswXTtcclxuICAgIH1cclxuICAgIHJldHVybiBudWxsO1xyXG4gIH1cclxufVxyXG4iXX0=