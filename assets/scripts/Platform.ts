import {
  _decorator,
  Component,
  Node,
  BoxCollider2D,
  Vec3,
  Sprite,
  math,
  loader,
  SpriteFrame,
  ImageAsset,
} from "cc";
import { MenuManager } from "./MenuPage/MenuManager";
import { PlayerControl } from "./PlayerControl";
const { ccclass, property } = _decorator;

@ccclass("Platform")
export class Platform extends Component {
  _collider: BoxCollider2D | undefined | null;
  goDown: boolean = false;
  cracks: Node[] = [];
  currentCountOfCracks: number = 0;
  shakeFactor: number = 7;

  // [1]
  // dummy = '';

  // [2]
  @property(Number)
  goDownSpeed = 400;

  @property(Sprite)
  spriteObject: Sprite | undefined;

  @property([Node])
  explosions: Node[] = [];

  @property([Node])
  rocks: Node[] = [];

  @property(Sprite)
  posterSprite: Sprite | undefined;

  @property(Number)
  posterShowChance: number = 0.7;

  start() {
    // [3]
    this._collider = this.node.getComponent(BoxCollider2D);
    if (this.spriteObject)
      for (let i = 0; i < this.spriteObject.node.children.length; i++) {
        this.cracks.push(this.spriteObject.node.children[i]);
      }

    if (this.posterSprite && Math.random() < this.posterShowChance) {
      this.loadPoster(this.posterSprite);
    }
  }

  loadPoster(posterSprite: Sprite) {
    if (MenuManager.posterSprites.length == 0) return;
    // Remote texture url with file extensions
    posterSprite.spriteFrame =
      MenuManager.posterSprites[
        Math.floor(Math.random() * MenuManager.posterSprites.length)
      ];

    posterSprite.trim = false;
  }

  update(deltaTime: number) {
    if (this._collider) this._collider.enabled = PlayerControl.enableColliders;

    if (this.goDown && this.spriteObject) {
      for (let i = 0; i < this.explosions.length; i++) {
        this.explosions[i].active = true;
      }
      for (let i = 0; i < this.rocks.length; i++) {
        this.rocks[i].active = true;
      }
      this.spriteObject.node.position = new Vec3(
        this.spriteObject.node.position.x,
        this.spriteObject.node.position.y - this.goDownSpeed * deltaTime,
        this.spriteObject.node.position.z
      );
    }
  }

  comboUpdated(combo: number) {
    if (!this.spriteObject) return;

    this.spriteObject.node.position = new Vec3(
      this.shakeFactor * combo * Math.random(),
      this.shakeFactor * combo * Math.random()
    );

    let count = Math.floor(combo * this.spriteObject.node.children.length);
    if (count > this.currentCountOfCracks) {
      this.addCrack();
      this.currentCountOfCracks++;
    }
  }

  addCrack() {
    if (!this.spriteObject) return;
    let availableCracks = [];
    for (let i = 0; i < this.spriteObject.node.children.length; i++) {
      if (!this.spriteObject.node.children[i].active)
        availableCracks.push(this.spriteObject.node.children[i]);
    }
    try {
      availableCracks[
        Math.floor(Math.random() * availableCracks.length)
      ].active = true;
    } catch (exception) {}
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
