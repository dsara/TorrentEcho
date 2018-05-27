var http = require('http');
var fs = require('fs');
var express = require('express');
var sync = require('./lib/sync');
var FTPS = require('./lib/lftp');
var logs = require('./lib/logs');

const configFile = '/config/config.json';

// Check if config file exists, if not create it with the sample data.
try {
  var stats = fs.statSync(configFile);
} catch (e) {
  logs.writeMessage("Config file not found, creating from sample!");
  fs.writeFileSync(configFile, fs.readFileSync('./config.json.sample'));
}
// read in and parse the config file
const config = JSON.parse(fs.readFileSync(configFile, 'utf8'));

process.chdir(config.nodeDownloadFolder);
var app = express();

const PORT = 8080;

//We need a function which handles requests and send response
app.use(function(request, response, next) {
  try {
    //log the request on console
    logs.writeMessage(request.url);
    next();
  } catch (error) {
    logs.writeMessage(error);
  }

});

app.post("/download/:label", function(req, res) {
  var label = req.params.label;
  res.writeHead(200, {'Content-Type': 'text/plain'});

  try {
    var syncer = new sync(config);

    var callback = function(message, end) {
      if (end) {
        res.end(message);
      } else {
        res.write(message + " \n");
      }
    }

    if (label in config.labelDownloadFolders) {
      //  call sync passing in config for the label
      syncer.sync(label, config.rootDownloadFolder + config.labelDownloadFolders[label], config.doneLabel, callback);
    } else {
      res.end("Label '" + label + "' not found in configuration");
    }

  } catch (error) {
    res.end(error);
  }
});

// Endpoint for procesing a folder sync
app.post("/sync/:label", function(req, res) {
  var label = req.params.label;
  res.writeHead(200, {'Content-Type': 'text/plain'});

  try {

    if (label in config.syncFolders) {
      // Setup some default options... need to clean this up at some point.
      var additionalCommands = "set mirror:use-pget-n " + config.pget + ";set pget:default-n " + config.pget + ";set xfer:use-temp-file true;set xfer:temp-file-name *.tmp";

      ftps = new FTPS({
        host: config.host,
        username: config.user,
        password: config.pass,
        protocol: 'sftp',
        autoConfirm: true,
        additionalLftpCommands: additionalCommands
      });

      var mirrorCommand = ftps.mirrorTorrent(config.syncFolders[label].source, config.syncFolders[label].destination, config.syncRemoveSource);
      logs.writeMessage("Wrote lftp command: " + mirrorCommand);

      //  call sync passing in config for the label
      ftps.exec(function(error, data) {
        if (error) {
          logs.writeMessage(error + " " + data.erroror + " " + data.data);
        } else {
          logs.writeMessage("LFTP Response: " + data.data);
        }
      });

      res.end("Download Started");
    } else {
      res.end("Sync Label '" + label + "' not found in configuration");
    }

  } catch (error) {
    res.end("errorOR: " + error);
  }
});

// Start server
app.listen(PORT, function() {
  logs.writeMessage("Server listening on: http://localhost:" + PORT);
});
