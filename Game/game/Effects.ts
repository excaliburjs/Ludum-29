module Fx {
   
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
         }

      }

   }

}