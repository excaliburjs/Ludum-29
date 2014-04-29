class DeathScene extends ex.Scene {
   
   constructor() {
      super();
   }

   public onInitialize(engine: ex.Engine): void {
      super.onInitialize(engine);

      game.camera = new ex.BaseCamera(engine);

      var level0Scene = (<any>game).sceneHash["level0"];
      var stats = level0Scene.stats;

      var boatsDestroyed = stats.numBoatsDestroyed;
      var damageTaken = stats.damageTaken;
      var healthGained = stats.healthGained;

      var analytics = (<any>window).ga;
      if (analytics) {
         analytics('send', 'event', 'Gameover', 'level0', 'Death', { 'nonInteraction': 1 });
         analytics('send', 'event', 'DeathStats', 'level0', 'Boats Destroyed', { 'eventValue': boatsDestroyed, 'nonInteraction': 1 });
         analytics('send', 'event', 'DeathStats', 'level0', 'Damage Taken', { 'eventValue': damageTaken, 'nonInteraction': 1 });
         analytics('send', 'event', 'DeathStats', 'level0', 'Health Gained', { 'eventValue': healthGained, 'nonInteraction': 1 });
      }

      // play death
      Resources.SoundDeath.play();

      // splash
      var death = new ex.Actor(0, 0, engine.canvas.width, engine.canvas.height);
      death.addDrawing("bg", new ex.Sprite(Resources.DeathTexture, 0, 0, engine.canvas.width, engine.canvas.height));

      var timer = new ex.Timer(() => {
         window.location.reload();
      }, Config.deathTimer, false);

      game.addChild(death);
      game.addTimer(timer);
   }

}