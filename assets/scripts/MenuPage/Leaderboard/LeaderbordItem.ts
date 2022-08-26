import { _decorator, Component, Node, Sprite, Color, Label } from "cc";
import { base64SvgToBase64Png } from "../GetAllNFTCharacters";
import { MenuManager, Score } from "../MenuManager";
const { ccclass, property } = _decorator;

@ccclass("LeaderbordItem")
export class LeaderbordItem extends Component {
  // [1]
  // dummy = '';
  walletAddress: string = "";

  // [2]
  @property(Node)
  bgOwner: Node | undefined;

  @property(Label)
  walletLabel: Label | undefined;

  @property(Label)
  idNumberLabel: Label | undefined;

  @property(Label)
  scoreLabel: Label | undefined;

  @property(Label)
  timeLabel: Label | undefined;

  @property(Sprite)
  nftAvatarSprite: Sprite | undefined;

  start() {
    // [3]
  }

  set(score: Score) {
    if (
      !this.bgOwner ||
      !this.idNumberLabel ||
      !this.walletLabel ||
      !this.timeLabel ||
      !this.scoreLabel ||
      !this.nftAvatarSprite
    )
      return;

    base64SvgToBase64Png(score.iconSVG, 512, this.nftAvatarSprite);
    this.walletAddress = score.wallet_id;
    this.walletLabel.string = this.getSummerisedString(score.wallet_id);
    this.bgOwner.active = score.wallet_id == MenuManager.wallerAccount;
    this.idNumberLabel.string = score.id + "";
    this.scoreLabel.string = score.score + "";
    this.timeLabel.string = score.time;
  }

  getSummerisedString(str: string, count: number = 13) {
    return str.substring(0, count) + "..." + str.substring(str.length - count);
  }

  openEtherScanPage() {
    console.log('openEtherScanPage()');
    
    window.open("https://etherscan.io/address/" + this.walletAddress);
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
