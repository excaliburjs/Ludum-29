/// <reference path="../scripts/Excalibur.d.ts" />
/// <reference path="Level.ts" />
/// <reference path="Kraken.ts" />
/// <reference path="Enemy.ts" />

var game = new ex.Engine();
game.backgroundColor = ex.Color.Azure;
game.setAntialiasing(false);
game.camera = new ex.TopCamera(game);

var loader = new ex.Loader();

var level = new BaseLevel("/maps/Level-0.json");
loader.addResource(level);
loader.addResource(Config.terrainTexture);

var kraken = new Kraken(200, 200, ex.Color.Red);

game.camera.setActorToFollow(kraken);

level.addChild(kraken);

game.start(loader).then(() => {
    game.addScene("test-level", level);
    game.goToScene("test-level");
});