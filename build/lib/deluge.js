"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var requestLib = require("request");
var util_1 = require("../tools/util");
var util = util_1.default.getInstance();
var Deluge = (function () {
    function Deluge() {
        this.props = util.config.props;
        this.request = requestLib.defaults({
            jar: true,
            gzip: true,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json',
                'Accept-Encoding': 'gzip, deflate, br'
            },
            host: 'https://' + this.props.host
        });
        this.id = 0;
    }
    Deluge.prototype.authenticate = function () {
        var _this = this;
        var options = {
            uri: "https://" + this.props.host + this.props.path,
            json: {
                method: methods.login,
                params: [this.props.pass],
                id: this.id++
            }
        };
        return new Promise(function (resolve, reject) {
            _this.request(options, function (error, response, body) {
                if (error) {
                    reject(error);
                }
                else {
                    resolve(body);
                }
            });
        });
    };
    Deluge.prototype.call = function (method, params) {
        var _this = this;
        return this.authenticate().then(function (auth) {
            var options = {
                uri: "https://" + _this.props.host + _this.props.path,
                json: {
                    method: method,
                    params: params,
                    id: _this.id++
                }
            };
            return new Promise(function (resolve, reject) {
                _this.request(options, function (error, response, body) {
                    if (error) {
                        reject(error);
                    }
                    else {
                        resolve(body);
                    }
                });
            });
        });
    };
    Deluge.prototype.getTorrents = function (label) {
        return this.call(methods.getTorrrents, [
            [fields.torrents.name, fields.torrents.state, fields.torrents.savePath, fields.torrents.label, fields.torrents.progress],
            {
                label: label,
                state: ['Downloading', 'Seeding', 'Paused']
            }
        ]);
    };
    Deluge.prototype.getSingleTorrent = function (hash) {
        return this.call(methods.getTorrent, [
            hash,
            [fields.torrents.name, fields.torrents.state, fields.torrents.savePath, fields.torrents.label, fields.torrents.progress]
        ]);
    };
    Deluge.prototype.changeTorrentLabel = function (hash, label) {
        return this.call(methods.setLabel, [hash, label]);
    };
    Deluge.prototype.removeTorrent = function (hash, removeFiles) {
        return this.call(methods.removeTorrent, [hash, removeFiles]);
    };
    return Deluge;
}());
exports.Deluge = Deluge;
var fields = {
    torrents: {
        name: 'name',
        state: 'state',
        savePath: 'save_path',
        label: 'label',
        progress: 'progress'
    }
};
var methods = {
    login: 'auth.login',
    setLabel: 'label.set_torrent',
    removeTorrent: 'core.remove_torrent',
    getTorrrents: 'web.update_ui',
    getTorrent: 'web.get_torrent_status'
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGVsdWdlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vYXBwL2xpYi9kZWx1Z2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFJQSxvQ0FBc0M7QUFHdEMsc0NBQXNDO0FBRXRDLElBQU0sSUFBSSxHQUFHLGNBQVMsQ0FBQyxXQUFXLEVBQUUsQ0FBQztBQUVyQztJQWlCRTtRQWhCQSxVQUFLLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUM7UUFFMUIsWUFBTyxHQUFHLFVBQVUsQ0FBQyxRQUFRLENBQUM7WUFDNUIsR0FBRyxFQUFFLElBQUk7WUFDVCxJQUFJLEVBQUUsSUFBSTtZQUNWLE1BQU0sRUFBRSxNQUFNO1lBQ2QsT0FBTyxFQUFFO2dCQUNQLGNBQWMsRUFBRSxrQkFBa0I7Z0JBQ2xDLE1BQU0sRUFBRSxrQkFBa0I7Z0JBQzFCLGlCQUFpQixFQUFFLG1CQUFtQjthQUN2QztZQUNELElBQUksRUFBRSxVQUFVLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJO1NBQ25DLENBQUMsQ0FBQztRQUVILE9BQUUsR0FBRyxDQUFDLENBQUM7SUFFUSxDQUFDO0lBRWhCLDZCQUFZLEdBQVo7UUFBQSxpQkFtQkM7UUFsQkMsSUFBTSxPQUFPLEdBQW1EO1lBQzlELEdBQUcsRUFBRSxhQUFXLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBTTtZQUNuRCxJQUFJLEVBQUU7Z0JBQ0osTUFBTSxFQUFFLE9BQU8sQ0FBQyxLQUFLO2dCQUNyQixNQUFNLEVBQUUsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQztnQkFDekIsRUFBRSxFQUFFLElBQUksQ0FBQyxFQUFFLEVBQUU7YUFDZDtTQUNGLENBQUM7UUFFRixPQUFPLElBQUksT0FBTyxDQUFDLFVBQUMsT0FBTyxFQUFFLE1BQU07WUFDakMsS0FBSSxDQUFDLE9BQU8sQ0FBQyxPQUFPLEVBQUUsVUFBQyxLQUFL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USxFQUFFLFdBQVc7UUFDckIsS0FBSyxFQUFFLE9BQU87UUFDZCxRQUFRLEVBQUUsVUFBVTtLQUNyQjtDQUNGLENBQUM7QUFFRixJQUFNLE9BQU8sR0FBRztJQUNkLEtBQUssRUFBRSxZQUFZO0lBQ25CLFFBQVEsRUFBRSxtQkFBbUI7SUFDN0IsYUFBYSxFQUFFLHFCQUFxQjtJQUNwQyxZQUFZLEVBQUUsZUFBZTtJQUM3QixVQUFVLEVBQUUsd0JBQXdCO0NBQ3JDLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgKiBhcyB1cmwgZnJvbSAndXJsJztcclxuaW1wb3J0ICogYXMgZnMgZnJvbSAnZnMnO1xyXG5pbXBvcnQgKiBhcyB6bGliIGZyb20gJ3psaWInO1xyXG5pbXBvcnQgKiBhcyBodHRwcyBmcm9tICdodHRwcyc7XHJcbmltcG9ydCAqIGFzIHJlcXVlc3RMaWIgZnJvbSAncmVxdWVzdCc7XHJcbmltcG9ydCB7IExvZ3MgfSBmcm9tICcuLi90b29scy9sb2dnaW5nJztcclxuaW1wb3J0IHsgRGVsdWdlQXV0aExvZ2luLCBEZWx1Z2VTaW5nbGVUb3JyZW50UmVzdWx0LCBEZWx1Z2VUb3JyZW50LCBEZWx1Z2VUb3JyZW50UmVzdWx0cywgRGVsdWdlR2VuZXJhbFJlc3VsdCB9IGZyb20gJy4vZGVsdWdlLm1vZGVsJztcclxuaW1wb3J0IHV0aWxpdGllcyBmcm9tICcuLi90b29scy91dGlsJztcclxuXHJcbmNvbnN0IHV0aWwgPSB1dGlsaXRpZXMuZ2V0SW5zdGFuY2UoKTtcclxuXHJcbmV4cG9ydCBjbGFzcyBEZWx1Z2Uge1xyXG4gIHByb3BzID0gdXRpbC5jb25maWcucHJvcHM7XHJcblxyXG4gIHJlcXVlc3QgPSByZXF1ZXN0TGliLmRlZmF1bHRzKHtcclxuICAgIGphcjogdHJ1ZSxcclxuICAgIGd6aXA6IHRydWUsXHJcbiAgICBtZXRob2Q6ICdQT1NUJyxcclxuICAgIGhlYWRlcnM6IHtcclxuICAgICAgJ0NvbnRlbnQtVHlwZSc6ICdhcHBsaWNhdGlvbi9qc29uJyxcclxuICAgICAgQWNjZXB0OiAnYXBwbGljYXRpb24vanNvbicsXHJcbiAgICAgICdBY2NlcHQtRW5jb2RpbmcnOiAnZ3ppcCwgZGVmbGF0ZSwgYnInXHJcbiAgICB9LFxyXG4gICAgaG9zdDogJ2h0dHBzOi8vJyArIHRoaXMucHJvcHMuaG9zdFxyXG4gIH0pO1xyXG5cclxuICBpZCA9IDA7XHJcblxyXG4gIGNvbnN0cnVjdG9yKCkge31cclxuXHJcbiAgYXV0aGVudGljYXRlKCk6IFByb21pc2U8RGVsdWdlQXV0aExvZ2luPiB7XHJcbiAgICBjb25zdCBvcHRpb25zOiByZXF1ZXN0TGliLlVyaU9wdGlvbnMgJiByZXF1ZXN0TGliLkNvcmVPcHRpb25zID0ge1xyXG4gICAgICB1cmk6IGBodHRwczovLyR7dGhpcy5wcm9wcy5ob3N0fSR7dGhpcy5wcm9wcy5wYXRofWAsXHJcbiAgICAgIGpzb246IHtcclxuICAgICAgICBtZXRob2Q6IG1ldGhvZHMubG9naW4sXHJcbiAgICAgICAgcGFyYW1zOiBbdGhpcy5wcm9wcy5wYXNzXSxcclxuICAgICAgICBpZDogdGhpcy5pZCsrXHJcbiAgICAgIH1cclxuICAgIH07XHJcblxyXG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcclxuICAgICAgdGhpcy5yZXF1ZXN0KG9wdGlvbnMsIChlcnJvciwgcmVzcG9uc2UsIGJvZHkpID0+IHtcclxuICAgICAgICBpZiAoZXJyb3IpIHtcclxuICAgICAgICAgIHJlamVjdChlcnJvcik7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIHJlc29sdmUoYm9keSk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9KTtcclxuICAgIH0pO1xyXG4gIH1cclxuXHJcbiAgY2FsbDxUPihtZXRob2QsIHBhcmFtcyk6IFByb21pc2U8VD4ge1xyXG4gICAgcmV0dXJuIHRoaXMuYXV0aGVudGljYXRlKCkudGhlbigoYXV0aCkgPT4ge1xyXG4gICAgICBjb25zdCBvcHRpb25zOiByZXF1ZXN0TGliLlVyaU9wdGlvbnMgJiByZXF1ZXN0TGliLkNvcmVPcHRpb25zID0ge1xyXG4gICAgICAgIHVyaTogYGh0dHBzOi8vJHt0aGlzLnByb3BzLmhvc3R9JHt0aGlzLnByb3BzLnBhdGh9YCxcclxuICAgICAgICBqc29uOiB7XHJcbiAgICAgICAgICBtZXRob2Q6IG1ldGhvZCxcclxuICAgICAgICAgIHBhcmFtczogcGFyYW1zLFxyXG4gICAgICAgICAgaWQ6IHRoaXMuaWQrK1xyXG4gICAgICAgIH1cclxuICAgICAgfTtcclxuXHJcbiAgICAgIHJldHVybiBuZXcgUHJvbWlzZTxUPigocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XHJcbiAgICAgICAgdGhpcy5yZXF1ZXN0KG9wdGlvbnMsIChlcnJvciwgcmVzcG9uc2UsIGJvZHkpID0+IHtcclxuICAgICAgICAgIGlmIChlcnJvcikge1xyXG4gICAgICAgICAgICByZWplY3QoZXJyb3IpO1xyXG4gICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgcmVzb2x2ZShib2R5KTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgICAgfSk7XHJcbiAgICB9KTtcclxuICB9XHJcblxyXG4gIGdldFRvcnJlbnRzKGxhYmVsOiBzdHJpbmcpOiBQcm9taXNlPERlbHVnZVRvcnJlbnRSZXN1bHRzPiB7XHJcbiAgICByZXR1cm4gdGhpcy5jYWxsPERlbHVnZVRvcnJlbnRSZXN1bHRzPihtZXRob2RzLmdldFRvcnJyZW50cywgW1xyXG4gICAgICBbZmllbGRzLnRvcnJlbnRzLm5hbWUsIGZpZWxkcy50b3JyZW50cy5zdGF0ZSwgZmllbGRzLnRvcnJlbnRzLnNhdmVQYXRoLCBmaWVsZHMudG9ycmVudHMubGFiZWwsIGZpZWxkcy50b3JyZW50cy5wcm9ncmVzc10sXHJcbiAgICAgIHtcclxuICAgICAgICBsYWJlbDogbGFiZWwsXHJcbiAgICAgICAgc3RhdGU6IFsnRG93bmxvYWRpbmcnLCAnU2VlZGluZycsICdQYXVzZWQnXVxyXG4gICAgICB9XHJcbiAgICBdKTtcclxuICB9XHJcblxyXG4gIGdldFNpbmdsZVRvcnJlbnQoaGFzaDogc3RyaW5nKTogUHJvbWlzZTxEZWx1Z2VTaW5nbGVUb3JyZW50UmVzdWx0PiB7XHJcbiAgICByZXR1cm4gdGhpcy5jYWxsPERlbHVnZVNpbmdsZVRvcnJlbnRSZXN1bHQ+KG1ldGhvZHMuZ2V0VG9ycmVudCwgW1xyXG4gICAgICBoYXNoLFxyXG4gICAgICBbZmllbGRzLnRvcnJlbnRzLm5hbWUsIGZpZWxkcy50b3JyZW50cy5zdGF0ZSwgZmllbGRzLnRvcnJlbnRzLnNhdmVQYXRoLCBmaWVsZHMudG9ycmVudHMubGFiZWwsIGZpZWxkcy50b3JyZW50cy5wcm9ncmVzc11cclxuICAgIF0pO1xyXG4gIH1cclxuXHJcbiAgY2hhbmdlVG9ycmVudExhYmVsKGhhc2g6IHN0cmluZywgbGFiZWw6IHN0cmluZyk6IFByb21pc2U8RGVsdWdlR2VuZXJhbFJlc3VsdD4ge1xyXG4gICAgcmV0dXJuIHRoaXMuY2FsbDxEZWx1Z2VHZW5lcmFsUmVzdWx0PihtZXRob2RzLnNldExhYmVsLCBbaGFzaCwgbGFiZWxdKTtcclxuICB9XHJcblxyXG4gIHJlbW92ZVRvcnJlbnQoaGFzaDogc3RyaW5nLCByZW1vdmVGaWxlczogYm9vbGVhbik6IFByb21pc2U8RGVsdWdlR2VuZXJhbFJlc3VsdD4ge1xyXG4gICAgcmV0dXJuIHRoaXMuY2FsbDxEZWx1Z2VHZW5lcmFsUmVzdWx0PihtZXRob2RzLnJlbW92ZVRvcnJlbnQsIFtoYXNoLCByZW1vdmVGaWxlc10pO1xyXG4gIH1cclxufVxyXG5cclxuY29uc3QgZmllbGRzID0ge1xyXG4gIHRvcnJlbnRzOiB7XHJcbiAgICBuYW1lOiAnbmFtZScsXHJcbiAgICBzdGF0ZTogJ3N0YXRlJyxcclxuICAgIHNhdmVQYXRoOiAnc2F2ZV9wYXRoJyxcclxuICAgIGxhYmVsOiAnbGFiZWwnLFxyXG4gICAgcHJvZ3Jlc3M6ICdwcm9ncmVzcydcclxuICB9XHJcbn07XHJcblxyXG5jb25zdCBtZXRob2RzID0ge1xyXG4gIGxvZ2luOiAnYXV0aC5sb2dpbicsXHJcbiAgc2V0TGFiZWw6ICdsYWJlbC5zZXRfdG9ycmVudCcsXHJcbiAgcmVtb3ZlVG9ycmVudDogJ2NvcmUucmVtb3ZlX3RvcnJlbnQnLFxyXG4gIGdldFRvcnJyZW50czogJ3dlYi51cGRhdGVfdWknLFxyXG4gIGdldFRvcnJlbnQ6ICd3ZWIuZ2V0X3RvcnJlbnRfc3RhdHVzJ1xyXG59O1xyXG4iXX0=