var FTP = require('ftps');

FTP.prototype.mirror = function(remotePath, localPath) {
  if (!localPath || !remotePath) {
    return this;
  }

  // Check if the last character is a slash, if not add one so folders are pulled correctly
  var lastChar = remotePath.substr(-1);
  if (lastChar !== '/') {
    remotePath = remotePath + '/';
  }

  return this.raw("mirror -c -vvv " + this._escapeshell(remotePath) + " " + this._escapeshell(localPath));
}

FTP.prototype.queuemirror = function(remotePath, localPath) {
  if (!localPath || !remotePath) {
    return this;
  }

    // Check if the last character is a slash, if not add one so folders are pulled correctly
    var lastChar = remotePath.substr(-1);
    if (lastChar !== '/') {
      remotePath = remotePath + '/';
    }

  return this.raw("queue mirror -c -vvv " + this._escapeshell(remotePath) + " " + this._escapeshell(localPath));
}

FTP.prototype.pget = function(remotePath, localFolder) {
  if (!localFolder || !remotePath) {
    return this;
  }

  return this.raw("pget -c -O " + this._escapeshell(localFolder) + " " + this._escapeshell(remotePath));
}

FTP.prototype.queuepget = function(remotePath, localFolder) {
  if (!localFolder || !remotePath) {
    return this;
  }

  return this.raw("queue pget -c -O " + this._escapeshell(localFolder) + " " + this._escapeshell(remotePath));
}

module.exports = FTP;
