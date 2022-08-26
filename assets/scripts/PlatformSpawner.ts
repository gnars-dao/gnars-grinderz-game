import {
  _decorator,
  Component,
  Node,
  Prefab,
  instantiate,
  UITransform,
  Vec3,
} from "cc";
import { GameManager } from "./GameManager";
import { Platform } from "./Platform";
const { ccclass, property } = _decorator;

@ccclass("PlatformSpawner")
export class PlatformSpawner extends Component {
  // [1]
  currentPlatforms: Node[] = [];
  startPosX: number = 0;

  // [2]
  @property([Prefab])
  platformsPrefab: Prefab[] = [];

  @property(Number)
  platformsCount: number = 10;

  @property(Number)
  playformXOffsetRemoval: number = 100;

  @property(Number)
  moveSpeed: number = 10;

  @property(Boolean)
  dependOnTutorial: boolean = false;

  start() {
    // [3]

    if (!GameManager.tutorialActivated || !this.dependOnTutorial)
      for (let i = 0; i < this.platformsCount; i++) {
        this.addNewPlatform();
      }
  }

  addNewPlatform(index: number = -1) {
    let obj = instantiate(
      this.platformsPrefab[
        index == -1
          ? Math.floor(Math.random() * this.platformsPrefab.length)
          : index
      ]
    );

    obj.parent = this.node;

    if (this.currentPlatforms.length == 0)
      obj.position = new Vec3(this.startPosX, 0, 0);
    else {
      let lastObjIndex = this.currentPlatforms.length - 1;
      let width =
        this.currentPlatforms[lastObjIndex].getComponent(UITransform)
          ?.contentSize.width;
      if (width == undefined) return;
      let nextPos = this.currentPlatforms[lastObjIndex].position.x + width;
      obj.position = new Vec3(nextPos, 0, 0);
    }

    let width = obj.getComponent(UITransform)?.contentSize.width;
    if (width != undefined) this.startPosX += width;
    this.currentPlatforms.push(obj);
  }

  update(deltaTime: number) {
    for (let i = 0; i < this.currentPlatforms.length; i++) {
      this.currentPlatforms[i].position = new Vec3(
        this.currentPlatforms[i].position.x - this.moveSpeed * deltaTime,
        this.currentPlatforms[i].position.y,
        this.currentPlatforms[i].position.z
      );
    }

    if (
      this.currentPlatforms[0].worldPosition.x < this.playformXOffsetRemoval
    ) {
      this.addNewPlatform();
      this.currentPlatforms[0].destroy();
      this.currentPlatforms.splice(0, 1);
    }
  }

  comboUpdated(combo: number) {
    for (let i = 0; i < 8; i++) {
      let platform = this.currentPlatforms[i].getComponent(Platform);
      if (platform) platform.comboUpdated(combo);
    }
  }

  platformsGoDown() {
    let maxDistance = 1800;
    let distCounter = 0;
    for (let i = 0; i < this.currentPlatforms.length; i++) {
      let uiTransform = this.currentPlatforms[i].getComponent(UITransform);
      if (uiTransform != undefined) {
        distCounter += uiTransform.contentSize.width;
        if (distCounter > maxDistance) break;
        this.currentPlatforms[i].getComponent(UITransform)?.contentSize.width;
        let platform = this.currentPlatforms[i].getComponent(Platform);
        if (platform) platform.goDown = true;
      }
    }
  }
}

/**
 * [1] Class member could be defined like this.
 * [2] Use `property` decorator if your want the member to be serializable.
 * [3] Your initialization goes here.
 * [4] Your update function goes here.
 *
 * Learn more about scripting: https://docs.cocos.com/creator/3.0/manual/en/scripting/
 * Learn more about CCClass: https://docs.cocos.com/creator/3.0/manual/en/scripting/ccclass.html
 * Learn more about life-cycle callbacks: https://docs.cocos.com/creator/3.0/manual/en/scripting/life-cycle-callbacks.html
 */
