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
        var anim = krakenSheet.getAnimationByIndices(game, [0, 1, 2], 200);
        anim.loop = true;
        anim.setScaleX(2);
        anim.setScaleY(2);

        var centerVector = this.getCenter();
        //anim.transformAboutPoint(new ex.Point(centerVector.x, centerVector.y));
        this.setCenterDrawing(true);

        this.addDrawing("default", anim);

    }

    public onInitialize(game: ex.Engine) {


        game.on('mousedown', (ev: ex.MouseDown) => {
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



}