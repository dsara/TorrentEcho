"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var fs = require("fs");
var path = require("path");
var rarModule = require("node-unrar");
var logging_1 = require("../tools/logging");
var Unrar = (function () {
    function Unrar() {
    }
    Unrar.prototype.HandleFolder = function (folderPath, unrarFinished) {
        var rarFile = '';
        var files = fs.readdirSync(folderPath);
        for (var i in files) {
            if (path.extname(files[i]) === '.rar') {
                rarFile = files[i];
                break;
            }
        }
        if (rarFile !== '') {
            var rar = new rarModule(folderPath + '/' + rarFile);
            rar.extract(folderPath, null, function (error) {
                if (error) {
                    logging_1.Logs.writeError('Unrar for ' + folderPath + ' failed: ' + error);
                    return unrarFinished(error, false);
                }
                else {
                    logging_1.Logs.writeMessage(rarFile + ' extracted');
                    return unrarFinished(undefined, true);
                }
            });
        }
        else {
            return unrarFinished(undefined, true);
        }
    };
    return Unrar;
}());
exports.Unrar = Unrar;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidW5yYXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9hcHAvbGliL3VucmFyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsdUJBQXlCO0FBQ3pCLDJCQUE2QjtBQUM3QixzQ0FBd0M7QUFDeEMsNENBQXdDO0FBRXhDO0lBQ0U7SUFBZSxDQUFDO0lBRWhCLDRCQUFZLEdBQVosVUFBYSxVQUFrQixFQUFFLGFBQXVCO1FBRXRELElBQUksT0FBTyxHQUFHLEVBQUUsQ0FBQztRQUNqQixJQUFNLEtBQUssR0FBRyxFQUFFLENBQUMsV0FBVyxDQUFDLFVBQVUsQ0FBQyxDQUFDO1FBRXpDLEtBQUssSUFBTSxDQUFDLElBQUksS0FBSyxFQUFFO1lBQ3JCLElBQUksSUFBSSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxNQUFNLEVBQUU7Z0JBQ3JDLE9BQU8sR0FBRyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQ25CLE1BQU07YUFDUDtTQUNGO1FBR0QsSUFBSSxPQUFPLEtBQUssRUFBRSxFQUFFO1lBRWxCLElBQU0sR0FBRyxHQUFHLElBQUksU0FBUyxDQUFDLFVBQVUsR0FBRyxHQUFHLEdBQUcsT0FBTyxDQUFDLENBQUM7WUFFdEQsR0FBRyxDQUFDLE9BQU8sQ0FBQyxVQUFVLEVBQUUsSUFBSSxFQUFFLFVBQUMsS0FBSztnQkFDbEMsSUFBSSxLQUFLLEVBQUU7b0JBQ1QsY0FBSSxDQUFDLFVBQVUsQ0FBQyxZQUFZLEdBQUcsVUFBVSxHQUFHLFdBQVcsR0FBRyxLQUFLLENBQUMsQ0FBQztvQkFDakUsT0FBTyxhQUFhLENBQUMsS0FBSyxFQUFFLEtBQUssQ0FBQyxDQUFDO2lCQUNwQztxQkFBTTtvQkFDTCxjQUFJLENBQUMsWUFBWSxDQUFDLE9BQU8sR0FBRyxZQUFZLENBQUMsQ0FBQztvQkFDMUMsT0FBTyxhQUFhLENBQUMsU0FBUyxFQUFFLElBQUksQ0FBQyxDQUFDO2lCQUN2QztZQUNILENBQUMsQ0FBQyxDQUFDO1NBQ0o7YUFBTTtZQUNMLE9BQU8sYUFBYSxDQUFDLFNBQVMsRUFBRSxJQUFJLENBQUMsQ0FBQztTQUN2QztJQUNILENBQUM7SUFDSCxZQUFDO0FBQUQsQ0FBQyxBQWpDRCxJQWlDQztBQWpDWSxzQkFBSyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCAqIGFzIGZzIGZyb20gJ2ZzJztcclxuaW1wb3J0ICogYXMgcGF0aCBmcm9tICdwYXRoJztcclxuaW1wb3J0ICogYXMgcmFyTW9kdWxlIGZyb20gJ25vZGUtdW5yYXInO1xyXG5pbXBvcnQgeyBMb2dzIH0gZnJvbSAnLi4vdG9vbHMvbG9nZ2luZyc7XHJcblxyXG5leHBvcnQgY2xhc3MgVW5yYXIge1xyXG4gIGNvbnN0cnVjdG9yKCkge31cclxuXHJcbiAgSGFuZGxlRm9sZGVyKGZvbGRlclBhdGg6IHN0cmluZywgdW5yYXJGaW5pc2hlZDogRnVuY3Rpb24pIHtcclxuICAgIC8vIGZpZ3VyZSBvdXQgcGF0aCB0byB0aGUgcmFyIGZpbGUsIGlmIHRoZXJlIGlzIG9uZVxyXG4gICAgbGV0IHJhckZpbGUgPSAnJztcclxuICAgIGNvbnN0IGZpbGVzID0gZnMucmVhZGRpclN5bmMoZm9sZGVyUGF0aCk7XHJcblxyXG4gICAgZm9yIChjb25zdCBpIGluIGZpbGVzKSB7XHJcbiAgICAgIGlmIChwYXRoLmV4dG5hbWUoZmlsZXNbaV0pID09PSAnLnJhcicpIHtcclxuICAgICAgICByYXJGaWxlID0gZmlsZXNbaV07XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvLyBFbnN1cmUgd2UgaGF2ZSBhIHJhciBmaWxlIHRvIHVucmFyXHJcbiAgICBpZiAocmFyRmlsZSAhPT0gJycpIHtcclxuICAgICAgLy8gQ29uc3RydWN0IHRoZSByYXIgbW9kdWxlIHdpdGggdGhlIGZ1bGwgcmFyIHBhdGhcclxuICAgICAgY29uc3QgcmFyID0gbmV3IHJhck1vZHVsZShmb2xkZXJQYXRoICsgJy8nICsgcmFyRmlsZSk7XHJcblxyXG4gICAgICByYXIuZXh0cmFjdChmb2xkZXJQYXRoLCBudWxsLCAoZXJyb3IpID0+IHtcclxuICAgICAgICBpZiAoZXJyb3IpIHtcclxuICAgICAgICAgIExvZ3Mud3JpdGVFcnJvcignVW5yYXIgZm9yICcgKyBmb2xkZXJQYXRoICsgJyBmYWlsZWQ6ICcgKyBlcnJvcik7XHJcbiAgICAgICAgICByZXR1cm4gdW5yYXJGaW5pc2hlZChlcnJvciwgZmFsc2UpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICBMb2dzLndyaXRlTWVzc2FnZShyYXJGaWxlICsgJyBleHRyYWN0ZWQnKTtcclxuICAgICAgICAgIHJldHVybiB1bnJhckZpbmlzaGVkKHVuZGVmaW5lZCwgdHJ1ZSk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9KTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIHJldHVybiB1bnJhckZpbmlzaGVkKHVuZGVmaW5lZCwgdHJ1ZSk7XHJcbiAgICB9XHJcbiAgfVxyXG59XHJcbiJdfQ==