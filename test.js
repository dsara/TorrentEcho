var torrentSync = require('./index.js');

var syncer = new torrentSync(require('./config.json'));

syncer.sync('test', "test/", console.log);
