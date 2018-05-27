"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = require("express");
var sync_1 = require("../lib/sync");
var util_1 = require("../tools/util");
var util = util_1.default.getInstance();
var router = express_1.Router();
router.post('/download/:label', function (req, res) {
    var label = req.params.label;
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    try {
        var syncer = new sync_1.Sync();
        var callback = function (message, end) {
            if (end) {
                res.end(message);
            }
            else {
                res.write(message + ' \n');
            }
        };
        if (label in util.config.props.labelDownloadFolders) {
            syncer.sync(label, util.config.props.rootDownloadFolder + util.config.props.labelDownloadFolders[label], util.config.props.doneLabel, callback);
        }
        else {
            res.end("Label '" + label + "' not found in configuration");
        }
    }
    catch (err) {
        res.end(err);
    }
});
exports.DownloadsController = router;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZG93bmxvYWRzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vYXBwL2FwaS9kb3dubG9hZHMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSxtQ0FBb0Q7QUFDcEQsb0NBQW1DO0FBQ25DLHNDQUFzQztBQUN0QyxJQUFNLElBQUksR0FBRyxjQUFTLENBQUMsV0FBVyxFQUFFLENBQUM7QUFFckMsSUFBTSxNQUFNLEdBQVcsZ0JBQU0sRUFBRSxDQUFDO0FBRWhDLE1BQU0sQ0FBQyxJQUFJLENBQUMsa0JBQWtCLEVBQUUsVUFBQyxHQUFZLEVBQUUsR0FBYTtJQUMxRCxJQUFNLEtBQUssR0FBRyxHQUFHLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQztJQUMvQixHQUFHLENBQUMsU0FBUyxDQUFDLEdBQUcsRUFBRSxFQUFFLGNBQWMsRUFBRSxZQUFZLEVBQUUsQ0FBQyxDQUFDO0lBRXJELElBQUk7UUFDRixJQUFNLE1BQU0sR0FBRyxJQUFJLFdBQUksRUFBRSxDQUFDO1FBRTFCLElBQU0sUUFBUSxHQUFHLFVBQUMsT0FBTyxFQUFFLEdBQUc7WUFDNUIsSUFBSSxHQUFHLEVBQUU7Z0JBQ1AsR0FBRyxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsQ0FBQzthQUNsQjtpQkFBTTtnQkFDTCxHQUFHLENBQUMsS0FBSyxDQUFDLE9BQU8sR0FBRyxLQUFLLENBQUMsQ0FBQzthQUM1QjtRQUNILENBQUMsQ0FBQztRQUVGLElBQUksS0FBSyxJQUFJLElBQUksQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLG9CQUFvQixFQUFFO1lBQ25ELE1BQU0sQ0FBQyxJQUFJLENBQUMsS0FBSyxFQUNmLElBQUksQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLGtCQUFrQixHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLG9CQUFvQixDQUFDLEtBQUssQ0FBQyxFQUNwRixJQUFJLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxTQUFTLEVBQzNCLFFBQVEsQ0FBQyxDQUFDO1NBQ2I7YUFBTTtZQUNMLEdBQUcsQ0FBQyxHQUFHLENBQUMsWUFBVSxLQUFLLGlDQUE4QixDQUFDLENBQUM7U0FDeEQ7S0FDRjtJQUFDLE9BQU8sR0FBRyxFQUFFO1FBQ1osR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQztLQUNkO0FBQ0gsQ0FBQyxDQUFDLENBQUM7QUFFVSxRQUFBLG1CQUFtQixHQUFXLE1BQU0sQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IFJvdXRlciwgUmVxdWVzdCwgUmVzcG9uc2UgfSBmcm9tICdleHByZXNzJztcclxuaW1wb3J0IHsgU3luYyB9IGZyb20gJy4uL2xpYi9zeW5jJztcclxuaW1wb3J0IHV0aWxpdGllcyBmcm9tICcuLi90b29scy91dGlsJztcclxuY29uc3QgdXRpbCA9IHV0aWxpdGllcy5nZXRJbnN0YW5jZSgpO1xyXG5cclxuY29uc3Qgcm91dGVyOiBSb3V0ZXIgPSBSb3V0ZXIoKTtcclxuXHJcbnJvdXRlci5wb3N0KCcvZG93bmxvYWQvOmxhYmVsJywgKHJlcTogUmVxdWVzdCwgcmVzOiBSZXNwb25zZSkgPT4ge1xyXG4gIGNvbnN0IGxhYmVsID0gcmVxLnBhcmFtcy5sYWJlbDtcclxuICByZXMud3JpdGVIZWFkKDIwMCwgeyAnQ29udGVudC1UeXBlJzogJ3RleHQvcGxhaW4nIH0pO1xyXG5cclxuICB0cnkge1xyXG4gICAgY29uc3Qgc3luY2VyID0gbmV3IFN5bmMoKTtcclxuXHJcbiAgICBjb25zdCBjYWxsYmFjayA9IChtZXNzYWdlLCBlbmQpID0+IHtcclxuICAgICAgaWYgKGVuZCkge1xyXG4gICAgICAgIHJlcy5lbmQobWVzc2FnZSk7XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgcmVzLndyaXRlKG1lc3NhZ2UgKyAnIFxcbicpO1xyXG4gICAgICB9XHJcbiAgICB9O1xyXG5cclxuICAgIGlmIChsYWJlbCBpbiB1dGlsLmNvbmZpZy5wcm9wcy5sYWJlbERvd25sb2FkRm9sZGVycykge1xyXG4gICAgICBzeW5jZXIuc3luYyhsYWJlbCxcclxuICAgICAgICB1dGlsLmNvbmZpZy5wcm9wcy5yb290RG93bmxvYWRGb2xkZXIgKyB1dGlsLmNvbmZpZy5wcm9wcy5sYWJlbERvd25sb2FkRm9sZGVyc1tsYWJlbF0sXHJcbiAgICAgICAgdXRpbC5jb25maWcucHJvcHMuZG9uZUxhYmVsLFxyXG4gICAgICAgIGNhbGxiYWNrKTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIHJlcy5lbmQoYExhYmVsICcke2xhYmVsfScgbm90IGZvdW5kIGluIGNvbmZpZ3VyYXRpb25gKTtcclxuICAgIH1cclxuICB9IGNhdGNoIChlcnIpIHtcclxuICAgIHJlcy5lbmQoZXJyKTtcclxuICB9XHJcbn0pO1xyXG5cclxuZXhwb3J0IGNvbnN0IERvd25sb2Fkc0NvbnRyb2xsZXI6IFJvdXRlciA9IHJvdXRlcjtcclxuIl19