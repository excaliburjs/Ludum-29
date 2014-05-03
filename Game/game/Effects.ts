module Fx {
   
   export class Flash implements ex.Internal.Actions.IAction {
      
      public x: number;/*not needed*/
      public y: number;/*not needed*/

      private _flashTimer: number = 0;
      private _appliedEffect: boolean = false
      constructor(private actor: ex.Actor, private color: ex.Color, private duration: number) {
         
         if (!actor.currentDrawing) {
            throw "Cannot flash an actor that has no drawing";
         }

         this._flashTimer = duration;
      }

      public update(delta: number): void {
         this._flashTimer -= delta;

         if (this._flashTimer <= 0 && this._appliedEffect) {
            // todo only clear the effect I added
            this.actor.currentDrawing.clearEffects();

            return;
         }

         if (!this._appliedEffect) {

            // todo drawings could change between updates
            this.actor.currentDrawing.addEffect(new ex.Effects.Fill(this.color));

            this._appliedEffect = true;
         }       
      }

      public isComplete(actor: ex.Actor/*not needed*/): boolean {
         return this._flashTimer <= 0;
      }

      public reset(): void {
         this._flashTimer = this.duration;
         this._appliedEffect = false;
         this.actor.currentDrawing.clearEffects();
      }

      public stop(): void {
         this._flashTimer = 0;
      }
   }

   export class Multiply implements ex.Effects.ISpriteEffect {
      
      constructor(private color: ex.Color) {
         
      }

      public updatePixel(x: number, y: number, imageData: ImageData): void {
         
         var firstPixel = (x + y * imageData.width) * 4;
         var pixel = imageData.data;
         if (pixel[firstPixel + 3] !== 0) {
            pixel[firstPixel + 0] = this.color.r * (pixel[firstPixel + 0]) / 255;
            pixel[firstPixel + 1] = this.color.g * (pixel[firstPixel + 1]) / 255;
            pixel[firstPixel + 2] = this.color.b * (pixel[firstPixel + 2]) / 255;
            pixel[firstPixel + 3] = (this.color.a * 255) * (pixel[firstPixel + 3]) / 255;
         }

      }

   }

}