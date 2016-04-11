# TorrentEcho
Node JS tool to facilitate automatic downloading of labeled torrents from rutorrent.

# Docker command
sudo docker run -d --restart always --name echo -p 8080:8080 -v /path/to/download/folder:/download -v /path/to/config:/config darknessgp/rtorrentecho
