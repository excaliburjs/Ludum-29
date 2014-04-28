/// <reference path="../scripts/Excalibur.d.ts" />
/// <reference path="Level.ts" />
/// <reference path="Resources.ts" />
/// <reference path="Kraken.ts" />
/// <reference path="Enemy.ts" />

var game = new ex.Engine(920, 580, "game");
//ex.Logger.getInstance().defaultLevel = ex.LogLevel.Debug;
game.backgroundColor = ex.Color.fromHex("#030d18");
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

var beginGame = () => {
   if (game.currentScene !== Resources.Level0) {
      game.off("keyup", beginGame);
      game.off("mouseup", beginGame);
      game.addScene("level0", Resources.Level0);
      game.addScene("death", new DeathScene());
      game.goToScene("level0");
   }
};

game.start(loader).then(() => {

   var splash = new ex.Actor(0, 0, game.width, game.height);
   splash.addDrawing("bg", new ex.Sprite(Resources.SplashTexture, 0, 0, game.width, game.height));

   game.addChild(splash);

   var startButton = new ex.Actor(game.width / 2 - (329/2), game.height - 120, 329, 76);
   startButton.collisionType = ex.CollisionType.PreventCollision;
   startButton.addDrawing("bg", new ex.Sprite(Resources.StartButtonTexture, 0, 0, 329, 76));
   startButton.blink(0.5, 6000, 500).repeatForever();

   game.addChild(startButton);

   game.on("keyup", beginGame);
   game.on("mouseup", beginGame);
});