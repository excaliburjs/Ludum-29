/**
 * Only put ILoadables into this resource hash
 */
var Resources = {

   // Levels
   Level0: new BaseLevel("/maps/Level-0.json"),

   // Textures
   SplashTexture: new ex.Texture("/images/splash.jpg"),
   KrakenTexture: new ex.Texture("/images/kraken/KrakenSpriteSheet.png"),

   // Tilesets
   TerrainTexture: new ex.Texture("/images/tilesets/terrain.png")
};

var Palette = {

   // Night time
   ColorNightTime: new ex.Color(18, 31, 98)
};