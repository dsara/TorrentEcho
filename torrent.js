function Torrent (shouldDownload, isDirectory, path, downloadLocation) {
    var self = this;
    self.ShouldDownload = shouldDownload;
    self.IsDirectory = isDirectory;
    self.Path = path;
    self.DownloadLocation = downloadLocation;
}

module.exports = Torrent;
