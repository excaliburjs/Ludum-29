﻿/// <reference path="Level.ts" />
/// <reference path="Sonar.ts" />

class Enemy extends ex.Actor {
   public health: number = Config.defaultEnemyHealth;
   public alertStatus: AlertStatus = AlertStatus.Calm;
   public rays: ex.Ray[] = new Array<ex.Ray>();
   public originalRays: ex.Ray[] = new Array<ex.Ray>();
   private _rayVectors: ex.Vector[] = new Array<ex.Vector>();
   private _fovLength: number;
   private _travelVector: ex.Vector;
   private _originalTravelVector: ex.Vector;
   private _kraken: Kraken;
   private _lightStartPoint: ex.Point;
   private _shipSheet: ex.SpriteSheet;
   private _bulletTimer: number = 0;
   public alertSprite: ex.Sprite = new ex.Sprite(Resources.AlertTexture, 0, 0, 60, 60);
   public isDead: boolean;
   public sonar: Sonar;

   constructor(public key: string, x?: number, y?: number, width?: number, height?: number, color?: ex.Color, health?: number) {
      super(x, y, Config.defaultEnemyWidth, Config.defaultEnemyHeight, color);
      this.setWidth(width || Config.defaultEnemyWidth);
      this.setHeight(height || Config.defaultEnemyHeight);
      this.health = health || this.health;
      this._travelVector = new ex.Vector(1, 0);
      this._originalTravelVector = new ex.Vector(1, 0);
      this._fovLength = Config.defaultEnemyFOV;

      this._shipSheet = new ex.SpriteSheet(Resources.Ship1Texture, 3, 2, 191, 73);

      this.addDrawing("full", this._shipSheet.getSprite(0));
      this.addDrawing("half", this._shipSheet.getSprite(1));
      this.addDrawing("eighty", this._shipSheet.getSprite(2));


      var anim = this._shipSheet.getAnimationByIndices(game, [3, 4, 5], 200);
      this.addDrawing("explode", anim);
      this.setCenterDrawing(true);

      this.setDrawing("full");
      this.collisionType = ex.CollisionType.Fixed;
   }

   public onInitialize(game: ex.Engine) {
      this._kraken = (<any>game.currentScene).kraken;

      this.rotation = Math.PI / 2;

       //TODO assumes all enemies are initially facing right
      this._lightStartPoint = new ex.Point(this.x + this.getWidth(), this.y + this.getHeight() / 2);

      var yValues = new Array<number>(-0.62, -0.25, 0, 0.25, 0.62);

       //this.sonar = new Sonar(this.getWidth()/2, this.getHeight()/2, 1, 1);
       //this.addChild(this.sonar);

       for (var i = 0; i < 5; i++) {
          //var rayPoint = new ex.Point(0, this.getHeight() / 2);
          var rayPoint = this._lightStartPoint;
          var rayVector = new ex.Vector(1, yValues[i]);
          var ray = new ex.Ray(rayPoint, rayVector);
          var ray2 = new ex.Ray(rayPoint, rayVector);
          this.rays.push(ray);
          this.originalRays.push(ray2);
       }

      this.on('DistressEvent', (ev: DistressEvent) => {
         //if (this.within(ev.enemy, Config.defaultAssistDistance)) {
         //this._alertStatus = AlertStatus.Warn;
         //this.assistShip(ev.enemy);
         //}
      });

      this.on('AttackEvent', (ev: AttackEvent) => {

      });

   }

   public update(engine: ex.Engine, delta: number) {
      super.update(engine, delta);

      this._lightStartPoint = new ex.Point(this.x + this.getWidth(), this.y + this.getHeight() / 2);
      this._lightStartPoint = this.rotatePoint(this._lightStartPoint, this.rotation, this.getCenter());
      if (this.health < Config.defaultEnemyHealth  && this.health >= Config.defaultEnemyHealth * 0.8) {
         this.setDrawing("full");
      }

      if (this.health < Config.defaultEnemyHealth * 0.8 && this.health >= Config.defaultEnemyHealth * 0.5) {
         this.setDrawing("half");
      }
       if (this.health < Config.defaultEnemyHealth * 0.5 && this.health >= 0) {
         this.setDrawing("eighty");
      }

      if (this.health < 0 && !this.isDead) {
         game.camera.shake(10, 10, 600);
         this.setDrawing("explode");
         Resources.SinkSound.play();
         this.isDead = true;
         var timer = new ex.Timer(() => {
            this.kill();
            (<BaseLevel>game.currentScene).kraken.health += Config.krakenHealthRegen;
            //record health gained
            (<BaseLevel>game.currentScene).stats.healthGained += Config.krakenHealthRegen;
            
         }, 600, false);
         game.currentScene.addTimer(timer);
         //record ship destroyed
         (<BaseLevel>game.currentScene).stats.numBoatsDestroyed++;
      }
      for (var i = 0; i < this.rays.length; i++) {
         this.rays[i].pos = this._lightStartPoint;

         // updating for potential rotation
         this.rays[i].dir = this.rotateVector(this.originalRays[i].dir, this.rotation);
         //this.rays[i].pos = this.rotatePoint(this.originalRays[i].pos, this.rotation, this.getCenter());
         this._travelVector = this.rotateVector(this._originalTravelVector, this.rotation);
      }


      if (this.detectKraken() == AlertStatus.Warn) {
         //this._alertStatus = AlertStatus.Warn;
      } else if (this.detectKraken() == AlertStatus.Attack) {
         this.alertStatus = AlertStatus.Attack;
         (<any>game.currentScene).stats.numBoatsAlerted = 1; //TODO have this correctly count
            //this.sonar.ping();
      } else {
         //this._alertStatus = AlertStatus.Calm;
      }

      if (this.alertStatus == AlertStatus.Warn) {
         this.triggerEvent('DistressEvent', new DistressEvent(this));
      } else if (this.alertStatus == AlertStatus.Attack) {
         this.triggerEvent('AttackEvent', new AttackEvent(this));
         if (this.within(this._kraken, Config.defaultEnemyMaxFiringDistance)) {
            this.attack(delta);
         } else {
            this.alertStatus = AlertStatus.Calm;
         }
      }
   }

   private movePath: ex.Point[] = [];
   public createMovePath(path: ex.Point[]): void {
      this.movePath = path;

      path.forEach((point, i) => {
         this.moveTo(point.x - this.getWidth() / 2, point.y - this.getHeight() / 2, Config.defaultEnemySpeed);
         if (path[i + 1]) {
            var direction = new ex.Vector(path[i + 1].x, path[i + 1].y).minus(point.toVector()).normalize();
            var angle = Math.atan2(direction.y, direction.x);
            this.rotateTo(angle, Config.enemyRotationSpeed);
         }
      });
      this.delay(Config.defaultEnemyWaitTime);
      for (var i = path.length - 1; i >= 0; i--) {
         this.moveTo(path[i].x - this.getWidth() / 2, path[i].y - this.getHeight() / 2, Config.defaultEnemySpeed);
         if (path[i - 1]) {
            var direction = new ex.Vector(path[i - 1].x, path[i - 1].y).minus(path[i].toVector()).normalize();
            var angle = Math.atan2(direction.y, direction.x);
            this.rotateTo(angle, Config.enemyRotationSpeed);
         }
      }

      this.repeatForever();
   }

   private detectKraken() {
      var result = AlertStatus.Calm;
      var krakenLines = this._kraken.getLines();
      for (var i = 0; i < this.rays.length; i++) {
         for (var j = 0; j < krakenLines.length; j++) {
            var distanceToKraken = this.rays[i].intersect(krakenLines[j]);
            if ((result != AlertStatus.Attack) && (distanceToKraken >= Config.defaultMaxAttackDistance) && (distanceToKraken <= Config.defaultMaxAlertDistance)) {
               result = AlertStatus.Warn;
            }
            if ((distanceToKraken >= 0) && (distanceToKraken <= Config.defaultMaxAttackDistance)) {
               result = AlertStatus.Attack;
            }
         }
      }
      return result;
   }

   private canSeeKraken() {
      var krakenLines = this._kraken.getLines();
      for (var i = 0; i < this.rays.length; i++) {
         for (var j = 0; j < krakenLines.length; j++) {
            var distanceToKraken = this.rays[i].intersect(krakenLines[j]);
            if (distanceToKraken >= 0) {
               return true;
            }
         }
      }
      return false;
   }

   private createSpotlight(startPoint: ex.Point, sightDistance: number) {
      //TODO
   }

   private createRadar(startPoint: ex.Point, sightDistance: number) {
      //TODO
   }

   private rotatePoint(p: ex.Point, rotationAngle: number, anchor: ex.Point) {
      var sinAngle = Math.sin(rotationAngle);
      var cosAngle = Math.cos(rotationAngle);
      var x = cosAngle * (p.x - anchor.x) - sinAngle * (p.y - anchor.y) + anchor.x;
      var y = sinAngle * (p.x - anchor.x) + cosAngle * (p.y - anchor.y) + anchor.y;
      return new ex.Point(x, y);
   }

   private rotateVector(vectorToRotate: ex.Vector, rotationAngle: number) {
      var newVectorPoint = this.rotatePoint(vectorToRotate.toPoint(), rotationAngle, new ex.Point(0, 0));
      return new ex.Vector(newVectorPoint.x, newVectorPoint.y);
   }

   public draw(ctx: CanvasRenderingContext2D, delta: number) {
      super.draw(ctx, delta);
      this.drawFOV(this._lightStartPoint, ctx, delta);

      if (this.alertStatus === AlertStatus.Attack) {
         this.alertSprite.draw(ctx, this.getCenter().x + Config.enemyAlertOffsetX - this.alertSprite.width/2, this.getCenter().y + Config.enemyAlertOffsetY - this.alertSprite.height/2);
      }
   }

   public attack(delta: number) {
      // if the ship can still see the kraken (or the kraken is in the ship's attack proximity), attack the kraken

      if (this._bulletTimer <= 0) {
         ex.Logger.getInstance().info("Shot bullet");

         // shoot
         // todo lead them a bit based on kraken's travel vector? bonus!

         var fireLocation = this.rotatePoint(new ex.Point(this.getCenter().x + Config.enemyGunOffset, this.getCenter().y), this.rotation, this.getCenter());

         game.addChild(new Bullet(fireLocation.x, fireLocation.y, this._kraken.getCenter().x, this._kraken.getCenter().y));
         Resources.BulletSound.play();

         this._bulletTimer = Config.defaultEnemyBulletWait;
      }
      this._bulletTimer -= delta;
   }

   public assistShip(shipInTrouble: Enemy) {
      this.clearActions();
      this.follow(shipInTrouble, 50);
   }

   private drawFOV(point: ex.Point, ctx: CanvasRenderingContext2D, delta: number): void {

      // create radial gradient
      var fovRay = new ex.Ray(point, this._travelVector);
      var fovEndPoint = fovRay.getPoint(this._fovLength);

      var grd = ctx.createRadialGradient(point.x, point.y, 10, fovEndPoint.x, fovEndPoint.y, this._fovLength / 2);
      if (this.alertStatus !== AlertStatus.Attack) {
         grd.addColorStop(0, 'rgba(255, 255, 255, 0.3)');
         grd.addColorStop(1, 'rgba(255, 255, 255, 0)');
      } else {
         grd.addColorStop(0, 'rgba(255, 150, 150, 0.3)');
         grd.addColorStop(1, 'rgba(255, 150, 150, 0)');
      }

      ctx.fillStyle = grd;
      ctx.beginPath();
      // x, y, radius, start, end, [anti-clockwise]
      ctx.arc(this.getCenter().x, this.getCenter().y, this._fovLength - 200, 0, Math.PI * 2);
      ctx.closePath();
      ctx.fill();

   }

   public debugDraw(ctx: CanvasRenderingContext2D): void {
      super.debugDraw(ctx);

      //Debugging draw for LOS rays on the enemy
      for (var i = 0; i < this.rays.length; i++) {
         ctx.beginPath();
         ctx.moveTo(this.rays[i].pos.x, this.rays[i].pos.y);
         var end = this.rays[i].getPoint(Config.defaultMaxAlertDistance);
         ctx.lineTo(end.x, end.y);
         ctx.strokeStyle = ex.Color.Chartreuse.toString();
         ctx.stroke();
         ctx.closePath();
      }

      // draw path if any
      if (this.movePath) {

         ctx.beginPath();
         this.movePath.forEach((point, i) => {

            ctx.moveTo(point.x, point.y);

            // not at the end yet
            if (i < (this.movePath.length - 1)) {
               ctx.lineTo(this.movePath[i + 1].x, this.movePath[i + 1].y);
            }

         });
         ctx.closePath();
         ctx.strokeStyle = ex.Color.Violet.toString();
         ctx.stroke();
      }
   }
}

enum AlertStatus {
   Calm,
   Warn,
   Attack
}