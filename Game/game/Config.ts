class Config {

   // Death
   static deathTimer: number = 5000;

   // Kraken
   static defaultKrakenMoveRadius: number = 150;
   static defaultKrakenWidth: number = 50;
   static defaultKrakenHeight: number = 50;
   static defaultKrakenSpeedScale: number = 2.1;
   static defaultKrakenMaxSpeed: number = 300;
   static defaultKrakenIdleThreshold: number = 20;
   static defaultKrakenAnimationChangeThreshold: number = 400; // todo hack to get around collision dx/dy and fast animation changes
   static defaultKrakenHealth: number = 100;
   //static defaultKrakenStamina: number = 100;
   static defaultKrakenSpecial: number = 5;
   //static defaultKrakenStamina: number = 100;
   //static defaultKrakenSpecial: number = 5;
   static krakenDps: number = 1.2;
   static krakenAttackTime: number = 300;
   static krakenAttackRange: number = 150;
   static krakenInertiaDampen: number = 1;
   static krakenHealthRegen: number = 10;

   // Enemies
   static defaultEnemyWidth: number = 73;
   static defaultEnemyHeight: number = 73;
   static defaultEnemyBulletMinWait: number = 500; // in ms
   static defaultEnemyBulletMaxWait: number = 2500; // in ms
   static defaultEnemyBulletSpeed: number = 300;
   static defaultEnemyAlertDistance = 550;
   static defaultEnemyBulletLife = 20000; // in ms

   static defaultEnemyHealth: number = 10;
   static defaultEnemySpeed: number = 100;
   static defaultAssistDistance: number = 300;
   static defaultEnemyWaitTime: number = 2000;
   static enemyRotationSpeed: number = Math.PI / 1.5;
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