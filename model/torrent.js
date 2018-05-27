module.exports = class Torrent {
    constructor(shouldDownload, isDirectory, torrentName, remotePath, downloadLocation) {
        this.ShouldDownload = shouldDownload;
        this.IsDirectory = isDirectory;
        this.RemotePath = remotePath;
        this.DownloadLocation = downloadLocation;
        this.Name = torrentName;
    }
}