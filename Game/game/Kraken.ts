/// <reference path="Config.ts" />
/// <reference path="Enemy.ts" />

enum KrakenMode {
    Idle,
    Attack,
    Swim
}

class Kraken extends ex.Actor {
    private _health: number = Config.defaultKrakenHealth;
    private _travelVector: ex.Vector = new ex.Vector(0,0);
    private _isMousePressed = false;
    private _currentMode: KrakenMode = KrakenMode.Idle;
    private _lastTarge: Enemy;

    constructor(x?: number, y?: number, color?: ex.Color, health?: number) {
        super(x, y, Config.defaultKrakenWidth, Config.defaultKrakenHeight, color);
        this._health = health || this._health;

       var krakenSheet = new ex.SpriteSheet(Resources.KrakenTexture, 4, 3, 120, 60);

       krakenSheet.sprites.forEach(s => s.addEffect(new Fx.Multiply(Palette.ColorKrakenBlend)));

        var swimAnim = krakenSheet.getAnimationByIndices(game, [0, 1, 2, 3], 200);
        swimAnim.loop = true;
        swimAnim.setScaleX(1.5);
        swimAnim.setScaleY(1.5);
        this.setCenterDrawing(true);

        var attackAnim = krakenSheet.getAnimationByIndices(game, [4, 5, 6], 200);
        attackAnim.loop = true;
        attackAnim.setScaleX(1.5);
        attackAnim.setScaleY(1.5);
        this.setCenterDrawing(true);

        var idleAnim = krakenSheet.getAnimationByIndices(game, [8, 7, 9, 7], 200);
        idleAnim.loop = true;
        idleAnim.setScaleX(1.5);
        idleAnim.setScaleY(1.5);
        this.setCenterDrawing(true);

        this.addDrawing('idle', idleAnim);
        this.addDrawing('attack', attackAnim);
        this.addDrawing('swim', swimAnim);
        this.setDrawing('idle');

    }

    public moveKraken(x: number, y: number): void {
        this._isMousePressed = true;
        var target = new ex.Vector(x, y);
        var travelVector = target.minus(this.getCenter());
        travelVector.normalize().scale(Config.defaultKrakenSpeedScale);
        this._travelVector = travelVector;
        this.move(travelVector.x, travelVector.y);

        travelVector.normalize();
        var rotationAngle = Math.atan2(travelVector.y, travelVector.x);
        this.rotation = rotationAngle;
    }

    public checkForShipClick(x: number, y: number) {

        var clickVector = new ex.Vector(x, y);
        var ships: Enemy[] = (<any>game.currentScene).enemies;
        var target: Enemy = ships.sort((a, b) => {
            return a.getCenter().distance(this.getCenter()) - b.getCenter().distance(this.getCenter());
        })[0];


        // Attack the ship if in range
        if (target && target.getCenter().distance(this.getCenter()) <= Config.krakenAttackRange && clickVector.distance(target.getCenter()) <= Config.krakenAttackRange) {
            this.attack(target);
        } else {
            this.returnToSwim();
        }
        
    }

    public onInitialize(game: ex.Engine) {
        
        game.on('mousedown', (ev: ex.MouseDown) => {
           this.moveKraken(ev.x, ev.y);
           this.checkForShipClick(ev.x, ev.y);

           Resources.SoundSwim.play();
            if (this._currentMode !== KrakenMode.Attack) {
                this.setDrawing('swim');    
            }
            
        });

        game.on('mousemove', (ev: ex.MouseMove) => {
            if (this._isMousePressed) {
                this.moveKraken(ev.x, ev.y);
                if (this._currentMode !== KrakenMode.Attack) {
                    this.setDrawing('swim');
                }
            }

        });

        game.on('mouseup', (ev: ex.MouseUp) => {
            //TODO rapidly decellerate rather than immediate stop?
            this._isMousePressed = false;
            //this.dx -= this._travelVector.x;
            //this.dy -= this._travelVector.y;
            //this.returnToIdle();
        });

        game.on('keydown', (ev: ex.KeyDown) => {
            if (ev.key === ex.InputKey.A) {
                if (this._currentMode !== KrakenMode.Attack) {
                    this.attack();
                } else {
                    this.returnToSwim();
                }
            }
        });

        this.on('collision', (ev: ex.CollisionEvent) => {
            if (!ev.other) {
                this.dx = 0;
                this.dy = 0;
            }
        });

    }


    public update(engine: ex.Engine, delta: number) {
        super.update(engine, delta);

        var dampeningVector = this._travelVector.normalize().scale(Config.krakenInertiaDampen).scale(-1);

        if (this.dx < 2 && this.dx > -2) {
            this.dx = 0;
        }

        if (this.dy < 2 && this.dy > -2) {
            this.dy = 0;
        }

        if (this.dx === 0 && this.dy === 0 && this._currentMode !== KrakenMode.Attack) {
            this.setDrawing('idle');
            this._currentMode = KrakenMode.Idle;
        }

        if (this.dx > dampeningVector.x && this.dx !== 0) {
            this.dx += dampeningVector.x;
        }

        if (this.dx < dampeningVector.x && this.dx !== 0) {
            this.dx += dampeningVector.x;
        }

        if (this.dy > dampeningVector.y && this.dy !== 0) {
            this.dy += dampeningVector.y;
        }

        if (this.dy < dampeningVector.y && this.dy !== 0) {
            this.dy += dampeningVector.y;
        }

       
    }

    public returnToSwim() {
        if (this._currentMode === KrakenMode.Attack) {
            var oldRotation = this.rotation;
            this.clearActions();
            this.rotateBy(this.rotation + Math.PI, 200).callMethod(() => {
                this.setDrawing('swim');
                this.rotation = oldRotation;
                this._currentMode = KrakenMode.Swim;
            });
        } else {
            this.setDrawing('swim');
            this._currentMode = KrakenMode.Swim;
        }
    }

    public move(x: number, y: number) {
        this.dx = x;
        this.dy = y;
    }

    public attack(enemy?: Enemy) {
        if (this._currentMode !== KrakenMode.Attack) {
            console.log("Spinning", this._currentMode);
            this._currentMode = KrakenMode.Attack;
            var oldRotation = this.rotation;
            this.rotateBy(this.rotation + Math.PI, 200).callMethod(() => {
                this.setDrawing('attack');
                this.rotation = oldRotation;
            });
        }

        //todo do damage here
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