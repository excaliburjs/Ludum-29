/// <reference path="../scripts/Excalibur.d.ts" />

class BaseLevel extends ex.Scene implements ex.ILoadable {
   private _isLoaded: boolean = false;
   public data: any;
   public collisionMap: ex.CollisionMap;

   constructor(public jsonPath: string) {
      super();
   }

   public onInitialize(engine: ex.Engine) {

      var terrainTileSet: any;
      var playerSpawn: ex.Point;

      // find terrain tileset
      this.data.tilesets.forEach(tileset => {

         if (tileset.name === "Terrain") {
            terrainTileSet = tileset;
         }

      });

      // No terrain? Bad map.
      if (!terrainTileSet) { return; }

      var columns = terrainTileSet.imagewidth / terrainTileSet.tilewidth;
      var rows = terrainTileSet.imageheight / terrainTileSet.tileheight;

      var terrainSheet = new ex.SpriteSheet(Config.terrainTexture, columns, rows, terrainTileSet.tilewidth, terrainTileSet.tileheight);

      // build the collision map
      this.collisionMap = new ex.CollisionMap(0, 0, this.data.tilewidth, this.data.tileheight, this.data.width, this.data.height, terrainSheet);

      var i, j, gid, layer;
      for (i = 0; i < this.data.layers.length; i++) {

         layer = this.data.layers[i];

         // terrain layer?
         if (layer.name === "Terrain") {
            for (j = 0; j < layer.data.length; j++) {
               gid = layer.data[j];
               if (gid !== 0) {
                  this.collisionMap.data[j].spriteId = gid - 1;
                  this.collisionMap.data[j].solid = this.isTileSolidTerrain(gid, terrainTileSet);
               }
            }
         }

         // object layer
         if (layer.type === "objectgroup") {

            layer.objects.forEach(obj => {

               if (obj.type === "PlayerSpawn") {
                  playerSpawn = new ex.Point(obj.x, obj.y);
               }

            });

         }
      }

      this.addCollisionMap(this.collisionMap);

      // place player at spawn point
      if (playerSpawn) {
         ex.Logger.getInstance().info("Player spawns at", playerSpawn);
      }
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