"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Torrent = (function () {
    function Torrent(shouldDownload, isDirectory, torrentName, remotePath, downloadLocation) {
        this.shouldDownload = false;
        this.isDirectory = false;
        this.remotePath = '';
        this.downloadLocation = '';
        this.name = '';
        this.shouldDownload = shouldDownload;
        this.isDirectory = isDirectory;
        this.remotePath = remotePath;
        this.downloadLocation = downloadLocation;
        this.name = torrentName;
    }
    return Torrent;
}());
exports.Torrent = Torrent;
exports.fileTypes = ['mkv', 'avi', 'mov', 'mp4', 'm4p', 'mpeg', 'mpg'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidG9ycmVudC5tb2RlbC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL2FwcC9saWIvdG9ycmVudC5tb2RlbC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBO0lBT0UsaUJBQVksY0FBYyxFQUFFLFdBQVcsRUFBRSxXQUFXLEVBQUUsVUFBVSxFQUFFLGdCQUFnQjtRQU5sRixtQkFBYyxHQUFHLEtBQUssQ0FBQztRQUN2QixnQkFBVyxHQUFHLEtBQUssQ0FBQztRQUNwQixlQUFVLEdBQUcsRUFBRSxDQUFDO1FBQ2hCLHFCQUFnQixHQUFHLEVBQUUsQ0FBQztRQUN0QixTQUFJLEdBQUcsRUFBRSxDQUFDO1FBR1IsSUFBSSxDQUFDLGNBQWMsR0FBRyxjQUFjLENBQUM7UUFDckMsSUFBSSxDQUFDLFdBQVcsR0FBRyxXQUFXLENBQUM7UUFDL0IsSUFBSSxDQUFDLFVBQVUsR0FBRyxVQUFVLENBQUM7UUFDN0IsSUFBSSxDQUFDLGdCQUFnQixHQUFHLGdCQUFnQixDQUFDO1FBQ3pDLElBQUksQ0FBQyxJQUFJLEdBQUcsV0FBVyxDQUFDO0lBQzFCLENBQUM7SUFDSCxjQUFDO0FBQUQsQ0FBQyxBQWRELElBY0M7QUFkWSwwQkFBTztBQWdCUCxRQUFBLFNBQVMsR0FBRyxDQUFDLEtBQUssRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsTUFBTSxFQUFFLEtBQUssQ0FBQyxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiZXhwb3J0IGNsYXNzIFRvcnJlbnQge1xyXG4gIHNob3VsZERvd25sb2FkID0gZmFsc2U7XHJcbiAgaXNEaXJlY3RvcnkgPSBmYWxzZTtcclxuICByZW1vdGVQYXRoID0gJyc7XHJcbiAgZG93bmxvYWRMb2NhdGlvbiA9ICcnO1xyXG4gIG5hbWUgPSAnJztcclxuXHJcbiAgY29uc3RydWN0b3Ioc2hvdWxkRG93bmxvYWQsIGlzRGlyZWN0b3J5LCB0b3JyZW50TmFtZSwgcmVtb3RlUGF0aCwgZG93bmxvYWRMb2NhdGlvbikge1xyXG4gICAgdGhpcy5zaG91bGREb3dubG9hZCA9IHNob3VsZERvd25sb2FkO1xyXG4gICAgdGhpcy5pc0RpcmVjdG9yeSA9IGlzRGlyZWN0b3J5O1xyXG4gICAgdGhpcy5yZW1vdGVQYXRoID0gcmVtb3RlUGF0aDtcclxuICAgIHRoaXMuZG93bmxvYWRMb2NhdGlvbiA9IGRvd25sb2FkTG9jYXRpb247XHJcbiAgICB0aGlzLm5hbWUgPSB0b3JyZW50TmFtZTtcclxuICB9XHJcbn1cclxuXHJcbmV4cG9ydCBjb25zdCBmaWxlVHlwZXMgPSBbJ21rdicsICdhdmknLCAnbW92JywgJ21wNCcsICdtNHAnLCAnbXBlZycsICdtcGcnXTtcclxuIl19