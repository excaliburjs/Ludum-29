/// <reference path="Config.ts" />
/// <reference path="Enemy.ts" />

class Kraken extends ex.Actor {
    private _health: number = Config.defaultKrakenHealth;
    private _travelVector: ex.Vector = new ex.Vector(0,0);
    private _isMousePressed = false;

    constructor(x?: number, y?: number, color?: ex.Color, health?: number) {
        super(x, y, Config.defaultKrakenWidth, Config.defaultKrakenHeight, color);
        this._health = health || this._health;

       var krakenSheet = new ex.SpriteSheet(Resources.KrakenTexture, 4, 3, 120, 60);

       krakenSheet.sprites.forEach(s => s.addEffect(new Fx.Multiply(Palette.ColorKrakenBlend)));

        var anim = krakenSheet.getAnimationByIndices(game, [0, 1, 2], 200);
        anim.loop = true;
        anim.setScaleX(1.5);
        anim.setScaleY(1.5);
        this.setCenterDrawing(true);
        var centerVector = this.getCenter();
        //anim.transformAboutPoint(new ex.Point(centerVector.x, centerVector.y));


        this.addDrawing("default", anim);

    }

    public onInitialize(game: ex.Engine) {


        game.on('mousedown', (ev: ex.MouseDown) => {
            console.log("(" + ev.x + ", " + ev.y + ")");
            this._isMousePressed = true;
            var target = new ex.Vector(ev.x, ev.y);
            var travelVector = target.minus(this.getCenter());
            travelVector.normalize().scale(20);
            this._travelVector = travelVector;
            this.move(travelVector.x, travelVector.y);

            travelVector.normalize();
            var rotationAngle = Math.atan2(travelVector.y, travelVector.x);
            var difference = Math.abs(rotationAngle - this.rotation) > 0.1;
           this.rotation = rotationAngle;

           Resources.SoundSwim.play();
        });

        game.on('mousemove', (ev: ex.MouseMove) => {
            if (this._isMousePressed) {
                var target = new ex.Vector(ev.x, ev.y);
                var travelVector = target.minus(this.getCenter());
                travelVector.normalize().scale(20);
                this._travelVector = travelVector;
                this.move(travelVector.x, travelVector.y);

                travelVector.normalize();
                var rotationAngle = Math.atan2(travelVector.y, travelVector.x);
                this.rotation = rotationAngle;
            }
        });

        game.on('mouseup', (ev: ex.MouseUp) => {
            //TODO rapidly decellerate rather than immediate stop?
            this._isMousePressed = false;
            this.dx -= this._travelVector.x;
            this.dy -= this._travelVector.y;
        });
    }

    public move(x: number, y: number) {
        this.dx = x;
        this.dy = y;
    }

    public attack() {

    }

    public getLines() {
        var lines = new Array<ex.Line>();

        var beginPoint1 = new ex.Point(this.x, this.y);
        var endPoint1 = new ex.Point(this.x + this.getWidth(), this.y);
        var newLine1 = new ex.Line(beginPoint1, endPoint1);

        // beginPoint2 is endPoint1
        var endPoint2 = new ex.Point(endPoint1.x, endPoint1.y + this.getHeight());
        var newLine2 = new ex.Line(endPoint1, endPoint2);

        // beginPoint3 is endPoint2
        var endPoint3 = new ex.Point(this.x, this.y + this.getHeight());
        var newLine3 = new ex.Line(endPoint2, endPoint3);

        // beginPoint4 is endPoint3
        // endPoint4 is beginPoint1
        var newLine4 = new ex.Line(endPoint3, beginPoint1);

        //console.log("line1: (" + Math.round(newLine1.begin.x) + ", " + Math.round(newLine1.begin.y) + ") to (" + Math.round(newLine1.end.x) + ", " + Math.round(newLine1.end.y) + ")");
        //console.log("line2: (" + Math.round(newLine2.begin.x) + ", " + Math.round(newLine2.begin.y) + ") to (" + Math.round(newLine2.end.x) + ", " + Math.round(newLine2.end.y) + ")");
        //console.log("line3: (" + Math.round(newLine3.begin.x) + ", " + Math.round(newLine3.begin.y) + ") to (" + Math.round(newLine3.end.x) + ", " + Math.round(newLine3.end.y) + ")");
        //console.log("line4: (" + Math.round(newLine4.begin.x) + ", " + Math.round(newLine4.begin.y) + ") to (" + Math.round(newLine4.end.x) + ", " + Math.round(newLine4.end.y) + ")");

        lines.push(newLine1);
        lines.push(newLine2);
        lines.push(newLine3);
        lines.push(newLine4);
        return lines;

    }

   public draw(ctx: CanvasRenderingContext2D, delta: number): void {

      this.drawGlow(ctx, delta);

      super.draw(ctx, delta);
   }

   private drawGlow(ctx: CanvasRenderingContext2D, delta: number): void {
      // create radial gradient
      var grd = ctx.createRadialGradient(this.getCenter().x, this.getCenter().y, 10, this.getCenter().x, this.getCenter().y, 150);

      grd.addColorStop(0, Palette.ColorKrakenGlowStart.toString());
      grd.addColorStop(1, Palette.ColorKrakenGlowEnd.toString());

      ctx.fillStyle = grd;
      ctx.beginPath();
      // x, y, radius, start, end, [anti-clockwise]
      ctx.arc(this.getCenter().x, this.getCenter().y, 150, 0, Math.PI * 2);
      ctx.closePath();
      ctx.fill();
   }
}