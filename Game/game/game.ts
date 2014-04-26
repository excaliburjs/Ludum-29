/// <reference path="../scripts/Excalibur.d.ts" />

var game = new ex.Engine();

var kraken = new ex.Actor(200, 200, 100, 100, ex.Color.Red);
game.addChild(kraken);

game.start();