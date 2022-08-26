import {
  _decorator,
  Component,
  Node,
  Sprite,
  RichText,
  Label,
  Button,
  SpriteFrame,
  Color,
} from "cc";
import { CharactersPageManager } from "./CharactersPageManager";
import { MenuManager } from "./MenuManager";
const { ccclass, property } = _decorator;

@ccclass("CharacterCard")
export class CharacterCard extends Component {
  // [1]
  // dummy = '';
  index: number = -1;

  // [2]
  @property(Sprite)
  avatarImg: Sprite | undefined;

  @property(Node)
  nameLabel: Node | undefined;

  @property(Button)
  selectBtn: Button | undefined;

  @property(Node)
  imageSelectedBorder: Node | undefined;

  start() {
    // [3]
  }

  Set(sprite: SpriteFrame, name: string, index: number) {
    if (this.avatarImg) this.avatarImg.spriteFrame = sprite;
    let nl = this.nameLabel?.getComponent(Label);
    if (nl) nl.string = name;
    this.index = index;
    this.updateCard();
  }

  updateCard() {
    if (this.selectBtn) {
      // this.selectBtn.enabled = !(
      //   this.index == CharactersPageManager.selectedCard
      // );

      let label = this.selectBtn.node.children[0].getComponent(Label);
      if (label)
        label.string =
          this.index == CharactersPageManager.selectedCard
            ? "Start Skating!"
            : "Select";

      if (this.imageSelectedBorder)
        this.imageSelectedBorder.active =
          this.index == CharactersPageManager.selectedCard;
    }
  }

  cardSelected() {
    console.log("selectCard()");
    //for start skating
    if (CharactersPageManager.selectedCard == this.index) {
      MenuManager.instance.playGame();
    } else {
      CharactersPageManager.selectedCard = this.index;
      CharactersPageManager.instance.updateAllCards();
    }
  }

  // update (deltaTime: number) {
  //     // [4]
  // }
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
