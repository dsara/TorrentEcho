"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express = require("express");
var fs = require("fs");
var downloads_1 = require("./api/downloads");
var logging_1 = require("./util/logging");
var configFile = '/config/config.json';
try {
    var stats = fs.statSync(configFile);
}
catch (e) {
    logging_1.default.writeMessage("Config file not found, creating from sample!");
    fs.writeFileSync(configFile, fs.readFileSync('./config.json.sample'));
}
var config = JSON.parse(fs.readFileSync(configFile, 'utf8'));
process.chdir(config.nodeDownloadFolder);
var app = express();
var port = 8080;
app.use('/', downloads_1.DownloadsController);
app.listen(port, function () {
    logging_1.default.writeMessage("Server listening on: http://localhost:" + port + "/");
});
{
    "mode";
    "xmlrpc",
        "host";
    "riot419.cloud.seedboxes.cc",
        "port";
    41026,
        "path";
    "/deluge/json",
        "user";
    "riot419",
        "pass";
    "vpD9BOLjcQTp4Kxa",
        "chownUser";
    1026,
        "chownGroup";
    101,
        "isSecure";
    true,
        "pget";
    30,
        "useTemp";
    true,
        "rootDownloadFolder";
    "/download",
        "nodeDownloadFolder";
    "/download",
        "labelDownloadFolders";
    {
        "test";
        "/tv";
    }
    "doneLabel";
    "done",
        "doneLabelDelay";
    300,
        "verboseLogging";
    true,
        "syncFolders";
    {
        "tv";
        {
            "source";
            "/download", "destination";
            "/download";
        }
    }
    "syncRemoveSource";
    true;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9hcHAvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFDQSxpQ0FBbUM7QUFDbkMsdUJBQXlCO0FBQ3pCLDZDQUFzRDtBQUN0RCwwQ0FBa0M7QUFHbEMsSUFBTSxVQUFVLEdBQUcscUJBQXFCLENBQUM7QUFDekMsSUFBSTtJQUNGLElBQUksS0FBSyxHQUFHLEVBQUUsQ0FBQyxRQUFRLENBQUMsVUFBVSxDQUFDLENBQUM7Q0FDckM7QUFBQyxPQUFPLENBQUMsRUFBRTtJQUNWLGlCQUFJLENBQUMsWUFBWSxDQUFDLDhDQUE4QyxDQUFDLENBQUM7SUFDbEUsRUFBRSxDQUFDLGFBQWEsQ0FBQyxVQUFVLEVBQUUsRUFBRSxDQUFDLFlBQVksQ0FBQyxzQkFBc0IsQ0FBQyxDQUFDLENBQUM7Q0FDdkU7QUFFRCxJQUFNLE1BQU0sR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxZQUFZLENBQUMsVUFBVSxFQUFFLE1BQU0sQ0FBQyxDQUFDLENBQUM7QUFFL0QsT0FBTyxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsa0JBQWtCLENBQUMsQ0FBQztBQUd6QyxJQUFNLEdBQUcsR0FBd0IsT0FBTyxFQUFFLENBQUM7QUFFM0MsSUFBTSxJQUFJLEdBQVcsSUFBSSxDQUFDO0FBRTFCLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxFQUFFLCtCQUFtQixDQUFDLENBQUM7QUFFbEMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxJQUFJLEVBQUU7SUFDZixpQkFBSSxDQUFDLFlBQVksQ0FBQywyQ0FBeUMsSUFBSSxNQUFHLENBQUMsQ0FBQztBQUN0RSxDQUFDLENBQUMsQ0FBQztBQUtIO0lBQ0UsTUFBTSxDQUFBO0lBQUUsUUFBUTtRQUNoQixNQUFNLENBQUE7SUFBRSw0QkFBNEI7UUFDcEMsTUFBTSxDQUFBO0lBQUUsS0FBSztRQUNiLE1BQU0sQ0FBQTtJQUFFLGNBQWM7UUFDdEIsTUFBTSxDQUFBO0lBQUUsU0FBUztRQUNqQixNQUFNLENBQUE7SUFBRSxrQkFBa0I7UUFDMUIsV0FBVyxDQUFBO0lBQUUsSUFBSTtRQUNqQixZQUFZLENBQUE7SUFBRSxHQUFHO1FBQ2pCLFVBQVUsQ0FBQTtJQUFFLElBQUk7UUFDaEIsTUFBTSxDQUFBO0lBQUUsRUFBRTtRQUNWLFNBQVMsQ0FBQTtJQUFFLElBQUk7UUFDZixvQkFBb0IsQ0FBQTtJQUFDLFdBQVc7UUFDaEMsb0JBQW9CLENBQUE7SUFBQyxXQUFXO1FBQ2hDLHNCQUFzQixDQUFBO0lBQUU7UUFBRSxNQUFNLENBQUE7UUFBRSxLQUFLLENBQUE7S0FBRTtJQUN6QyxXQUFXLENBQUE7SUFBRSxNQUFNO1FBQ25CLGdCQUFnQixDQUFBO0lBQUUsR0FBRztRQUNyQixnQkFBZ0IsQ0FBQTtJQUFFLElBQUk7UUFDdEIsYUFBYSxDQUFBO0lBQUU7UUFBQyxJQUFJLENBQUE7UUFBRTtZQUFFLFFBQVEsQ0FBQTtZQUFFLFdBQVcsRUFBRSxhQUFhLENBQUE7WUFBRSxXQUFXLENBQUE7U0FBQztLQUFDO0lBQzNFLGtCQUFrQixDQUFBO0lBQUUsSUFBSSxDQUFBO0NBQ3pCIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0ICogYXMgaHR0cCBmcm9tICdodHRwJztcclxuaW1wb3J0ICogYXMgZXhwcmVzcyBmcm9tICdleHByZXNzJztcclxuaW1wb3J0ICogYXMgZnMgZnJvbSAnZnMnO1xyXG5pbXBvcnQgeyBEb3dubG9hZHNDb250cm9sbGVyIH0gZnJvbSAnLi9hcGkvZG93bmxvYWRzJztcclxuaW1wb3J0IGxvZ3MgZnJvbSAnLi91dGlsL2xvZ2dpbmcnO1xyXG5cclxuXHJcbmNvbnN0IGNvbmZpZ0ZpbGUgPSAnL2NvbmZpZy9jb25maWcuanNvbic7XHJcbnRyeSB7XHJcbiAgdmFyIHN0YXRzID0gZnMuc3RhdFN5bmMoY29uZmlnRmlsZSk7XHJcbn0gY2F0Y2ggKGUpIHtcclxuICBsb2dzLndyaXRlTWVzc2FnZShcIkNvbmZpZyBmaWxlIG5vdCBmb3VuZCwgY3JlYXRpbmcgZnJvbSBzYW1wbGUhXCIpO1xyXG4gIGZzLndyaXRlRmlsZVN5bmMoY29uZmlnRmlsZSwgZnMucmVhZEZpbGVTeW5jKCcuL2NvbmZpZy5qc29uLnNhbXBsZScpKTtcclxufVxyXG4vLyByZWFkIGluIGFuZCBwYXJzZSB0aGUgY29uZmlnIGZpbGVcclxuY29uc3QgY29uZmlnID0gSlNPTi5wYXJzZShmcy5yZWFkRmlsZVN5bmMoY29uZmlnRmlsZSwgJ3V0ZjgnKSk7XHJcblxyXG5wcm9jZXNzLmNoZGlyKGNvbmZpZy5ub2RlRG93bmxvYWRGb2xkZXIpO1xyXG5cclxuXHJcbmNvbnN0IGFwcDogZXhwcmVzcy5BcHBsaWNhdGlvbiA9IGV4cHJlc3MoKTtcclxuXHJcbmNvbnN0IHBvcnQ6IG51bWJlciA9IDgwODA7XHJcblxyXG5hcHAudXNlKCcvJywgRG93bmxvYWRzQ29udHJvbGxlcik7XHJcblxyXG5hcHAubGlzdGVuKHBvcnQsICgpID0+IHtcclxuICBsb2dzLndyaXRlTWVzc2FnZShgU2VydmVyIGxpc3RlbmluZyBvbjogaHR0cDovL2xvY2FsaG9zdDoke3BvcnR9L2ApO1xyXG59KTtcclxuXHJcblxyXG5cclxuXHJcbntcclxuICBcIm1vZGVcIjogXCJ4bWxycGNcIixcclxuICBcImhvc3RcIjogXCJyaW90NDE5LmNsb3VkLnNlZWRib3hlcy5jY1wiLFxyXG4gIFwicG9ydFwiOiA0MTAyNixcclxuICBcInBhdGhcIjogXCIvZGVsdWdlL2pzb25cIixcclxuICBcInVzZXJcIjogXCJyaW90NDE5XCIsXHJcbiAgXCJwYXNzXCI6IFwidnBEOUJPTGpjUVRwNEt4YVwiLFxyXG4gIFwiY2hvd25Vc2VyXCI6IDEwMjYsXHJcbiAgXCJjaG93bkdyb3VwXCI6IDEwMSxcclxuICBcImlzU2VjdXJlXCI6IHRydWUsXHJcbiAgXCJwZ2V0XCI6IDMwLFxyXG4gIFwidXNlVGVtcFwiOiB0cnVlLFxyXG4gIFwicm9vdERvd25sb2FkRm9sZGVyXCI6XCIvZG93bmxvYWRcIixcclxuICBcIm5vZGVEb3dubG9hZEZvbGRlclwiOlwiL2Rvd25sb2FkXCIsXHJcbiAgXCJsYWJlbERvd25sb2FkRm9sZGVyc1wiOiB7IFwidGVzdFwiOiBcIi90dlwiIH0sXHJcbiAgXCJkb25lTGFiZWxcIjogXCJkb25lXCIsXHJcbiAgXCJkb25lTGFiZWxEZWxheVwiOiAzMDAsXHJcbiAgXCJ2ZXJib3NlTG9nZ2luZ1wiOiB0cnVlLFxyXG4gIFwic3luY0ZvbGRlcnNcIjoge1widHZcIjogeyBcInNvdXJjZVwiOiBcIi9kb3dubG9hZFwiLCBcImRlc3RpbmF0aW9uXCI6IFwiL2Rvd25sb2FkXCJ9fSxcclxuICBcInN5bmNSZW1vdmVTb3VyY2VcIjogdHJ1ZVxyXG59XHJcbiJdfQ==