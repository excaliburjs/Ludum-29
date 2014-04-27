var __extends = this.__extends || function (d, b) {
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
            this._travelVector = new ex.Vector(0, 0);
            this._fovLength = 300;
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

        Enemy.prototype.draw = function (ctx, delta) {
            _super.prototype.draw.call(this, ctx, delta);

            this.drawFOV(ctx, delta);
        };

        Enemy.prototype.drawFOV = function (ctx, delta) {
            // create radial gradient
            var fovRay = new ex.Ray(this.getCenter(), this._travelVector);
            var fovEndPoint = fovRay.getPoint(this._fovLength);

            var grd = ctx.createRadialGradient(this.getCenter().x, this.getCenter().y, 10, fovEndPoint.x, fovEndPoint.y, this._fovLength / 2);

            grd.addColorStop(0, 'rgba(255, 255, 255, 0.3)');
            grd.addColorStop(1, 'rgba(255, 255, 255, 0)');

            ctx.fillStyle = grd;
            ctx.beginPath();

            // x, y, radius, start, end, [anti-clockwise]
            ctx.arc(this.getCenter().x, this.getCenter().y, this._fovLength, 0, Math.PI * 2);
            ctx.closePath();
            ctx.fill();
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
