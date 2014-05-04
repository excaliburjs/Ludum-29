class Turret extends ex.Actor {
   
   constructor(x: number, y: number) {
      super(x, y, 48, 48);
      this.collisionType = ex.CollisionType.PreventCollision;

      this.addDrawing("inactive", new ex.Sprite(Resources.TurretTexture, 0, 0, 48, 48));
      this.addDrawing("active", new ex.Sprite(Resources.TurretTexture, 48, 0, 48, 48));
      this.setDrawing("inactive");
      this.currentDrawing.addEffect(new Fx.Multiply(Palette.ColorNightTime));
   }

   private _kraken: Kraken;
   private _bulletTimer: number = 0;

   public onInitialize(engine: ex.Engine): void {
      super.onInitialize(engine);

      this._kraken = (<BaseLevel>engine.currentScene).kraken;
   }

   public update(engine: ex.Engine, delta: number) {
      super.update(engine, delta);

      if (this.within(this._kraken, Config.defaultTurretAlertDistance)) {
         this.setDrawing("active");
         this.attack(delta);
      } else {
         this.setDrawing("inactive");
      }

      this._bulletTimer -= delta;
   }

   public attack(delta: number) {
      // if the ship can still see the kraken (or the kraken is in the ship's attack proximity), attack the kraken

      if (this._bulletTimer <= 0) {
         ex.Logger.getInstance().info("Shot bullet");

         // shoot
         // todo lead them a bit based on kraken's travel vector? bonus!

         var fireLocation = this.getCenter();

         game.addChild(new Bullet(fireLocation.x, fireLocation.y, this._kraken.getCenter().x, this._kraken.getCenter().y));
         Resources.BulletSound.play();

         this._bulletTimer = ex.Util.randomInRange(Config.defaultEnemyBulletMinWait, Config.defaultEnemyBulletMaxWait);
      }      
   }
} 