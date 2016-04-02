var http = require('http');
var fs = require('fs');
var express = require('express');
var sync = require('./sync.js');

var configFile = '/config/config.json';
// Check if config file exists, if not create it with the sample data.
try {
  var stats = fs.statSync(configFile);
}
catch {
  console.log("config file not found, creating from sample!")
  fs.createReadStream('./config.json.sample').pipe(fs.createWriteStream(configFile));
}

var config = require(configFile);

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

app.get("/download/tv", function(req, res) {
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

    syncer.sync('test', "/download/", callback);

  } catch (err) {
    res.end(err);
  }
});


//Lets start our server
app.listen(PORT, function() {
  //Callback triggered when server is successfully listening. Hurray!
  console.log("Server listening on: http://localhost:%s", PORT);
});
