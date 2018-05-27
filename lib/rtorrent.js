import * as url from 'url';
import * as fs from 'fs';
import * as xmlrpc from 'xmlrpc';
import logs from './logs';

export default class RTorrent {
    constructor(option) {
        this.mode = (option && option['mode']) || "xmlrpc";
        this.host = (option && option['host']) || "127.0.0.1";
        this.port = (option && option['port']) || 80;
        this.path = (option && option['path']) || "/RPC2";
        this.user = (option && option['user']) || null;
        this.pass = (option && option['pass']) || null;
        this.isSecure = (option && option['isSecure']) || false;
        this.client = null;

        if (this.mode == 'xmlrpc') {
            options = {
                host: this.host,
                port: this.port,
                path: this.path,
                headers: {
                    'User-Agent': 'NodeJS XML-RPC Client',
                    'Content-Type': 'text/xml',
                    'Accept': 'text/xml',
                    'Accept-Charset': 'UTF8',
                    'Connection': 'Close'
                }
            }

            if (this.user && this.pass) {
                options.basic_auth = {
                    user: this.user,
                    pass: this.pass
                }
            }
            if (this.isSecure) {
                // Tell process to just accept any ssl
                process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
                this.client = xmlrpc.createSecureClient(options);
            } else {
                this.client = xmlrpc.createClient(options);
            }
        } else {
            throw new error('unknown mode: ' + this.mode + ' (available: xmlrpc)');
        }
    }

    get(method, param, callback) {
        return this.getXmlrpc(method, param, callback);
    }

    getXmlrpc(method, params, callback) {
        this.client.methodCall(method, params, callback);
    }

    execute(cmd, callback) {
        return this.get('execute_capture', ['bash', '-c', cmd], callback);
    }

    getMulticall(method, param, cmds, callback) {
        var self = this;
        var cmdarray = param;

        for (var c in cmds)
            cmdarray.push(cmds[c] + '=');

        self.get(method, cmdarray, function(error, data) {
            if (error) return callback(error);

            var res = doublearray2hash(data, Object.keys(cmds));
            callback(error, res);
        });
    }

    getTorrents(callback) {
        var self = this;

        self.getMulticall('d.multicall', ['main'], fields.torrents, function(error, data) {
            if (error) return callback(error);

            for (var i in data) {
                data[i]['state'] = '';
                if (data[i]['active'] == 1)
                    data[i]['state'] += 'active ';
                if (data[i]['open'] == 1)
                    data[i]['state'] += 'open ';
                if (data[i]['complete'] == 1)
                    data[i]['state'] += 'complete ';
                if (data[i]['hashing'] == 1)
                    data[i]['state'] += 'hashing ';
                if (data[i]['hashed'] == 1)
                    data[i]['state'] += 'hashed ';
                if (data[i]['down_total'] < data[i]['completed'])
                    data[i]['down_total'] = data[i]['completed'];
                data[i]['ratio'] = data[i]['up_total'] / data[i]['down_total'];
            }
            callback(error, data)
        });
    }

    systemMulticall(cmds, callback) {
        var array = [];

        for (i in cmds)
            array.push({
                'methodName': cmds[i],
                'params': [],
            });

        this.getXmlrpc('system.multicall', [array], function(error, data) {
            if (error) return callback(error);

            var res = {};
            var i = 0;
            for (var key in cmds)
                res[key] = data[i++][0];
            callback(error, res);
        });
    }

    start(hash, callback) {
        var self = this;
        this.get('d.open', [hash], function(error, data) {
            if (error) return callback(error);

            self.get('d.start', [hash], callback);
        })
    }

    stop = function(hash, callback) {
        var self = this;
        this.get('d.stop', [hash], function(error, data) {
            if (error) return callback(error);

            self.get('d.close', [hash], callback);
        })
    };

    remove(hash, callback) {
        this.get('d.erase', [hash], callback);
    };

    loadLink(link, callback) {
        this.get('load_start', [link], callback);
    };

    loadFile(filePath, callback) {
        var file = fs.readFileSync(filePath);
        this.loadFileContent(file, callback);
    };

    loadFileContent(filecontent, callback) {
        this.get('load_raw_start', [filecontent], callback);
    };

    setPath(hash, directory, callback) {
        this.get('d.set_directory', [hash, directory], callback);
    };

    setLabel(hash, label, callback) {
        this.get('d.custom1.set', [hash, label], callback);
    };

    getSingle(hash, callback) {
        this.get('d.get_complete', [hash], callback);

    }

    getCommands(callback) {
        this.get('system.listMethods', null, callback);
    }
}

const fields = {
    torrents: {
        hash: 'd.get_hash',
        torrent: 'd.get_tied_to_file',
        path: 'd.get_base_path',
        name: 'd.get_base_filename',
        label: 'd.custom1',
        size: 'd.get_size_bytes',
        message: 'd.get_message',
        createdAt: 'd.creation_date',
        active: 'd.is_active',
        open: 'd.is_open',
        complete: 'd.get_complete',
        seeders: 'd.get_peers_complete',
        ismultifile: 'd.is_multi_file'
    },
};

function array2hash(array, keys) {
    var i = 0;
    var res = {};
    for (var k in keys) {
        res[keys[k]] = array[i++];
    }
    return res;
}

function doublearray2hash(array, keys) {
    for (var i in array)
        array[i] = array2hash(array[i], keys);
    return array;
}
