/// <reference path="Config.ts" />

class Kraken extends ex.Actor {
    private _health: number = Config.defaultKrakenHealth;

    constructor(x?: number, y?: number, color?: ex.Color, health?: number) {
        super(x, y, Config.defaultKrakenWidth, Config.defaultKrakenHeight, color);
        this._health = health || this._health;

        var krakenTexture = new ex.Texture("images/kraken/KrakenSpriteSheet.png");
        loader.addResource(krakenTexture);

        var krakenSheet = new ex.SpriteSheet(krakenTexture, 4, 3, 120, 60);
        var anim = krakenSheet.getAnimationByIndices(game, [0, 1, 2], 200);
        anim.loop = true;
        anim.setScaleX(2);
        anim.setScaleY(2);

        this.addDrawing("default", anim);

        this.on("right", function () {
            this.dx = 100;
        });

        this.on("left", function () {
            this.dx = -100;
        });

        this.on("keyup", function () {
            this.dx = 0;
        });
    }


}