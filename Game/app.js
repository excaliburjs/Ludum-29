var Config = (function () {
    function Config() {
    }
    Config.terrainTexture = new ex.Texture("/images/tilesets/terrain.png");
<<<<<<< Updated upstream
=======

    Config.defaultKrakenWidth = 200;
    Config.defaultKrakenHeight = 200;

    Config.defaultKrakenHealth = 100;

    Config.defaultEnemyWidth = 100;
    Config.defaultEnemyHeight = 100;

    Config.defaultEnemyHealth = 10;
>>>>>>> Stashed changes
    return Config;
})();
/// <reference path="../scripts/Excalibur.d.ts" />
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var BaseLevel = (function (_super) {
    __extends(BaseLevel, _super);
    function BaseLevel(jsonPath) {
        _super.call(this);
        this.jsonPath = jsonPath;
        this._isLoaded = false;
        this.onprogress = function () {
        };
        this.oncomplete = function () {
        };
        this.onerror = function () {
        };
    }
    BaseLevel.prototype.onInitialize = function (engine) {
        var tileset = this.data.tilesets[0];

        var columns = tileset.imagewidth / tileset.tilewidth;
        var rows = tileset.imageheight / tileset.tileheight;

        var spriteSheet = new ex.SpriteSheet(Config.terrainTexture, columns, rows, tileset.tilewidth, tileset.tileheight);

        // build the collision map
        this.collisionMap = new ex.CollisionMap(0, 0, this.data.tilewidth, this.data.tileheight, this.data.width, this.data.height, spriteSheet);
        for (var i = 0; i < this.data.layers.length; i++) {
            for (var j = 0; j < this.data.layers[i].data.length; j++) {
<<<<<<< Updated upstream
                var gid = this.data.layers[i].data[j];
                if (gid !== 0) {
                    this.collisionMap.data[j].spriteId = gid - 1;
                    this.collisionMap.data[j].solid = this.isTileSolidTerrain(gid, tileset);
=======
                var currentData = this.data.layers[i].data[j];
                if (currentData !== 0) {
                    this.collisionMap.data[j].spriteId = currentData - 1;
                    this.collisionMap.data[j].solid = false;
>>>>>>> Stashed changes
                }
            }
        }

        this.addCollisionMap(this.collisionMap);
    };

<<<<<<< Updated upstream
    BaseLevel.prototype.isTileSolidTerrain = function (gid, tileset) {
        if (gid === 0)
            return false;

        // loop through terrains
        var solidTerrains = [], i, terrain;
        for (i = 0; i < tileset.terrains.length; i++) {
            // check for solid terrains
            terrain = tileset.terrains[i];
            if (terrain.properties && terrain.properties.solid === "false") {
                continue;
            }

            solidTerrains.push(i);
        }

        // loop through tiles
        var tile = tileset.tiles[(gid - 1).toString()];

        if (tile && tile.terrain) {
            for (i = 0; i < tile.terrain.length; i++) {
                // for each corner of terrain, it is not solid if all corners are not solid
                if (solidTerrains.indexOf(tile.terrain[i]) > -1) {
                    return true;
                }
            }
        }

        return false;
    };

=======
>>>>>>> Stashed changes
    //TODO overload draw: draw HUD, UI, etc.
    BaseLevel.prototype.draw = function (ctx, delta) {
        _super.prototype.draw.call(this, ctx, delta);
        // draw HUD, UI, etc.
    };

    BaseLevel.prototype.load = function () {
        var _this = this;
        var complete = new ex.Promise();
        var request = new XMLHttpRequest();
        request.open("GET", this.jsonPath, true);
        request.responseType = "json";
        request.onprogress = this.onprogress;
        request.onerror = this.onerror;
        request.onload = function (e) {
            complete.resolve(request.response);
            _this.data = request.response;
            _this.oncomplete();
        };
        request.send();
        return complete;
    };

    BaseLevel.prototype.isLoaded = function () {
        return this._isLoaded;
    };
    return BaseLevel;
})(ex.Scene);
<<<<<<< Updated upstream
/// <reference path="../scripts/Excalibur.d.ts" />
/// <reference path="Level.ts" />
=======
/// <reference path="Config.ts" />
var Kraken = (function (_super) {
    __extends(Kraken, _super);
    function Kraken(x, y, color, health) {
        _super.call(this, x, y, Config.defaultKrakenWidth, Config.defaultKrakenHeight, color);
        this._health = Config.defaultKrakenHealth;
        this._health = health || this._health;

        var krakenTexture = new ex.Texture("images/kraken/KrakenSpriteSheet.png");
        loader.addResource(krakenTexture);

        var krakenSheet = new ex.SpriteSheet(krakenTexture, 4, 3, 120, 60);
        var anim = krakenSheet.getAnimationByIndices(game, [0, 1, 2], 200);
        anim.loop = true;
        anim.setScaleX(2);
        anim.setScaleY(2);

        this.addDrawing("default", anim);

        this.on("right", function () {
            this.dx = 100;
        });

        this.on("left", function () {
            this.dx = -100;
        });

        this.on("keyup", function () {
            this.dx = 0;
        });
    }
    return Kraken;
})(ex.Actor);
/// <reference path="../scripts/Excalibur.d.ts" />
/// <reference path="Level.ts" />
/// <reference path="Kraken.ts" />
/// <reference path="Enemy.ts" />
>>>>>>> Stashed changes
var game = new ex.Engine();
game.backgroundColor = ex.Color.Azure;
game.setAntialiasing(false);
game.camera = new ex.TopCamera(game);

var loader = new ex.Loader();
<<<<<<< Updated upstream
var krakenTexture = new ex.Texture("images/kraken/KrakenSpriteSheet.png");
loader.addResource(krakenTexture);
=======
>>>>>>> Stashed changes

var level = new BaseLevel("/maps/Level-0.json");
loader.addResource(level);
loader.addResource(Config.terrainTexture);

<<<<<<< Updated upstream
var krakenSheet = new ex.SpriteSheet(krakenTexture, 4, 3, 120, 60);
var anim = krakenSheet.getAnimationByIndices(game, [0, 1, 2], 200);
anim.loop = true;
anim.setScaleX(2);
anim.setScaleY(2);

var kraken = new ex.Actor(200, 200, 200, 200, ex.Color.Red);
kraken.addDrawing("default", anim);
kraken.on("right", function () {
    this.dx = 100;
});

game.camera.setActorToFollow(kraken);

kraken.on("left", function () {
    this.dx = -100;
});

kraken.on("keyup", function () {
    this.dx = 0;
});
=======
var kraken = new Kraken(200, 200, ex.Color.Red);

game.camera.setActorToFollow(kraken);

>>>>>>> Stashed changes
level.addChild(kraken);

game.start(loader).then(function () {
    game.addScene("test-level", level);
    game.goToScene("test-level");
});
//# sourceMappingURL=app.js.map
