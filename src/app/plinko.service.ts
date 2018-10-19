import { EventEmitter, Injectable } from '@angular/core';
import { BasicParam } from './../app/game/config';
@Injectable({
  providedIn: 'root'
})
export class PlinkoService {
  events: number = 0; 
  color: number;
  number: number;
  hole: number; 
  isReady: boolean = true;
  
  eventOccured: EventEmitter<any> = new EventEmitter<any>();

  constructor() { }

  setDiceAndHole(): void {
    this.color = Math.floor(Math.random() * 3);
    this.number = Math.floor(Math.random() * 6);
    this.hole = Math.floor(Math.random() * (BasicParam.grids + 1));
  }

  fallDice(): void {
    if (this.isReady) {
      this.events++;
      this.setDiceAndHole();
      this.eventOccured.emit(this.events);
      this.isReady = false;
      setTimeout (() => {
        this.isReady = true;
        // this.fallDice();
      }, BasicParam.eventDelay);
    }
  }
}
// const dd = 3 //Math.floor(d / 4) % 6;
// const ddd = d % 4
// this.diceObject[d].rotationQuaternion = new BABYLON.Quaternion
// (
//   FacePostion[dd][ddd].x, 
//   FacePostion[dd][ddd].y, 
//   FacePostion[dd][ddd].z, 
//   FacePostion[dd][ddd].w
// );
