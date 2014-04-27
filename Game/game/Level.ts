/// <reference path="../scripts/Excalibur.d.ts" />

class BaseLevel extends ex.Scene implements ex.ILoadable {
   public data: IMap;
   public maps: {[key: string]: ex.CollisionMap} = {};

   constructor(public jsonPath: string) {
      super();
   }

   public onInitialize(engine: ex.Engine) {

      // create collision map for each tileset in map
      this.data.tilesets.forEach(ts => {
         var cols = Math.floor(ts.imagewidth / ts.tilewidth);
         var rows = Math.floor(ts.imageheight / ts.tileheight);
         var ss = new ex.SpriteSheet(ts.texture, cols, rows, ts.tilewidth, ts.tileheight);

         this.maps[ts.firstgid.toString()] = new ex.CollisionMap(0, 0, ts.tilewidth, ts.tileheight, this.data.height, this.data.width, ss);
      });

      var i, j, gid, layer: ILayer, map: ex.CollisionMap, tileset: ITileset;
      for (i = 0; i < this.data.layers.length; i++) {

         layer = this.data.layers[i];

         // terrain layer?
         if (layer.type === "tilelayer") {
            for (j = 0; j < layer.data.length; j++) {
               gid = layer.data[j];
               if (gid !== 0) {
                  map = this.getCollisionMapForTile(gid);
                  tileset = this.getTilesetForTile(gid);

                  if (map && tileset) {
                     map.data[j].spriteId = gid - tileset.firstgid;
                     map.data[j].solid = this.isTileSolidTerrain(gid, tileset);
                  }
               }
            }
         }

         // object layer
         if (layer.type === "objectgroup") {

            layer.objects.forEach(obj => {

               if (obj.type && this._objectFactories[obj.type]) {

                  this._objectFactories[obj.type](obj);

               }

            });

         }
      }

      //delete this.maps["401"];

      // Add collision maps to scene
      for (var key in this.maps) {
         if (this.maps.hasOwnProperty(key)) {
            this.addCollisionMap(this.maps[key]);
         }
      }
   }

   //TODO overload draw: draw HUD, UI, etc.
   public draw(ctx: CanvasRenderingContext2D, delta: number) {
      super.draw(ctx, delta);
      // draw HUD, UI, etc.
   }

   public load(): ex.Promise<IMap> {
      var complete = new ex.Promise<IMap>();
      var request = new XMLHttpRequest();
      request.open("GET", this.jsonPath, true);
      request.responseType = "json";
      request.onprogress = this.onprogress;
      request.onerror = this.onerror;
      request.onload = (e) => {

         this.data = request.response;

         var promises = [];

         // retrieve images from tilesets and create textures
         this.data.tilesets.forEach(ts => {
            ts.texture = new ex.Texture(ts.image);
            ts.texture.oncomplete = ts.texture.onerror = () => {
               var idx = promises.indexOf(ts.texture);
               promises.splice(idx, 1);

               if (promises.length === 0) {
                  this.oncomplete();
                  complete.resolve(this.data);   
               }
            };
            promises.push(ts.texture);            
         });

         promises.forEach(p => p.load());
      };
      request.send();
      return complete;
   }

   public isLoaded(): boolean {
      return this.data !== undefined;
   }

   public onprogress: (e: any) => void = () => { };

   public oncomplete: () => void = () => { };

   public onerror: (e: any) => void = () => { };

   /**
    * Factories for creating objects from Tiled map data. In Tiled, when you
    * place an object, you can specify it's Type. The type name gets mapped
    * to this hash. If it exists, the function is called with the the IObject
    * interface.
    */
   private _objectFactories: { [key: string]: (obj: IObject) => void } = {

      /**
       * Handle spawning a player
       */
      PlayerSpawn: (obj: IObject) => {

         ex.Logger.getInstance().info("Released the Kraken!", obj.x, obj.y);

         var kraken = new Kraken(obj.x, obj.y);

         // add to level
         this.addChild(kraken);

         // follow the kraken
         game.camera.setActorToFollow(kraken);
      }

   }

   private getCollisionMapForTile(gid: number): ex.CollisionMap {
      
      // Need to reverse search the maps hash
      var gids: number[] = [];

      for (var key in this.maps) {
         if (this.maps.hasOwnProperty(key)) {
            gids.push(parseInt(key, 10));
         }
      }

      for (var i = gids.length - 1; i >= 0; i--) {
         if (gids[i] <= gid) {
            return this.maps[gids[i]];
         }
      }

      return null;
   }

   private getTilesetForTile(gid: number): ITileset {
      for (var i = this.data.tilesets.length - 1; i >= 0; i--) {
         var ts = this.data.tilesets[i];

         if (ts.firstgid <= gid) {
            return ts;
         }
      }

      return null;
   }   

   private isTileSolidTerrain(gid: number, tileset: ITileset): boolean {

      if (gid === 0 || !tileset.terrains) return false;

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

   
}

//#region Tiled Interfaces

interface IMap {
   
   height: number;
   width: number;
   tileheight: number;
   tilewidth: number;
   orientation: string;

   layers: ILayer[];
   tilesets: ITileset[];

   properties: {};
   version: number;

}

interface ILayer {
   data: number[];
   height: number;
   name: string;
   opacity: number;
   type: string;
   visible: boolean;
   width: number;
   x: number;
   y: number;

   draworder: string;
   objects: IObject[];
}

interface ITileset {
   
   firstgid: number;
   image: string;
   imageheight: number;
   imagewidth: number;
   margin: number;
   name: string;
   properties: { [key: string]: string };
   spacing: number;
   tileheight: number;
   tilewidth: number;

   // Terrain
   terrains: ITerrain[];
   tiles: { [key: string]: ITerrainTile };

   // For this game
   texture: ex.Texture;
}

interface IObject {
   
   height: number;
   width: number;
   x: number;
   y: number;
   rotation: number;
   name: string;
   properties: { [key: string]: string };
   type: string;
   visible: boolean;

}

interface ITerrain {
   
   name: string;
   properties: { [key: string]: string };

}

interface ITerrainTile {
   
   terrain: number[];

}

//#endregion