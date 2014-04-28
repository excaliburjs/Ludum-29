class Config {

   // Kraken
   static defaultKrakenWidth: number = 150;
   static defaultKrakenHeight: number = 50;
   static defaultKrakenSpeedScale: number = 20;
   static defaultKrakenHealth: number = 100;
   //static defaultKrakenStamina: number = 100;
   //static defaultKrakenSpecial: number = 5;

   // Enemies
   static defaultEnemyWidth: number = 191;
   static defaultEnemyHeight: number = 73;

   static defaultEnemyAlertDistance = 500

   static defaultEnemyHealth: number = 10;
   static defaultEnemySpeed: number = 50;
   static defaultAssistDistance: number = 300;
   static defaultEnemyWaitTime: number = 2000;

   //distance of detection tied to the FOV
   static defaultMaxAttackDistance: number = 250
   static defaultMaxAlertDistance: number = 275;

   //FOV for the spotlight effect
   static defaultEnemyFOV: number = 500;
}