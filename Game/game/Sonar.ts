

class Sonar extends ex.Actor {

   constructor(x: number, y: number, width?: number, height?: number, color?: ex.Color) {
      super(x, y, width, height, color);
      this.x = x - (this.getWidth() / 2);
      this.y = y - (this.getHeight() / 2); 
   }

   public update(engine: ex.Engine, delta: number) {
      super.update(engine, delta);
      this.x = (this.parent.getWidth()/2) -(this.getWidth() / 2);
      this.y = (this.parent.getHeight()/2) -(this.getHeight() / 2); 
   }

   public draw(ctx: CanvasRenderingContext2D, delta: number) {
      //super.draw(ctx, delta);
      ctx.strokeStyle = ex.Color.Red.toString();
      ctx.beginPath();
      ctx.arc(this.x + this.getWidth() / 2, this.y + this.getHeight() / 2, this.getWidth(), 0, 2 * Math.PI);
      ctx.arc(this.x + this.getWidth() / 2, this.y + this.getHeight() / 2, this.getWidth(), 2 * Math.PI, 0, true);
      ctx.closePath();
      ctx.stroke();
   }

   public ping() {
      this.scaleTo(100, 100, 10, 10);
   }
}