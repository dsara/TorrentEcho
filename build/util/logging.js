"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Logs = (function () {
    function Logs() {
    }
    Logs.writeMessage = function (message, callback, isEnd) {
        console.log((new Date().toLocaleString()) + " - " + message.toString());
        if (callback) {
            callback(message, isEnd);
        }
    };
    Logs.writeError = function (message, callback, isEnd) {
        console.log((new Date().toLocaleString()) + " - ERROR: " + message.toString());
        if (callback) {
            callback(message, isEnd);
        }
    };
    return Logs;
}());
exports.default = Logs;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibG9nZ2luZy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL2FwcC91dGlsL2xvZ2dpbmcudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQTtJQUNFO0lBQWdCLENBQUM7SUFFVixpQkFBWSxHQUFuQixVQUFvQixPQUFlLEVBQUUsUUFBbUIsRUFBRSxLQUFlO1FBQ3ZFLE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLElBQUksRUFBRSxDQUFDLGNBQWMsRUFBRSxDQUFDLEdBQUcsS0FBSyxHQUFHLE9BQU8sQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDO1FBQ3hFLElBQUksUUFBUSxFQUFFO1lBQ1osUUFBUSxDQUFDLE9BQU8sRUFBRSxLQUFLLENBQUMsQ0FBQztTQUMxQjtJQUNILENBQUM7SUFFTSxlQUFVLEdBQWpCLFVBQWtCLE9BQU8sRUFBRSxRQUFRLEVBQUUsS0FBSztRQUN4QyxPQUFPLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxJQUFJLEVBQUUsQ0FBQyxjQUFjLEVBQUUsQ0FBQyxHQUFHLFlBQVksR0FBRyxPQUFPLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQztRQUMvRSxJQUFJLFFBQVEsRUFBRTtZQUNaLFFBQVEsQ0FBQyxPQUFPLEVBQUUsS0FBSyxDQUFDLENBQUM7U0FDMUI7SUFDSCxDQUFDO0lBQ0gsV0FBQztBQUFELENBQUMsQUFoQkQsSUFnQkMiLCJzb3VyY2VzQ29udGVudCI6WyJleHBvcnQgZGVmYXVsdCBjbGFzcyBMb2dzIHtcclxuICBjb25zdHJ1Y3RvcigpIHsgfVxyXG5cclxuICBzdGF0aWMgd3JpdGVNZXNzYWdlKG1lc3NhZ2U6IHN0cmluZywgY2FsbGJhY2s/OiBGdW5jdGlvbiwgaXNFbmQ/OiBib29sZWFuKSB7XHJcbiAgICBjb25zb2xlLmxvZygobmV3IERhdGUoKS50b0xvY2FsZVN0cmluZygpKSArIFwiIC0gXCIgKyBtZXNzYWdlLnRvU3RyaW5nKCkpO1xyXG4gICAgaWYgKGNhbGxiYWNrKSB7XHJcbiAgICAgIGNhbGxiYWNrKG1lc3NhZ2UsIGlzRW5kKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIHN0YXRpYyB3cml0ZUVycm9yKG1lc3NhZ2UsIGNhbGxiYWNrLCBpc0VuZCkge1xyXG4gICAgY29uc29sZS5sb2coKG5ldyBEYXRlKCkudG9Mb2NhbGVTdHJpbmcoKSkgKyBcIiAtIEVSUk9SOiBcIiArIG1lc3NhZ2UudG9TdHJpbmcoKSk7XHJcbiAgICBpZiAoY2FsbGJhY2spIHtcclxuICAgICAgY2FsbGJhY2sobWVzc2FnZSwgaXNFbmQpO1xyXG4gICAgfVxyXG4gIH1cclxufSJdfQ==