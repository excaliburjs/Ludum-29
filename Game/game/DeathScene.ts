class DeathScene extends ex.Scene {
   
   constructor() {
      super();
   }

   public onInitialize(engine: ex.Engine): void {
      super.onInitialize(engine);

      game.camera = new ex.BaseCamera(engine);

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