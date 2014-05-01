/// <reference path="Config.ts" />
/// <reference path="Enemy.ts" />

enum KrakenMode {
   Idle,
   Attack,
   Swim
}

class Kraken extends ex.Actor {
   public health: number = Config.defaultKrakenHealth;
   private _travelVector: ex.Vector = new ex.Vector(0, 0);
   private _currentMode: KrakenMode = KrakenMode.Idle;
   private _lastTarget: Enemy;
   private _lastAttackTime: number = Date.now();
   private _canAttack: boolean;
   private _spinning: boolean = false;

   constructor(x?: number, y?: number, color?: ex.Color, health?: number) {
      super(x, y, Config.defaultKrakenWidth, Config.defaultKrakenHeight, color);
      this.health = health || this.health;

      var krakenSheet = new ex.SpriteSheet(Resources.KrakenTexture, 4, 3, 120, 60);

      krakenSheet.sprites.forEach(s => s.addEffect(new Fx.Multiply(Palette.ColorKrakenBlend)));

      var swimAnim = krakenSheet.getAnimationByIndices(game, [0, 1, 2, 3], 200);
      swimAnim.loop = true;
      swimAnim.setScaleX(1.5);
      swimAnim.setScaleY(1.5);
      this.setCenterDrawing(true);

      var attackAnim = krakenSheet.getAnimationByIndices(game, [4, 5, 6], 200);
      attackAnim.loop = true;
      attackAnim.setScaleX(1.5);
      attackAnim.setScaleY(1.5);
      this.setCenterDrawing(true);

      var idleAnim = krakenSheet.getAnimationByIndices(game, [8, 7, 9, 7], 200);
      idleAnim.loop = true;
      idleAnim.setScaleX(1.5);
      idleAnim.setScaleY(1.5);
      this.setCenterDrawing(true);

      this.addDrawing('idle', idleAnim);
      this.addDrawing('attack', attackAnim);
      this.addDrawing('swim', swimAnim);
      this.setDrawing('idle');

   }

   public handleAttackPress() {
      var target = this.getClosestEnemy();

      if (this._canAttack && target) {
         this.attack(target);
      }
   }

   private getClosestEnemy(): Enemy {
      var ships: Enemy[] = (<any>game.currentScene).enemies;
      var target: Enemy = ships.sort((a, b) => {
         return a.getCenter().distance(this.getCenter()) - b.getCenter().distance(this.getCenter());
      })[0];

      if (target && target.getCenter().distance(this.getCenter()) <= Config.krakenAttackRange) {
         return target;
      }

      return null;
   }

   public checkForShipProximity() {
      var targetInRange = this.getClosestEnemy();

      // Attack the ship if in range
      if (targetInRange) {
         this._canAttack = true;
      } else {
         this._canAttack = false;

         if (this._currentMode === KrakenMode.Attack) {
            this.returnToSwim();
         }
      }

   }

   public onInitialize(game: ex.Engine) {

      ex.Logger.getInstance().info("Kraken initialized");

      //Resources.SoundSwim.setVolume(.3);

      // Build swim sound timer
      var swimTimer = new ex.Timer(() => {
         if (this._currentMode === KrakenMode.Swim) {
            Resources.SoundSwim.play();
         }

      }, 800, true);

      game.currentScene.addTimer(swimTimer);

      game.on('mousemove,touchmove', (ev: ex.MouseMove) => {
         this.moveKraken(ev.x, ev.y);
      });

      game.on('mouseup,touchend', (ev) => {
         this.handleAttackPress();
      });

      this.on('collision', (ev: ex.CollisionEvent) => {
         if (!ev.other) {
            this.dx = 0;
            this.dy = 0;
         }

         // todo workaround race condition in Excalibur collisions
         // when two collision events are queued for this actor
         // don't process if other was killed in previous handler
         if (ev.other instanceof Bullet && !(<any>ev.other)._isKilled) {

            ex.Logger.getInstance().info("Kraken got shot, yo!");

            // subtract health
            this.health -= Config.enemyDps;

            // record damage taken
            (<BaseLevel>game.currentScene).stats.damageTaken += Config.enemyDps;

            // cue
            Resources.SoundHurt.play();

            // kill
            ev.other.kill();
         }
      });

   }


   public update(engine: ex.Engine, delta: number) {
      super.update(engine, delta);

      // if killed?
      if (this.health <= 0) {
         game.goToScene("death");
         return;
      }

      // check for enemy proximity
      this.checkForShipProximity();

      var dampeningVector = this._travelVector.normalize().scale(Config.krakenInertiaDampen).scale(-1);

      if (Math.abs(this.dx) < Config.defaultKrakenIdleThreshold) {
         this.dx = 0;
      }

      if (Math.abs(this.dy) < Config.defaultKrakenIdleThreshold) {
         this.dy = 0;
      }

      this.setAnimationState(delta);

      if (this.dx > dampeningVector.x && this.dx !== 0) {
         this.dx += dampeningVector.x;
      }

      if (this.dx < dampeningVector.x && this.dx !== 0) {
         this.dx += dampeningVector.x;
      }

      if (this.dy > dampeningVector.y && this.dy !== 0) {
         this.dy += dampeningVector.y;
      }

      if (this.dy < dampeningVector.y && this.dy !== 0) {
         this.dy += dampeningVector.y;
      }

   }

   public moveKraken(x: number, y: number): void {
      var potentialTarget = new ex.Vector(x, y);

      if (potentialTarget.minus(this.getCenter()).distance() > Config.defaultKrakenMoveRadius) {
         var rayTarget = new ex.Ray(this.getCenter(), potentialTarget.minus(this.getCenter()));
         potentialTarget = rayTarget.getPoint(Config.defaultKrakenMoveRadius).toVector();
      }

      var travelVector = potentialTarget.minus(this.getCenter());
      travelVector.normalize().scale(Config.defaultKrakenSpeedScale);
      this._travelVector = travelVector;

      //this._travelVector = new ex.Vector(ex.Util.clamp(travelVector.x, -Config.defaultKrakenMaxSpeed, Config.defaultKrakenMaxSpeed),
      //   ex.Util.clamp(travelVector.y, -Config.defaultKrakenMaxSpeed, Config.defaultKrakenMaxSpeed));

      this.move(travelVector.x, travelVector.y);

      travelVector.normalize();
      var rotationAngle = Math.atan2(travelVector.y, travelVector.x);

      if (!this._spinning) {
         this.rotation = rotationAngle;
      }
   }

   public move(x: number, y: number) {
      this.dx = x;
      this.dy = y;
   }

   private _animationTimer: number = 0;
   public setAnimationState(delta: number): void {

      // Moving
      if (this.dx === 0 && this.dy === 0 && this._animationTimer <= 0) {

         if (this._currentMode !== KrakenMode.Attack && this._currentMode !== KrakenMode.Idle) {
            ex.Logger.getInstance().info("Setting animation state to Idle", this.dx, this.dy);
            this.setDrawing('idle');
            this._currentMode = KrakenMode.Idle;
            this._animationTimer = Config.defaultKrakenAnimationChangeThreshold;
            return;
         }
      }

      // Moving
      if (this.dx !== 0 && this.dy !== 0 && this._animationTimer <= 0) {

         if (this._currentMode !== KrakenMode.Attack && this._currentMode !== KrakenMode.Swim) {
            ex.Logger.getInstance().info("Setting animation state to Swim", this.dx, this.dy);
            this.setDrawing('swim');
            this._currentMode = KrakenMode.Swim;
            this._animationTimer = Config.defaultKrakenAnimationChangeThreshold;
            return;
         }

      }

      this._animationTimer -= delta;
   }

   public returnToSwim() {
      if (this._currentMode === KrakenMode.Attack) {
         if (!this.actionQueue.hasNext()) {

            ex.Logger.getInstance().info("Kraken.returnToSwim: Returning to swim");

            var oldRotation = this.rotation;

            this.clearActions();
            this._spinning = true;
            this.rotateBy(this.rotation + Math.PI, 200).callMethod(() => {
               this.setDrawing('swim');
               this.rotation = oldRotation;
               this._currentMode = KrakenMode.Swim;
               ex.Logger.getInstance().info("Kraken.returnToSwim: Setting mode to Swim after rotate");
               this._spinning = false;
            });
         }
      } else {
         this.setDrawing('swim');
         this._currentMode = KrakenMode.Swim;
         ex.Logger.getInstance().info("Kraken.returnToSwim: Setting mode to Swim");
      }
   }



   public attack(enemy?: Enemy) {

      if ((Date.now() - this._lastAttackTime) > Config.krakenAttackTime) {
         if (this._currentMode !== KrakenMode.Attack) {
            //console.log("Spinning", this._currentMode);
            this._currentMode = KrakenMode.Attack;
            ex.Logger.getInstance().info("Kraken.attack: Setting mode to Attack");

            var oldRotation = this.rotation;
            this.clearActions();
            this._spinning = true;
            this.rotateBy(this.rotation + Math.PI, 200).callMethod(() => {
               this.setDrawing('attack');
               this.rotation = oldRotation;
               this._spinning = false;
            });
         }

         //todo do damage here
         if (enemy) {
            Resources.HitSound.play();
            game.camera.shake(10, 10, 200);
            enemy.health -= Config.krakenDps;
            enemy.alertStatus = AlertStatus.Attack;
            //record damage dealt
            (<BaseLevel>game.currentScene).stats.damageDealt += Config.krakenDps;
         }
         this._lastAttackTime = Date.now();

      }


   }

   public getLines() {
      var lines = new Array<ex.Line>();

      var beginPoint1 = new ex.Point(this.x, this.y);
      var endPoint1 = new ex.Point(this.x + this.getWidth(), this.y);
      var newLine1 = new ex.Line(beginPoint1, endPoint1);

      // beginPoint2 is endPoint1
      var endPoint2 = new ex.Point(endPoint1.x, endPoint1.y + this.getHeight());
      var newLine2 = new ex.Line(endPoint1, endPoint2);

      // beginPoint3 is endPoint2
      var endPoint3 = new ex.Point(this.x, this.y + this.getHeight());
      var newLine3 = new ex.Line(endPoint2, endPoint3);

      // beginPoint4 is endPoint3
      // endPoint4 is beginPoint1
      var newLine4 = new ex.Line(endPoint3, beginPoint1);

      //console.log("line1: (" + Math.round(newLine1.begin.x) + ", " + Math.round(newLine1.begin.y) + ") to (" + Math.round(newLine1.end.x) + ", " + Math.round(newLine1.end.y) + ")");
      //console.log("line2: (" + Math.round(newLine2.begin.x) + ", " + Math.round(newLine2.begin.y) + ") to (" + Math.round(newLine2.end.x) + ", " + Math.round(newLine2.end.y) + ")");
      //console.log("line3: (" + Math.round(newLine3.begin.x) + ", " + Math.round(newLine3.begin.y) + ") to (" + Math.round(newLine3.end.x) + ", " + Math.round(newLine3.end.y) + ")");
      //console.log("line4: (" + Math.round(newLine4.begin.x) + ", " + Math.round(newLine4.begin.y) + ") to (" + Math.round(newLine4.end.x) + ", " + Math.round(newLine4.end.y) + ")");

      lines.push(newLine1);
      lines.push(newLine2);
      lines.push(newLine3);
      lines.push(newLine4);
      return lines;

   }

   public draw(ctx: CanvasRenderingContext2D, delta: number): void {

      this.drawGlow(ctx, delta);

      super.draw(ctx, delta);
   }

   private drawGlow(ctx: CanvasRenderingContext2D, delta: number): void {
      // create radial gradient
      var grd = ctx.createRadialGradient(this.getCenter().x, this.getCenter().y, 10, this.getCenter().x, this.getCenter().y, 150);

      grd.addColorStop(0, Palette.ColorKrakenGlowStart.toString());
      grd.addColorStop(1, Palette.ColorKrakenGlowEnd.toString());

      ctx.fillStyle = grd;
      ctx.beginPath();
      // x, y, radius, start, end, [anti-clockwise]
      ctx.arc(this.getCenter().x, this.getCenter().y, 150, 0, Math.PI * 2);
      ctx.closePath();
      ctx.fill();
   }
}