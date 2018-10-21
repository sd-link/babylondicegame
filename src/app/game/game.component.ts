import {
  Component,
  OnInit,
  ElementRef,
  ViewChild
} from '@angular/core';
import * as BABYLON from 'babylonjs';
import {
  BasicParam,
  FacePostion
} from './config';
import {
  PlinkoService
} from './../plinko.service';

var pt = null;
@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.css']
})

export class GameComponent implements OnInit {

  canvas: any;
  engine: any;
  scene: any;

  diceFaceUV: any;
  diceMat: any;
  holeObject: any;

  diceObject: any[];
  diceIsEnable: boolean[];
  diceIsReached: boolean[];
  dicePath: any[];
  diceNumber: any[];
  planOne: number[];
  planAll: any[];
  diceRouterInfo: any[];
  dotGlow: any[];




  subscription = null;

  tableY = BasicParam.offsetY - BasicParam.gridWidth * 7;

  constructor(public plinkoService: PlinkoService) {
    pt = this;
    this.subscription = this.plinkoService.eventOccured.subscribe(event => {
      this.fallDice();
    });
  }
  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
      this.subscription = null;
    }
  }

  ngOnInit() {
    this.canvas = document.getElementById('renderCanvas');
    this.engine = new BABYLON.Engine(this.canvas, true);
    this.scene = this.createScene();
    this.engine.runRenderLoop(() => {
      this.scene.render();
      this.updateRoute();
    });
  }

  createScene() {

    const scene = new BABYLON.Scene(this.engine);
    const gravityVector = new BABYLON.Vector3(0, -500, 0);
    const physicsPlugin = new BABYLON.CannonJSPlugin();
    scene.enablePhysics(gravityVector, physicsPlugin);
    scene.collisionsEnabled = true;

    const camera = new BABYLON.UniversalCamera('UniversalCamera', new BABYLON.Vector3(0, 0, BasicParam.plinkoDepth * 2), scene);
    camera.setTarget(BABYLON.Vector3.Zero());
    camera.mode = BABYLON.Camera.ORTHOGRAPHIC_CAMERA;
    // camera.attachControl(this.canvas, true);
    const light1 = new BABYLON.HemisphericLight('mainLight1', new BABYLON.Vector3(1500, 2500, 500), scene);
    const light2 = new BABYLON.HemisphericLight('mainLight1', new BABYLON.Vector3(-1500, 2500, 500), scene);

    this.dicePath = [];
    this.diceNumber = [];



    // dice
    this.diceMat = new BABYLON.StandardMaterial('diceMat', scene);
    this.diceMat.opacityTexture = new BABYLON.Texture('assets/img/dice-sprite.png', scene);
    this.diceMat.diffuseTexture = new BABYLON.Texture('assets/img/dice-sprite.png', scene);
    this.diceMat.specularColor = new BABYLON.Color3(0, 0, 0);

    const hSpriteNb = 6;
    const vSpriteNb = 3;

    this.diceFaceUV = [];
    for (let d = 0; d < vSpriteNb; d++) {
      this.diceFaceUV[d] = [];
      for (let i = 0; i < 6; i++) {
        this.diceFaceUV[d][i] = new BABYLON.Vector4(i / hSpriteNb, d / vSpriteNb, (i + 1) / hSpriteNb, (d + 1) / vSpriteNb);
      }
    }

    this.diceObject = [];
    this.diceIsEnable = [];
    this.diceIsReached = [];
    for (let i = 0; i < BasicParam.dicesPerScreen; i++) {
      this.diceIsEnable[i] = true;
      this.diceObject[i] = BABYLON.MeshBuilder.CreateBox(`dicd${i}`, {
        size: BasicParam.diceSize,
        faceUV: this.diceFaceUV[i % 3]
      }, scene);
      this.diceObject[i].material = this.diceMat;

      this.diceObject[i].position = new BABYLON.Vector3(
        BasicParam.diceSize * (i - BasicParam.dicesPerScreen / 2) * 1.5,
        this.tableY + BasicParam.diceSize,
        BasicParam.plinkoDepth / 2);
      this.diceObject[i].physicsImpostor = new BABYLON.PhysicsImpostor(this.diceObject[i], BABYLON.PhysicsImpostor.BoxImpostor, {
        mass: BasicParam.diceMass,
        restitution: BasicParam.diceRestitution,
        friction: BasicParam.diceFriction,
      }, scene);
    }


    const diceTable = BABYLON.MeshBuilder.CreateBox('diceTable', {
      width: BasicParam.gridWidth * BasicParam.dicesPerScreen * 2,
      depth: BasicParam.plinkoDepth
    }, scene);
    diceTable.position.y = this.tableY;
    diceTable.position.z = BasicParam.plinkoDepth / 2;
    diceTable.physicsImpostor = new BABYLON.PhysicsImpostor(diceTable, BABYLON.PhysicsImpostor.BoxImpostor, {
      mass: 0
    });

    //  back
    const backPan = BABYLON.MeshBuilder.CreatePlane('backPan', {
      width: BasicParam.backWidth,
      height: BasicParam.backHeight
    }, scene);
    backPan.position = new BABYLON.Vector3(0, 0, 0);
    backPan.rotation.y = Math.PI;


    const backMat = new BABYLON.StandardMaterial('backMat', scene);

    backMat.diffuseColor = new BABYLON.Color3(0, 0, 0);
    backMat.specularColor = new BABYLON.Color3(0, 0, 0);
    backMat.emissiveTexture = new BABYLON.Texture('assets/img/back.png', scene);


    backPan.material = backMat;

    backPan.physicsImpostor = new BABYLON.PhysicsImpostor(backPan, BABYLON.PhysicsImpostor.BoxImpostor, {
      mass: 0,
      restitution: 0.7,
      friction: 0.1
    }, scene);



    // front
    const borderMat = new BABYLON.StandardMaterial('borderMat', scene);
    borderMat.diffuseColor = new BABYLON.Color3(0, 0, 0);
    borderMat.specularColor = new BABYLON.Color3(0, 0, 0);
    borderMat.emissiveColor = new BABYLON.Color3(.1, .8, 1.0);
    borderMat.alpha = 0.0;




    const frontPan = BABYLON.MeshBuilder.CreatePlane('frontPan', {
      width: BasicParam.backWidth,
      height: BasicParam.backHeight
    }, scene);
    frontPan.position = new BABYLON.Vector3(0, 0, BasicParam.plinkoDepth)
    const frontMat = new BABYLON.StandardMaterial('backMat', scene);
    frontPan.material = frontMat;
    frontPan.physicsImpostor = new BABYLON.PhysicsImpostor(
      frontPan,
      BABYLON.PhysicsImpostor.BoxImpostor, {
        mass: 0,
        restitution: 0.7,
        friction: 0.1
      },
      scene);


    // right 
    const rightPan = BABYLON.MeshBuilder.CreateBox('rightPan', {
      width: BasicParam.gridWidth * (BasicParam.grids + 2),
      depth: BasicParam.plinkoDepth
    }, scene);
    rightPan.position = new BABYLON.Vector3(
      -BasicParam.gridWidth * Math.sin(Math.PI / 3) * (BasicParam.grids / 3),
      BasicParam.offsetY + BasicParam.gridWidth * (BasicParam.grids + 2) / 2 * Math.sin(Math.PI / 3),
      BasicParam.plinkoDepth / 2);
    rightPan.material = borderMat;
    rightPan.rotation.z = Math.PI / 3;
    rightPan.physicsImpostor = new BABYLON.PhysicsImpostor(rightPan, BABYLON.PhysicsImpostor.BoxImpostor, {
      mass: 0,
      restitution: 0.1
    }, scene);

    // left
    const leftPan = BABYLON.MeshBuilder.CreateBox('leftPan', {
      width: BasicParam.gridWidth * (BasicParam.grids + 2),
      depth: BasicParam.plinkoDepth
    }, scene);
    leftPan.position = new BABYLON.Vector3(
      BasicParam.gridWidth * Math.sin(Math.PI / 3) * (BasicParam.grids / 3),
      BasicParam.offsetY + BasicParam.gridWidth * (BasicParam.grids + 2) / 2 * Math.sin(Math.PI / 3),
      BasicParam.plinkoDepth / 2);
    leftPan.rotation.z = Math.PI * 2 / 3;
    leftPan.material = borderMat;
    leftPan.physicsImpostor = new BABYLON.PhysicsImpostor(leftPan, BABYLON.PhysicsImpostor.BoxImpostor, {
      mass: 0,
      restitution: 0.1
    }, scene);


    // bottom & dots
    this.holeObject = [];
    this.dotGlow = [];
    for (let i = BasicParam.grids; i > -1; i--) {
      // bottom
      this.holeObject[i] = BABYLON.MeshBuilder.CreateBox('hole' + i, {
        width: BasicParam.gridWidth,
        height: BasicParam.dotWidth,
        depth: BasicParam.plinkoDepth
      }, scene);
      this.holeObject[i].position = new BABYLON.Vector3(
        BasicParam.gridWidth * i - (BasicParam.grids / 2) * BasicParam.gridWidth,
        BasicParam.offsetY - BasicParam.dotWidth / 2,
        BasicParam.plinkoDepth / 2);
      this.holeObject[i].physicsImpostor = new BABYLON.PhysicsImpostor(
        this.holeObject[i], BABYLON.PhysicsImpostor.BoxImpostor, {
          mass: 0,
          restitution: 0.9,
          friction: 0.01
        }, scene);
      const holeMat = new BABYLON.StandardMaterial(`holeMat${i}`, scene);
      holeMat.diffuseColor = new BABYLON.Color3(0, 0, 0);
      holeMat.specularColor = new BABYLON.Color3(0, 0, 0);
      holeMat.emissiveColor = new BABYLON.Color3(.1, .8, 1.0);
      this.holeObject[i].material = holeMat;


      if (i === 0) break;


      // dots
      this.dotGlow[i] = [];
      for (let j = 0; j < i; j++) {

        const dot = BABYLON.MeshBuilder.CreateCylinder(`dot${i}_${j}`, {
            diameterTop: (j % 2 || i === BasicParam.grids) ? BasicParam.dotWidth : 0,
            diameterBottom: (j % 2 && i !== BasicParam.grids) ? 0 : BasicParam.dotWidth,
            height: BasicParam.plinkoDepth,
            tessellation: 12
          },
          scene);
        dot.rotation.x = Math.PI / 2;
        dot.position = new BABYLON.Vector3(
          j * BasicParam.gridWidth - BasicParam.gridWidth * (i - 1) / 2,
          BasicParam.gridWidth * Math.sin(Math.PI / 3) * (BasicParam.grids - i + 1) + BasicParam.offsetY,
          BasicParam.plinkoDepth / 2);
        dot.physicsImpostor = new BABYLON.PhysicsImpostor(dot, BABYLON.PhysicsImpostor.CylinderImpostor, {
          mass: 0,
          restitution: 0.2,
          friction: 0.1
        }, scene);

        const dotMat = new BABYLON.StandardMaterial('dotMat', scene);
        dotMat.diffuseColor = new BABYLON.Color3(0, 0, 0);
        dotMat.specularColor = new BABYLON.Color3(0, 0, 0);
        dotMat.emissiveColor = new BABYLON.Color3(.1, .8, 1.0);
        dot.material = dotMat;
        dot.actionManager = new BABYLON.ActionManager(scene);

        this.dotGlow[i][j] = BABYLON.MeshBuilder.CreatePlane(`dotGlow${i}_${j}`, {
            width: 17,
            height: 17
          },
          scene);
        this.dotGlow[i][j].position = new BABYLON.Vector3(
          j * BasicParam.gridWidth - BasicParam.gridWidth * (i - 1) / 2,
          BasicParam.gridWidth * Math.sin(Math.PI / 3) * (BasicParam.grids - i + 1) + BasicParam.offsetY,
          -1);
        
        this.dotGlow[i][j].rotation.y = Math.PI;
        const dotGlowMat = new BABYLON.StandardMaterial(`dotGlowMat${i}_${j}`, scene);

        dotGlowMat.diffuseColor = new BABYLON.Color3(0, 0, 0);
        dotGlowMat.specularColor = new BABYLON.Color3(0, 0, 0);
        dotGlowMat.emissiveTexture = new BABYLON.Texture('assets/img/dot-glow.png', scene);
        dotGlowMat.opacityTexture = new BABYLON.Texture('assets/img/dot-glow.png', scene);
        this.dotGlow[i][j].material = dotGlowMat;


        // collision event
        for (let d = 0; d < BasicParam.dicesPerScreen; d++) {
          dot.actionManager.registerAction(new BABYLON.ExecuteCodeAction({
              trigger: BABYLON.ActionManager.OnIntersectionEnterTrigger,
              parameter: this.diceObject[d]
            },
            pt.onDotCollision
          ));
        }
      }

      // vertical lines
      const shareLine = BABYLON.MeshBuilder.CreateBox(`shareLine${i}`, {
        height: BasicParam.gridWidth * Math.sin(Math.PI / 3),
        depth: BasicParam.plinkoDepth
      }, scene);

      shareLine.material = borderMat;
      shareLine.position = new BABYLON.Vector3(
        (i - BasicParam.grids / 2 - 0.5) * BasicParam.gridWidth,
        BasicParam.offsetY + BasicParam.gridWidth * Math.sin(Math.PI / 3) / 2,
        BasicParam.plinkoDepth / 2);
      shareLine.physicsImpostor = new BABYLON.PhysicsImpostor(
        shareLine,
        BABYLON.PhysicsImpostor.BoxImpostor, {
          mass: 0,
          restitution: 0.9,
          friction: 0
        }, scene);
    }


    // front
    // const triangleMat = new BABYLON.StandardMaterial('borderMat', scene);
    // triangleMat.diffuseColor = new BABYLON.Color3(0, 0, 0);
    // triangleMat.specularColor = new BABYLON.Color3(0, 0, 0);
    // triangleMat.emissiveColor = new BABYLON.Color3(.1, .8, 1.0);

    const myLine = [
      [
        new BABYLON.Vector3(0, Math.sin(Math.PI / 3) * BasicParam.gridWidth * (BasicParam.grids + 2) + BasicParam.offsetY, 400),
        new BABYLON.Vector3(-BasicParam.gridWidth * (BasicParam.grids / 2 + 0.5) - Math.sin(Math.PI / 6) * BasicParam.gridWidth, BasicParam.offsetY, 400),
        new BABYLON.Vector3(BasicParam.gridWidth * (BasicParam.grids / 2 + 0.5) + Math.sin(Math.PI / 6) * BasicParam.gridWidth, BasicParam.offsetY, 400),
        new BABYLON.Vector3(0, Math.sin(Math.PI / 3) * BasicParam.gridWidth * (BasicParam.grids + 2) + BasicParam.offsetY, 400)
      ]
    ];
    // const triangle = BABYLON.MeshBuilder.CreateTube("tube", {path: myLine, radius: 20, tessellation: 9, updatable: false}, scene);
    // triangle.material = triangleMat;

    const linesystem = BABYLON.MeshBuilder.CreateLineSystem("linesystem", {
      lines: myLine,
      updatable: true
    }, scene);
    linesystem.color = new BABYLON.Color3(.1, .8, 1.0);


    return scene;
  }

  start() {
    this.plinkoService.fallDice();
  }

  fallDice() {
    this.planAll = [];
    this.planOne = [];
    this.getAllPlan(0);
    const plans = this.planAll.length;
    const selectedPlan = Math.floor(Math.random() * plans);

    console.log('');
    console.log('target');
    console.log(this.plinkoService.number + 1, this.plinkoService.hole)

    this.holeObject[this.plinkoService.hole].material.emissiveColor = new BABYLON.Color3(1.0, 0.0, 1.0);

    for (let i = this.plinkoService.number; i < BasicParam.dicesPerScreen; i += 3) {
      if (this.diceIsEnable[i]) {
        this.diceObject[i].position = new BABYLON.Vector3(
          0,
          BasicParam.gridWidth * (BasicParam.grids + 1) * Math.sin(Math.PI / 3) + BasicParam.offsetY,
          BasicParam.gridWidth * i / 3 + BasicParam.gridWidth / 2);
        this.dicePath[i] = JSON.parse(this.planAll[selectedPlan]);
        this.diceNumber[i] = this.plinkoService.number;
        this.diceIsEnable[i] = false;
        this.diceIsReached[i] = false;
        break;
      }
    }
    this.makeRoute();
  }

  getAllPlan(k) {
    if (k >= BasicParam.grids + 1) {
      if (this.planOne[k - 1] === this.plinkoService.hole) {
        this.planAll.push(JSON.stringify(this.planOne));
      }

      return;
    } else {
      for (let i = 0; i <= k; i++) {
        if (k === 0 || this.planOne[k - 1] === i || i - this.planOne[k - 1] === 1) {
          this.planOne[k] = i;
          this.getAllPlan(k + 1);
        }
      }
    }
  }

  updateRoute() {


    for (let d = 0; d < BasicParam.dicesPerScreen; d++) {

      if (!this.dicePath[d]) continue;

      const velocity = this.diceObject[d].physicsImpostor.getLinearVelocity();
      const v3d = Math.sqrt(velocity.x * velocity.x + velocity.y * velocity.y + velocity.z * velocity.z);
      const v2d = Math.sqrt(velocity.x * velocity.x + velocity.y * velocity.y);
      const velocityAngular = this.diceObject[d].physicsImpostor.getAngularVelocity();

      if (v2d > 120) {
        const vY = velocity.y * 0.1
        const vX = velocity.x * 0.5
        this.diceObject[d].physicsImpostor.setLinearVelocity(new BABYLON.Vector3(
          vX,
          vY,
          0
        ));
      }
      if (Math.abs(velocity.y) < .001) {
        if (this.diceObject[d].position.y - BasicParam.offsetY <= BasicParam.diceSize) {
          const targetHoleNumber = this.dicePath[d][BasicParam.grids];
          console.log('result');
          console.log(this.diceNumber[d] + 1, targetHoleNumber);
          this.holeObject[targetHoleNumber].material.emissiveColor = new BABYLON.Color3(.1, .8, 1.0);

          this.diceIsReached[d] = true;
          this.dicePath[d] = null;
          setTimeout(() => {
            this.diceIsEnable[d] = true;
            this.diceObject[d].position = new BABYLON.Vector3(
              BasicParam.diceSize * (d - BasicParam.dicesPerScreen / 2) * 1.5,
              this.tableY + BasicParam.diceSize,
              BasicParam.plinkoDepth / 2);
          }, 2000);
          return;

        }
      } else if (v3d > 5 && this.diceObject[d].position.y > BasicParam.offsetY + BasicParam.diceSize) {
        // rotate
        const rT = FacePostion[this.diceNumber[d]];
        let rqX, rqY, rqZ, rqW, minDis = null;

        for (let op = 0; op < 4; op++) {
          let cRqX = rT[op].x - this.diceObject[d].rotationQuaternion.x;
          let cRqY = rT[op].y - this.diceObject[d].rotationQuaternion.y;
          let cRqZ = rT[op].z - this.diceObject[d].rotationQuaternion.z;
          let cRqW = rT[op].w - this.diceObject[d].rotationQuaternion.w;

          cRqX = Math.abs((Math.PI * 2 - cRqX)) > Math.abs(cRqX) ? cRqX : Math.PI * 2 - cRqX;
          cRqY = Math.abs((Math.PI * 2 - cRqY)) > Math.abs(cRqY) ? cRqY : Math.PI * 2 - cRqY;
          cRqZ = Math.abs((Math.PI * 2 - cRqZ)) > Math.abs(cRqZ) ? cRqZ : Math.PI * 2 - cRqZ;
          cRqW = Math.abs((Math.PI * 2 - cRqW)) > Math.abs(cRqW) ? cRqW : Math.PI * 2 - cRqW;

          const dis = cRqX * cRqX + cRqY * cRqY + cRqZ * cRqZ + cRqW * cRqW
          if (minDis === null || dis < minDis) {
            rqX = cRqX;
            rqY = cRqY;
            rqZ = cRqZ;
            rqW = cRqW;
            minDis = dis;
          }
        }

        const rDis = Math.abs(this.diceObject[d].position.y - BasicParam.offsetY - BasicParam.diceSize * 2);
        if (rDis < 3) {
          this.diceObject[d].physicsImpostor.setAngularVelocity(new BABYLON.Vector3(
            0,
            0,
            0
          ));
          this.diceObject[d].physicsImpostor.setLinearVelocity(new BABYLON.Vector3(
            velocity.x / 4,
            velocity.y,
            0
          ));
        }
        const rqA = Math.abs(v2d) /
          (rDis * rDis);
        this.diceObject[d].rotationQuaternion = new BABYLON.Quaternion(
          this.diceObject[d].rotationQuaternion.x + rqX * rqA,
          this.diceObject[d].rotationQuaternion.y + rqY * rqA,
          this.diceObject[d].rotationQuaternion.z + rqZ * rqA,
          this.diceObject[d].rotationQuaternion.w + rqW * rqA
        );
      }
      for (let i = 0; i < BasicParam.grids; i++) {
        const {
          j,
          k,
          v
        } = this.diceRouterInfo[d][i];
        const unitH = BasicParam.gridWidth * Math.sin(Math.PI / 3);
        const offsetY2 = -10;
        const r = this.diceObject[d].position.y - BasicParam.offsetY + offsetY2 < unitH * (BasicParam.grids - i + 1) &&
          this.diceObject[d].position.y - BasicParam.offsetY + offsetY2 > unitH * (BasicParam.grids - i);
        if (r) {


          // pulse
          const disOld = (i == 0) ? null : (this.dicePath[d][i] - this.dicePath[d][i - 1]);
          const disNew = this.dicePath[d][i + 1] - this.dicePath[d][i];

          if (disNew !== disOld) {

            this.diceObject[d].physicsImpostor.setLinearVelocity(new BABYLON.Vector3(
              velocity.x * 0.5,
              velocity.y,
              0
            ));

            this.diceObject[d].applyImpulse(new BABYLON.Vector3(
                (k ? -1 : 1) * 6000,
                -100,
                0
              ),
              this.diceObject[d].getAbsolutePosition()
            );

          } else {
            const vAng = Math.atan(Math.abs(velocity.y / (velocity.x ? velocity.x : 0.001)));
            const dAngV = (vAng - Math.PI / 3);
            if (dAngV > 0) {
              this.diceObject[d].applyImpulse(new BABYLON.Vector3(
                  (k ? -1 : 1) * dAngV * 40000,
                  400,
                  0
                ),
                this.diceObject[d].getAbsolutePosition()
              );
            }
          }
        }

      }
    }
  }

  onDotCollision(event) {
    const obj = event.source;
    obj.material.emissiveColor = new BABYLON.Color3(1, 1, 1);
    const i = 15 - Math.floor((event.source.position.y - BasicParam.offsetY) / (Math.sin(Math.PI / 3) * BasicParam.gridWidth));
    const j =  Math.floor( (event.source.position.x + i * BasicParam.gridWidth / 2) / BasicParam.gridWidth ) ;
    pt.dotGlow[i][j].position.z = BasicParam.plinkoDepth + 1;
    setTimeout(() => {
      pt.dotGlow[i][j].position.z = -1;
    }, 800);
    setTimeout(() => {
      obj.material.emissiveColor = new BABYLON.Color3(.1, .8, 1.0);
    }, 1000);
    
  }

  makeRoute() {
    this.diceRouterInfo = [];

    for (let l = 0; l < BasicParam.dicesPerScreen; l++) {
      let fk = null;
      this.diceRouterInfo[l] = [];
      if (!this.dicePath[l]) continue;
      for (let i = 0; i < BasicParam.grids; i++) {
        for (let j = 0; j < i + 1; j++) {
          for (let k = 0; k < 2; k++) {

            if (this.dicePath[l][i] === j) {
              let sk = this.dicePath[l][i + 1] - this.dicePath[l][i];

              if (sk !== k) {

                if (fk === sk) {

                  this.diceRouterInfo[l][i] = {
                    j: j,
                    k: k,
                    v: false
                  };
                } else {

                  this.diceRouterInfo[l][i] = {
                    j: j,
                    k: k,
                    v: true
                  };
                }
                fk = sk;
              }
            }
          }
        }
      }
    }
  }


}
