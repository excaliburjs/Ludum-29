/// <reference path="../scripts/Excalibur.d.ts" />

class BaseLevel extends ex.Scene implements ex.ILoadable {
    private _isLoaded: boolean = false;
    public data: any;
    public collisionMap: ex.CollisionMap;

    constructor(public jsonPath: string) {
        super();
    }

    public onInitialize(engine: ex.Engine) {

        var tileset = this.data.tilesets[0]

        var columns = tileset.imagewidth / tileset.tilewidth;
        var rows = tileset.imageheight / tileset.tileheight;

        var spriteSheet = new ex.SpriteSheet(Config.terrainTexture, columns, rows, tileset.tilewidth, tileset.tileheight);

        // build the collision map
        this.collisionMap = new ex.CollisionMap(0, 0, this.data.tilewidth, this.data.tileheight, this.data.width, this.data.height, spriteSheet);
        for (var i = 0; i < this.data.layers.length; i++) {
            for (var j = 0; j < this.data.layers[i].data.length; j++) {
                var currentData = this.data.layers[i].data[j];
                if (currentData !== 0) {
                    this.collisionMap.data[j].spriteId = currentData-1;
                    this.collisionMap.data[j].solid = false;
                }
            }
        }

        this.addCollisionMap(this.collisionMap);
    }

    //TODO overload draw: draw HUD, UI, etc.
    public draw(ctx: CanvasRenderingContext2D, delta: number) {
        super.draw(ctx, delta);
        // draw HUD, UI, etc.
    }

    public load(): ex.Promise<any> {
        var complete = new ex.Promise<any>();
        var request = new XMLHttpRequest();
        request.open("GET", this.jsonPath, true);
        request.responseType = "json";
        request.onprogress = this.onprogress;
        request.onerror = this.onerror;
        request.onload = (e) => {
            complete.resolve(request.response);
            this.data = request.response;
            this.oncomplete();
        };
         request.send();
         return complete;
     }

     public isLoaded(): boolean {
         return this._isLoaded;
     }

     public onprogress: (e: any) => void = () => { };

     public oncomplete: () => void = () => { };

     public onerror: (e: any) => void = () => { };
 }