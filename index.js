var http = require('http');
var fs = require('fs');
var express = require('express');
var sync = require('./sync.js');

var configFile = './config.json';
// Check if config file exists, if not create it with the sample data.
try {
  var stats = fs.statSync(configFile);
}
 catch (e) {
  console.log("config file not found, creating from sample!")
  fs.writeFileSync(configFile, fs.readFileSync('./config.json.sample'));
}

// read in and parse the config file
var config = JSON.parse(fs.readFileSync(configFile, 'utf8'));

var app = express();

// TODO: Move to config
const PORT = 8080;

//We need a function which handles requests and send response
app.use(function(request, response, next) {
  try {
    //log the request on console
    console.log(request.url);
    next();
  } catch (err) {
    console.log(err);
  }

});

app.get("/download/:label", function(req, res) {
  var label = req.params.label;
  res.writeHead(200, { 'Content-Type': 'text/plain' });

  try {
    var syncer = new sync(config);

    var callback = function(message, end) {
      if (end) {
        res.end(message);
      } else {
        res.write(message + " \n");
      }
    }

    if (label in config.labelDownloadFolders)
    {
          //  call sync passing in config for the label
          syncer.sync(label, config.rootDownloadFolder + config.labelDownloadFolders[label], callback);
    }
    else {
      res.end("Label not found in configuration");
    }

  } catch (err) {
    res.end(err);
  }
});


//Lets start our server
app.listen(PORT, function() {
  //Callback triggered when server is successfully listening. Hurray!
  console.log("Server listening on: http://localhost:%s", PORT);
});
