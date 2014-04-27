
class Enemy extends ex.Actor {
   private _health: number = Config.defaultEnemyHealth;
   private _alertStatus: AlertStatus = AlertStatus.Calm;
   public rays: ex.Ray[] = new Array<ex.Ray>();
   private _rayVectors: ex.Vector[] = new Array<ex.Vector>();
   private _fovLength: number;
   private _travelVector: ex.Vector;

   constructor(x?: number, y?: number, width?: number, height?: number, color?: ex.Color, health?: number) {
      super(x, y, Config.defaultEnemyWidth, Config.defaultEnemyHeight, color);
      this.setWidth(width || Config.defaultEnemyWidth);
      this.setHeight(height || Config.defaultEnemyHeight);
      this._health = health || this._health;
      this._travelVector = new ex.Vector(0, 0);
      this._fovLength = 300;
   }

   public onInitialize(game: ex.Engine) {

      var yValues = new Array<number>(-0.5, -0.25, 0, 0.25, 0.5);


      for (var i = 0; i < 5; i++) {
         //var rayPoint = new ex.Point(0, this.getHeight() / 2);
         var rayPoint = new ex.Point(this.x, this.y);
         var rayVector = new ex.Vector(-1, yValues[i]);
         var ray = new ex.Ray(rayPoint, rayVector);
         this.rays.push(ray);
      }

      this.on('DistressEvent', (ev: DistressEvent) => {
         //if (this.within(ev.enemy, Config.defaultAssistDistance)) {

         //}
         this._alertStatus = AlertStatus.Warn;
         this.assistShip(ev.enemy);
      });

      this.on('update', (ev: ex.UpdateEvent) => {

         if (this.canSeeKraken()) {
            this.color = ex.Color.Red;
         } else {
            this.color = ex.Color.Black;
         }

         //    if (this._alertStatus = alertStatus.Warn) {
         //        this.triggerEvent('DistressEvent', new DistressEvent(this));
         //    }
      });
   }

   private canSeeKraken() {
      var krakenLines = testKraken.getLines();
      for (var i = 0; i < this.rays.length; i++) {
         for (var j = 0; j < krakenLines.length; j++) {
            var pixelsOut = this.rays[i].intersect(krakenLines[j]);
            if (pixelsOut >= 0) {
               console.log("pixels: ", this.rays[i].getPoint(pixelsOut));
               return true;
               //this.color = ex.Color.Red;
               //console.log("saw the test kraken");
            } //else {
            //this.color = ex.Color.Black;
            //}
         }
      }
      return false;
   }

   public draw(ctx: CanvasRenderingContext2D, delta: number) {
      super.draw(ctx, delta);
      //Debugging draw for LOS rays on the enemy
      //TODO remove save and restore
      //ctx.save();
      //ctx.translate(this.x, this.y);
      for (var i = 0; i < this.rays.length; i++) {
         ctx.beginPath();
         ctx.moveTo(this.rays[i].pos.x, this.rays[i].pos.y);
         var end = this.rays[i].getPoint(1000);
         ctx.lineTo(end.x, end.y);
         ctx.strokeStyle = ex.Color.Chartreuse.toString();
         ctx.stroke();
         ctx.closePath();
      }
      //ctx.restore();

      this.drawFOV(ctx, delta);
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