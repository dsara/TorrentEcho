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
            logging_1.Logs.writeMessage("Wrote lftp mirror command: mirror -c " + this.ftpsInstance.escapeshell(remotePath + '/' + torrentName));
            this.ftpsInstance.raw("mirror -c " + remotePath + "/" + torrentName);
        }
    };
    SFTP.prototype.addPGetCommand = function (remotePath, torrentName) {
        if (remotePath && torrentName) {
            logging_1.Logs.writeMessage("Wrote lftp pget command: pget -c " + this.ftpsInstance.escapeshell(remotePath + '/' + torrentName));
            this.ftpsInstance.raw("pget -c " + this.ftpsInstance.escapeshell(remotePath + '/' + torrentName));
        }
    };
    SFTP.prototype.executeCommands = function (callback) {
        logging_1.Logs.writeMessage('Executing stored lftp commands');
        return this.ftpsInstance.exec(callback);
    };
    return SFTP;
}());
exports.SFTP = SFTP;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGZ0cC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL2FwcC9saWIvbGZ0cC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLDJCQUE2QjtBQUM3Qiw0Q0FBd0M7QUFDeEMsc0NBQXNDO0FBR3RDLElBQU0sSUFBSSxHQUFHLGNBQVMsQ0FBQyxXQUFXLEVBQUUsQ0FBQztBQUVyQztJQUdFO1FBQ0UsSUFBTSxXQUFXLEdBQUcsMkJBQXlCLElBQUksQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLElBQUksdURBQ3pCLElBQUksQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLElBQUksb0VBQ1AsQ0FBQztRQUMxRCxJQUFNLFdBQVcsR0FBRyxvSkFFa0MsSUFBSSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsa0JBQW9CLENBQUM7UUFFN0YsSUFBSSxDQUFDLFlBQVksR0FBRyxJQUFJLElBQUksQ0FBQztZQUMzQixJQUFJLEVBQUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsSUFBSTtZQUM1QixRQUFRLEVBQUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsSUFBSTtZQUNoQyxRQUFRLEVBQUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsSUFBSTtZQUNoQyxJQUFJLEVBQUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsSUFBSTtZQUM1QixPQUFPLEVBQUUsQ0FBQztZQUNWLGFBQWEsRUFBRSxFQUFFO1lBQ2pCLFFBQVEsRUFBRSxNQUFNO1lBQ2hCLFdBQVcsRUFBRSxJQUFJO1lBQ2pCLHNCQUFzQixFQUFFLFdBQVcsR0FBRyxHQUFHLEdBQUcsV0FBVztTQUN4RCxDQUFDLENBQUM7SUFDTCxDQUFDO0lBRUQsK0JBQWdCLEdBQWhCLFVBQWlCLFVBQWtCLEVBQUUsa0JBQTBCLEVBQUUsV0FBbUI7UUFDbEYsSUFBSSxVQUFVLElBQUksV0FBVyxFQUFFO1lBRTdCLElBQU0sUUFBUSxHQUFHLGtCQUFrQixDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQy9DLElBQUksUUFBUSxLQUFLLEdBQUcsRUFBRTtnQkFDcEIsa0JBQWtCLEdBQUcsa0JBQWtCLEdBQUcsR0FBRyxDQUFDO2FBQy9DO1lBRUQsY0FBSSxDQUFDLFlBQVksQ0FBQywwQ0FBd0MsSUFBSSxDQUFDLFlBQVksQ0FBQyxXQUFXLENBQUMsVUFBVSxHQUFHLEdBQUcsR0FBRyxXQUFXLENBQUcsQ0FBQyxDQUFDO1lBQzNILElBQUksQ0FBQyxZQUFZLENBQUMsR0FBRyxDQUFDLGVBQWEsVUFBVSxTQUFJLFdBQWEsQ0FBQyxDQUFDO1NBQ2pFO0lBQ0gsQ0FBQztJQUVELDZCQUFjLEdBQWQsVUFBZSxVQUFrQixFQUFFLFdBQW1CO1FBQ3BELElBQUksVUFBVSxJQUFJLFdBQVcsRUFBRTtZQUM3QixjQUFJLENBQUMsWUFBWSxDQUFDLHNDQUFvQyxJQUFJLENBQUMsWUFBWSxDQUFDLFdBQVcsQ0FBQyxVQUFVLEdBQUcsR0FBRyxHQUFHLFdBQVcsQ0FBRyxDQUFDLENBQUM7WUFDdkgsSUFBSSxDQUFDLFlBQVksQ0FBQyxHQUFHLENBQUMsYUFBVyxJQUFJLENBQUMsWUFBWSxDQUFDLFdBQVcsQ0FBQyxVQUFVLEdBQUcsR0FBRyxHQUFHLFdBQVcsQ0FBRyxDQUFDLENBQUM7U0FDbkc7SUFDSCxDQUFDO0lBRUQsOEJBQWUsR0FBZixVQUFnQixRQUFpQztRQUMvQyxjQUFJLENBQUMsWUFBWSxDQUFDLGdDQUFnQyxDQUFDLENBQUM7UUFDcEQsT0FBTyxJQUFJLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQztJQUMxQyxDQUFDO0lBQ0gsV0FBQztBQUFELENBQUMsQUFoREQsSUFnREM7QUFoRFksb0JBQUkiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgKiBhcyBmdHBzIGZyb20gJ2Z0cHMnO1xyXG5pbXBvcnQgeyBMb2dzIH0gZnJvbSAnLi4vdG9vbHMvbG9nZ2luZyc7XHJcbmltcG9ydCB1dGlsaXRpZXMgZnJvbSAnLi4vdG9vbHMvdXRpbCc7XHJcblxyXG4vLyBjb25zdCBsb2dzID0gbG9nZ2luZy5nZXRJbnN0YW5jZSgpO1xyXG5jb25zdCB1dGlsID0gdXRpbGl0aWVzLmdldEluc3RhbmNlKCk7XHJcblxyXG5leHBvcnQgY2xhc3MgU0ZUUCB7XHJcbiAgZnRwc0luc3RhbmNlOiBhbnk7XHJcblxyXG4gIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgY29uc3QgcGdldENvbW1hbmQgPSBgc2V0IG1pcnJvcjp1c2UtcGdldC1uICR7dXRpbC5jb25maWcucHJvcHMucGdldH07XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICBzZXQgcGdldDpkZWZhdWx0LW4gJHt1dGlsLmNvbmZpZy5wcm9wcy5wZ2V0fTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgIHNldCBuZXQ6bGltaXQtdG90YWwtcmF0ZSAyOTM2MDEyODowYDtcclxuICAgIGNvbnN0IHRlbXBDb21tYW5kID0gYHNldCB4ZmVyOnVzZS10ZW1wLWZpbGUgdHJ1ZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgIHNldCB4ZmVyOnRlbXAtZmlsZS1uYW1lICoudG1wO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgc2V0IHhmZXI6ZGVzdGluYXRpb24tZGlyZWN0b3J5ICR7dXRpbC5jb25maWcucHJvcHMucm9vdERvd25sb2FkRm9sZGVyfWA7XHJcblxyXG4gICAgdGhpcy5mdHBzSW5zdGFuY2UgPSBuZXcgZnRwcyh7XHJcbiAgICAgIGhvc3Q6IHV0aWwuY29uZmlnLnByb3BzLmhvc3QsXHJcbiAgICAgIHVzZXJuYW1lOiB1dGlsLmNvbmZpZy5wcm9wcy51c2VyLFxyXG4gICAgICBwYXNzd29yZDogdXRpbC5jb25maWcucHJvcHMucGFzcyxcclxuICAgICAgcG9ydDogdXRpbC5jb25maWcucHJvcHMucG9ydCxcclxuICAgICAgcmV0cmllczogMixcclxuICAgICAgcmV0cnlJbnRlcnZhbDogMTAsXHJcbiAgICAgIHByb3RvY29sOiAnc2Z0cCcsXHJcbiAgICAgIGF1dG9Db25maXJtOiB0cnVlLFxyXG4gICAgICBhZGRpdGlvbmFsTGZ0cENvbW1hbmRzOiBwZ2V0Q29tbWFuZCArICc7JyArIHRlbXBDb21tYW5kXHJcbiAgICB9KTtcclxuICB9XHJcblxyXG4gIGFkZE1pcnJvckNvbW1hbmQocmVtb3RlUGF0aDogc3RyaW5nLCByb290RG93bmxvYWRGb2xkZXI6IHN0cmluZywgdG9ycmVudE5hbWU6IHN0cmluZyk6IHZvaWQge1xyXG4gICAgaWYgKHJlbW90ZVBhdGggJiYgdG9ycmVudE5hbWUpIHtcclxuXHJcbiAgICAgIGNvbnN0IGxhc3RDaGFyID0gcm9vdERvd25sb2FkRm9sZGVyLnN1YnN0cigtMSk7XHJcbiAgICAgIGlmIChsYXN0Q2hhciAhPT0gJy8nKSB7XHJcbiAgICAgICAgcm9vdERvd25sb2FkRm9sZGVyID0gcm9vdERvd25sb2FkRm9sZGVyICsgJy8nO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBMb2dzLndyaXRlTWVzc2FnZShgV3JvdGUgbGZ0cCBtaXJyb3IgY29tbWFuZDogbWlycm9yIC1jICR7dGhpcy5mdHBzSW5zdGFuY2UuZXNjYXBlc2hlbGwocmVtb3RlUGF0aCArICcvJyArIHRvcnJlbnROYW1lKX1gKTtcclxuICAgICAgdGhpcy5mdHBzSW5zdGFuY2UucmF3KGBtaXJyb3IgLWMgJHtyZW1vdGVQYXRofS8ke3RvcnJlbnROYW1lfWApO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgYWRkUEdldENvbW1hbmQocmVtb3RlUGF0aDogc3RyaW5nLCB0b3JyZW50TmFtZTogc3RyaW5nKTogdm9pZCB7XHJcbiAgICBpZiAocmVtb3RlUGF0aCAmJiB0b3JyZW50TmFtZSkge1xyXG4gICAgICBMb2dzLndyaXRlTWVzc2FnZShgV3JvdGUgbGZ0cCBwZ2V0IGNvbW1hbmQ6IHBnZXQgLWMgJHt0aGlzLmZ0cHNJbnN0YW5jZS5lc2NhcGVzaGVsbChyZW1vdGVQYXRoICsgJy8nICsgdG9ycmVudE5hbWUpfWApO1xyXG4gICAgICB0aGlzLmZ0cHNJbnN0YW5jZS5yYXcoYHBnZXQgLWMgJHt0aGlzLmZ0cHNJbnN0YW5jZS5lc2NhcGVzaGVsbChyZW1vdGVQYXRoICsgJy8nICsgdG9ycmVudE5hbWUpfWApO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgZXhlY3V0ZUNvbW1hbmRzKGNhbGxiYWNrOiAoZXJyb3IsIHJlc3VsdCkgPT4gdm9pZCk6IHZvaWQge1xyXG4gICAgTG9ncy53cml0ZU1lc3NhZ2UoJ0V4ZWN1dGluZyBzdG9yZWQgbGZ0cCBjb21tYW5kcycpO1xyXG4gICAgcmV0dXJuIHRoaXMuZnRwc0luc3RhbmNlLmV4ZWMoY2FsbGJhY2spO1xyXG4gIH1cclxufVxyXG4iXX0=