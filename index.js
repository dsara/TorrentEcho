var FTPS = require('./lftp.js');
var Rtorrent = require('./rtorrent.js');

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


Sync.prototype.sync = function (label, location, callback) {

    console.log("Getting Torrents");

    self.rtorrent.getTorrents(function (err, data) {
        if (err) return console.log('err: ', err);

        // filter down to torrents with the label and are complete
        var torrents = data.filter(function (obj) {
            return obj.label === label;
        });

        var completeTorrents = torrents.filter(function(obj)){
          return obj.complete == 1;
        }

        // TODO: Handle torrents that are not complete, by waiting and watching for them to complete
        var incompleteTorrents = torrents.filter(function(obj)){
          return obj.complete == 0;
        }

        console.log(torrents.length + " torrents with label " + label);

        // Loop over each and add commands to queue them
        torrents.forEach(function (item) {
            console.log("Adding" + item.name + " to download");

            // Check if the torrent is a multi file, if it is use mirror.
            if (item.ismultifile == true){
              self.ftps.mirror(item.path, location);
            }
            else { // Otherwise use pget
              self.ftps.queuepget(item.path, location);
            }
        });

        // Finally execute the commands
        self.ftps.exec(callback);

        console.log("Done");
    });
};

module.exports = Sync;
