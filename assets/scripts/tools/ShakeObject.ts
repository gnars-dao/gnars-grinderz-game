import { _decorator, Component, Node, CCFloat, Vec3 } from "cc";
const { ccclass, property } = _decorator;

@ccclass("ShakeObject")
export class ShakeObject extends Component {
  // [1]
  // dummy = '';
  startPosition: Vec3 | undefined;

  // [2]
  @property(CCFloat)
  shakeFactor: number = 7;

  onLoad() {
    this.startPosition = new Vec3(this.node.position.x, this.node.position.y);
  }
  start() {
    // [3]
  }

  update(deltaTime: number) {
    if (this.startPosition)
      this.node.position = new Vec3(
        this.startPosition.x + this.shakeFactor * Math.random(),
        this.startPosition.y + this.shakeFactor * Math.random()
      );
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
