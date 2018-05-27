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
    global.torrents = undefined;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3luYy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL2FwcC9saWIvc3luYy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLCtCQUE4QjtBQUM5Qix1QkFBeUI7QUFDekIsbUNBQWtDO0FBQ2xDLGlEQUFxRDtBQUNyRCxpQ0FBZ0M7QUFDaEMsNENBQXdDO0FBQ3hDLHNDQUFzQztBQUN0QyxJQUFNLElBQUksR0FBRyxjQUFTLENBQUMsV0FBVyxFQUFFLENBQUM7QUFPckMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxRQUFRLEVBQUU7SUFDcEIsTUFBTSxDQUFDLFFBQVEsR0FBRyxTQUFTLENBQUM7Q0FDN0I7QUFFRCxJQUFJLENBQUMsTUFBTSxDQUFDLGFBQWEsRUFBRTtJQUN6QixNQUFNLENBQUMsYUFBYSxHQUFHLEtBQUssQ0FBQztDQUM5QjtBQUVEO0lBTUU7UUFMQSxtQkFBYyxHQUFHLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsY0FBYyxJQUFJLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQztRQUNoRSxXQUFNLEdBQVcsSUFBSSxlQUFNLEVBQUUsQ0FBQztRQUM5QixTQUFJLEdBQVMsSUFBSSxXQUFJLEVBQUUsQ0FBQztRQUN4QixVQUFLLEdBQVUsSUFBSSxhQUFLLEVBQUUsQ0FBQztJQUczQixDQUFDO0lBRUQsOEJBQWUsR0FBZixVQUFnQixRQUFnQjtRQUM5QixJQUFJLEtBQUssR0FBRyxDQUFDLENBQUM7UUFDZCxLQUFLLElBQU0sR0FBRyxJQUFJLFFBQVEsRUFBRTtZQUMxQixJQUFJLFFBQVEsQ0FBQyxjQUFjLENBQUMsR0FBRyxDQUFDLEVBQUU7Z0JBQ2hDLEVBQUUsS0FBSyxDQUFDO2FBQ1Q7U0FDRjtRQUNELE9BQU8sS0FBSyxDQUFDO0lBQ2YsQ0FBQztJQUVELG1CQUFJLEdBQUosVUFBSyxLQUFhLEVBQUUsUUFBZ0IsRUFBRSxTQUFpQixFQUFFLFFBQWtCO1FBQTNFLGlCQXFDQztRQXBDQyxjQUFJLENB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QztpQkFDckI7cUJBQU07b0JBQ0wsY0FBSSxDQUFDLFlBQVksQ0FBSSxjQUFjLENBQUMsSUFBSSxvREFBaUQsQ0FBQyxDQUFDO29CQUMzRixVQUFVLENBQUM7d0JBQ1QsS0FBSSxDQUFDLG9CQUFvQixDQUFDLElBQUksQ0FBQyxDQUFDO29CQUNsQyxDQUFDLEVBQUUsS0FBSyxDQUFDLENBQUM7aUJBQ1g7YUFDRjtRQUNILENBQUMsRUFDRCxVQUFDLEtBQUs7WUFDSixPQUFPLGNBQUksQ0FBQyxVQUFVLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDaEMsQ0FBQyxDQUNGLENBQUM7SUFDSixDQUFDO0lBRUQsNkJBQWMsR0FBZDtRQUNFLElBQU0sSUFBSSxHQUFHLE1BQU0sQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBQzFDLElBQUksSUFBSSxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUU7WUFDbkIsT0FBTyxJQUFJLENBQUMsTUFBTSxDQUFDLFVBQUMsR0FBRztnQkFDckIsT0FBTyxNQUFNLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxDQUFDLGNBQWMsS0FBSyxJQUFJLENBQUM7WUFDdEQsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7U0FDUDtRQUNELE9BQU8sSUFBSSxDQUFDO0lBQ2QsQ0FBQztJQUNILFdBQUM7QUFBRCxDQUFDLEFBN0xELElBNkxDO0FBN0xZLG9CQUFJIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgU0ZUUCB9IGZyb20gJy4vbGZ0cCc7XHJcbmltcG9ydCAqIGFzIGZzIGZyb20gJ2ZzJztcclxuaW1wb3J0IHsgRGVsdWdlIH0gZnJvbSAnLi9kZWx1Z2UnO1xyXG5pbXBvcnQgeyBUb3JyZW50LCBmaWxlVHlwZXMgfSBmcm9tICcuL3RvcnJlbnQubW9kZWwnO1xyXG5pbXBvcnQgeyBVbnJhciB9IGZyb20gJy4vdW5yYXInO1xyXG5pbXBvcnQgeyBMb2dzIH0gZnJvbSAnLi4vdG9vbHMvbG9nZ2luZyc7XHJcbmltcG9ydCB1dGlsaXRpZXMgZnJvbSAnLi4vdG9vbHMvdXRpbCc7XHJcbmNvbnN0IHV0aWwgPSB1dGlsaXRpZXMuZ2V0SW5zdGFuY2UoKTtcclxuXHJcbmRlY2xhcmUgdmFyIGdsb2JhbDoge1xyXG4gIHRvcnJlbnRzOiB7IFtrZXk6IHN0cmluZ106IFRvcnJlbnQgfTtcclxuICBpc0Rvd25sb2FkaW5nOiBib29sZWFuO1xyXG59O1xyXG5cclxuaWYgKCFnbG9iYWwudG9ycmVudHMpIHtcclxuICBnbG9iYWwudG9ycmVudHMgPSB1bmRlZmluZWQ7XHJcbn1cclxuXHJcbmlmICghZ2xvYmFsLmlzRG93bmxvYWRpbmcpIHtcclxuICBnbG9iYWwuaXNEb3dubG9hZGluZyA9IGZhbHNlO1xyXG59XHJcblxyXG5leHBvcnQgY2xhc3MgU3luYyB7XHJcbiAgZG9uZUxhYmVsRGVsYXkgPSAodXRpbC5jb25maWcucHJvcHMuZG9uZUxhYmVsRGVsYXkgfHwgMCkgKiAxMDAwO1xyXG4gIGRlbHVnZTogRGVsdWdlID0gbmV3IERlbHVnZSgpO1xyXG4gIHNmdHA6IFNGVFAgPSBuZXcgU0ZUUCgpO1xyXG4gIHVucmFyOiBVbnJhciA9IG5ldyBVbnJhcigpO1xyXG5cclxuICBjb25zdHJ1Y3RvcigpIHtcclxuICB9XHJcblxyXG4gIGdldFRvcnJlbnRDb3VudCh0b3JyZW50czogT2JqZWN0KSB7XHJcbiAgICBsZXQgY291bnQgPSAwO1xyXG4gICAgZm9yIChjb25zdCB0b3IgaW4gdG9ycmVudHMpIHtcclxuICAgICAgaWYgKHRvcnJlbnRzLmhhc093blByb3BlcnR5KHRvcikpIHtcclxuICAgICAgICArK2NvdW50O1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICByZXR1cm4gY291bnQ7XHJcbiAgfVxyXG5cclxuICBzeW5jKGxhYmVsOiBzdHJpbmcsIGxvY2F0aW9uOiBzdHJpbmcsIGRvbmVMYWJlbDogc3RyaW5nLCBjYWxsYmFjazogRnVuY3Rpb24pIHtcclxuICAgIExvZ3Mud3JpdGVNZXNzYWdlKCdHZXR0aW5nIFRvcnJlbnRzJyk7XHJcblxyXG4gICAgdGhpcy5kZWx1Z2UuZ2V0VG9ycmVudHMobGFiZWwpLnRoZW4oXHJcbiAgICAgIChkYXRhKSA9PiB7XHJcbiAgICAgICAgaWYgKGRhdGEgJiYgZGF0YS5lcnJvciA9PT0gbnVsbCAmJiBkYXRhLnJlc3VsdC50b3JyZW50cykge1xyXG4gICAgICAgICAgY29uc3QgYWxsVG9ycmVudHMgPSBkYXRhLnJlc3VsdC50b3JyZW50cztcclxuICAgICAgICAgIExvZ3Mud3JpdGVNZXNzYWdlKGAke3RoaXMuZ2V0VG9ycmVudENvdW50KGFsbFRvcnJlbnRzKX0gdG9ycmVudHMgd2l0aCBsYWJlbCAke2xhYmVsfWAsIGNhbGxiYWNrKTtcclxuICAgICAgICAgIGZvciAoY29uc3QgdG9ycmVudCBpbiBhbGxUb3JyZW50cykge1xyXG4gICAgICAgICAgICBpZiAodG9ycmVudCBpbiBnbG9iYWwudG9ycmVudHMpIHtcclxuICAgICAgICAgICAgICBMb2dzLndyaXRlTWVzc2FnZShgJHtnbG9iYWwudG9ycmVudHNbdG9ycmVudF0ubmFtZX0gYWxyZWFkeSBiZWluZyBoYW5kbGVkIGJ5IGFub3RoZXIgY2FsbC4gU2tpcHBpbmdgLCBjYWxsYmFjayk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgZ2xvYmFsLnRvcnJlbnRzW3RvcnJlbnRdID0gbmV3IFRvcnJlbnQoXHJcbiAgICAgICAgICAgICAgICBhbGxUb3JyZW50c1t0b3JyZW50XS5wcm9ncmVzcyA9PT0gMTAwLFxyXG4gICAgICAgICAgICAgICAgdGhpcy5pc1JlbW90ZVRvcnJlbnRBRGlyZWN0b3J5KGFsbFRvcnJlbnRzW3RvcnJlbnRdLm5hbWUpLFxyXG4gICAgICAgICAgICAgICAgYWxsVG9ycmVudHNbdG9ycmVudF0ubmFtZSxcclxuICAgICAgICAgICAgICAgIGFsbFRvcnJlbnRzW3RvcnJlbnRdLnNhdmVfcGF0aCxcclxuICAgICAgICAgICAgICAgIHV0aWwuY29uZmlnLnByb3BzLnJvb3REb3dubG9hZEZvbGRlclxyXG4gICAgICAgICAgICAgICk7XHJcblxyXG4gICAgICAgICAgICAgIGlmICghZ2xvYmFsLnRvcnJlbnRzW3RvcnJlbnRdLnNob3VsZERvd25sb2FkKSB7XHJcbiAgICAgICAgICAgICAgICBMb2dzLndyaXRlTWVzc2FnZShgJHtnbG9iYWwudG9ycmVudHNbdG9ycmVudF0ubmFtZX0gaW5jb21wbGV0ZSwgd2FpdGluZyBmb3IgdG9ycmVudCB0byBjb21wbGV0ZWAsIGNhbGxiYWNrKTtcclxuICAgICAgICAgICAgICAgIHRoaXMuY2hlY2tUb3JyZW50Q29tcGxldGUodG9ycmVudCk7XHJcbiAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIExvZ3Mud3JpdGVNZXNzYWdlKGBUb3JyZW50IHJlYWR5LCBhZGRpbmcgJHthbGxUb3JyZW50c1t0b3JyZW50XS5uYW1lfSB0byBkb3dubG9hZGAsIGNhbGxiYWNrKTtcclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICBMb2dzLndyaXRlTWVzc2FnZShgU3RhcnRpbmcgUG9zc2libGUgRG93bmxvYWQocylgLCBjYWxsYmFjaywgdHJ1ZSk7XHJcbiAgICAgICAgICB0aGlzLmRvd25sb2FkTmV4dCgpO1xyXG4gICAgICAgIH1cclxuICAgICAgfSxcclxuICAgICAgKGVycm9yKSA9PiB7XHJcbiAgICAgICAgcmV0dXJuIExvZ3Mud3JpdGVNZXNzYWdlKGBlcnJvcjogJHtlcnJvcn1gLCBjYWxsYmFjaywgdHJ1ZSk7XHJcbiAgICAgIH1cclxuICAgICk7XHJcbiAgfVxyXG5cclxuICBpc1JlbW90ZVRvcnJlbnRBRGlyZWN0b3J5KHRvcnJlbnROYW1lKSB7XHJcbiAgICBpZiAodG9ycmVudE5hbWUpIHtcclxuICAgICAgY29uc3QgZmlsZVR5cGUgPSB0b3JyZW50TmFtZS5zcGxpdCgnLicpLnBvcCgpO1xyXG4gICAgICByZXR1cm4gZmlsZVR5cGVzLmluZGV4T2YoZmlsZVR5cGUpID09PSAtMTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIHByb2Nlc3NEb3dubG9hZCh0b3JyZW50SGFzaCkge1xyXG4gICAgY29uc3QgaXRlbSA9IGdsb2JhbC50b3JyZW50c1t0b3JyZW50SGFzaF07XHJcbiAgICBnbG9iYWwuaXNEb3dubG9hZGluZyA9IHRydWU7XHJcblxyXG4gICAgLy8gQ2hlY2sgaWYgd2Ugc2hvdWxkIGV2ZW4gdHJ5IGRvd25sb2FkaW5nXHJcbiAgICBpZiAoaXRlbS5zaG91bGREb3dubG9hZCkge1xyXG4gICAgICBpZiAoaXRlbS5pc0RpcmVjdG9yeSA9PT0gdHJ1ZSkge1xyXG4gICAgICAgIHRoaXMuc2Z0cC5hZGRNaXJyb3JDb21tYW5kKGl0ZW0ucmVtb3RlUGF0aCwgdXRpbC5jb25maWcucHJvcHMucm9vdERvd25sb2FkRm9sZGVyLCBpdGVtLm5hbWUpO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIHRoaXMuc2Z0cC5hZGRQR2V0Q29tbWFuZChpdGVtLnJlbW90ZVBhdGgsIGl0ZW0ubmFtZSk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8vIE1hcmsgdG9ycmVudCBhcyBzaG91bGQgbm90IGRvd25sb2FkLCBzaW5jZSB3ZSBhcmUgZXhlY3V0aW5nIG9uIGl0XHJcbiAgICAgIGdsb2JhbC50b3JyZW50c1t0b3JyZW50SGFzaF0uc2hvdWxkRG93bmxvYWQgPSBmYWxzZTtcclxuXHJcbiAgICAgIExvZ3Mud3JpdGVNZXNzYWdlKGBTdGFydGluZyBkb3dubG9hZCBmb3IgJHtpdGVtLm5hbWV9YCk7XHJcblxyXG4gICAgICAvLyBGaW5hbGx5IGV4ZWN1dGUgdGhlIGNvbW1hbmRcclxuICAgICAgLy8gdGhpcy5mdHBzLmV4ZWMoY29uc29sZS5sb2cpO1xyXG4gICAgICB0aGlzLnNmdHAuZXhlY3V0ZUNvbW1hbmRzKChlcnJvciwgZGF0YSkgPT4ge1xyXG4gICAgICAgIGlmIChlcnJvcikge1xyXG4gICAgICAgICAgTG9ncy53cml0ZU1lc3NhZ2UoZXJyb3IgKyAnICcgKyBkYXRhLmVycm9yICsgJyAnICsgZGF0YS5kYXRhKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgTG9ncy53cml0ZU1lc3NhZ2UoJ0xGVFAgUmVzcG9uc2U6Jyk7XHJcbiAgICAgICAgICBjb25zb2xlLmxvZyhkYXRhKTtcclxuICAgICAgICAgIC8vIExvZ3Mud3JpdGVNZXNzYWdlKGRhdGEuZGF0YSk7XHJcblxyXG4gICAgICAgICAgdGhpcy5wb3N0RG93bmxvYWRIYW5kbGluZyhpdGVtLm5hbWUpXHJcbiAgICAgICAgICAgIC50aGVuKFxyXG4gICAgICAgICAgICAgIChwb3N0SGFuZGxpbmcpID0+IHtcclxuICAgICAgICAgICAgICAgIExvZ3Mud3JpdGVNZXNzYWdlKGBQb3N0IGRvd25sb2FkIGhhbmRsaW5nIGRvbmU6ICR7cG9zdEhhbmRsaW5nfWApO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMucmVsYWJlbFRvcnJlbnQodG9ycmVudEhhc2gsIGl0ZW0ubmFtZSwgdXRpbC5jb25maWcucHJvcHMuZG9uZUxhYmVsKTtcclxuICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgIChlcnIpID0+IHtcclxuICAgICAgICAgICAgICAgIExvZ3Mud3JpdGVFcnJvcihgUG9zdCBkb3dubG9hZCBoYW5kbGluZyBmYWlsZWQ6ICR7ZXJyfWApO1xyXG4gICAgICAgICAgICAgICAgZ2xvYmFsLmlzRG93bmxvYWRpbmcgPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgIHRoaXMuZG93bmxvYWROZXh0KCk7XHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICApXHJcbiAgICAgICAgICAgIC50aGVuKFxyXG4gICAgICAgICAgICAgIChyZWxhYmxlZCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgTG9ncy53cml0ZU1lc3NhZ2UoYCR7aXRlbS5uYW1lfSBsYWJlbCBjaGFuZ2VkIHRvICR7dXRpbC5jb25maWcucHJvcHMuZG9uZUxhYmVsfWApO1xyXG4gICAgICAgICAgICAgICAgZ2xvYmFsLmlzRG93bmxvYWRpbmcgPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgIGRlbGV0ZSBnbG9iYWwudG9ycmVudHNbdG9ycmVudEhhc2hdO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5kb3dubG9hZE5leHQoKTtcclxuICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgIChlcnIpID0+IHtcclxuICAgICAgICAgICAgICAgIExvZ3Mud3JpdGVFcnJvcihgUmUtbGFiZWwgZmFpbGVkOiAke2Vycn1gKTtcclxuICAgICAgICAgICAgICAgIGdsb2JhbC5pc0Rvd25sb2FkaW5nID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmRvd25sb2FkTmV4dCgpO1xyXG4gICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgKTtcclxuICAgICAgICB9XHJcbiAgICAgIH0pO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgcG9zdERvd25sb2FkSGFuZGxpbmcodG9ycmVudE5hbWUpIHtcclxuICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XHJcbiAgICAgIGlmIChmcy5zdGF0U3luYyh1dGlsLmNvbmZpZy5wcm9wcy5ub2RlRG93bmxvYWRGb2xkZXIgKyAnLycgKyB0b3JyZW50TmFtZSkuaXNEaXJlY3RvcnkoKSkge1xyXG4gICAgICAgIHRoaXMudW5yYXIuSGFuZGxlRm9sZGVyKHV0aWwuY29uZmlnLnByb3BzLm5vZGVEb3dubG9hZEZvbGRlciArICcvJyArIHRvcnJlbnROYW1lLCAoZXJyb3IsIGZpbmlzaGVkKSA9PiB7XHJcbiAgICAgICAgICBpZiAoZXJyb3IpIHtcclxuICAgICAgICAgICAgcmVqZWN0KGVycm9yKTtcclxuICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHJlc29sdmUoZmluaXNoZWQpO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIHJlc29sdmUodHJ1ZSk7XHJcbiAgICAgIH1cclxuICAgIH0pO1xyXG4gIH1cclxuXHJcbiAgcmVsYWJlbFRvcnJlbnQodG9ycmVudEhhc2g6IHN0cmluZywgdG9ycmVudE5hbWU6IHN0cmluZywgbmV3TGFiZWw6IHN0cmluZykge1xyXG4gICAgTG9ncy53cml0ZU1lc3NhZ2UoYFJlbGFiZWxsaW5nICR7dG9ycmVudE5hbWV9YCk7XHJcbiAgICByZXR1cm4gdGhpcy5kZWx1Z2UuY2hhbmdlVG9ycmVudExhYmVsKHRvcnJlbnRIYXNoLCBuZXdMYWJlbCk7XHJcbiAgfVxyXG5cclxuICAvLyBNZXRob2QgZm9yIGp1c3QgZ3JhYmJpbmcgdGhlIG5leHQgZG93bmxvYWQgYW5kIHN0YXJ0aW5nIGl0IGlmIHdlIGFyZSBjdXJyZW50bHkgbm90IGRvd25sb2FkaW5nIGFueXRoaW5nXHJcbiAgZG93bmxvYWROZXh0KCkge1xyXG4gICAgLy8gQ2hlY2sgaWYgd2Ugc2hvdWxkIHRyeSB0byBkb3dubG9hZCBpdCBpbW1lZGlhdGVseVxyXG4gICAgaWYgKGdsb2JhbC5pc0Rvd25sb2FkaW5nID09PSBmYWxzZSkge1xyXG4gICAgICBjb25zdCBuZXh0VG9ycmVudEhhc2ggPSB0aGlzLmdldE5leHRUb3JyZW50KCk7XHJcbiAgICAgIGlmIChuZXh0VG9ycmVudEhhc2gpIHtcclxuICAgICAgICB0aGlzLnByb2Nlc3NEb3dubG9hZChuZXh0VG9ycmVudEhhc2gpO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBjaGVja1RvcnJlbnRDb21wbGV0ZShoYXNoKSB7XHJcbiAgICB0aGlzLmRlbHVnZS5nZXRTaW5nbGVUb3JyZW50KGhhc2gpLnRoZW4oXHJcbiAgICAgIChkYXRhKSA9PiB7XHJcbiAgICAgICAgaWYgKGRhdGEgJiYgZGF0YS5yZXN1bHQpIHtcclxuICAgICAgICAgIGNvbnN0IGN1cnJlbnRUb3JyZW50ID0gZGF0YS5yZXN1bHQ7XHJcbiAgICAgICAgICBpZiAoY3VycmVudFRvcnJlbnQucHJvZ3Jlc3MgPT09IDEwMCkge1xyXG4gICAgICAgICAgICBMb2dzLndyaXRlTWVzc2FnZShgJHtjdXJyZW50VG9ycmVudC5uYW1lfSBub3cgcmVhZHkgZm9yIGRvd25sb2FkOyBhZGRkaW5nIHRvIHF1ZXVlLmApO1xyXG4gICAgICAgICAgICBnbG9iYWwudG9ycmVudHNbaGFzaF0uc2hvdWxkRG93bmxvYWQgPSB0cnVlO1xyXG5cclxuICAgICAgICAgICAgdGhpcy5kb3dubG9hZE5leHQoKTtcclxuICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIExvZ3Mud3JpdGVNZXNzYWdlKGAke2N1cnJlbnRUb3JyZW50Lm5hbWV9IHN0aWxsIG5vdCByZWFkeSwgY2hlY2tpbmcgYWdhaW4gaW4gMTUgc2Vjb25kcy5gKTtcclxuICAgICAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7XHJcbiAgICAgICAgICAgICAgdGhpcy5jaGVja1RvcnJlbnRDb21wbGV0ZShoYXNoKTtcclxuICAgICAgICAgICAgfSwgMTUwMDApO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgfSxcclxuICAgICAgKGVycm9yKSA9PiB7XHJcbiAgICAgICAgcmV0dXJuIExvZ3Mud3JpdGVFcnJvcihlcnJvcik7XHJcbiAgICAgIH1cclxuICAgICk7XHJcbiAgfVxyXG5cclxuICBnZXROZXh0VG9ycmVudCgpIHtcclxuICAgIGNvbnN0IGtleXMgPSBPYmplY3Qua2V5cyhnbG9iYWwudG9ycmVudHMpO1xyXG4gICAgaWYgKGtleXMubGVuZ3RoID4gMCkge1xyXG4gICAgICByZXR1cm4ga2V5cy5maWx0ZXIoKGtleSkgPT4ge1xyXG4gICAgICAgIHJldHVybiBnbG9iYWwudG9ycmVudHNba2V5XS5zaG91bGREb3dubG9hZCA9PT0gdHJ1ZTtcclxuICAgICAgfSlbMF07XHJcbiAgICB9XHJcbiAgICByZXR1cm4gbnVsbDtcclxuICB9XHJcbn1cclxuIl19