
class Enemy extends ex.Actor {
   private _health: number = Config.defaultEnemyHealth;
   private _alertStatus: AlertStatus = AlertStatus.Calm;
   private _travelVector: ex.Vector;
   private _fovLength: number;

   constructor(x?: number, y?: number, color?: ex.Color, health?: number) {
      super(x, y, Config.defaultEnemyWidth, Config.defaultEnemyHeight, color);
      this._health = health || this._health;
      this._travelVector = new ex.Vector(0, 0);
      this._fovLength = 300;
   }

   public movePatrol(start: ex.Point, end: ex.Point) {
      this.moveTo(end.x, end.y, Config.defaultEnemySpeed).moveTo(start.x, start.y, Config.defaultEnemySpeed).repeatForever();
   }

   public moveCircle() {

   }

   public moveMeander() {

   }

   public attack() {
      // if the ship can still see the kraken (or the kraken is in the ship's attack proximity), attack the kraken
   }

   public assistShip(shipInTrouble: Enemy) {
      this.clearActions();
      this.follow(shipInTrouble, 50);
   }

   public draw(ctx: CanvasRenderingContext2D, delta: number): void {
      super.draw(ctx, delta);

      this.drawFOV(ctx, delta);
   }

   private drawFOV(ctx: CanvasRenderingContext2D, delta: number): void {

      // create radial gradient
      var fovRay = new ex.Ray(this.getCenter(), this._travelVector);
      var fovEndPoint = fovRay.getPoint(this._fovLength);

      var grd = ctx.createRadialGradient(this.getCenter().x, this.getCenter().y, 10, fovEndPoint.x, fovEndPoint.y, this._fovLength / 2);

      grd.addColorStop(0, 'rgba(255, 255, 255, 0.3)');
      grd.addColorStop(1, 'rgba(255, 255, 255, 0)');

      ctx.fillStyle = grd;
      ctx.beginPath();
      // x, y, radius, start, end, [anti-clockwise]
      ctx.arc(this.getCenter().x, this.getCenter().y, this._fovLength, 0, Math.PI * 2);
      ctx.closePath();
      ctx.fill();

   }
}

enum AlertStatus {
   Calm,
   Warn,
   Attack
}