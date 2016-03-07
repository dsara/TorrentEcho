var torrentSync = require('./sync.js');

var syncer = new torrentSync(require('./config.json'));

syncer.sync(console.log);
