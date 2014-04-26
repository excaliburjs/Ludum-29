 
 class Enemy extends ex.Actor {
     private _health: number = Config.defaultEnemyHealth;
     private _alertStatus: alertStatus = alertStatus.Calm;

     constructor(x? : number, y? : number, color? : ex.Color, health? : number) {
         super(x, y, Config.defaultEnemyWidth, Config.defaultEnemyHeight, color);
         this._health = health || this._health;
     }

     public movePatrol(start: ex.Point, end: ex.Point) {
        this.moveTo(end.x, end.y, Config.defaultEnemySpeed).moveTo(start.x, start.y, Config.defaultEnemySpeed).repeatForever;
     }

     public moveCircle() {
        
     }

     public moveMeander() {

     }

     public attack() {
        // if the ship can still see the kraken (or the kraken is in the ship's attack proximity), attack the kraken
     }

     public assistShip(shipInTrouble: Enemy) {
         this.clearActions();
         this.follow(shipInTrouble, 50);
     }
 }

export enum alertStatus {
    Calm, 
    Warn,
    Attack
 }