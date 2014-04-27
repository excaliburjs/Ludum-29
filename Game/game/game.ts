/// <reference path="../scripts/Excalibur.d.ts" />
/// <reference path="Level.ts" />
/// <reference path="Resources.ts" />
/// <reference path="Kraken.ts" />
/// <reference path="Enemy.ts" />

var game = new ex.Engine(920, 580, "game", ex.DisplayMode.Fill);
//ex.Logger.getInstance().defaultLevel = ex.LogLevel.Debug;
game.backgroundColor = ex.Color.Azure;
game.setAntialiasing(false);
game.on('keydown', function(ev: ex.KeyDown) {
    if (ev.key === ex.InputKey.D) {
        game.isDebug = !game.isDebug;
    }
});

game.camera = new ex.TopCamera(game);

var loader = new ex.Loader();

// Load all resources
for (var resource in Resources) {
   if (Resources.hasOwnProperty(resource)) {
      loader.addResource(Resources[resource]);
   }
}

var testBoat = new Enemy(700, 4300, 100, 50, ex.Color.Black);
var startPoint = new ex.Point(850, 4300);
var endPoint = new ex.Point(950, 4300);
//testBoat.movePatrol(startPoint, endPoint);

var beginGame = () => {
   if (game.currentScene !== Resources.Level0) {
      game.off("keyup", beginGame);
      game.off("mouseup", beginGame);
      game.addScene("level0", Resources.Level0);
      game.goToScene("level0");
      game.currentScene.addChild(testBoat);
   }
};

game.start(loader).then(() => {

   var splash = new ex.Actor(0, 0, game.width, game.height);
   splash.addDrawing("bg", new ex.Sprite(Resources.SplashTexture, 0, 0, game.width, game.height));

   game.addChild(splash);

   game.on("keyup", beginGame);
   game.on("mouseup", beginGame);
});