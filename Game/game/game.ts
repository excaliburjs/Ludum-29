/// <reference path="../scripts/Excalibur.d.ts" />
/// <reference path="Level.ts" />

var game = new ex.Engine();
game.backgroundColor = ex.Color.Azure;
game.setAntialiasing(false);
game.camera = new ex.TopCamera(game);

var loader = new ex.Loader();
var krakenTexture = new ex.Texture("images/kraken/KrakenSpriteSheet.png");
loader.addResource(krakenTexture);

var level = new BaseLevel("/maps/Level-0.json");
loader.addResource(level);
loader.addResource(Config.terrainTexture);

var krakenSheet = new ex.SpriteSheet(krakenTexture, 4, 3, 120, 60);
var anim = krakenSheet.getAnimationByIndices(game, [0, 1, 2], 200);
anim.loop = true;
anim.setScaleX(2);
anim.setScaleY(2);

var kraken = new ex.Actor(200, 200, 200, 200, ex.Color.Red);
kraken.addDrawing("default", anim);
kraken.on("right", function() {
    this.dx = 100;
});

game.camera.setActorToFollow(kraken);

kraken.on("left", function () {
    this.dx = -100;
});

kraken.on("keyup", function() {
    this.dx = 0;
});
level.addChild(kraken);

game.start(loader).then(() => {
    game.addScene("test-level", level);
    game.goToScene("test-level");
});