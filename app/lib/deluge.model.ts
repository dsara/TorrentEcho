export interface DelugeCallJSON {
  id: number;
  method: string;
  params: Array<any>;
}

export interface DelugeAuthLogin {
  id: number;
  result: boolean;
  error: any;
}

export interface DelugeGeneralResult {
  id: number;
  result: any;
  error: any;
}

export interface DelugeTorrentResults {
  id: number;
  result: {
    stats: {
      upload_protocol_rate: number,
      max_upload: number,
      download_protocol_rate: number,
      download_rate: number,
      has_incoming_connections: boolean,
      num_connections: number,
      max_download: number,
      upload_rate: number,
      dht_nodes: number,
      free_space: number,
      max_num_connections: number
    },
    connected: boolean,
    torrents: {
      [key: string]: DelugeTorrent
    },
    filters: {
      state: [
        [string, number]
      ],
      tracker_host: [
        [string, number]
      ],
      label: [
        [string, number]
      ]
    }
  };
  error: any;
}

export interface DelugeSingleTorrentResult {
  id: number;
  result: DelugeTorrent;
  error: any;
}

export interface DelugeTorrent {
  max_download_speed: number;
  upload_payload_rate: number;
  download_payload_rate: number;
  num_peers: number;
  ratio: number;
  total_peers: number;
  state: string;
  label: string;
  max_upload_speed: number;
  eta: number;
  save_path: string;
  progress: number;
  time_added: number;
  tracker_host: string;
  total_uploaded: number;
  total_done: number;
  total_wanted: number;
  total_seeds: number;
  seeds_peers_ratio: number;
  num_seeds: number;
  name: string;
  is_auto_managed: boolean;
  queue: number;
  distributed_copies: number;
}
