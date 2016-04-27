# TorrentEcho
Node JS tool to facilitate automatic downloading of labeled torrents from rutorrent.
This tool is somewhat simplistic in it's approach. A web request is made to it specifying the rutorrent label. It will then look at all current torrents with that label and attempt to download them to the specified folder in the config via lftp. If they are incomplete, it will periodically check if it is completed and then attempt to download when complete.

# Docker command
sudo docker run -d --restart always --name echo -p 8080:8080 -v /path/to/download/folder:/download -v /path/to/config:/config darknessgp/rtorrentecho

# Dependencies
This tool requires that you are running rutorrent on your remote server as well as using the same username and password for rutorrent and sftp access.

# Simple Web hook
To trigger a download, the url structure is download/[Label] where [Label] is the rutorrent label you want to download.
