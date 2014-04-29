/**
 * Only put ILoadables into this resource hash
 */
var Resources = {

   // Soundtrack
   SoundTrack: new ex.Sound("/sounds/KrakenMusic.mp3", "/sounds/KrakenMusic.wav"),

   // Levels
   Level0: new BaseLevel("/maps/Level-0.json"),

   // Textures
   SplashTexture: new ex.Texture("/images/splash.jpg"),
   DeathTexture: new ex.Texture("/images/death.jpg"),
   VictoryTexture: new ex.Texture("/images/victory.jpg"),
   KrakenTexture: new ex.Texture("/images/kraken/KrakenSpriteSheet.png"),
   StartButtonTexture: new ex.Texture("/images/start.png"),

   // Enemies
   Ship1Texture: new ex.Texture("/images/ship-1.png"),

   BulletTexture: new ex.Texture("/images/bullet.png"),

   AlertTexture: new ex.Texture("/images/alert.png"),

   BulletSound: new ex.Sound("/sounds/shoot.mp3", "/sounds/shoot.wav"),
   SinkSound: new ex.Sound("/sounds/shipsink.mp3", "/sounds/shipsink.wav"),

   // Tilesets
   TerrainTexture: new ex.Texture("/images/tilesets/terrain.png"),

   // Kraken
   SoundSwim: new ex.Sound("/sounds/swim.mp3", "/sounds/swim.wav"),
   SoundHurt: new ex.Sound("/sounds/hurt.mp3", "/sounds/hurt.wav"),
   SoundWaves: new ex.Sound("/sounds/waves.mp3", "/sounds/waves.wav"),
   SoundDeath: new ex.Sound("/sounds/death.mp3", "/sounds/death.wav"),
   HitSound: new ex.Sound("/sounds/hit.mp3", "/sounds/hit.wav"),

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