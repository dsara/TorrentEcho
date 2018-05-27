var ftps = require('ftps');
var logs = require('./logs');
var cp = require('child_process');


module.exports = class FTP extends ftps {
    constructor(config) {
        super(config);
    }

    mirrorTorrent(remotePath, rootDownloadFolder, torrentName) {
        if (!remotePath || !torrentName) {
            return this;
        }

        // Check if the last character is a slash, if not add one so folders are pulled correctly
        // var lastChar = torrentName.substr(-1);
        // if (lastChar !== '/') {
        //     torrentName = torrentName + '/';
        // }

        var lastChar = rootDownloadFolder.substr(-1);
        if (lastChar !== '/') {
            rootDownloadFolder = rootDownloadFolder + '/';
        }

        logs.writeMessage("Wrote lftp mirror command: " + "mirror -c " + this.escapeshell(remotePath + "/" + torrentName));
        //return this.raw("mirror -c " + this.escapeshell(remotePath + "/" + torrentName));
        return this.raw("mirror -c " + remotePath + "/" + torrentName);
    }

    queuemirror(remotePath, localPath) {
        if (!localPath || !remotePath) {
            return this;
        }

        // Check if the last character is a slash, if not add one so folders are pulled correctly
        var lastChar = remotePath.substr(-1);
        if (lastChar !== '/') {
            remotePath = remotePath + '/';
        }
        // Check if the last character is a slash, if not add one so folders are pulled correctly
        var lastChar = localPath.substr(-1);
        if (lastChar !== '/') {
            localPath = localPath + '/';
        }

        return this.raw("queue mirror -c -vvv " + this._escapeshell(remotePath) + " " + this._escapeshell(localPath));
    }

    pget(remotePath, torrentName) {
        if (!remotePath || !torrentName) {
            return this;
        }

        logs.writeMessage('Wrote lftp pget command: ' + 'pget -c ' + this.escapeshell(remotePath + "/" + torrentName));
        return this.raw('pget -c ' + this.escapeshell(remotePath + "/" + torrentName));
        // return this.raw("pget -c -O " + this._escapeshell(localFolder) + " " + this._escapeshell(remotePath));
    }

    queuepget(remotePath, localFolder) {
        if (!localFolder || !remotePath) {
            return this;
        }

        return this.raw("queue pget -c -O " + this._escapeshell(localFolder) + " " + this._escapeshell(remotePath));
    }
}