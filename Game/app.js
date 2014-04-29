var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Bullet = (function (_super) {
    __extends(Bullet, _super);
    function Bullet(x, y, destX, destY) {
        _super.call(this, x, y, 3, 3, ex.Color.Red);
        this.bulletSpriteSheet = new ex.SpriteSheet(Resources.BulletTexture, 6, 1, 32, 32);
        this.bulletAnimation = this.bulletSpriteSheet.getAnimationForAll(game, 200);

        this.collisionType = 1 /* Passive */;

        var sv = new ex.Vector(x, y);
        var tv = new ex.Vector(destX, destY);
        var fv = tv.minus(sv).normalize().scale(Config.defaultEnemyBulletSpeed);

        this.dx = fv.x;
        this.dy = fv.y;
        this.bulletAnimation.loop = true;
        this.addDrawing('default', this.bulletAnimation);
        this.setCenterDrawing(true);

        this.remainingLife = Config.defaultEnemyBulletLife;
    }
    Bullet.prototype.update = function (engine, delta) {
        _super.prototype.update.call(this, engine, delta);

        // can only spawn on level!
        if (!(engine.currentScene instanceof BaseLevel)) {
            this.kill();
            return;
        }

        var currentMap = engine.currentScene.data;

        // todo it would be cool to die when you hit a solid tile (not terrain)
        // exit map
        if (this.x <= 0 || this.y <= 0 || this.x >= (currentMap.width * currentMap.tilewidth) || this.y >= (currentMap.height * currentMap.tileheight)) {
            this.kill();
            return;
        }

        // or time out
        if (this.remainingLife <= 0) {
            this.kill();
            return;
        } else {
            this.remainingLife -= delta;
        }
    };
    return Bullet;
})(ex.Actor);
var Config = (function () {
    function Config() {
    }
    Config.deathTimer = 5000;

    Config.defaultKrakenMoveRadius = 300;
    Config.defaultKrakenWidth = 50;
    Config.defaultKrakenHeight = 50;
    Config.defaultKrakenSpeedScale = 10;
    Config.defaultKrakenMaxSpeed = 200;
    Config.defaultKrakenIdleThreshold = 10;
    Config.defaultKrakenAnimationChangeThreshold = 400;
    Config.defaultKrakenHealth = 100;

    Config.defaultKrakenSpecial = 5;

    Config.krakenDps = 1;
    Config.krakenAttackTime = 300;
    Config.krakenAttackRange = 150;
    Config.krakenInertiaDampen = 1;
    Config.krakenHealthRegen = 10;

    Config.defaultEnemyWidth = 73;
    Config.defaultEnemyHeight = 73;
    Config.defaultEnemyBulletWait = 2000;
    Config.defaultEnemyBulletSpeed = 300;
    Config.defaultEnemyAlertDistance = 500;
    Config.defaultEnemyBulletLife = 20000;

    Config.defaultEnemyHealth = 10;
    Config.defaultEnemySpeed = 100;
    Config.defaultAssistDistance = 300;
    Config.defaultEnemyWaitTime = 2000;
    Config.enemyRotationSpeed = Math.PI / 1.5;
    Config.enemyDps = 10;
    Config.enemyGunOffset = 80;
    Config.enemyAlertOffsetX = 0;
    Config.enemyAlertOffsetY = -20;

    Config.defaultEnemyMaxFiringDistance = 400;

    Config.defaultMaxAttackDistance = 250;
    Config.defaultMaxAlertDistance = 275;

    Config.defaultEnemyFOV = 500;

    Config.defaultSonarPingScale = 4000;
    Config.defaultSonarPingSpeed = 600;
    return Config;
})();
var DeathScene = (function (_super) {
    __extends(DeathScene, _super);
    function DeathScene() {
        _super.call(this);
    }
    DeathScene.prototype.onInitialize = function (engine) {
        _super.prototype.onInitialize.call(this, engine);

        game.camera = new ex.BaseCamera(engine);

        // play death
        Resources.SoundDeath.play();

        // splash
        var death = new ex.Actor(0, 0, engine.canvas.width, engine.canvas.height);
        death.addDrawing("bg", new ex.Sprite(Resources.DeathTexture, 0, 0, engine.canvas.width, engine.canvas.height));

        var timer = new ex.Timer(function () {
            window.location.reload();
        }, Config.deathTimer, false);

        game.addChild(death);
        game.addTimer(timer);
    };
    return DeathScene;
})(ex.Scene);
var Fx;
(function (Fx) {
    var Multiply = (function () {
        function Multiply(color) {
            this.color = color;
        }
        Multiply.prototype.updatePixel = function (x, y, imageData) {
            var firstPixel = (x + y * imageData.width) * 4;
            var pixel = imageData.data;
            if (pixel[firstPixel + 3] !== 0) {
                pixel[firstPixel + 0] = this.color.r * (pixel[firstPixel + 0]) / 255;
                pixel[firstPixel + 1] = this.color.g * (pixel[firstPixel + 1]) / 255;
                pixel[firstPixel + 2] = this.color.b * (pixel[firstPixel + 2]) / 255;
            }
        };
        return Multiply;
    })();
    Fx.Multiply = Multiply;
})(Fx || (Fx = {}));
/// <reference path="../scripts/Excalibur.d.ts" />
var BaseLevel = (function (_super) {
    __extends(BaseLevel, _super);
    function BaseLevel(jsonPath) {
        var _this = this;
        _super.call(this);
        this.jsonPath = jsonPath;
        this.enemies = [];
        this.paths = {};
        this.onprogress = function () {
        };
        this.oncomplete = function () {
        };
        this.onerror = function () {
        };
        /**
        * Factories for creating objects from Tiled map data. In Tiled, when you
        * place an object, you can specify it's Type. The type name gets mapped
        * to this hash. If it exists, the function is called with the the IObject
        * interface.
        */
        this._objectFactories = {
            /**
            * Handle spawning a player
            */
            PlayerSpawn: function (obj) {
                ex.Logger.getInstance().info("Released the Kraken!", obj.x, obj.y);

                _this.kraken = new Kraken(obj.x, obj.y);

                // add to level
                _this.addChild(_this.kraken);

                // follow the kraken
                game.camera.setActorToFollow(_this.kraken);
            },
            /**
            * Spawns an enemy
            */
            EnemySpawn: function (obj) {
                var enemy = new Enemy(obj.name, obj.x, obj.y);

                _this.enemies.push(enemy);
                _this.addChild(enemy);
                _this.stats.numBoats++;
            },
            /*
            * Spawns a path for an actor to follow
            */
            Path: function (obj) {
                if (!obj.polyline || !obj.name)
                    return;

                obj.polyline.forEach(function (point) {
                    // transform polyline point to world coordinates for actors
                    point.x = obj.x + point.x;
                    point.y = obj.y + point.y;
                });

                // push path
                _this.paths[obj.name] = obj.polyline.map(function (p) {
                    return new ex.Point(p.x, p.y);
                });
            }
        };
    }
    BaseLevel.prototype.onInitialize = function (engine) {
        var _this = this;
        // play waves
        Resources.SoundWaves.setVolume(0.1);
        Resources.SoundWaves.setLoop(true);
        Resources.SoundWaves.play();

        this.stats = new Stats();

        this.map = new ex.TileMap(0, 0, this.data.tilewidth, this.data.tileheight, this.data.height, this.data.width);
        this.heartSprite = new ex.Sprite(Resources.Heart, 0, 0, 20, 20);

        // create collision map for each tileset in map
        this.data.tilesets.forEach(function (ts) {
            var cols = Math.floor(ts.imagewidth / ts.tilewidth);
            var rows = Math.floor(ts.imageheight / ts.tileheight);
            var ss = new ex.SpriteSheet(ts.texture, cols, rows, ts.tilewidth, ts.tileheight);

            // nighty night!
            ss.sprites.forEach(function (s) {
                return s.addEffect(new Fx.Multiply(Palette.ColorNightTime));
            });

            _this.map.registerSpriteSheet(ts.firstgid.toString(), ss);
        });

        var i, j, gid, layer, tileset;
        for (i = 0; i < this.data.layers.length; i++) {
            layer = this.data.layers[i];

            // terrain layer?
            if (layer.type === "tilelayer") {
                for (j = 0; j < layer.data.length; j++) {
                    gid = layer.data[j];
                    if (gid !== 0) {
                        tileset = this.getTilesetForTile(gid);

                        if (tileset) {
                            this.map.data[j].sprites.push(new ex.TileSprite(tileset.firstgid.toString(), gid - tileset.firstgid));
                            this.map.data[j].solid = this.map.data[j].solid || this.isTileSolid(gid, layer, tileset);
                        }
                    }
                }
            }

            // object layer
            if (layer.type === "objectgroup") {
                layer.objects.forEach(function (obj) {
                    if (obj.type && _this._objectFactories[obj.type]) {
                        _this._objectFactories[obj.type](obj);
                    }
                });
            }
        }

        // resolve the associations between enemies and paths
        this.resolveEnemyPaths();

        // Add collision maps to scene
        this.addTileMap(this.map);
    };

    BaseLevel.prototype.onDeactivate = function () {
        _super.prototype.onDeactivate.call(this);

        // stop sounds
        Resources.SoundWaves.stop();
    };

    BaseLevel.prototype.update = function (engine, delta) {
        _super.prototype.update.call(this, engine, delta);

        // kill enemies
        this.enemies = this.enemies.filter(function (enemy) {
            return !enemy._isKilled;
        });

        var levelWidth = this.data.width * this.data.tilewidth;
        var levelHeight = this.data.height * this.data.tileheight;

        if ((this.kraken.x < 0) || (this.kraken.x > levelWidth) || (this.kraken.y < 0) || (this.kraken.y > levelHeight)) {
            //console.log("victory!");
            game.goToScene("victory");
        }
    };

    //TODO overload draw: draw HUD, UI, etc.
    BaseLevel.prototype.draw = function (ctx, delta) {
        _super.prototype.draw.call(this, ctx, delta);

        // draw HUD, UI, etc.
        ctx.restore();
        var krakenHealth = game.currentScene.kraken.health;
        var numHearts = Math.floor(krakenHealth / 10);

        for (var i = 0; i < numHearts; i++) {
            this.heartSprite.draw(ctx, (this.heartSprite.width + 5) * i + 10, 10);
        }
        ctx.save();
        game.camera.update(0);
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
            _this.data = request.response;

            var promises = [];

            // retrieve images from tilesets and create textures
            _this.data.tilesets.forEach(function (ts) {
                ts.texture = new ex.Texture(ts.image);
                ts.texture.oncomplete = ts.texture.onerror = function () {
                    var idx = promises.indexOf(ts.texture);
                    promises.splice(idx, 1);

                    if (promises.length === 0) {
                        _this.oncomplete();
                        complete.resolve(_this.data);
                    }
                };
                promises.push(ts.texture);
            });

            promises.forEach(function (p) {
                return p.load();
            });
        };
        request.send();
        return complete;
    };

    BaseLevel.prototype.isLoaded = function () {
        return this.data !== undefined;
    };

    BaseLevel.prototype.resolveEnemyPaths = function () {
        var _this = this;
        this.enemies.forEach(function (enemy) {
            if (enemy.key && _this.paths[enemy.key]) {
                enemy.createMovePath(_this.paths[enemy.key]);
            }
        });
    };

    BaseLevel.prototype.getTilesetForTile = function (gid) {
        for (var i = this.data.tilesets.length - 1; i >= 0; i--) {
            var ts = this.data.tilesets[i];

            if (ts.firstgid <= gid) {
                return ts;
            }
        }

        return null;
    };

    BaseLevel.prototype.isTileSolid = function (gid, layer, tileset) {
        if (gid === 0)
            return false;

        var solidTerrains = [], i, terrain;

        if (tileset.terrains) {
            for (i = 0; i < tileset.terrains.length; i++) {
                // check for solid terrains
                terrain = tileset.terrains[i];
                if (terrain.properties && terrain.properties.solid === "false") {
                    continue;
                }

                solidTerrains.push(i);
            }
        }

        // todo individual tile overrides layer
        // layers > terrain
        if (layer.properties && layer.properties["solid"] === "true") {
            return true;
        }

        // loop through tiles
        if (tileset.tiles) {
            var tile = tileset.tiles[(gid - 1).toString()];

            if (tile && tile.terrain) {
                for (i = 0; i < tile.terrain.length; i++) {
                    // for each corner of terrain, it is not solid if all corners are not solid
                    if (solidTerrains.indexOf(tile.terrain[i]) > -1) {
                        return true;
                    }
                }
            }
        }

        return false;
    };
    return BaseLevel;
})(ex.Scene);

//#endregion
var Sonar = (function (_super) {
    __extends(Sonar, _super);
    function Sonar(x, y, width, height, color) {
        _super.call(this, x, y, width, height, color);
        this._isOn = false;
        this.x = x - (this.getWidth() / 2);
        this.y = y - (this.getHeight() / 2);
        this.collisionType = 1 /* Passive */;
    }
    Sonar.prototype.update = function (engine, delta) {
        _super.prototype.update.call(this, engine, delta);
        this.x = (this.parent.getWidth() / 2) - (this.getWidth() / 2);
        this.y = (this.parent.getHeight() / 2) - (this.getHeight() / 2);
        //if (this._isOn) {
        //   var timer = new ex.Timer(() => {
        //      if (this.getWidth() > Config.defaultMaxAttackDistance) {
        //         this._isOn = false;
        //         this.setHeight(1);
        //         this.setWidth(1);
        //         this.clearActions();
        //      }
        //   }, 600, false);
        //   game.currentScene.addTimer(timer);
        //}
    };

    Sonar.prototype.draw = function (ctx, delta) {
        if (this._isOn) {
            //super.draw(ctx, delta);
            ctx.strokeStyle = ex.Color.Red.toString();
            ctx.beginPath();
            var parentShiftX = this.parent.getWidth() / 2;
            var parentShiftY = this.parent.getHeight() / 2;
            ctx.arc(-parentShiftX + this.x + this.getWidth() / 2, -parentShiftY + this.y + this.getHeight() / 2, this.getWidth() / 2, 0, 2 * Math.PI);
            ctx.arc(-parentShiftX + this.x + this.getWidth() / 2, -parentShiftY + this.y + this.getHeight() / 2, this.getWidth() / 2, 2 * Math.PI, 0, true);
            ctx.closePath();
            ctx.stroke();
        }
    };
    return Sonar;
})(ex.Actor);
/// <reference path="Level.ts" />
/// <reference path="Sonar.ts" />
var Enemy = (function (_super) {
    __extends(Enemy, _super);
    function Enemy(key, x, y, width, height, color, health) {
        _super.call(this, x, y, Config.defaultEnemyWidth, Config.defaultEnemyHeight, color);
        this.key = key;
        this.health = Config.defaultEnemyHealth;
        this.alertStatus = 0 /* Calm */;
        this.rays = new Array();
        this.originalRays = new Array();
        this._rayVectors = new Array();
        this._bulletTimer = 0;
        this.alertSprite = new ex.Sprite(Resources.AlertTexture, 0, 0, 60, 60);
        this.movePath = [];
        this.setWidth(width || Config.defaultEnemyWidth);
        this.setHeight(height || Config.defaultEnemyHeight);
        this.health = health || this.health;
        this._travelVector = new ex.Vector(1, 0);
        this._originalTravelVector = new ex.Vector(1, 0);
        this._fovLength = Config.defaultEnemyFOV;

        this._shipSheet = new ex.SpriteSheet(Resources.Ship1Texture, 3, 2, 191, 73);

        this.addDrawing("full", this._shipSheet.getSprite(0));
        this.addDrawing("half", this._shipSheet.getSprite(1));
        this.addDrawing("eighty", this._shipSheet.getSprite(2));

        var anim = this._shipSheet.getAnimationByIndices(game, [3, 4, 5], 200);
        this.addDrawing("explode", anim);
        this.setCenterDrawing(true);

        this.setDrawing("full");
        this.collisionType = 4 /* Fixed */;
    }
    Enemy.prototype.onInitialize = function (game) {
        this._kraken = game.currentScene.kraken;

        this.rotation = Math.PI / 2;

        //TODO assumes all enemies are initially facing right
        this._lightStartPoint = new ex.Point(this.x + this.getWidth(), this.y + this.getHeight() / 2);

        var yValues = new Array(-0.62, -0.25, 0, 0.25, 0.62);

        for (var i = 0; i < 5; i++) {
            //var rayPoint = new ex.Point(0, this.getHeight() / 2);
            var rayPoint = this._lightStartPoint;
            var rayVector = new ex.Vector(1, yValues[i]);
            var ray = new ex.Ray(rayPoint, rayVector);
            var ray2 = new ex.Ray(rayPoint, rayVector);
            this.rays.push(ray);
            this.originalRays.push(ray2);
        }

        this.on('DistressEvent', function (ev) {
            //if (this.within(ev.enemy, Config.defaultAssistDistance)) {
            //this._alertStatus = AlertStatus.Warn;
            //this.assistShip(ev.enemy);
            //}
        });

        this.on('AttackEvent', function (ev) {
        });
    };

    Enemy.prototype.update = function (engine, delta) {
        var _this = this;
        _super.prototype.update.call(this, engine, delta);

        this._lightStartPoint = new ex.Point(this.x + this.getWidth(), this.y + this.getHeight() / 2);
        this._lightStartPoint = this.rotatePoint(this._lightStartPoint, this.rotation, this.getCenter());
        if (this.health < Config.defaultEnemyHealth && this.health >= Config.defaultEnemyHealth * 0.8) {
            this.setDrawing("full");
        }

        if (this.health < Config.defaultEnemyHealth * 0.8 && this.health >= Config.defaultEnemyHealth * 0.5) {
            this.setDrawing("half");
        }
        if (this.health < Config.defaultEnemyHealth * 0.5 && this.health >= 0) {
            this.setDrawing("eighty");
        }

        if (this.health < 0 && !this.isDead) {
            game.camera.shake(10, 10, 600);
            this.setDrawing("explode");
            Resources.SinkSound.play();
            this.isDead = true;
            var timer = new ex.Timer(function () {
                _this.kill();
                game.currentScene.kraken.health += Config.krakenHealthRegen;

                //record health gained
                game.currentScene.stats.healthGained += Config.krakenHealthRegen;
            }, 600, false);
            game.currentScene.addTimer(timer);

            //record ship destroyed
            game.currentScene.stats.numBoatsDestroyed++;
        }
        for (var i = 0; i < this.rays.length; i++) {
            this.rays[i].pos = this._lightStartPoint;

            // updating for potential rotation
            this.rays[i].dir = this.rotateVector(this.originalRays[i].dir, this.rotation);

            //this.rays[i].pos = this.rotatePoint(this.originalRays[i].pos, this.rotation, this.getCenter());
            this._travelVector = this.rotateVector(this._originalTravelVector, this.rotation);
        }

        if (this.detectKraken() == 1 /* Warn */) {
            //this._alertStatus = AlertStatus.Warn;
        } else if (this.detectKraken() == 2 /* Attack */) {
            this.alertStatus = 2 /* Attack */;
            game.currentScene.stats.numBoatsAlerted = 1; //TODO have this correctly count
            //this.sonar.ping();
        } else {
            //this._alertStatus = AlertStatus.Calm;
        }

        if (this.alertStatus == 1 /* Warn */) {
            this.triggerEvent('DistressEvent', new DistressEvent(this));
        } else if (this.alertStatus == 2 /* Attack */) {
            this.triggerEvent('AttackEvent', new AttackEvent(this));
            if (this.within(this._kraken, Config.defaultEnemyMaxFiringDistance)) {
                this.attack(delta);
            } else {
                this.alertStatus = 0 /* Calm */;
            }
        }
    };

    Enemy.prototype.createMovePath = function (path) {
        var _this = this;
        this.movePath = path;

        path.forEach(function (point, i) {
            _this.moveTo(point.x - _this.getWidth() / 2, point.y - _this.getHeight() / 2, Config.defaultEnemySpeed);
            if (path[i + 1]) {
                var direction = new ex.Vector(path[i + 1].x, path[i + 1].y).minus(point.toVector()).normalize();
                var angle = Math.atan2(direction.y, direction.x);
                _this.rotateTo(angle, Config.enemyRotationSpeed);
            }
        });
        this.delay(Config.defaultEnemyWaitTime);
        for (var i = path.length - 1; i >= 0; i--) {
            this.moveTo(path[i].x - this.getWidth() / 2, path[i].y - this.getHeight() / 2, Config.defaultEnemySpeed);
            if (path[i - 1]) {
                var direction = new ex.Vector(path[i - 1].x, path[i - 1].y).minus(path[i].toVector()).normalize();
                var angle = Math.atan2(direction.y, direction.x);
                this.rotateTo(angle, Config.enemyRotationSpeed);
            }
        }

        this.repeatForever();
    };

    Enemy.prototype.detectKraken = function () {
        var result = 0 /* Calm */;
        var krakenLines = this._kraken.getLines();
        for (var i = 0; i < this.rays.length; i++) {
            for (var j = 0; j < krakenLines.length; j++) {
                var distanceToKraken = this.rays[i].intersect(krakenLines[j]);
                if ((result != 2 /* Attack */) && (distanceToKraken >= Config.defaultMaxAttackDistance) && (distanceToKraken <= Config.defaultMaxAlertDistance)) {
                    result = 1 /* Warn */;
                }
                if ((distanceToKraken >= 0) && (distanceToKraken <= Config.defaultMaxAttackDistance)) {
                    result = 2 /* Attack */;
                }
            }
        }
        return result;
    };

    Enemy.prototype.canSeeKraken = function () {
        var krakenLines = this._kraken.getLines();
        for (var i = 0; i < this.rays.length; i++) {
            for (var j = 0; j < krakenLines.length; j++) {
                var distanceToKraken = this.rays[i].intersect(krakenLines[j]);
                if (distanceToKraken >= 0) {
                    return true;
                }
            }
        }
        return false;
    };

    Enemy.prototype.createSpotlight = function (startPoint, sightDistance) {
        //TODO
    };

    Enemy.prototype.createRadar = function (startPoint, sightDistance) {
        //TODO
    };

    Enemy.prototype.rotatePoint = function (p, rotationAngle, anchor) {
        var sinAngle = Math.sin(rotationAngle);
        var cosAngle = Math.cos(rotationAngle);
        var x = cosAngle * (p.x - anchor.x) - sinAngle * (p.y - anchor.y) + anchor.x;
        var y = sinAngle * (p.x - anchor.x) + cosAngle * (p.y - anchor.y) + anchor.y;
        return new ex.Point(x, y);
    };

    Enemy.prototype.rotateVector = function (vectorToRotate, rotationAngle) {
        var newVectorPoint = this.rotatePoint(vectorToRotate.toPoint(), rotationAngle, new ex.Point(0, 0));
        return new ex.Vector(newVectorPoint.x, newVectorPoint.y);
    };

    Enemy.prototype.draw = function (ctx, delta) {
        _super.prototype.draw.call(this, ctx, delta);
        this.drawFOV(this._lightStartPoint, ctx, delta);

        if (this.alertStatus === 2 /* Attack */) {
            this.alertSprite.draw(ctx, this.getCenter().x + Config.enemyAlertOffsetX - this.alertSprite.width / 2, this.getCenter().y + Config.enemyAlertOffsetY - this.alertSprite.height / 2);
        }
    };

    Enemy.prototype.attack = function (delta) {
        // if the ship can still see the kraken (or the kraken is in the ship's attack proximity), attack the kraken
        if (this._bulletTimer <= 0) {
            ex.Logger.getInstance().info("Shot bullet");

            // shoot
            // todo lead them a bit based on kraken's travel vector? bonus!
            var fireLocation = this.rotatePoint(new ex.Point(this.getCenter().x + Config.enemyGunOffset, this.getCenter().y), this.rotation, this.getCenter());

            game.addChild(new Bullet(fireLocation.x, fireLocation.y, this._kraken.getCenter().x, this._kraken.getCenter().y));
            Resources.BulletSound.play();

            this._bulletTimer = Config.defaultEnemyBulletWait;
        }
        this._bulletTimer -= delta;
    };

    Enemy.prototype.assistShip = function (shipInTrouble) {
        this.clearActions();
        this.follow(shipInTrouble, 50);
    };

    Enemy.prototype.drawFOV = function (point, ctx, delta) {
        // create radial gradient
        var fovRay = new ex.Ray(point, this._travelVector);
        var fovEndPoint = fovRay.getPoint(this._fovLength);

        var grd = ctx.createRadialGradient(point.x, point.y, 10, fovEndPoint.x, fovEndPoint.y, this._fovLength / 2);
        if (this.alertStatus !== 2 /* Attack */) {
            grd.addColorStop(0, 'rgba(255, 255, 255, 0.3)');
            grd.addColorStop(1, 'rgba(255, 255, 255, 0)');
        } else {
            grd.addColorStop(0, 'rgba(255, 150, 150, 0.3)');
            grd.addColorStop(1, 'rgba(255, 150, 150, 0)');
        }

        ctx.fillStyle = grd;
        ctx.beginPath();

        // x, y, radius, start, end, [anti-clockwise]
        ctx.arc(this.getCenter().x, this.getCenter().y, this._fovLength - 200, 0, Math.PI * 2);
        ctx.closePath();
        ctx.fill();
    };

    Enemy.prototype.debugDraw = function (ctx) {
        var _this = this;
        _super.prototype.debugDraw.call(this, ctx);

        for (var i = 0; i < this.rays.length; i++) {
            ctx.beginPath();
            ctx.moveTo(this.rays[i].pos.x, this.rays[i].pos.y);
            var end = this.rays[i].getPoint(Config.defaultMaxAlertDistance);
            ctx.lineTo(end.x, end.y);
            ctx.strokeStyle = ex.Color.Chartreuse.toString();
            ctx.stroke();
            ctx.closePath();
        }

        // draw path if any
        if (this.movePath) {
            ctx.beginPath();
            this.movePath.forEach(function (point, i) {
                ctx.moveTo(point.x, point.y);

                // not at the end yet
                if (i < (_this.movePath.length - 1)) {
                    ctx.lineTo(_this.movePath[i + 1].x, _this.movePath[i + 1].y);
                }
            });
            ctx.closePath();
            ctx.strokeStyle = ex.Color.Violet.toString();
            ctx.stroke();
        }
    };
    return Enemy;
})(ex.Actor);

var AlertStatus;
(function (AlertStatus) {
    AlertStatus[AlertStatus["Calm"] = 0] = "Calm";
    AlertStatus[AlertStatus["Warn"] = 1] = "Warn";
    AlertStatus[AlertStatus["Attack"] = 2] = "Attack";
})(AlertStatus || (AlertStatus = {}));
/**
* Only put ILoadables into this resource hash
*/
var Resources = {
    // Soundtrack
    SoundTrack: new ex.Sound("/sounds/KrakenMusic.mp3", "/sounds/KrakenMusic.wav"),
    // Levels
    Level0: new BaseLevel("/maps/Level-0.json"),
    // Textures
    SplashTexture: new ex.Texture("/images/splash.jpg"),
    DeathTexture: new ex.Texture("/images/death.jpg"),
    VictoryTexture: new ex.Texture("/images/victory.jpg"),
    KrakenTexture: new ex.Texture("/images/kraken/KrakenSpriteSheet.png"),
    StartButtonTexture: new ex.Texture("/images/start.png"),
    // Enemies
    Ship1Texture: new ex.Texture("/images/ship-1.png"),
    BulletTexture: new ex.Texture("/images/bullet.png"),
    AlertTexture: new ex.Texture("/images/alert.png"),
    BulletSound: new ex.Sound("/sounds/shoot.mp3", "/sounds/shoot.wav"),
    SinkSound: new ex.Sound("/sounds/shipsink.mp3", "/sounds/shipsink.wav"),
    // Tilesets
    TerrainTexture: new ex.Texture("/images/tilesets/terrain.png"),
    // Kraken
    SoundSwim: new ex.Sound("/sounds/swim.mp3", "/sounds/swim.wav"),
    SoundHurt: new ex.Sound("/sounds/hurt.mp3", "/sounds/hurt.wav"),
    SoundWaves: new ex.Sound("/sounds/waves.mp3", "/sounds/waves.wav"),
    SoundDeath: new ex.Sound("/sounds/death.mp3", "/sounds/death.wav"),
    HitSound: new ex.Sound("/sounds/hit.mp3", "/sounds/hit.wav"),
    // HUD
    Heart: new ex.Texture("/images/heart.png")
};

var Palette = {
    // Night time
    ColorNightTime: new ex.Color(51, 27, 96),
    // Kraken
    ColorKrakenBlend: new ex.Color(80, 48, 140),
    ColorKrakenGlowStart: new ex.Color(65, 102, 197, 0.5),
    ColorKrakenGlowEnd: new ex.Color(14, 26, 55, 0)
};
/// <reference path="Config.ts" />
/// <reference path="Enemy.ts" />
var KrakenMode;
(function (KrakenMode) {
    KrakenMode[KrakenMode["Idle"] = 0] = "Idle";
    KrakenMode[KrakenMode["Attack"] = 1] = "Attack";
    KrakenMode[KrakenMode["Swim"] = 2] = "Swim";
})(KrakenMode || (KrakenMode = {}));

var Kraken = (function (_super) {
    __extends(Kraken, _super);
    function Kraken(x, y, color, health) {
        _super.call(this, x, y, Config.defaultKrakenWidth, Config.defaultKrakenHeight, color);
        this.health = Config.defaultKrakenHealth;
        this._travelVector = new ex.Vector(0, 0);
        this._currentMode = 0 /* Idle */;
        this._lastAttackTime = Date.now();
        this._spinning = false;
        this._animationTimer = 0;
        this.health = health || this.health;

        var krakenSheet = new ex.SpriteSheet(Resources.KrakenTexture, 4, 3, 120, 60);

        krakenSheet.sprites.forEach(function (s) {
            return s.addEffect(new Fx.Multiply(Palette.ColorKrakenBlend));
        });

        var swimAnim = krakenSheet.getAnimationByIndices(game, [0, 1, 2, 3], 200);
        swimAnim.loop = true;
        swimAnim.setScaleX(1.5);
        swimAnim.setScaleY(1.5);
        this.setCenterDrawing(true);

        var attackAnim = krakenSheet.getAnimationByIndices(game, [4, 5, 6], 200);
        attackAnim.loop = true;
        attackAnim.setScaleX(1.5);
        attackAnim.setScaleY(1.5);
        this.setCenterDrawing(true);

        var idleAnim = krakenSheet.getAnimationByIndices(game, [8, 7, 9, 7], 200);
        idleAnim.loop = true;
        idleAnim.setScaleX(1.5);
        idleAnim.setScaleY(1.5);
        this.setCenterDrawing(true);

        this.addDrawing('idle', idleAnim);
        this.addDrawing('attack', attackAnim);
        this.addDrawing('swim', swimAnim);
        this.setDrawing('idle');
    }
    Kraken.prototype.handleAttackPress = function () {
        var target = this.getClosestEnemy();

        if (this._canAttack && target) {
            this.attack(target);
        }
    };

    Kraken.prototype.getClosestEnemy = function () {
        var _this = this;
        var ships = game.currentScene.enemies;
        var target = ships.sort(function (a, b) {
            return a.getCenter().distance(_this.getCenter()) - b.getCenter().distance(_this.getCenter());
        })[0];

        if (target && target.getCenter().distance(this.getCenter()) <= Config.krakenAttackRange) {
            return target;
        }

        return null;
    };

    Kraken.prototype.checkForShipProximity = function () {
        var targetInRange = this.getClosestEnemy();

        // Attack the ship if in range
        if (targetInRange) {
            this._canAttack = true;
        } else {
            this._canAttack = false;

            if (this._currentMode === 1 /* Attack */) {
                this.returnToSwim();
            }
        }
    };

    Kraken.prototype.onInitialize = function (game) {
        var _this = this;
        ex.Logger.getInstance().info("Kraken initialized");

        Resources.SoundSwim.setVolume(.3);

        // Build swim sound timer
        var swimTimer = new ex.Timer(function () {
            if (_this._currentMode === 2 /* Swim */) {
                Resources.SoundSwim.play();
            }
        }, 800, true);

        game.currentScene.addTimer(swimTimer);

        game.on('mousemove', function (ev) {
            // todo play sound in interval
            //Resources.SoundSwim.play();
            _this.moveKraken(ev.x, ev.y);
        });

        game.on('keyup', function (ev) {
            if (ev.key === 32 /* Space */) {
                _this.handleAttackPress();
            }
        });

        this.on('collision', function (ev) {
            if (!ev.other) {
                _this.dx = 0;
                _this.dy = 0;
            }

            // todo workaround race condition in Excalibur collisions
            // when two collision events are queued for this actor
            // don't process if other was killed in previous handler
            if (ev.other instanceof Bullet && !ev.other._isKilled) {
                ex.Logger.getInstance().info("Kraken got shot, yo!");

                // subtract health
                _this.health -= Config.enemyDps;

                // record damage taken
                game.currentScene.stats.damageTaken += Config.enemyDps;

                // cue
                Resources.SoundHurt.play();

                // kill
                ev.other.kill();
            }
        });
    };

    Kraken.prototype.update = function (engine, delta) {
        _super.prototype.update.call(this, engine, delta);

        // if killed?
        if (this.health <= 0) {
            game.goToScene("death");
            return;
        }

        // check for enemy proximity
        this.checkForShipProximity();

        var dampeningVector = this._travelVector.normalize().scale(Config.krakenInertiaDampen).scale(-1);

        if (Math.abs(this.dx) < Config.defaultKrakenIdleThreshold) {
            this.dx = 0;
        }

        if (Math.abs(this.dy) < Config.defaultKrakenIdleThreshold) {
            this.dy = 0;
        }

        this.setAnimationState(delta);

        if (this.dx > dampeningVector.x && this.dx !== 0) {
            this.dx += dampeningVector.x;
        }

        if (this.dx < dampeningVector.x && this.dx !== 0) {
            this.dx += dampeningVector.x;
        }

        if (this.dy > dampeningVector.y && this.dy !== 0) {
            this.dy += dampeningVector.y;
        }

        if (this.dy < dampeningVector.y && this.dy !== 0) {
            this.dy += dampeningVector.y;
        }
    };

    Kraken.prototype.moveKraken = function (x, y) {
        var potentialTarget = new ex.Vector(x, y);

        if (potentialTarget.minus(this.getCenter()).distance() > Config.defaultKrakenMoveRadius) {
            var rayTarget = new ex.Ray(this.getCenter(), potentialTarget.minus(this.getCenter()));
            potentialTarget = rayTarget.getPoint(Config.defaultKrakenMoveRadius).toVector();
        }

        var travelVector = potentialTarget.minus(this.getCenter());
        travelVector.normalize().scale(Config.defaultKrakenSpeedScale);
        this._travelVector = travelVector;

        //this._travelVector = new ex.Vector(ex.Util.clamp(travelVector.x, -Config.defaultKrakenMaxSpeed, Config.defaultKrakenMaxSpeed),
        //   ex.Util.clamp(travelVector.y, -Config.defaultKrakenMaxSpeed, Config.defaultKrakenMaxSpeed));
        this.move(travelVector.x, travelVector.y);

        travelVector.normalize();
        var rotationAngle = Math.atan2(travelVector.y, travelVector.x);

        if (!this._spinning) {
            this.rotation = rotationAngle;
        }
    };

    Kraken.prototype.move = function (x, y) {
        this.dx = x;
        this.dy = y;
    };

    Kraken.prototype.setAnimationState = function (delta) {
        // Moving
        if (this.dx === 0 && this.dy === 0 && this._animationTimer <= 0) {
            if (this._currentMode !== 1 /* Attack */ && this._currentMode !== 0 /* Idle */) {
                ex.Logger.getInstance().info("Setting animation state to Idle", this.dx, this.dy);
                this.setDrawing('idle');
                this._currentMode = 0 /* Idle */;
                this._animationTimer = Config.defaultKrakenAnimationChangeThreshold;
                return;
            }
        }

        // Moving
        if (this.dx !== 0 && this.dy !== 0 && this._animationTimer <= 0) {
            if (this._currentMode !== 1 /* Attack */ && this._currentMode !== 2 /* Swim */) {
                ex.Logger.getInstance().info("Setting animation state to Swim", this.dx, this.dy);
                this.setDrawing('swim');
                this._currentMode = 2 /* Swim */;
                this._animationTimer = Config.defaultKrakenAnimationChangeThreshold;
                return;
            }
        }

        this._animationTimer -= delta;
    };

    Kraken.prototype.returnToSwim = function () {
        var _this = this;
        if (this._currentMode === 1 /* Attack */) {
            if (!this.actionQueue.hasNext()) {
                ex.Logger.getInstance().info("Kraken.returnToSwim: Returning to swim");

                var oldRotation = this.rotation;

                this.clearActions();
                this._spinning = true;
                this.rotateBy(this.rotation + Math.PI, 200).callMethod(function () {
                    _this.setDrawing('swim');
                    _this.rotation = oldRotation;
                    _this._currentMode = 2 /* Swim */;
                    ex.Logger.getInstance().info("Kraken.returnToSwim: Setting mode to Swim after rotate");
                    _this._spinning = false;
                });
            }
        } else {
            this.setDrawing('swim');
            this._currentMode = 2 /* Swim */;
            ex.Logger.getInstance().info("Kraken.returnToSwim: Setting mode to Swim");
        }
    };

    Kraken.prototype.attack = function (enemy) {
        var _this = this;
        if ((Date.now() - this._lastAttackTime) > Config.krakenAttackTime) {
            if (this._currentMode !== 1 /* Attack */) {
                //console.log("Spinning", this._currentMode);
                this._currentMode = 1 /* Attack */;
                ex.Logger.getInstance().info("Kraken.attack: Setting mode to Attack");

                var oldRotation = this.rotation;
                this.clearActions();
                this._spinning = true;
                this.rotateBy(this.rotation + Math.PI, 200).callMethod(function () {
                    _this.setDrawing('attack');
                    _this.rotation = oldRotation;
                    _this._spinning = false;
                });
            }

            //todo do damage here
            if (enemy) {
                Resources.HitSound.play();
                game.camera.shake(10, 10, 200);
                enemy.health -= Config.krakenDps;
                enemy.alertStatus = 2 /* Attack */;

                //record damage dealt
                game.currentScene.stats.damageDealt += Config.krakenDps;
            }
            this._lastAttackTime = Date.now();
        }
    };

    Kraken.prototype.getLines = function () {
        var lines = new Array();

        var beginPoint1 = new ex.Point(this.x, this.y);
        var endPoint1 = new ex.Point(this.x + this.getWidth(), this.y);
        var newLine1 = new ex.Line(beginPoint1, endPoint1);

        // beginPoint2 is endPoint1
        var endPoint2 = new ex.Point(endPoint1.x, endPoint1.y + this.getHeight());
        var newLine2 = new ex.Line(endPoint1, endPoint2);

        // beginPoint3 is endPoint2
        var endPoint3 = new ex.Point(this.x, this.y + this.getHeight());
        var newLine3 = new ex.Line(endPoint2, endPoint3);

        // beginPoint4 is endPoint3
        // endPoint4 is beginPoint1
        var newLine4 = new ex.Line(endPoint3, beginPoint1);

        //console.log("line1: (" + Math.round(newLine1.begin.x) + ", " + Math.round(newLine1.begin.y) + ") to (" + Math.round(newLine1.end.x) + ", " + Math.round(newLine1.end.y) + ")");
        //console.log("line2: (" + Math.round(newLine2.begin.x) + ", " + Math.round(newLine2.begin.y) + ") to (" + Math.round(newLine2.end.x) + ", " + Math.round(newLine2.end.y) + ")");
        //console.log("line3: (" + Math.round(newLine3.begin.x) + ", " + Math.round(newLine3.begin.y) + ") to (" + Math.round(newLine3.end.x) + ", " + Math.round(newLine3.end.y) + ")");
        //console.log("line4: (" + Math.round(newLine4.begin.x) + ", " + Math.round(newLine4.begin.y) + ") to (" + Math.round(newLine4.end.x) + ", " + Math.round(newLine4.end.y) + ")");
        lines.push(newLine1);
        lines.push(newLine2);
        lines.push(newLine3);
        lines.push(newLine4);
        return lines;
    };

    Kraken.prototype.draw = function (ctx, delta) {
        this.drawGlow(ctx, delta);

        _super.prototype.draw.call(this, ctx, delta);
    };

    Kraken.prototype.drawGlow = function (ctx, delta) {
        // create radial gradient
        var grd = ctx.createRadialGradient(this.getCenter().x, this.getCenter().y, 10, this.getCenter().x, this.getCenter().y, 150);

        grd.addColorStop(0, Palette.ColorKrakenGlowStart.toString());
        grd.addColorStop(1, Palette.ColorKrakenGlowEnd.toString());

        ctx.fillStyle = grd;
        ctx.beginPath();

        // x, y, radius, start, end, [anti-clockwise]
        ctx.arc(this.getCenter().x, this.getCenter().y, 150, 0, Math.PI * 2);
        ctx.closePath();
        ctx.fill();
    };
    return Kraken;
})(ex.Actor);
/**
* Whether or not an element has a CSS class present
* @param element The DOM element to check
* @param cls The CSS class to check for
* @returns True if the class exists and false if not
*/
function hasClass(element, cls) {
    return element.classList.contains(cls);
}

/**
* Replaces a CSS class on an element
* @param element The DOM element to manipulate
* @param search The CSS class to find
* @param replace The CSS class to replace with
*/
function replaceClass(element, search, replace) {
    if (hasClass(element, search)) {
        this.removeClass(element, search);
        this.addClass(element, replace);
    }
}

/**
* Adds a CSS class to a DOM element
* @param element The DOM element to manipulate
* @param cls The CSS class to add
*/
function addClass(element, cls) {
    element.classList.add(cls);
}

/**
* Removes a CSS class to a DOM element
* @param element The DOM element to manipulate
* @param cls The CSS class to remove
*/
function removeClass(element, cls) {
    element.classList.remove(cls);
}

function setVolume(val) {
    for (var resource in Resources) {
        if (Resources.hasOwnProperty(resource)) {
            if (Resources[resource] instanceof ex.Sound) {
                Resources[resource].setVolume(val);

                if (resource === "SoundWaves" && val > 0) {
                    Resources[resource].setVolume(0.1);
                }

                if (resource === "SoundTrack" && val > 0) {
                    Resources[resource].setVolume(.2);
                }
            }
        }
    }
}
/// <reference path="../scripts/Excalibur.d.ts" />
/// <reference path="Level.ts" />
/// <reference path="Resources.ts" />
/// <reference path="Kraken.ts" />
/// <reference path="Enemy.ts" />
/// <reference path="util.ts" />
document.getElementById("sound").addEventListener('click', function () {
    if (hasClass(this, 'fa-volume-up')) {
        replaceClass(this, 'fa-volume-up', 'fa-volume-off');
        setVolume(0);
    } else {
        replaceClass(this, 'fa-volume-off', 'fa-volume-up');
        setVolume(.5);
    }
});

var game = new ex.Engine(920, 580, "game");

//ex.Logger.getInstance().defaultLevel = ex.LogLevel.Debug;
game.backgroundColor = ex.Color.fromHex("#030d18");
game.setAntialiasing(false);
game.on('keydown', function (ev) {
    if (ev.key === 68 /* D */) {
        game.isDebug = !game.isDebug;
    }
});

game.camera = new ex.TopCamera(game);

var loader = new ex.Loader();

for (var resource in Resources) {
    if (Resources.hasOwnProperty(resource)) {
        loader.addResource(Resources[resource]);
    }
}

var beginGame = function () {
    if (game.currentScene !== Resources.Level0) {
        game.off("keyup", beginGame);
        game.off("mouseup", beginGame);
        game.addScene("level0", Resources.Level0);
        game.addScene("death", new DeathScene());
        game.addScene("victory", new VictoryScene());
        game.goToScene("level0");
    }
};

game.start(loader).then(function () {
    var splash = new ex.Actor(0, 0, game.width, game.height);
    splash.addDrawing("bg", new ex.Sprite(Resources.SplashTexture, 0, 0, game.width, game.height));
    Resources.SoundTrack.setVolume(.2);
    Resources.SoundTrack.setLoop(true);
    Resources.SoundTrack.play();

    game.addChild(splash);

    var startButton = new ex.Actor(game.width / 2 - (329 / 2), game.height - 120, 329, 76);
    startButton.collisionType = 0 /* PreventCollision */;
    startButton.addDrawing("bg", new ex.Sprite(Resources.StartButtonTexture, 0, 0, 329, 76));
    startButton.blink(0.5, 6000, 500).repeatForever();

    game.addChild(startButton);

    game.on("keyup", beginGame);
    game.on("mouseup", beginGame);
});
var DistressEvent = (function (_super) {
    __extends(DistressEvent, _super);
    function DistressEvent(enemy) {
        _super.call(this);
        this.enemy = enemy;
    }
    return DistressEvent;
})(ex.GameEvent);

var AttackEvent = (function (_super) {
    __extends(AttackEvent, _super);
    function AttackEvent(enemy) {
        _super.call(this);
        this.enemy = enemy;
    }
    return AttackEvent;
})(ex.GameEvent);
var Stats = (function () {
    function Stats() {
        this.numBoatsDestroyed = 0;
        this.numBoatsAlerted = 0;
        this.damageTaken = 0;
        this.damageDealt = 0;
        this.healthGained = 0;
        this.timeToFinishLevel = 0;
        // original stats for the level
        this.numBoats = 0;
        this.krakenHealth = Config.defaultKrakenHealth;
    }
    return Stats;
})();
var VictoryScene = (function (_super) {
    __extends(VictoryScene, _super);
    function VictoryScene() {
        _super.call(this);
    }
    VictoryScene.prototype.onInitialize = function (engine) {
        _super.prototype.onInitialize.call(this, engine);

        //var victoryKraken = new Kraken();
        //this.addChild(victoryKraken);
        game.camera = new ex.BaseCamera(engine);

        //game.camera.setActorToFollow(victoryKraken);
        var w = game.getWidth();
        var h = game.getHeight();

        var level0Scene = game.sceneHash["level0"];
        var stats = level0Scene.stats;

        var boatsDestroyed = stats.numBoatsDestroyed;
        var damageTaken = stats.damageTaken;
        var healthGained = stats.healthGained;

        var grade = "C";

        var enemiesDestroyedPercentage = 1 - ((stats.numBoats - boatsDestroyed) / stats.numBoats);

        //var damageTakenState =
        //var healthGainedStat =
        var originalHealth = Config.defaultKrakenHealth;
        var finalHealth = Config.defaultKrakenHealth + healthGained - damageTaken;
        var healthPercentage = 1 - ((originalHealth - finalHealth) / originalHealth);

        var aggregateScore = (enemiesDestroyedPercentage + healthPercentage) / 2;

        if (aggregateScore > 0.5) {
            grade = "B";
        } else if (aggregateScore > 0.8) {
            grade = "A";
        } else if (aggregateScore > 1) {
            grade = "S";
        } else if (aggregateScore > 1.5) {
            grade = "S+";
        }

        var splash = new ex.Actor(0, 0, game.width, game.height);
        splash.addDrawing("bg", new ex.Sprite(Resources.VictoryTexture, 0, 0, game.width, game.height));
        this.addChild(splash);

        //var labelVictory = new ex.Label("Game Complete!", w / 2, 150, '90px Iceland');
        //labelVictory.color = ex.Color.Red;
        //labelVictory.textAlign = ex.TextAlign.Center;
        //this.addChild(labelVictory);
        var labelBoatsDestroyed = new ex.Label("boats destroyed     " + boatsDestroyed, w / 2, 350, '50px Iceland');
        labelBoatsDestroyed.color = ex.Color.White;
        labelBoatsDestroyed.textAlign = 2 /* Center */;
        this.addChild(labelBoatsDestroyed);

        var labelDamageTaken = new ex.Label("damage taken     " + damageTaken, w / 2, 400, '50px Iceland');
        labelDamageTaken.color = ex.Color.White;
        labelDamageTaken.textAlign = 2 /* Center */;
        this.addChild(labelDamageTaken);

        var labelHealthGained = new ex.Label("health gained     " + healthGained, w / 2, 450, '50px Iceland');
        labelHealthGained.color = ex.Color.White;
        labelHealthGained.textAlign = 2 /* Center */;
        this.addChild(labelHealthGained);

        var labelGrade = new ex.Label("grade     " + grade, w / 2, 550, '75px Iceland');
        labelGrade.color = ex.Color.White;
        labelGrade.textAlign = 2 /* Center */;
        this.addChild(labelGrade);
        //var labelDetected = new ex.Label("avoided detection     " , w / 2, 300, '50px Iceland');
        //labelDetected.color = ex.Color.White;
        //labelDetected.textAlign = ex.TextAlign.Center;
        //this.addChild(labelDetected);
        //var damageDealt = new ex.Label("damage dealt", w/2, 450, '50px Iceland');
        //boatsDestroyed.color = ex.Color.White;
        //boatsDestroyed.textAlign = ex.TextAlign.Center;
        //this.addChild(boatsDestroyed);
    };
    return VictoryScene;
})(ex.Scene);
//# sourceMappingURL=app.js.map
