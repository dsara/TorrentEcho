var fs = require('fs');
var path = require('path');
var rarModule = require('node-unrar');
var logs = require('./logs');

module.exports = class Unrar {
    constructor(config) {

    }

    /**
     * @param {string} full path location
     * @param {function(Error, boolean): void} callback when unrar is done
     */
    HandleFolder(folderPath, unrarFinished) {
        //figure out path to the rar file, if there is one
        var rarFile = '';
        var files = fs.readdirSync(folderPath);

        for (var i in files) {
            if (path.extname(files[i]) === ".rar") {
                rarFile = files[i];
                break;
            }
        }

        // Ensure we have a rar file to unrar
        if (rarFile !== '') {
            // Construct the rar module with the full rar path
            var rar = new rarModule(folderPath + "/" + rarFile);

            rar.extract(folderPath, null, (error) => {
                if (error) {
                    logs.writeError("Unrar for " + folderPath + " failed: " + error);
                    return unrarFinished(error, false);
                } else {
                    logs.writeMessage(rarFile + " extracted");
                    return unrarFinished(undefined, true);
                }
            });
        } else {
            return unrarFinished(undefined, true);
        }
    }
}