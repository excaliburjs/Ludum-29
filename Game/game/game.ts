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
      game.goToScene("level0");
   }
};

game.start(loader).then(() => {

   var splash = new ex.Actor(0, 0, game.width, game.height);
   splash.addDrawing("bg", new ex.Sprite(Resources.SplashTexture, 0, 0, game.width, game.height));
   Resources.SoundTrack.setVolume(.5);
   Resources.SoundTrack.setLoop(true);
   Resources.SoundTrack.play();

   game.addChild(splash);

   game.on("keyup", beginGame);
   game.on("mouseup", beginGame);
});