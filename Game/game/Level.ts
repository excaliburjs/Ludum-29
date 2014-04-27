/// <reference path="../scripts/Excalibur.d.ts" />

class BaseLevel extends ex.Scene implements ex.ILoadable {
   public data: IMap;
   public map: ex.TileMap;

   constructor(public jsonPath: string) {
      super();
   }

   public onInitialize(engine: ex.Engine) {

      this.map = new ex.TileMap(0, 0, this.data.tilewidth, this.data.tileheight, this.data.height, this.data.width);

      // create collision map for each tileset in map
      this.data.tilesets.forEach(ts => {
         var cols = Math.floor(ts.imagewidth / ts.tilewidth);
         var rows = Math.floor(ts.imageheight / ts.tileheight);
         var ss = new ex.SpriteSheet(ts.texture, cols, rows, ts.tilewidth, ts.tileheight);

         // nighty night!
         ss.sprites.forEach(s => s.addEffect(new Fx.Multiply(Palette.ColorNightTime)));

         this.map.registerSpriteSheet(ts.firstgid.toString(), ss);
      });

      var i, j, gid, layer: ILayer, tileset: ITileset;
      for (i = 0; i < this.data.layers.length; i++) {

         layer = this.data.layers[i];

         // terrain layer?
         if (layer.type === "tilelayer") {
            for (j = 0; j < layer.data.length; j++) {
               gid = layer.data[j];
               if (gid !== 0) {
                  tileset = this.getTilesetForTile(gid);

                  if (tileset) {
                     this.map.data[j].sprites.push(new ex.TileSprite(tileset.firstgid.toString(), gid - tileset.firstgid));
                     this.map.data[j].solid = this.map.data[j].solid || this.isTileSolid(gid, layer, tileset);
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

      // Add collision maps to scene
      this.addTileMap(this.map);
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

   private getTilesetForTile(gid: number): ITileset {
      for (var i = this.data.tilesets.length - 1; i >= 0; i--) {
         var ts = this.data.tilesets[i];

         if (ts.firstgid <= gid) {
            return ts;
         }
      }

      return null;
   }   

   private isTileSolid(gid: number, layer: ILayer, tileset: ITileset): boolean {

      if (gid === 0) return false;

      var solidTerrains = [], i, terrain;

      if (tileset.terrains) {
         // loop through terrains         
         for (i = 0; i < tileset.terrains.length; i++) {

            // check for solid terrains
            terrain = tileset.terrains[i];
            if (terrain.properties && terrain.properties.solid === "false") {
               continue;
            }

            solidTerrains.push(i);
         }
      }

      // todo individual tile overrides layer

      // layers > terrain
      if (layer.properties && layer.properties["solid"] === "true") {
         return true;
      }

      // loop through tiles
      if (tileset.tiles) {
         var tile = tileset.tiles[(gid - 1).toString()];

         if (tile && tile.terrain) {
            for (i = 0; i < tile.terrain.length; i++) {

               // for each corner of terrain, it is not solid if all corners are not solid
               if (solidTerrains.indexOf(tile.terrain[i]) > -1) {
                  return true;
               }
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

   properties: { [key: string]: string };

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