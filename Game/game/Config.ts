class Config {

   // Kraken
   static defaultKrakenMoveRadius: number = 300;
   static defaultKrakenWidth: number = 50;
   static defaultKrakenHeight: number = 50;
   static defaultKrakenSpeedScale: number = 10;
   static defaultKrakenMaxSpeed: number = 200;
   static defaultKrakenIdleThreshold: number = 10;
   static defaultKrakenAnimationChangeThreshold: number = 400; // todo hack to get around collision dx/dy and fast animation changes
   static defaultKrakenHealth: number = 100;
   //static defaultKrakenStamina: number = 100;
   static defaultKrakenSpecial: number = 5;
   //static defaultKrakenStamina: number = 100;
   //static defaultKrakenSpecial: number = 5;
   static krakenDps: number = 1;
   static krakenAttackTime: number = 300;
   static krakenAttackRange: number = 150;
   static krakenInertiaDampen: number = 1;

   // Enemies
   static defaultEnemyWidth: number = 191;
   static defaultEnemyHeight: number = 73;
   static defaultEnemyBulletWait: number = 2000; // in ms
   static defaultEnemyBulletSpeed: number = 150;
   static defaultEnemyAlertDistance = 500;
   static defaultEnemyBulletLife = 20000; // in ms

   static defaultEnemyHealth: number = 10;
   static defaultEnemySpeed: number = 50;
   static defaultAssistDistance: number = 300;
   static defaultEnemyWaitTime: number = 2000;
   static enemyRotationSpeed: number = Math.PI / 2;
   static enemyDps: number = 10;
   static enemyGunOffset: number = 80;
   static enemyAlertOffsetX: number = 0;
   static enemyAlertOffsetY: number = -20;



   static defaultEnemyMaxFiringDistance: number = 400;

   //distance of detection tied to the FOV
   static defaultMaxAttackDistance: number = 250
   static defaultMaxAlertDistance: number = 275;

   //FOV for the spotlight effect
   static defaultEnemyFOV: number = 500;


   // Sonar
   static defaultSonarPingScale: number = 4000;
   static defaultSonarPingSpeed: number = 600;
}