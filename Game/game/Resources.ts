/**
 * Only put ILoadables into this resource hash
 */
var Resources = {

   // Levels
   Level0: new BaseLevel("/maps/Level-0.json"),

   // Textures
   SplashTexture: new ex.Texture("/images/splash.jpg"),
   DeathTexture: new ex.Texture("/images/death.jpg"),
   KrakenTexture: new ex.Texture("/images/kraken/KrakenSpriteSheet.png"),

   // Enemies
   Ship1Texture: new ex.Texture("/images/ship-1.png"),

   BulletTexture: new ex.Texture("/images/bullet.png"),

   AlertTexture: new ex.Texture("/images/alert.png"),

   // Tilesets
   TerrainTexture: new ex.Texture("/images/tilesets/terrain.png"),

   // Kraken
   SoundSwim: new ex.Sound("/sounds/swim.wav"),
   SoundHurt: new ex.Sound("/sounds/hurt.wav"),
   SoundWaves: new ex.Sound("/sounds/waves.wav"),
   SoundDeath: new ex.Sound("/sounds/death.wav"),

   // HUD
   Heart: new ex.Texture("/images/heart.png")
};

var Palette = {

   // Night time
   ColorNightTime: new ex.Color(51, 27, 96),

   // Kraken
   ColorKrakenBlend: new ex.Color(80, 48, 140),
   ColorKrakenGlowStart: new ex.Color(65, 102, 197, 0.5),
   ColorKrakenGlowEnd: new ex.Color(14, 26, 55, 0)
};