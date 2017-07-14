var http = require('http');
var fs = require('fs');
var express = require('express');
var sync = require('./sync.js');
var FTPS = require('./lftp.js');

var configFile = '/config/config.json';
// Check if config file exists, if not create it with the sample data.
try {
  var stats = fs.statSync(configFile);
} catch (e) {
  //WriteMessage("config file not found, creating from sample!")
  fs.writeFileSync(configFile, fs.readFileSync('./config.json.sample'));
}

// read in and parse the config file
var config = JSON.parse(fs.readFileSync(configFile, 'utf8'));

var app = express();

const PORT = 8080;

//We need a function which handles requests and send response
app.use(function(request, response, next) {
  try {
    //log the request on console
    WriteMessage(request.url);
    next();
  } catch (err) {
    WriteMessage(err);
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

  } catch (err) {
    res.end(err);
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

      var mirrorCommand = ftps.mirror(config.syncFolders[label].source, config.syncFolders[label].destination, config.syncRemoveSource);
      WriteMessage("Wrote lftp command: " + mirrorCommand);

      //  call sync passing in config for the label
      ftps.exec(function(err, data) {
        if (err) {
          WriteMessage(err + " " + data.error + " " + data.data);
        } else {
          WriteMessage("LFTP Response: " + data.data);
        }
      });

      res.end("Download Started");
    } else {
      res.end("Sync Label '" + label + "' not found in configuration");
    }

  } catch (err) {
    res.end("ERROR: " + err);
  }
});

//Lets start our server
app.listen(PORT, function() {
  //Callback triggered when server is successfully listening. Hurray!
  WriteMessage("Server listening on: http://localhost:" + PORT);
});

// Global function to write to console and optionally to a callback
WriteMessage = function(message, callback, isEnd) {
  console.log((new Date().toLocaleString()) + " - " + message.toString());
  if (callback) {
    callback(message, isEnd);
  }
}
