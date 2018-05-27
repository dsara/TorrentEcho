export class Torrent {
  shouldDownload = false;
  isDirectory = false;
  remotePath = '';
  downloadLocation = '';
  name = '';

  constructor(shouldDownload, isDirectory, torrentName, remotePath, downloadLocation) {
    this.shouldDownload = shouldDownload;
    this.isDirectory = isDirectory;
    this.remotePath = remotePath;
    this.downloadLocation = downloadLocation;
    this.name = torrentName;
  }
}

export const fileTypes = ['mkv', 'avi', 'mov', 'mp4', 'm4p', 'mpeg', 'mpg'];
