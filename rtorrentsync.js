var FTPS = require('./lftp.js');
var Rtorrent = require('./rtorrent.js');

var config = require('./config.json');

var rtorrent = new Rtorrent({
    mode: config.mode,
    host: config.host,
    port: config.port,
    path: config.path,
    user: config.user,
    pass: config.pass,
    isSecure: config.isSecure
});

var pgetCommand = "set mirror:use-pget-n " + config.pget + "; set pget:default-n " + config.pget;

var ftps = new FTPS({
  host: config.host,
  username: config.user,
  password: config.pass,
  protocol: 'sftp',
  autoConfirm: true,
  additionalLftpCommands: pgetCommand
});

function RTorrentSync() {
  // TODO: Anything that should be here?
};


RTorrentSync.prototype.sync = function(callback) {

  var label = "Games";

  console.log("Getting Torrents");

  rtorrent.getTorrents(function (err, data) {
      if (err) return console.log('err: ', err);

     //    console.log(data);
      var torrents = data.filter(function(obj) {
          return obj.label === label;
          });
      console.log(torrents.length + " torrents with label " + label);

  console.log("Testing lftp");
  //ftps.mirror("/home2/darknessgp/temp", "/opt/test").exec(console.log);
  ftps.cd("/home2/darknessgp").ls().exec(console.log);
  console.log("Done");
  });
};

module.exports = RTorrentSync;
