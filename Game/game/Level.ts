/// <reference path="../scripts/Excalibur.d.ts" />

class BaseLevel extends ex.Scene implements ex.ILoadable {
   private _isLoaded: boolean = false;
   public data: any;
   public collisionMap: ex.CollisionMap;

   constructor(public jsonPath: string) {
      super();
   }

   public onInitialize(engine: ex.Engine) {

      var tileset = this.data.tilesets[0];

      var columns = tileset.imagewidth / tileset.tilewidth;
      var rows = tileset.imageheight / tileset.tileheight;

      var spriteSheet = new ex.SpriteSheet(Config.terrainTexture, columns, rows, tileset.tilewidth, tileset.tileheight);

      // build the collision map
      this.collisionMap = new ex.CollisionMap(0, 0, this.data.tilewidth, this.data.tileheight, this.data.width, this.data.height, spriteSheet);
      for (var i = 0; i < this.data.layers.length; i++) {
         for (var j = 0; j < this.data.layers[i].data.length; j++) {
            var gid = this.data.layers[i].data[j];
            if (gid !== 0) {
               this.collisionMap.data[j].spriteId = gid - 1;
               this.collisionMap.data[j].solid = this.isTileSolidTerrain(gid, tileset);
            }
         }
      }

      this.addCollisionMap(this.collisionMap);
   }

   private isTileSolidTerrain(gid: number, tileset: any): boolean {

      if (gid === 0) return false;

      // loop through terrains
      var solidTerrains = [], i, terrain;
      for (i = 0; i < tileset.terrains.length; i++) {
         
         // check for solid terrains
         terrain = tileset.terrains[i];
         if (terrain.properties && terrain.properties.solid === "false") {
            continue;
         }

         solidTerrains.push(i);
      }

      // loop through tiles
      var tile = tileset.tiles[(gid - 1).toString()];

      if (tile && tile.terrain) {
         for (i = 0; i < tile.terrain.length; i++) {
            // for each corner of terrain, it is not solid if all corners are not solid
            if (solidTerrains.indexOf(tile.terrain[i]) > -1) {
               return true;
            }
         }
      }

      return false;
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