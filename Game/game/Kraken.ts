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
        this.setCenterDrawing(true);
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
        });

        game.on('mousemove', (ev: ex.MouseMove) => {
            if (this._isMousePressed) {
                var target = new ex.Vector(ev.x, ev.y);
                var travelVector = target.minus(this.getCenter());
                travelVector.normalize().scale(20);
                this._travelVector = travelVector;
                this.move(travelVector.x, travelVector.y);
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