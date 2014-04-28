class Bullet extends ex.Actor {
   
   private remainingLife: number;
   private bulletSpriteSheet: ex.SpriteSheet = new ex.SpriteSheet(Resources.BulletTexture, 6, 1, 32, 32);
   private bulletAnimation: ex.Animation =  this.bulletSpriteSheet.getAnimationForAll(game, 200);

   constructor(x: number, y: number, destX: number, destY: number) {
      super(x, y, 3, 3, ex.Color.Red);

      this.collisionType = ex.CollisionType.Passive;

      var sv = new ex.Vector(x, y);
      var tv = new ex.Vector(destX, destY);
      var fv = tv.minus(sv).normalize().scale(Config.defaultEnemyBulletSpeed);

      this.dx = fv.x;
      this.dy = fv.y;
      this.bulletAnimation.loop = true;
      this.addDrawing('default', this.bulletAnimation);
      this.setCenterDrawing(true);

      this.remainingLife = Config.defaultEnemyBulletLife;
   }

   public update(engine: ex.Engine, delta: number): void {
      super.update(engine, delta);

      // can only spawn on level!
      var currentMap = (<BaseLevel>engine.currentScene).data;

      // todo it would be cool to die when you hit a solid tile (not terrain)

      // exit map
      if (this.x <= 0 ||
         this.y <= 0 ||
         this.x >= (currentMap.width * currentMap.tilewidth) ||
         this.y >= (currentMap.height * currentMap.tileheight)) {

         this.kill();
         return;
      }

      // or time out
      if (this.remainingLife <= 0) {
         this.kill();
         return;
      } else {
         this.remainingLife -= delta;
      }
   }
} 