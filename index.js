var http = require('http');
var dispatcher = require('httpdispatcher');
var sync = require('./sync.js');
var config = require('./config.json');

// TODO: Move to config
const PORT=8080;

//We need a function which handles requests and send response
function handleRequest(request, response){
  try {
      //log the request on console
      console.log(request.url);
      //Disptach
      dispatcher.dispatch(request, response);
  } catch(err) {
      console.log(err);
  }
}

//Create a server
var server = http.createServer(handleRequest);

//Lets start our server
server.listen(PORT, function(){
    //Callback triggered when server is successfully listening. Hurray!
    console.log("Server listening on: http://localhost:%s", PORT);
});

dispatcher.setStatic('resources');

dispatcher.onGet("/download/tv", function(req, res){

try {
  var syncer = new sync(config);

  var callback = function(err, data){
    if (err) console.log(err);
    console.log(data);
  }

  syncer.sync('test', "test/", callback);
} catch(err){
  res.writeHead(200, {'Content-Type':'text/plain'});
  res.end("Download TV Shows");
}
});
