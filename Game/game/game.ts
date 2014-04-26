/// <reference path="../scripts/Excalibur.d.ts" />
/// <reference path="Resources.ts" />
/// <reference path="Level.ts" />
/// <reference path="Kraken.ts" />
/// <reference path="Enemy.ts" />

var game = new ex.Engine();
game.backgroundColor = ex.Color.Azure;
game.setAntialiasing(false);
game.camera = new ex.TopCamera(game);

var loader = new ex.Loader();

// Load all resources
for (var resource in Resources) {
   if (Resources.hasOwnProperty(resource)) {
      loader.addResource(Resources[resource]);
   }
}

game.start(loader).then(() => {
   game.addScene("level0", Resources.Level0);
   game.goToScene("level0");
});