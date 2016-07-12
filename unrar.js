var fs = require('fs');
var path = require('path');
var rarModule = require('node-unrar');

function Unrar(config) {};

// Method for checking if there are rar'd files to uncompress
Unrar.prototype.HandleFolder = function(folderPath) {
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

        rar.extract(folderPath, null, function(err) {
            if (err) {
                WriteMessage("Error in unrar for " + folderPath + " ERROR: " + err);
            } else {
                WriteMessage(rarFile + " extracted");
            }
        });
    }
}

module.exports = Unrar;
