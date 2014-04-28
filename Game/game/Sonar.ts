

class Sonar extends ex.Actor {

   private _isOn: boolean = false;

   constructor(x: number, y: number, width?: number, height?: number, color?: ex.Color) {
      super(x, y, width, height, color);
      this.x = x - (this.getWidth() / 2);
      this.y = y - (this.getHeight() / 2);
      this.collisionType = ex.CollisionType.Passive;
   }

   public update(engine: ex.Engine, delta: number) {
      super.update(engine, delta);
      this.x = (this.parent.getWidth()/2) -(this.getWidth() / 2);
      this.y = (this.parent.getHeight() / 2) - (this.getHeight() / 2);

      //if (this._isOn) {
      //   var timer = new ex.Timer(() => {
      //      if (this.getWidth() > Config.defaultMaxAttackDistance) {
      //         this._isOn = false;
      //         this.setHeight(1);
      //         this.setWidth(1);
      //         this.clearActions();
      //      }
      //   }, 600, false);
      //   game.currentScene.addTimer(timer);
      //}
   }

   public draw(ctx: CanvasRenderingContext2D, delta: number) {
      if (this._isOn) {
         //super.draw(ctx, delta);
         ctx.strokeStyle = ex.Color.Red.toString();
         ctx.beginPath();
         var parentShiftX = this.parent.getWidth() / 2;
         var parentShiftY = this.parent.getHeight() / 2;
         ctx.arc(-parentShiftX + this.x + this.getWidth() / 2, -parentShiftY + this.y + this.getHeight() / 2, this.getWidth() / 2, 0, 2 * Math.PI);
         ctx.arc(-parentShiftX + this.x + this.getWidth() / 2, -parentShiftY + this.y + this.getHeight() / 2, this.getWidth() / 2, 2 * Math.PI, 0, true);
         ctx.closePath();
         ctx.stroke();
      }
   }

   //public ping() {
   //   this._isOn = true;
   //   this.scaleTo(Config.defaultSonarPingScale, Config.defaultSonarPingScale, Config.defaultSonarPingSpeed, Config.defaultSonarPingSpeed);
   //   //if (this.getWidth() > Config.defaultMaxAttackDistance) {
   //   //   this._isOn = false;
   //   //   this.setHeight(1);
   //   //   this.setWidth(1);
   //   //}
   //}
}