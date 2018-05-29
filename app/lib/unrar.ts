import * as fs from 'fs';
import * as path from 'path';
import * as rarModule from 'node-unrar';
import { Logs } from '../tools/logging';

export namespace Unrar {

  export function HandleFolder(folderPath: string, unrarFinished: Function) {
    // figure out path to the rar file, if there is one
    let rarFile = '';
    const files = fs.readdirSync(folderPath);

    for (const i in files) {
      if (path.extname(files[i]) === '.rar') {
        rarFile = files[i];
        break;
      }
    }

    // Ensure we have a rar file to unrar
    if (rarFile !== '') {
      // Construct the rar module with the full rar path
      const rar = new rarModule(folderPath + '/' + rarFile);

      rar.extract(folderPath, null, (error) => {
        if (error) {
          Logs.writeError('Unrar for ' + folderPath + ' failed: ' + error);
          return unrarFinished(error, false);
        } else {
          Logs.writeMessage(rarFile + ' extracted');
          return unrarFinished(undefined, true);
        }
      });
    } else {
      return unrarFinished(undefined, true);
    }
  }
}
