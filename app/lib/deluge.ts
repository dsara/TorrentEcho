import * as url from 'url';
import * as fs from 'fs';
import * as zlib from 'zlib';
import * as https from 'https';
import * as requestLib from 'request';
import { Logs } from '../tools/logging';
import { DelugeAuthLogin, DelugeSingleTorrentResult, DelugeTorrent, DelugeTorrentResults, DelugeGeneralResult } from './deluge.model';
import utilities from '../tools/util';

const util = utilities.getInstance();

export class Deluge {
  props = util.config.props;

  request = requestLib.defaults({
    jar: true,
    gzip: true,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      'Accept-Encoding': 'gzip, deflate, br'
    },
    host: 'https://' + this.props.host
  });

  id = 0;

  constructor() {}

  authenticate(): Promise<DelugeAuthLogin> {
    const options: requestLib.UriOptions & requestLib.CoreOptions = {
      uri: `https://${this.props.host}${this.props.path}`,
      json: {
        method: methods.login,
        params: [this.props.pass],
        id: this.id++
      }
    };

    return new Promise((resolve, reject) => {
      this.request(options, (error, response, body) => {
        if (error) {
          reject(error);
        } else {
          resolve(body);
        }
      });
    });
  }

  call<T>(method, params): Promise<T> {
    return this.authenticate().then((auth) => {
      const options: requestLib.UriOptions & requestLib.CoreOptions = {
        uri: `https://${this.props.host}${this.props.path}`,
        json: {
          method: method,
          params: params,
          id: this.id++
        }
      };

      return new Promise<T>((resolve, reject) => {
        this.request(options, (error, response, body) => {
          if (error) {
            reject(error);
          } else {
            resolve(body);
          }
        });
      });
    });
  }

  getTorrents(label: string): Promise<DelugeTorrentResults> {
    return this.call<DelugeTorrentResults>(methods.getTorrrents, [
      [fields.torrents.name, fields.torrents.state, fields.torrents.savePath, fields.torrents.label, fields.torrents.progress],
      {
        label: label,
        state: ['Downloading', 'Seeding', 'Paused']
      }
    ]);
  }

  getSingleTorrent(hash: string): Promise<DelugeSingleTorrentResult> {
    return this.call<DelugeSingleTorrentResult>(methods.getTorrent, [
      hash,
      [fields.torrents.name, fields.torrents.state, fields.torrents.savePath, fields.torrents.label, fields.torrents.progress]
    ]);
  }

  changeTorrentLabel(hash: string, label: string): Promise<DelugeGeneralResult> {
    return this.call<DelugeGeneralResult>(methods.setLabel, [hash, label]);
  }

  removeTorrent(hash: string, removeFiles: boolean): Promise<DelugeGeneralResult> {
    return this.call<DelugeGeneralResult>(methods.removeTorrent, [hash, removeFiles]);
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
