

class Stats {
   public numBoatsDestroyed: number = 0;
   public numBoatsAlerted: number = 0;
   public damageTaken: number = 0;
   public damageDealt: number = 0;
   public healthGained: number = 0;
   public timeToFinishLevel = 0;


   // original stats for the level
   public numBoats: number = 0;
   public krakenHealth: number = Config.defaultKrakenHealth;

   constructor() {}

}