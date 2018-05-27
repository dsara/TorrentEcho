var url = require('url');
var fs = require('fs');
var zlib = require('zlib');
var https = require('http');
var logs = require('./logs');
var request = require('request').defaults({
  jar: true,
  gzip: true,
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    'Accept-Encoding': 'gzip, defalte, br'
  }
});

module.exports = class Deluge {
  constructor(options) {
    this.host = (options && options['host']) || '127.0.0.1';
    this.port = (options && options['port']) || 80;
    this.path = (options && options['path']) || '/deluge/json';
    this.pass = (options && options['pass']) || null;
    this.id = 0;
  }

  authenticate() {
    var options = {
      uri: 'https://' + this.host + this.path,
      json: {
        method: methods.login,
        params: [this.pass],
        id: this.id++
      }
    };

    return new Promise(function(resolve, reject) {
      request(options, function(error, response, body) {
        if (error) {
          reject(error);
        } else {
          resolve(body);
        }
      });
    });
  }

  call(method, params) {
    return this.authenticate().then((auth) => {
      var options = {
        uri: 'https://' + this.host + this.path,
        json: {
          method: method,
          params: params,
          id: this.id++
        }
      };

      return new Promise((resolve, reject) => {
        request(options, function(error, response, body) {
          if (error) {
            reject(error);
          } else {
            resolve(body);
          }
        });
      });
    });
  }

  getTorrents(label) {
    return this.call(methods.getTorrrents, [
      [fields.torrents.name, fields.torrents.state, fields.torrents.savePath, fields.torrents.label, fields.torrents.progress],
      {
        label: label,
        state: ['Downloading', 'Seeding', 'Paused']
      }
    ]);
  }

  getSingleTorrent(hash) {
    return this.call(methods.getTorrent, [
      hash,
      [fields.torrents.name, fields.torrents.state, fields.torrents.savePath, fields.torrents.label, fields.torrents.progress]
    ]);
  }

  changeTorrentLabel(hash, label) {
    return this.call(methods.setLabel, [hash, label]);
  }

  removeTorrent(hash, removeFiles) {
    return this.call(methods.removeTorrent, [hash, removeFiles]);
  }
}

const fields = {
  torrents: {
    name: 'name',
    state: 'state',
    savePath: 'save_path',
    label: 'label',
    progress: 'progress'
  }
};

const methods = {
  login: 'auth.login',
  setLabel: 'label.set_torrent',
  removeTorrent: 'core.remove_torrent',
  getTorrrents: 'web.update_ui',
  getTorrent: 'web.get_torrent_status'
};
