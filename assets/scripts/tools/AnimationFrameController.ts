import {
  _decorator,
  Component,
  Node,
  SpriteFrame,
  CCInteger,
  Sprite,
} from "cc";
const { ccclass, property } = _decorator;

@ccclass("AnimationFrameController")
export class AnimationFrameController extends Component {
  // [1]
  // dummy = '';
  currentIndex = 0;
  currentFrameCounter = 0;
  sprite: Sprite | undefined;
  finished: boolean = false;

  // [2]
  @property([SpriteFrame])
  frames: SpriteFrame[] = [];

  @property(Boolean)
  repeat: boolean = true;

  @property(Boolean)
  destroyAfterFinnish: boolean = false;
  @property(CCInteger)
  speedFrame: number = 0;

  onEnable() {
    let s = this.node.getComponent(Sprite);
    if (s != null) this.sprite = s;
  }

  start() {
    // [3]
  }

  update(deltaTime: number) {
    if (this.sprite && !this.finished) {
      if (this.currentFrameCounter >= this.speedFrame) {
        this.currentFrameCounter = 0;
        this.currentIndex++;
        if (this.currentIndex >= this.frames.length) {
          this.currentIndex = 0;
          if (!this.repeat) {
            this.finished = true;
            if (this.destroyAfterFinnish) this.node.destroy();
          }
        }
        this.sprite.spriteFrame = this.frames[this.currentIndex];
      } else this.currentFrameCounter++;
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
