/// <reference path="../scripts/Excalibur.d.ts" />
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
define(["require", "exports"], function(require, exports) {
    var BaseLevel = (function (_super) {
        __extends(BaseLevel, _super);
        function BaseLevel(jsonPath, spriteSheet) {
            _super.call(this);
            this.jsonPath = jsonPath;
            this.spriteSheet = spriteSheet;
            this._isLoaded = false;
            this.onprogress = function () {
            };
            this.oncomplete = function () {
            };
            this.onerror = function () {
            };
        }
        BaseLevel.prototype.onInitialize = function (engine) {
            //build the collision map
        };

        //TODO overload draw: draw HUD, UI, etc.; also draw the collision map
        // remember to call super.draw()
        BaseLevel.prototype.load = function () {
            var _this = this;
            var complete = new ex.Promise();
            var request = new XMLHttpRequest();
            request.open("GET", this.jsonPath, true);
            request.responseType = "json";
            request.onload = function (e) {
                complete.resolve(request.response);
                _this.data = request.response;
            };
            request.send();
            return complete;
        };

        BaseLevel.prototype.isLoaded = function () {
            return this._isLoaded;
        };
        return BaseLevel;
    })(ex.Scene);
    exports.BaseLevel = BaseLevel;
});
//# sourceMappingURL=Level.js.map
