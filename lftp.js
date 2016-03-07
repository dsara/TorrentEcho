var FTP = require('ftps');

FTP.prototype.mirror = function (remotePath, localPath) {
    if (!localPath || !remotePath) { return this; }

 	return this.raw("mirror -c -vvv " + this._escapeshell(remotePath) + " " + this._escapeshell(localPath));
}

FTP.prototype.pget = function (remotePath, localFolder){
    if (!localFolder || !remotePath) { return this; }

    return this.raw("pget -c -O " + this._escapeshell(localFolder) + " " + this._escapeshell(remotePath));
}

module.exports = FTP;
