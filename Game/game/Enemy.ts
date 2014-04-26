 
 class Enemy extends ex.Actor {
     private _health: number = Config.defaultEnemyHealth;
     private _alertStatus: alertStatus = alertStatus.Calm;

     constructor(x? : number, y? : number, color? : ex.Color, health? : number) {
         super(x, y, Config.defaultEnemyWidth, Config.defaultEnemyHeight, color);
         this._health = health || this._health;
     }

     public patrol() {

     }

     public attack() {

     }

     public assistShip(shipInTrouble: Enemy) {
         this.clearActions();
         this.follow(shipInTrouble);
     }
 }

export enum alertStatus {
    Calm, 
    Warn,
    Attack
}