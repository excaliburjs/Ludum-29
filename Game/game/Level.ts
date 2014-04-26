/// <reference path="../scripts/Excalibur.d.ts" />

export class BaseLevel extends ex.Scene implements ex.ILoadable {
    private _isLoaded: boolean = false;
    public data: any;

    constructor(public jsonPath: string, public spriteSheet: ex.SpriteSheet) {
        super();
    }

    public onInitialize(engine: ex.Engine) {
        //build the collision map
    }

    //TODO overload draw: draw HUD, UI, etc.; also draw the collision map
    // remember to call super.draw()

    public load(): ex.Promise<any> {
        var complete = new ex.Promise<any>();
        var request = new XMLHttpRequest();
        request.open("GET", this.jsonPath, true);
        request.responseType = "json";
        request.onload = (e) => {
            complete.resolve(request.response);
            this.data = request.response;
        };
         request.send();
         return complete;
     }

     public isLoaded(): boolean {
         return this._isLoaded;
     }

     public onprogress: (e: any) => void = () => { };

     public oncomplete: () => void = () => { };

     public onerror: (e: any) => void = () => { };
 }