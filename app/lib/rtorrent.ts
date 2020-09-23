import * as xmlrpc from 'xmlrpc';
import * as url from 'url';
import * as fs from 'fs';
import utilities from '../tools/util';
import { RTorrentData } from '../tools/rtorrent.model';

const util = utilities.getInstance();

export class RTorrent {
  props = util.config.props;
  isSecure = false;
  client: xmlrpc.Client;

  constructor() {
    if (this.props.isSecure) {
      this.isSecure = true;
      // process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
      this.client = xmlrpc.createSecureClient({
        host: this.props.webHost,
        port: this.props.webPort,
        path: this.props.webPath,
        headers: {
          'User-Agent': 'NodeJS XML-RPC Client',
          'Content-Type': 'text/xml',
          'Accept': 'text/xml',
          'Accept-Charset': 'UTF8',
          'Connection': 'Close'
        },
        basic_auth: {
          user: this.props.user,
          pass: this.props.pass
        }
      });
    } else {
      this.isSecure = false;
      this.client = xmlrpc.createClient({
        host: this.props.webHost,
        port: this.props.webPort,
        path: this.props.webPath,
        headers: {
          'User-Agent': 'NodeJS XML-RPC Client',
          'Content-Type': 'text/xml',
          'Accept': 'text/xml',
          'Accept-Charset': 'UTF8',
          'Connection': 'Close'
        },
        basic_auth: {
          user: this.props.user,
          pass: this.props.pass
        }
      });
    }

    // this.client.methodCall('d.multicall', ['main', 'd.hash=', 'd.name=', 'd.custom1=', 'd.base_path=', 'd.complete=', 'd.is_multi_file='], (error, value) => {
    //   if (error) {
    //     console.log('error:', error);
    //   } else {
    //     console.log('value', value);
    //   }
    // });

    // // this.client.methodCall('system.listMethods', [], (error, value) => {
    // //   if (error) {
    // //     console.log('error:', error);
    // //   } else {
    // //     console.log('value', value);
    // //   }
    // // });

    // this.client.methodCall('d.custom1.set', ['8CED158F90D0F2F17C5339DD82786575D9385844', 'stuff'], (error, value) => {
    //   if (error) {
    //     console.log(error);
    //   } else {
    //     console.log(value);
    //   }
    // });
  }

  getTorrents(label: string): Promise<Array<RTorrentData>> {
    const results = new Array<RTorrentData>();
    return new Promise((resolve, reject) => {
      this.client.methodCall('d.multicall', ['main', 'd.hash=', 'd.name=', 'd.custom1=', 'd.base_path=', 'd.complete=', 'd.is_multi_file='], (error, value: Array<Array<string>>) => {
        if (error) {
          console.log('error:', error);
          reject('method call failure');
        } else {
          value.filter((torrent, index) => {
            return torrent[2] === label;
          }).forEach(filteredTorrent => {
            results.push({
              hash: filteredTorrent[0],
              torrentName: filteredTorrent[1],
              label: filteredTorrent[2],
              path: filteredTorrent[3],
              complete: filteredTorrent[4] === '1' ? true : false,
              isMultiFile: filteredTorrent[5] === '1' ? true : false
            });
          });

          resolve(results);
        }
      });
    });
  }

  changeTorrentLabel(hash: string, label: string): Promise<boolean> {
    return new Promise((resovle, reject) => {
      this.client.methodCall('d.custom1.set', [hash, label], (error, value) => {
        if (error) {
          console.log(error);
          reject('label change failed');
        } else {
          resovle(true);
        }
      });
    });
  }

  isTorrentDone(hash: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      this.client.methodCall('d.get_complete', [hash], (error, isComplete) => {
        if (error) {
          console.log('error:', error);
          reject('check for torrent done failed');
        } else {
          resolve(isComplete === '1' ? true : false);
        }
      });
    });
  }
}
