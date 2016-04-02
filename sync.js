var FTPS = require('./lftp.js');
var Rtorrent = require('./rtorrent.js');

if (!global.torrents) { global.torrents = {}; }

function Sync(config) {
  self = this;

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

Sync.prototype.sync = function(label, location, callback) {

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
          global.torrents[item.hash] = true;
          WriteMessage("Adding " + item.name + " to download", callback);
          // Check if the torrent is a multi file, if it is use mirror.
          if (item.ismultifile == true) {
            self.ftps.mirror(item.path, location);
          } else { // Otherwise use pget
            self.ftps.pget(item.path, location);
          }
        } else {
          // Set global flag to false, since we haven't started it yet.
          global.torrents[item.hash] = false;
          // TODO: Add a watcher then try downloading the torrent.
        }
      }
    });

    WriteMessage("Starting Download", callback, true);

    // Finally execute the commands
    self.ftps.exec(function(err, data) {
      if (err) {
        WriteMessage(err + " " + data);
      } else {
        WriteMessage(data);
      }
    });
  });
};

function WriteMessage(message, callback, isEnd) {
  console.log(message);
  if (callback) { callback(message, isEnd); }
}

module.exports = Sync;
