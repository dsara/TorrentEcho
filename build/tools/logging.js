"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Logs;
(function (Logs) {
    function writeMessage(message, callback, isEnd) {
        console.log((new Date().toLocaleString()) + ' - ' + message.toString());
        if (callback) {
            callback(message, isEnd);
        }
    }
    Logs.writeMessage = writeMessage;
    function writeError(message, callback, isEnd) {
        console.log((new Date().toLocaleString()) + ' - ERROR: ' + message.toString());
        if (callback) {
            callback(message, isEnd);
        }
    }
    Logs.writeError = writeError;
})(Logs = exports.Logs || (exports.Logs = {}));
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibG9nZ2luZy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL2FwcC90b29scy9sb2dnaW5nLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsSUFBaUIsSUFBSSxDQWNwQjtBQWRELFdBQWlCLElBQUk7SUFDbkIsc0JBQTZCLE9BQWUsRUFBRSxRQUFtQixFQUFFLEtBQWU7UUFDaEYsT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksSUFBSSxFQUFFLENBQUMsY0FBYyxFQUFFLENBQUMsR0FBRyxLQUFLLEdBQUcsT0FBTyxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUM7UUFDeEUsSUFBSSxRQUFRLEVBQUU7WUFDWixRQUFRLENBQUMsT0FBTyxFQUFFLEtBQUssQ0FBQyxDQUFDO1NBQzFCO0lBQ0gsQ0FBQztJQUxlLGlCQUFZLGVBSzNCLENBQUE7SUFFRCxvQkFBMkIsT0FBZSxFQUFFLFFBQW1CLEVBQUUsS0FBZTtRQUM5RSxPQUFPLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxJQUFJLEVBQUUsQ0FBQyxjQUFjLEVBQUUsQ0FBQyxHQUFHLFlBQVksR0FBRyxPQUFPLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQztRQUMvRSxJQUFJLFFBQVEsRUFBRTtZQUNaLFFBQVEsQ0FBQyxPQUFPLEVBQUUsS0FBSyxDQUFDLENBQUM7U0FDMUI7SUFDSCxDQUFDO0lBTGUsZUFBVSxhQUt6QixDQUFBO0FBQ0gsQ0FBQyxFQWRnQixJQUFJLEdBQUosWUFBSSxLQUFKLFlBQUksUUFjcEIiLCJzb3VyY2VzQ29udGVudCI6WyJleHBvcnQgbmFtZXNwYWNlIExvZ3Mge1xyXG4gIGV4cG9ydCBmdW5jdGlvbiB3cml0ZU1lc3NhZ2UobWVzc2FnZTogc3RyaW5nLCBjYWxsYmFjaz86IEZ1bmN0aW9uLCBpc0VuZD86IGJvb2xlYW4pIHtcclxuICAgIGNvbnNvbGUubG9nKChuZXcgRGF0ZSgpLnRvTG9jYWxlU3RyaW5nKCkpICsgJyAtICcgKyBtZXNzYWdlLnRvU3RyaW5nKCkpO1xyXG4gICAgaWYgKGNhbGxiYWNrKSB7XHJcbiAgICAgIGNhbGxiYWNrKG1lc3NhZ2UsIGlzRW5kKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIGV4cG9ydCBmdW5jdGlvbiB3cml0ZUVycm9yKG1lc3NhZ2U6IHN0cmluZywgY2FsbGJhY2s/OiBGdW5jdGlvbiwgaXNFbmQ/OiBib29sZWFuKSB7XHJcbiAgICBjb25zb2xlLmxvZygobmV3IERhdGUoKS50b0xvY2FsZVN0cmluZygpKSArICcgLSBFUlJPUjogJyArIG1lc3NhZ2UudG9TdHJpbmcoKSk7XHJcbiAgICBpZiAoY2FsbGJhY2spIHtcclxuICAgICAgY2FsbGJhY2sobWVzc2FnZSwgaXNFbmQpO1xyXG4gICAgfVxyXG4gIH1cclxufVxyXG4iXX0=