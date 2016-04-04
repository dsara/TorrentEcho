var FTPS = require('./lftp.js');
var Rtorrent = require('./rtorrent.js');
var Torrent = require('./torrent.js');

if (!global.torrents) {
    global.torrents = [];
}

if (!global.isDownloading){
  global.isDownloading = false;
}

function Sync(config) {
    self = this;

    self.doneLabel = config.doneLabel;

    // Setup based on config
    self.rtorrent = new Rtorrent({
        mode: config.mode,
        host: config.host,
        port: config.port,
        path: config.path,
        user: config.user,
        pass: config.pass,
        isSecure: config.isSecure
    });

    var pgetCommand = "set mirror:use-pget-n " + config.pget + ";set pget:default-n " + config.pget;
    var tempCommand = "set xfer:use-temp-file true;set xfer:temp-file-name *.tmp";

    additionalCommands = pgetCommand;

    if (config.useTemp)
        additionalCommands += ";" + tempCommand;

    self.ftps = new FTPS({
        host: config.host,
        username: config.user,
        password: config.pass,
        protocol: 'sftp',
        autoConfirm: true,
        additionalLftpCommands: additionalCommands
    });
};

Sync.prototype.sync = function(label, location, doneLabel, callback) {

    console.log("Getting Torrents");

    self.rtorrent.getTorrents(function(err, data) {
            if (err) return console.log('err: ', err);

            // filter down to torrents with the label and are complete
            var torrents = data.filter(function(obj) {
                return obj.label === label;
            });

            WriteMessage(torrents.length + " torrents with label " + label, callback);

            // Loop over each torrent and add commands to queue them
            torrents.forEach(function(item) {
                    if (item.hash in global.torrents)
                        WriteMessage(item.name + " already being handled by another call. Skipping", callback);
                    else {
                        if (item.complete == 1) {
                            // Set global tag to true, since we are going to try downloading it.
                            global.torrents[item.hash] = new Torrent(true, item.ismultifile, item.path, location);

                            WriteMessage("Adding " + item.name + " to download", callback);
                        }
                    // } else {
                    //     //// Set global flag to false, since we haven't started it yet.
                    //     // Commented out so we don't set anything until the watcher is created
                    //     // This is so that we try downloading later if it ever finishs.
                    //     //global.torrents[item.hash] = false;
                    //     // TODO: Add a watcher then try downloading the torrent.
                    // }
                }
            });

        WriteMessage("Starting Download", callback, true);

        // Check if we are already downloading, if not, start the download.
        if (!global.isDownloading) {
          var nextTorrentHash = GetNextTorrent();
          if (nextTorrentHash){
            self.ProcessDownload(nextTorrentHash);
          }
        }
    });
};

Sync.prototype.ProcessDownload = function(torrentHash) {
    var item = global.torrents[torrentHash];
    global.isDownloading = true;

    // Check if we should even try downloading
    if (item.ShouldDownload) {
        if (item.IsDirectory == true) {
            self.ftps.mirror(item.Path, item.DownloadLocation);
        } else { // Otherwise use pget
            self.ftps.pget(item.Path, item.DownloadLocation);
        }

        // Mark torrent as should not download, since we are executing on it
        item.ShouldDownload = false;
        global.torrents[torrentHash] = item;

        // Finally execute the command
        self.ftps.exec(function(err, data) {
            if (err) {
                WriteMessage(err + " " + data);
            } else {
                WriteMessage(data);
            }

            self.rtorrent.setLabel(torrentHash, self.doneLabel, function() { return; });

            // Remove the torrent from the global collection
            delete global.torrents[torrentHash];

            // Mark that we are done downloading.
            global.isDownloading = false;

            // Grab next download and make call to download
            var nextTorrentHash = GetNextTorrent();
            if (nextTorrentHash){
              self.ProcessDownload(nextTorrentHash);
            }
        });
    }
};

function GetNextTorrent() {
  var keys = Object.keys(global.torrents);
  if (keys.length > 0){
    return keys.filter(function(key){return global.torrents[key].ShouldDownload == true;})[0];
  }
  return null;
}

function WriteMessage(message, callback, isEnd) {
    console.log(message);
    if (callback) {
        callback(message, isEnd);
    }
}



module.exports = Sync;
