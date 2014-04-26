/// <reference path="../scripts/Excalibur.d.ts" />
/// <reference path="Level.ts" />
/// <reference path="Resources.ts" />
/// <reference path="Kraken.ts" />
/// <reference path="Enemy.ts" />

var game = new ex.Engine(920, 580, "game");
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

game.start(loader).then(() => {

   var splash = new ex.Actor(0, 0, game.width, game.height);
   splash.addDrawing("bg", new ex.Sprite(Resources.SplashTexture, 0, 0, game.width, game.height));

   game.addChild(splash);

   game.on("keyup", (ev: ex.KeyUp) => {

      if (ev.key !== ex.InputKey.Space) return;

      if (game.currentScene !== Resources.Level0) {
         game.addScene("level0", Resources.Level0);
         game.goToScene("level0");
      }
   });


});