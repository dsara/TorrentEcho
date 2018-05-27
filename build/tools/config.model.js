"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var fs = require("fs");
var logging_1 = require("./logging");
var Config = (function () {
    function Config() {
        this.props = new ConfigProperties();
        var configFile = '/config/config.json';
        try {
            var stats = fs.statSync(configFile);
        }
        catch (e) {
            logging_1.Logs.writeMessage('Config file not found');
        }
        this.props = JSON.parse(fs.readFileSync(configFile, 'utf8'));
    }
    return Config;
}());
exports.Config = Config;
var ConfigProperties = (function () {
    function ConfigProperties() {
    }
    return ConfigProperties;
}());
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29uZmlnLm1vZGVsLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vYXBwL3Rvb2xzL2NvbmZpZy5tb2RlbC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLHVCQUF5QjtBQUN6QixxQ0FBaUM7QUFFakM7SUFHRTtRQUZPLFVBQUssR0FBRyxJQUFJLGdCQUFnQixFQUFFLENBQUM7UUFHcEMsSUFBTSxVQUFVLEdBQUcscUJBQXFCLENBQUM7UUFFekMsSUFBSTtZQUNGLElBQU0sS0FBSyxHQUFHLEVBQUUsQ0FBQyxRQUFRLENBQUMsVUFBVSxDQUFDLENBQUM7U0FDdkM7UUFBQyxPQUFPLENBQUMsRUFBRTtZQUNWLGNBQUksQ0FBQyxZQUFZLENBQUMsdUJBQXVCLENBQUMsQ0FBQztTQUM1QztRQUVELElBQUksQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUMsWUFBWSxDQUFDLFVBQVUsRUFBRSxNQUFNLENBQUMsQ0FBQyxDQUFDO0lBQy9ELENBQUM7SUFDSCxhQUFDO0FBQUQsQ0FBQyxBQWRELElBY0M7QUFkWSx3QkFBTTtBQWdCbkI7SUFBQTtJQW1CQSxDQUFDO0lBQUQsdUJBQUM7QUFBRCxDQUFDLEFBbkJELElBbUJDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0ICogYXMgZnMgZnJvbSAnZnMnO1xyXG5pbXBvcnQgeyBMb2dzIH0gZnJvbSAnLi9sb2dnaW5nJztcclxuXHJcbmV4cG9ydCBjbGFzcyBDb25maWcge1xyXG4gIHB1YmxpYyBwcm9wcyA9IG5ldyBDb25maWdQcm9wZXJ0aWVzKCk7XHJcblxyXG4gIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgY29uc3QgY29uZmlnRmlsZSA9ICcvY29uZmlnL2NvbmZpZy5qc29uJztcclxuXHJcbiAgICB0cnkge1xyXG4gICAgICBjb25zdCBzdGF0cyA9IGZzLnN0YXRTeW5jKGNvbmZpZ0ZpbGUpO1xyXG4gICAgfSBjYXRjaCAoZSkge1xyXG4gICAgICBMb2dzLndyaXRlTWVzc2FnZSgnQ29uZmlnIGZpbGUgbm90IGZvdW5kJyk7XHJcbiAgICB9XHJcbiAgICAvLyByZWFkIGluIGFuZCBwYXJzZSB0aGUgY29uZmlnIGZpbGVcclxuICAgIHRoaXMucHJvcHMgPSBKU09OLnBhcnNlKGZzLnJlYWRGaWxlU3luYyhjb25maWdGaWxlLCAndXRmOCcpKTtcclxuICB9XHJcbn1cclxuXHJcbmNsYXNzIENvbmZpZ1Byb3BlcnRpZXMge1xyXG4gIG1vZGU6IHN0cmluZztcclxuICBob3N0OiBzdHJpbmc7XHJcbiAgcG9ydDogc3RyaW5nO1xyXG4gIHBhdGg6IHN0cmluZztcclxuICB1c2VyOiBzdHJpbmc7XHJcbiAgcGFzczogc3RyaW5nO1xyXG4gIGNob3duVXNlcjogbnVtYmVyO1xyXG4gIGNob3duR3JvdXA6IG51bWJlcjtcclxuICBpc1NlY3VyZTogYm9vbGVhbjtcclxuICBwZ2V0OiBudW1iZXI7XHJcbiAgdXNlVGVtcDogYm9vbGVhbjtcclxuICByb290RG93bmxvYWRGb2xkZXI6IHN0cmluZztcclxuICBub2RlRG93bmxvYWRGb2xkZXI6IHN0cmluZztcclxuICBsYWJlbERvd25sb2FkRm9sZGVyczogQXJyYXk8c3RyaW5nPjtcclxuICBkb25lTGFiZWw6IHN0cmluZztcclxuICBkb25lTGFiZWxEZWxheTogbnVtYmVyO1xyXG4gIHZlcmJvc2VMb2dnaW5nOiBib29sZWFuO1xyXG4gIHN5bmNSZW1vdmVTb3VyY2U6IGJvb2xlYW47XHJcbn1cclxuIl19