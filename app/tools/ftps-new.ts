var spawn = require('child_process').spawn;
var _ = require('lodash');
var dcp = require('duplex-child-process');

export class FTP {
  cmds: Array<string> = [];
  options: FtpsConfigOptions;
  defaults: FtpsConfigOptions = {
    host: '',
    protocol: 'ftp',
    username: '',
    password: '',
    escape: true,
    retries: 1, // LFTP by default tries an unlimited amount of times so we change that here
    timeout: 10, // Time before failing a connection attempt
    retryInterval: 5, // Time in seconds between attempts
    retryIntervalMultiplier: 1, // Multiplier by which retryInterval is multiplied each time new attempt fails
    requiresPassword: true, // Supports Anonymous FTP
    autoConfirm: false, // Auto confirm ssl certificate,
    cwd: '', // Use a different working directory
    additionalLftpCommands: '', // Additional commands to pass to lftp, splitted by ';'
    requireSSHKey: false, // This option for SFTP Protocol with ssh key authentication
    sshKeyPath: '' // ssh key path for, SFTP Protocol with ssh key authentication
  }

  constructor(options) {
    let opts = _.pick(_.extend(this.defaults, options), 'host', 'username', 'password', 'port', 'escape', 'retries', 'timeout', 'retryInterval', 'retryIntervalMultiplier', 'requiresPassword', 'protocol', 'autoConfirm', 'cwd', 'additionalLftpCommands', 'requireSSHKey', 'sshKeyPath')

    if (!opts.host) throw new Error('You need to set a host.')
    if (opts.username && opts.requiresPassword === true && !opts.password) throw new Error('You need to set a password.')
    if (opts.protocol && typeof opts.protocol !== 'string') throw new Error('Protocol needs to be of type string.')
    if (opts.requireSSHKey === true && !opts.sshKeyPath) throw new Error('You need to set a ssh key path.');

    if (opts.protocol && opts.host.indexOf(opts.protocol + '://') !== 0) {
      opts.host = opts.protocol + '://' + opts.host;
    }
    if (opts.port) {
      opts.host = opts.host + ':' + opts.port;
    }
    this.options = opts;
  }

  escapeshell(cmd) {
    if (typeof cmd !== 'string') {
      return ''
    }
    return cmd.replace(/([&"\s'$`\\;])/g, '\\$1')
  }

  _escapeshell(cmd) {
    if (this.options.escape) {
      return this.escapeshell(cmd)
    }
    return cmd
  }

  prepareLFTPOptions() {
    var opts = []

    // Only support SFTP or FISH for ssl autoConfirm
    if ((this.options.protocol.toLowerCase() === 'sftp' || this.options.protocol.toLowerCase() === 'fish') && this.options.autoConfirm) {
      opts.push('set ' + this.options.protocol.toLowerCase() + ':auto-confirm yes')
    }
    // Only support SFTP for openSSH key authentication
    if (this.options.protocol.toLowerCase() === "sftp" && this.options.requireSSHKey) {
      opts.push('set sftp:connect-program "ssh -a -x -i ' + this.options.sshKeyPath + '"')
    }
    opts.push('set net:max-retries ' + this.options.retries)
    opts.push('set net:timeout ' + this.options.timeout)
    opts.push('set net:reconnect-interval-base ' + this.options.retryInterval)
    opts.push('set net:reconnect-interval-multiplier ' + this.options.retryIntervalMultiplier)
    opts.push(this.options.additionalLftpCommands)

    var open = 'open'
    if (this.options.username) {
      open += ' -u "' + this._escapeshell(this.options.username) + '","' + this._escapeshell(this.options.password) + '"'
    }
    open += ' "' + this.options.host + '"'
    opts.push(open)
    return opts
  }

  exec(callback, cmds?) {
    if (typeof cmds === 'string') {
      cmds = cmds.split(';')
    }
    if (Array.isArray(cmds)) {
      this.cmds = this.cmds.concat(cmds)
    }
    if (!callback) {
      throw new Error('Callback is missing to exec() function.')
    }
    var cmd = this.prepareLFTPOptions().concat(this.cmds).join(';')
    var spawnoptions: any = {
      deatched: true
    }

    this.cmds = []
    if (this.options.cwd) {
      spawnoptions.cwd = this.options.cwd;
    }

    var lftp = spawn('lftp', ['-c', cmd], spawnoptions)
    var data = ''
    var error = ''

    lftp.stdout.on('data', function (res) {
      data += res
    })
    lftp.stderr.on('data', function (res) {
      error += res
    })
    lftp.on('error', function (err) {
      if (callback) {
        callback(err, {
          error: error || null,
          data: data
        })
      }
      callback = null // Make sure callback is only called once, whether 'exit' event is triggered or not.
    })
    lftp.on('close', function (code) {
      if (callback) {
        callback(null, {
          error: error || null,
          data: data
        })
      }
      // setTimeout(() => {
      //   process.kill(-lftp.pid);
      // }, 1000);
      // process.kill(-lftp.pid);
      lftp.kill();
    })
    return lftp;
  }

  execAsStream(cmds) {
    if (typeof cmds === 'string') {
      cmds = cmds.split(';')
    }
    if (Array.isArray(cmds)) {
      this.cmds = this.cmds.concat(cmds)
    }

    var cmd = this.prepareLFTPOptions().concat(this.cmds).join(';')
    var spawnoptions

    this.cmds = []
    if (this.options.cwd) {
      spawnoptions = {
        cwd: this.options.cwd
      }
    }

    return dcp.spawn('lftp', ['-c', cmd], spawnoptions)
  }

  raw(cmd) {
    if (cmd && typeof cmd === 'string') {
      this.cmds.push(cmd)
    }
    return this
  }

  ls() {
    return this.raw('ls')
  }

  pwd() {
    return this.raw('pwd')
  }

  cd(directory) {
    return this.raw('cd ' + this._escapeshell(directory))
  }

  cat(path) {
    return this.raw('cat ' + this._escapeshell(path))
  }

  put(localPath, remotePath) {
    if (!localPath) {
      return this
    }
    if (!remotePath) {
      return this.raw('put ' + this._escapeshell(localPath))
    }
    return this.raw('put ' + this._escapeshell(localPath) + ' -o ' + this._escapeshell(remotePath))
  }

  addFile = this.put;

  get(remotePath, localPath) {
    if (!remotePath) {
      return this
    }
    if (!localPath) {
      return this.raw('get ' + this._escapeshell(remotePath))
    }
    return this.raw('get ' + this._escapeshell(remotePath) + ' -o ' + this._escapeshell(localPath))
  }

  getFile = this.get;

  mv(from, to) {
    if (!from || !to) {
      return this
    }
    return this.raw('mv ' + this._escapeshell(from) + ' ' + this._escapeshell(to))
  }

  move = this.mv;

  rm () {
    return this.raw('rm ' + Array.prototype.slice.call(arguments).map(this._escapeshell.bind(this)).join(' '))
  }
  remove = this.rm;

  rmdir () {
    return this.raw('rmdir ' + Array.prototype.slice.call(arguments).map(this._escapeshell.bind(this)).join(' '))
  }

  mirror(opts) {
    opts = opts || {}
    opts.remoteDir = opts.remoteDir || '.'
    opts.localDir = opts.localDir || '.'
    opts.options = opts.options || ''
    var raw = 'mirror'
    if (opts.upload === true) {
      raw += ' -R'
    }
    if (opts.parallel === true) {
      raw += ' --parallel'
    }
    if (typeof opts.parallel === 'number' && opts.parallel >= 1) {
      raw += ' --parallel=' + parseInt(opts.parallel, 10)
    }
    if (opts.options) {
      raw += ' ' + opts.options
    }
    if (opts.filter) {
      raw += ' -i "' + String(opts.filter).slice(1, -1) + '"'
    }
    if (opts.upload === true) {
      raw += ' ' + this._escapeshell(opts.localDir) + ' ' + this._escapeshell(opts.remoteDir)
    } else {
      raw += ' ' + this._escapeshell(opts.remoteDir) + ' ' + this._escapeshell(opts.localDir)
    }
    return this.raw(raw)
  }
}

export class FtpsConfigOptions {
  host: string;
  protocol: string;
  username: string;
  password: string;
  escape: boolean;
  retries: number;
  timeout: number;
  retryInterval: number;
  retryIntervalMultiplier: number;
  requiresPassword: boolean;
  autoConfirm: boolean;
  cwd: string;
  additionalLftpCommands: string;
  requireSSHKey: boolean;
  sshKeyPath: string;
}