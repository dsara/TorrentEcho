var torrentSync = require('./index.js');

var syncer = new torrentSync(require('./config.json'));

var callback = function(err, data){
  if (err) console.log(err);
  console.log(data);
}

syncer.sync('test', "test/", callback);
