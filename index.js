var http = require('http');
var express = require('express');
var sync = require('./sync.js');
var config = require('./config.json');

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
  res.writeHead(200, {
    'Content-Type': 'text/plain'
  });

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
