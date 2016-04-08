function Torrent(shouldDownload, isDirectory, name, path, downloadLocation) {
    var self = this;
    self.ShouldDownload = shouldDownload;
    self.IsDirectory = isDirectory;
    self.Path = path;
    self.DownloadLocation = downloadLocation;
    self.Name = name;
}

module.exports = Torrent;
