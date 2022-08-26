import {
  _decorator,
  Component,
  Node,
  Label,
  director,
  Color,
  Sprite,
} from "cc";
import { GameManager } from "./GameManager";
import { PlatformSpawner } from "./PlatformSpawner";
const { ccclass, property } = _decorator;

@ccclass("Tutorial")
export class Tutorial extends Component {
  static instance: Tutorial;
  _currentState: number = -1;
  // [1]
  // dummy = '';

  // [2]
  @property(Label)
  tutorialLabel: Label | undefined;
  @property(Node)
  tutorialPanel: Node | undefined;

  @property(PlatformSpawner)
  platformsSpawner: PlatformSpawner | undefined;

  @property(Label)
  pressToResumeLabel: Label | undefined;

  onLoad() {
    Tutorial.instance = this;
    if (!this.tutorialLabel || !this.tutorialPanel || !this.pressToResumeLabel)
      return;
    this.tutorialLabel.node.active = false;
    this.switchTutorialPanel(false);
    this.pressToResumeLabel.node.active = false;
  }

  start() {
    // [3]
    this._currentState++;
    this.spawnPlatforms();
    this.ApplyState();
  }

  spawnPlatforms() {
    if (!this.platformsSpawner) return;
    this.platformsSpawner.addNewPlatform(7);
    this.platformsSpawner.addNewPlatform(7);
    this.platformsSpawner.addNewPlatform(7);
    this.platformsSpawner.addNewPlatform(7);
    this.platformsSpawner.addNewPlatform(7);
    this.platformsSpawner.addNewPlatform(7);
    this.platformsSpawner.addNewPlatform(7);
    this.platformsSpawner.addNewPlatform(7);
    this.platformsSpawner.addNewPlatform(7);
    this.platformsSpawner.addNewPlatform(7);
    this.platformsSpawner.addNewPlatform(7);
    this.platformsSpawner.addNewPlatform(7);
    this.platformsSpawner.addNewPlatform(7);
    this.platformsSpawner.addNewPlatform(7);
    this.platformsSpawner.addNewPlatform(7);
    this.platformsSpawner.addNewPlatform(7);
    this.platformsSpawner.addNewPlatform(7);
    this.platformsSpawner.addNewPlatform(7);
    this.platformsSpawner.addNewPlatform(7);
    this.platformsSpawner.addNewPlatform(7);
    this.platformsSpawner.addNewPlatform(7);
    this.platformsSpawner.addNewPlatform(7);
  }

  switchTutorialPanel(active: boolean) {
    let panelImage = this.tutorialPanel?.getComponent(Sprite);
    if (!this.tutorialPanel || !this.tutorialLabel || !panelImage) return;

    this.tutorialPanel?.active;

    this.tutorialPanel.active = active;

    this.tutorialLabel.color = active ? Color.WHITE : panelImage.color;
  }

  async ApplyState() {
    if (!this.tutorialLabel || !this.tutorialPanel || !this.pressToResumeLabel)
      return;

    switch (this._currentState) {
      case 0:
        await this.wait(3000);
        this.switchTutorialPanel(true);
        this.tutorialLabel.node.active = true;
        this.tutorialLabel.string = "LET'S LEARN HOW TO\nPLAY GRINDERS!";
        await this.wait(3000);
        this._nextState();
        break;
      case 1:
        this.tutorialLabel.string =
          "HOLD (SPACE)\nTO CROUCH\n...AND RELEASE TO JUMP";
        await this.wait(2000);
        this._nextState();
        break;
      case 2:
        GameManager.tutorialActivated = false;
        this.pressToResumeLabel.node.active = true;
        director.pause();
        break;
      case 3:
        this.switchTutorialPanel(false);
        this.pressToResumeLabel.node.active = false;
        director.resume();
        this._nextState();
        break;
      case 4:
        break;
      case 5:
        this.switchTutorialPanel(true);
        this.tutorialLabel.string = "NICE!";
        await this.wait(500);
        director.pause();
        await this.wait(300);
        this.tutorialLabel.string =
          "HOLD (SPACE)\nWHILE JUMPING TO LAND\nAND GRIND ON A WALL";
        await this.wait(1500);
        this.pressToResumeLabel.node.active = true;
        this._nextState();
        break;
      case 6:
        break;
      case 7:
        this.switchTutorialPanel(false);
        this.pressToResumeLabel.node.active = false;
        director.resume();
        break;
      case 8:
        await this.wait(100);
        this.switchTutorialPanel(true);
        this.tutorialLabel.string = "NICE!";
        GameManager.tutorialActivated = true;
        await this.wait(600);
        this._nextState();
        break;

      case 9:
        await this.wait(200);
        director.pause();
        this.switchTutorialPanel(true);
        this.tutorialLabel.string =
          "RELEASE TO JUMP OFF THE WALL,\nTHEN LAND ON ANOTHER\nWALL SEGMENT.";
        await this.wait(200);
        this.pressToResumeLabel.node.active = true;
        GameManager.tutorialActivated = false;
        break;
      case 10:
        this.pressToResumeLabel.node.active = false;
        this.switchTutorialPanel(false);
        director.resume();
        break;
      case 11:
        this.switchTutorialPanel(true);
        this.tutorialLabel.string = "NICE!";
        await this.wait(600);
        this._nextState();
        break;
      case 12:
        this.switchTutorialPanel(true);
        this.tutorialLabel.string = "NICE!";
        await this.wait(400);
        this._nextState();
        break;
      case 13:
        GameManager.tutorialActivated = true;
        this.switchTutorialPanel(true);
        this.tutorialLabel.string =
          "NOW YOUR FINAL CHALLENGE:\nGRIND LONG ENOUGH TO KNOCK\nDOWN THAT WALL!";
        await this.wait(600);
        director.pause();
        await this.wait(200);
        GameManager.tutorialActivated = false;
        this.pressToResumeLabel.node.active = true;
        this._nextState();
        break;
      case 14:
        break;
      case 15:
        this.pressToResumeLabel.node.active = false;
        this.switchTutorialPanel(false);
        director.resume();
        break;
      case 16:
        this.tutorialLabel.string = "TUTORIAL DONE!";
        this.switchTutorialPanel(false);
        break;
      case 17:
        this.tutorialLabel.string = "LET'S GO!";
        GameManager.instance.startGameAfterTutorial();
        await this.wait(2000);
        this.tutorialLabel.node.active = false;
        break;

      default:
        break;
    }
  }
  _nextState() {
    this._currentState++;
    this.ApplyState();
  }

  onJumpButtonPressDown() {
    let indexes = [2, 6, 9, 14];
    if (indexes.indexOf(this._currentState) != -1) this._nextState();
  }

  onJumpButtonPressUp() {
    let indexes = [4];
    if (indexes.indexOf(this._currentState) != -1) this._nextState();
  }

  onPlayerSlideOnWall() {
    let indexes = [7];
    if (indexes.indexOf(this._currentState) != -1) this._nextState();
  }

  onPlayerSlidedOnAnotherWall() {
    let indexes = [10];
    if (indexes.indexOf(this._currentState) != -1) this._nextState();
  }

  onPlayerJetEnabled() {
    let indexes = [15];
    if (indexes.indexOf(this._currentState) != -1) this._nextState();
  }

  onPlayerOnGround() {
    let indexes = [16];
    if (indexes.indexOf(this._currentState) != -1) this._nextState();
  }

  async wait(timeInMillies: number) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({});
      }, timeInMillies);
    });
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
