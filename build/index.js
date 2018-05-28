"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express = require("express");
var downloads_1 = require("./api/downloads");
var logging_1 = require("./tools/logging");
var util_1 = require("./tools/util");
var util = util_1.default.getInstance();
process.chdir(util.config.props.nodeDownloadFolder);
var app = express();
var port = 8080;
app.use(function (request, response, next) {
    try {
        logging_1.Logs.writeMessage(request.url);
        next();
    }
    catch (error) {
        logging_1.Logs.writeMessage(error);
    }
});
app.use('/', downloads_1.DownloadsController);
app.listen(port, function () {
    logging_1.Logs.writeMessage("Server listening on: http://localhost:" + port + "/");
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9hcHAvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFDQSxpQ0FBbUM7QUFFbkMsNkNBQXNEO0FBQ3RELDJDQUF1QztBQUN2QyxxQ0FBcUM7QUFDckMsSUFBTSxJQUFJLEdBQUcsY0FBUyxDQUFDLFdBQVcsRUFBRSxDQUFDO0FBRXJDLE9BQU8sQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsa0JBQWtCLENBQUMsQ0FBQztBQUVwRCxJQUFNLEdBQUcsR0FBd0IsT0FBTyxFQUFFLENBQUM7QUFFM0MsSUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDO0FBRWxCLEdBQUcsQ0FBQyxHQUFHLENBQUMsVUFBVSxPQUFPLEVBQUUsUUFBUSxFQUFFLElBQUk7SUFDdkMsSUFBSTtRQUVGLGNBQUksQ0FBQyxZQUFZLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQy9CLElBQUksRUFBRSxDQUFDO0tBQ1I7SUFBQyxPQUFPLEtBQUssRUFBRTtRQUNkLGNBQUksQ0FBQyxZQUFZLENBQUMsS0FBSyxDQUFDLENBQUM7S0FDMUI7QUFDSCxDQUFDLENBQUMsQ0FBQztBQUVILEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxFQUFFLCtCQUFtQixDQUFDLENBQUM7QUFFbEMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxJQUFJLEVBQUU7SUFDZixjQUFJLENBQUMsWUFBWSxDQUFDLDJDQUF5QyxJQUFJLE1BQUcsQ0FBQyxDQUFDO0FBQ3RFLENBQUMsQ0FBQyxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0ICogYXMgaHR0cCBmcm9tICdodHRwJztcclxuaW1wb3J0ICogYXMgZXhwcmVzcyBmcm9tICdleHByZXNzJztcclxuaW1wb3J0ICogYXMgZnMgZnJvbSAnZnMnO1xyXG5pbXBvcnQgeyBEb3dubG9hZHNDb250cm9sbGVyIH0gZnJvbSAnLi9hcGkvZG93bmxvYWRzJztcclxuaW1wb3J0IHsgTG9ncyB9IGZyb20gJy4vdG9vbHMvbG9nZ2luZyc7XHJcbmltcG9ydCB1dGlsaXRpZXMgZnJvbSAnLi90b29scy91dGlsJztcclxuY29uc3QgdXRpbCA9IHV0aWxpdGllcy5nZXRJbnN0YW5jZSgpO1xyXG5cclxucHJvY2Vzcy5jaGRpcih1dGlsLmNvbmZpZy5wcm9wcy5ub2RlRG93bmxvYWRGb2xkZXIpO1xyXG5cclxuY29uc3QgYXBwOiBleHByZXNzLkFwcGxpY2F0aW9uID0gZXhwcmVzcygpO1xyXG5cclxuY29uc3QgcG9ydCA9IDgwODA7XHJcblxyXG5hcHAudXNlKGZ1bmN0aW9uIChyZXF1ZXN0LCByZXNwb25zZSwgbmV4dCkge1xyXG4gIHRyeSB7XHJcbiAgICAvLyBsb2cgdGhlIHJlcXVlc3Qgb24gY29uc29sZVxyXG4gICAgTG9ncy53cml0ZU1lc3NhZ2UocmVxdWVzdC51cmwpO1xyXG4gICAgbmV4dCgpO1xyXG4gIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICBMb2dzLndyaXRlTWVzc2FnZShlcnJvcik7XHJcbiAgfVxyXG59KTtcclxuXHJcbmFwcC51c2UoJy8nLCBEb3dubG9hZHNDb250cm9sbGVyKTtcclxuXHJcbmFwcC5saXN0ZW4ocG9ydCwgKCkgPT4ge1xyXG4gIExvZ3Mud3JpdGVNZXNzYWdlKGBTZXJ2ZXIgbGlzdGVuaW5nIG9uOiBodHRwOi8vbG9jYWxob3N0OiR7cG9ydH0vYCk7XHJcbn0pO1xyXG4iXX0=