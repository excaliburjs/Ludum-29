﻿var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
define(["require", "exports"], function(require, exports) {
    var Enemy = (function (_super) {
        __extends(Enemy, _super);
        function Enemy(x, y, color, health) {
            _super.call(this, x, y, Config.defaultEnemyWidth, Config.defaultEnemyHeight, color);
            this._health = Config.defaultEnemyHealth;
            this._alertStatus = 0 /* Calm */;
            this._health = health || this._health;
        }
        Enemy.prototype.movePatrol = function (start, end) {
            this.moveTo(end.x, end.y, Config.defaultEnemySpeed).moveTo(start.x, start.y, Config.defaultEnemySpeed).repeatForever;
        };

        Enemy.prototype.moveCircle = function () {
        };

        Enemy.prototype.moveMeander = function () {
        };

        Enemy.prototype.attack = function () {
            // if the ship can still see the kraken (or the kraken is in the ship's attack proximity), attack the kraken
        };

        Enemy.prototype.assistShip = function (shipInTrouble) {
            this.clearActions();
            this.follow(shipInTrouble, 50);
        };
        return Enemy;
    })(ex.Actor);

    (function (alertStatus) {
        alertStatus[alertStatus["Calm"] = 0] = "Calm";
        alertStatus[alertStatus["Warn"] = 1] = "Warn";
        alertStatus[alertStatus["Attack"] = 2] = "Attack";
    })(exports.alertStatus || (exports.alertStatus = {}));
    var alertStatus = exports.alertStatus;
});
//# sourceMappingURL=Enemy.js.map