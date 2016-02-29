var Rtorrent = require('./rtorrent.js');


var config = require('./config.json');


var rtorrent = new Rtorrent({
    mode: config.mode,
    host: config.host,
    port: config.port,
    path: config.path,
    user: config.user,
    pass: config.pass
});

console.log("Getting all");

rtorrent.getTorrents(function (err, data) {
    if (err) return console.log('err: ', err);

//    console.log(data);
    var torrents = data.filter(function(obj) {
	return obj.label === 'Games';
	});
    console.log(torrents);
});

