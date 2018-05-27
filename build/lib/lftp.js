"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ftps = require("ftps");
var logging_1 = require("../tools/logging");
var util_1 = require("../tools/util");
var util = util_1.default.getInstance();
var SFTP = (function () {
    function SFTP() {
        var pgetCommand = "set mirror:use-pget-n " + util.config.props.pget + ";\n                         set pget:default-n " + util.config.props.pget + ";\n                         set net:limit-total-rate 29360128:0";
        var tempCommand = "set xfer:use-temp-file true;\n                         set xfer:temp-file-name *.tmp;\n                         set xfer:destination-directory " + util.config.props.rootDownloadFolder;
        this.ftpsInstance = new ftps({
            host: util.config.props.host,
            username: util.config.props.user,
            password: util.config.props.pass,
            port: util.config.props.port,
            retries: 2,
            retryInterval: 10,
            protocol: 'sftp',
            autoConfirm: true,
            additionalLftpCommands: pgetCommand + ';' + tempCommand
        });
    }
    SFTP.prototype.addMirrorCommand = function (remotePath, rootDownloadFolder, torrentName) {
        if (remotePath && torrentName) {
            var lastChar = rootDownloadFolder.substr(-1);
            if (lastChar !== '/') {
                rootDownloadFolder = rootDownloadFolder + '/';
            }
            logging_1.Logs.writeMessage('Wrote lftp mirror command: ' + 'mirror -c ' + ftps.escapeshell(remotePath + '/' + torrentName));
            this.ftpsInstance.raw('mirror -c ' + remotePath + '/' + torrentName);
        }
    };
    SFTP.prototype.addPGetCommand = function (remotePath, torrentName) {
        if (remotePath && torrentName) {
            logging_1.Logs.writeMessage("Wrote lftp pget command: pget -c " + ftps.escapeshell(remotePath + '/' + torrentName));
            this.ftpsInstance.raw("pget -c " + ftps.escapeshell(remotePath + '/' + torrentName));
        }
    };
    SFTP.prototype.executeCommands = function (callback) {
        logging_1.Logs.writeMessage('Executing stored lftp commands');
        return this.ftpsInstance.exec();
    };
    return SFTP;
}());
exports.SFTP = SFTP;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGZ0cC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL2FwcC9saWIvbGZ0cC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLDJCQUE2QjtBQUM3Qiw0Q0FBd0M7QUFDeEMsc0NBQXNDO0FBR3RDLElBQU0sSUFBSSxHQUFHLGNBQVMsQ0FBQyxXQUFXLEVBQUUsQ0FBQztBQUVyQztJQUdFO1FBQ0UsSUFBTSxXQUFXLEdBQUcsMkJBQXlCLElBQUksQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLElBQUksdURBQ3pCLElBQUksQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLElBQUksb0VBQ1AsQ0FBQztRQUMxRCxJQUFNLFdBQVcsR0FBRyxvSkFFa0MsSUFBSSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsa0JBQW9CLENBQUM7UUFFN0YsSUFBSSxDQUFDLFlBQVksR0FBRyxJQUFJLElBQUksQ0FBQztZQUMzQixJQUFJLEVBQUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsSUFBSTtZQUM1QixRQUFRLEVBQUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsSUFBSTtZQUNoQyxRQUFRLEVBQUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsSUFBSTtZQUNoQyxJQUFJLEVBQUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsSUFBSTtZQUM1QixPQUFPLEVBQUUsQ0FBQztZQUNWLGFBQWEsRUFBRSxFQUFFO1lBQ2pCLFFBQVEsRUFBRSxNQUFNO1lBQ2hCLFdBQVcsRUFBRSxJQUFJO1lBQ2pCLHNCQUFzQixFQUFFLFdBQVcsR0FBRyxHQUFHLEdBQUcsV0FBVztTQUN4RCxDQUFDLENBQUM7SUFDTCxDQUFDO0lBRUQsK0JBQWdCLEdBQWhCLFVBQWlCLFVBQWtCLEVBQUUsa0JBQTBCLEVBQUUsV0FBbUI7UUFDbEYsSUFBSSxVQUFVLElBQUksV0FBVyxFQUFFO1lBRTdCLElBQU0sUUFBUSxHQUFHLGtCQUFrQixDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQy9DLElBQUksUUFBUSxLQUFLLEdBQUcsRUFBRTtnQkFDcEIsa0JBQWtCLEdBQUcsa0JBQWtCLEdBQUcsR0FBRyxDQUFDO2FBQy9DO1lBRUQsY0FBSSxDQUFDLFlBQVksQ0FBQyw2QkFBNkIsR0FBRyxZQUFZLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQyxVQUFVLEdBQUcsR0FBRyxHQUFHLFdBQVcsQ0FBQyxDQUFDLENBQUM7WUFDbkgsSUFBSSxDQUFDLFlBQVksQ0FBQyxHQUFHLENBQUMsWUFBWSxHQUFHLFVBQVUsR0FBRyxHQUFHLEdBQUcsV0FBVyxDQUFDLENBQUM7U0FDdEU7SUFDSCxDQUFDO0lBRUQsNkJBQWMsR0FBZCxVQUFlLFVBQWtCLEVBQUUsV0FBbUI7UUFDcEQsSUFBSSxVQUFVLElBQUksV0FBVyxFQUFFO1lBQzdCLGNBQUksQ0FBQyxZQUFZLENBQUMsc0NBQW9DLElBQUksQ0FBQyxXQUFXLENBQUMsVUFBVSxHQUFHLEdBQUcsR0FBRyxXQUFXLENBQUcsQ0FBQyxDQUFDO1lBQzFHLElBQUksQ0FBQyxZQUFZLENBQUMsR0FBRyxDQUFDLGFBQVcsSUFBSSxDQUFDLFdBQVcsQ0FBQyxVQUFVLEdBQUcsR0FBRyxHQUFHLFdBQVcsQ0FBRyxDQUFDLENBQUM7U0FDdEY7SUFDSCxDQUFDO0lBRUQsOEJBQWUsR0FBZixVQUFnQixRQUFpQztRQUMvQyxjQUFJLENBQUMsWUFBWSxDQUFDLGdDQUFnQyxDQUFDLENBQUM7UUFDcEQsT0FBTyxJQUFJLENBQUMsWUFBWSxDQUFDLElBQUksRUFBRSxDQUFDO0lBQ2xDLENBQUM7SUFDSCxXQUFDO0FBQUQsQ0FBQyxBQWhERCxJQWdEQztBQWhEWSxvQkFBSSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCAqIGFzIGZ0cHMgZnJvbSAnZnRwcyc7XHJcbmltcG9ydCB7IExvZ3MgfSBmcm9tICcuLi90b29scy9sb2dnaW5nJztcclxuaW1wb3J0IHV0aWxpdGllcyBmcm9tICcuLi90b29scy91dGlsJztcclxuXHJcbi8vIGNvbnN0IGxvZ3MgPSBsb2dnaW5nLmdldEluc3RhbmNlKCk7XHJcbmNvbnN0IHV0aWwgPSB1dGlsaXRpZXMuZ2V0SW5zdGFuY2UoKTtcclxuXHJcbmV4cG9ydCBjbGFzcyBTRlRQIHtcclxuICBmdHBzSW5zdGFuY2U6IGFueTtcclxuXHJcbiAgY29uc3RydWN0b3IoKSB7XHJcbiAgICBjb25zdCBwZ2V0Q29tbWFuZCA9IGBzZXQgbWlycm9yOnVzZS1wZ2V0LW4gJHt1dGlsLmNvbmZpZy5wcm9wcy5wZ2V0fTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgIHNldCBwZ2V0OmRlZmF1bHQtbiAke3V0aWwuY29uZmlnLnByb3BzLnBnZXR9O1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgc2V0IG5ldDpsaW1pdC10b3RhbC1yYXRlIDI5MzYwMTI4OjBgO1xyXG4gICAgY29uc3QgdGVtcENvbW1hbmQgPSBgc2V0IHhmZXI6dXNlLXRlbXAtZmlsZSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgc2V0IHhmZXI6dGVtcC1maWxlLW5hbWUgKi50bXA7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICBzZXQgeGZlcjpkZXN0aW5hdGlvbi1kaXJlY3RvcnkgJHt1dGlsLmNvbmZpZy5wcm9wcy5yb290RG93bmxvYWRGb2xkZXJ9YDtcclxuXHJcbiAgICB0aGlzLmZ0cHNJbnN0YW5jZSA9IG5ldyBmdHBzKHtcclxuICAgICAgaG9zdDogdXRpbC5jb25maWcucHJvcHMuaG9zdCxcclxuICAgICAgdXNlcm5hbWU6IHV0aWwuY29uZmlnLnByb3BzLnVzZXIsXHJcbiAgICAgIHBhc3N3b3JkOiB1dGlsLmNvbmZpZy5wcm9wcy5wYXNzLFxyXG4gICAgICBwb3J0OiB1dGlsLmNvbmZpZy5wcm9wcy5wb3J0LFxyXG4gICAgICByZXRyaWVzOiAyLFxyXG4gICAgICByZXRyeUludGVydmFsOiAxMCxcclxuICAgICAgcHJvdG9jb2w6ICdzZnRwJyxcclxuICAgICAgYXV0b0NvbmZpcm06IHRydWUsXHJcbiAgICAgIGFkZGl0aW9uYWxMZnRwQ29tbWFuZHM6IHBnZXRDb21tYW5kICsgJzsnICsgdGVtcENvbW1hbmRcclxuICAgIH0pO1xyXG4gIH1cclxuXHJcbiAgYWRkTWlycm9yQ29tbWFuZChyZW1vdGVQYXRoOiBzdHJpbmcsIHJvb3REb3dubG9hZEZvbGRlcjogc3RyaW5nLCB0b3JyZW50TmFtZTogc3RyaW5nKTogdm9pZCB7XHJcbiAgICBpZiAocmVtb3RlUGF0aCAmJiB0b3JyZW50TmFtZSkge1xyXG5cclxuICAgICAgY29uc3QgbGFzdENoYXIgPSByb290RG93bmxvYWRGb2xkZXIuc3Vic3RyKC0xKTtcclxuICAgICAgaWYgKGxhc3RDaGFyICE9PSAnLycpIHtcclxuICAgICAgICByb290RG93bmxvYWRGb2xkZXIgPSByb290RG93bmxvYWRGb2xkZXIgKyAnLyc7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIExvZ3Mud3JpdGVNZXNzYWdlKCdXcm90ZSBsZnRwIG1pcnJvciBjb21tYW5kOiAnICsgJ21pcnJvciAtYyAnICsgZnRwcy5lc2NhcGVzaGVsbChyZW1vdGVQYXRoICsgJy8nICsgdG9ycmVudE5hbWUpKTtcclxuICAgICAgdGhpcy5mdHBzSW5zdGFuY2UucmF3KCdtaXJyb3IgLWMgJyArIHJlbW90ZVBhdGggKyAnLycgKyB0b3JyZW50TmFtZSk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBhZGRQR2V0Q29tbWFuZChyZW1vdGVQYXRoOiBzdHJpbmcsIHRvcnJlbnROYW1lOiBzdHJpbmcpOiB2b2lkIHtcclxuICAgIGlmIChyZW1vdGVQYXRoICYmIHRvcnJlbnROYW1lKSB7XHJcbiAgICAgIExvZ3Mud3JpdGVNZXNzYWdlKGBXcm90ZSBsZnRwIHBnZXQgY29tbWFuZDogcGdldCAtYyAke2Z0cHMuZXNjYXBlc2hlbGwocmVtb3RlUGF0aCArICcvJyArIHRvcnJlbnROYW1lKX1gKTtcclxuICAgICAgdGhpcy5mdHBzSW5zdGFuY2UucmF3KGBwZ2V0IC1jICR7ZnRwcy5lc2NhcGVzaGVsbChyZW1vdGVQYXRoICsgJy8nICsgdG9ycmVudE5hbWUpfWApO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgZXhlY3V0ZUNvbW1hbmRzKGNhbGxiYWNrOiAoZXJyb3IsIHJlc3VsdCkgPT4gdm9pZCk6IHZvaWQge1xyXG4gICAgTG9ncy53cml0ZU1lc3NhZ2UoJ0V4ZWN1dGluZyBzdG9yZWQgbGZ0cCBjb21tYW5kcycpO1xyXG4gICAgcmV0dXJuIHRoaXMuZnRwc0luc3RhbmNlLmV4ZWMoKTtcclxuICB9XHJcbn1cclxuIl19