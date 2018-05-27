"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var configFile = '/config/config.json';
var config_model_1 = require("./config.model");
var Util = (function () {
    function Util() {
        this.config = new config_model_1.Config();
        if (Util._instance) {
            throw new Error('Error: Instantiation failed: Use Util.getInstance() instead of new');
        }
        Util._instance = this;
    }
    Util.getInstance = function () {
        return Util._instance;
    };
    Util._instance = new Util();
    return Util;
}());
exports.default = Util;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXRpbC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL2FwcC90b29scy91dGlsLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsSUFBTSxVQUFVLEdBQUcscUJBQXFCLENBQUM7QUFFekMsK0NBQXdDO0FBRXhDO0lBS0U7UUFGTyxXQUFNLEdBQVcsSUFBSSxxQkFBTSxFQUFFLENBQUM7UUFHbkMsSUFBSSxJQUFJLENBQUMsU0FBUyxFQUFFO1lBQ2xCLE1BQU0sSUFBSSxLQUFLLENBQUMsb0VBQW9FLENBQUMsQ0FBQztTQUN2RjtRQUNELElBQUksQ0FBQyxTQUFTLEdBQUcsSUFBSSxDQUFDO0lBQ3hCLENBQUM7SUFFYSxnQkFBVyxHQUF6QjtRQUNFLE9BQU8sSUFBSSxDQUFDLFNBQVMsQ0FBQztJQUN4QixDQUFDO0lBYmMsY0FBUyxHQUFTLElBQUksSUFBSSxFQUFFLENBQUM7SUFjOUMsV0FBQztDQUFBLEFBZkQsSUFlQztrQkFmb0IsSUFBSSIsInNvdXJjZXNDb250ZW50IjpbImNvbnN0IGNvbmZpZ0ZpbGUgPSAnL2NvbmZpZy9jb25maWcuanNvbic7XHJcbmltcG9ydCB7IExvZ3MgfSBmcm9tICcuL2xvZ2dpbmcnO1xyXG5pbXBvcnQgeyBDb25maWcgfSBmcm9tICcuL2NvbmZpZy5tb2RlbCc7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBVdGlsIHtcclxuICBwcml2YXRlIHN0YXRpYyBfaW5zdGFuY2U6IFV0aWwgPSBuZXcgVXRpbCgpO1xyXG5cclxuICBwdWJsaWMgY29uZmlnOiBDb25maWcgPSBuZXcgQ29uZmlnKCk7XHJcblxyXG4gIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgaWYgKFV0aWwuX2luc3RhbmNlKSB7XHJcbiAgICAgIHRocm93IG5ldyBFcnJvcignRXJyb3I6IEluc3RhbnRpYXRpb24gZmFpbGVkOiBVc2UgVXRpbC5nZXRJbnN0YW5jZSgpIGluc3RlYWQgb2YgbmV3Jyk7XHJcbiAgICB9XHJcbiAgICBVdGlsLl9pbnN0YW5jZSA9IHRoaXM7XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgc3RhdGljIGdldEluc3RhbmNlKCk6IFV0aWwge1xyXG4gICAgcmV0dXJuIFV0aWwuX2luc3RhbmNlO1xyXG4gIH1cclxufVxyXG4iXX0=