import {
  _decorator,
  Component,
  Node,
  systemEvent,
  SystemEvent,
  EventKeyboard,
  macro,
  RigidBody2D,
  Vec2,
  Collider2D,
  Contact2DType,
  IPhysics2DContact,
  ProgressBar,
  Sprite,
  Color,
} from "cc";
import { GameManager } from "./GameManager";
import { CharactersPageManager } from "./MenuPage/CharactersPageManager";
import { GetAllNFTCharacters } from "./MenuPage/GetAllNFTCharacters";
import { PlatformSpawner } from "./PlatformSpawner";
import { Tutorial } from "./Tutorial";
const { ccclass, property } = _decorator;
const PLATFORM_TAG: number = 1;
const GROUND_TAG: number = 2;

@ccclass("PlayerControl")
export class PlayerControl extends Component {
  static enableColliders: boolean = false;

  // [1]
  // dummy = '';
  _rb: RigidBody2D | undefined | null;
  _isHoldingKey: boolean = false;
  _isOnGround: boolean = false;
  _ignoreOneTimeGround: boolean = false;
  _currentCollidingTag: number = 0;
  _jetPackTime: number = 0;
  _currentKeyDownIsZ: boolean = false;
  _scoreMultiplier: number = 1;

  // [2]
  @property(Number)
  jumpFactor: number = 20;

  @property(Number)
  maxJetPackTime: number = 5;

  @property(Number)
  comboFillSpeed: number = 0.5;

  @property(ProgressBar)
  comboProgressBar: ProgressBar | undefined;

  @property(PlatformSpawner)
  platformSpawner: PlatformSpawner | undefined;

  @property(Node)
  upCollider: Node | undefined;

  @property(Node)
  normalSkate: Node | undefined;

  @property([Node])
  slidingSkates: Node[] = [];

  @property([Node])
  skateFires: Node[] = [];

  @property([Node])
  sparksObjects: Node[] = [];

  @property(GameManager)
  gameManager: GameManager | undefined;

  onLoad() {
    systemEvent.on(SystemEvent.EventType.KEY_DOWN, this.onKeyDown, this);
    systemEvent.on(SystemEvent.EventType.KEY_UP, this.onKeyUp, this);

    let collider = this.getComponent(Collider2D);
    if (collider) {
      collider.on(Contact2DType.BEGIN_CONTACT, this.onBeginContact, this);
      collider.on(Contact2DType.END_CONTACT, this.onEndContact, this);
    }

    this._rb = this.node.getComponent(RigidBody2D);

    let sprite = this.node.getComponent(Sprite);
    if (sprite)
      sprite.spriteFrame =
        GetAllNFTCharacters.uris[CharactersPageManager.selectedCard].img;

    if (this.comboProgressBar) this.comboProgressBar.progress = 0;
  }

  start() {
    // [3]
  }

  onKeyDown(event: EventKeyboard) {
    if (GameManager.tutorialActivated) return;
    switch (event.keyCode) {
      // case macro.KEY.x:
      //   this._currentKeyDownIsZ = false;
      //   this._isHoldingKey = true;
      //   Tutorial.instance.onJumpButtonPressDown();
      //   break;
      // case macro.KEY.z:
      //   this._currentKeyDownIsZ = true;
      //   this._isHoldingKey = true;
      //   Tutorial.instance.onJumpButtonPressDown();
      //   break;
      case macro.KEY.space:
        this._currentKeyDownIsZ = Math.random() < 0.5 ? true : false;
        this._isHoldingKey = true;
        Tutorial.instance.onJumpButtonPressDown();
        break;
    }
  }

  onKeyUp(event: EventKeyboard) {
    if (GameManager.tutorialActivated) return;
    switch (event.keyCode) {
      // case macro.KEY.x:
      // case macro.KEY.z:
      //   if (this._rb != undefined && this._isOnGround) {
      //     this._rb.linearVelocity = new Vec2(0, this.jumpFactor);

      //     Tutorial.instance.onJumpButtonPressUp();
      //   }
      //   this._isHoldingKey = false;
      //   break;
      case macro.KEY.space:
        if (this._rb != undefined && this._isOnGround) {
          this._rb.linearVelocity = new Vec2(0, this.jumpFactor);

          Tutorial.instance.onJumpButtonPressUp();
        }
        this._isHoldingKey = false;
        break;
    }
  }

  update(deltaTime: number) {
    if (this._rb != undefined)
      PlayerControl.enableColliders =
        this._rb.linearVelocity.y < 0.1 && this._isHoldingKey;

    for (let i = 0; i < this.sparksObjects.length; i++) {
      this.sparksObjects[i].active =
        this._isOnGround && this._currentCollidingTag == PLATFORM_TAG;
    }
    if (this._currentCollidingTag == GROUND_TAG)
      Tutorial.instance.onPlayerOnGround();
    if (this.comboProgressBar) {
      if (this._isOnGround && this._currentCollidingTag == PLATFORM_TAG) {
        this.comboProgressBar.progress += deltaTime * this.comboFillSpeed;
        this.platformSpawner?.comboUpdated(this.comboProgressBar.progress);

        if (this.comboProgressBar.barSprite) {
          let color = Color.RED;
          this._scoreMultiplier = 1;
          if (
            this.comboProgressBar.progress >= 0.25 &&
            this.comboProgressBar.progress < 0.5
          ) {
            color = new Color(255, 163, 0);
            this._scoreMultiplier = 2;
          } else if (
            this.comboProgressBar.progress >= 0.5 &&
            this.comboProgressBar.progress < 0.75
          ) {
            color = Color.YELLOW;
            this._scoreMultiplier = 3;
          } else if (this.comboProgressBar.progress >= 0.75) {
            color = Color.GREEN;
            this._scoreMultiplier = 4;
          }

          this.comboProgressBar.barSprite.color = color;
        }
        if (this.comboProgressBar.progress > 0.05)
          Tutorial.instance.onPlayerSlideOnWall();
        this.comboProgressBar.barSprite?.color;

        if (this.comboProgressBar.progress >= 1) {
          this.comboProgressBar.progress = 0;
          this.platformSpawner?.platformsGoDown();
          Tutorial.instance.onPlayerJetEnabled();
          this._jetPackTime = this.maxJetPackTime;
        }
      } else if (this._currentCollidingTag == GROUND_TAG) {
        this.comboProgressBar.progress = 0;
        this.gameManager?.groundHit();
      }
    }

    //for jetpack time
    for (let i = 0; i < this.skateFires.length; i++) {
      this.skateFires[i].active = this._jetPackTime > 0;
    }
    if (this.upCollider) {
      if (this._jetPackTime > 0) {
        this.gameManager?.Score(5);
        this.setSkate(false);
        this._jetPackTime -= deltaTime;
        this.upCollider.active = true;
        if (this._rb) this._rb.linearVelocity = new Vec2(0, this.jumpFactor);
      } else this.upCollider.active = false;
    }

    //setting the score
    if (this._isOnGround && this._currentCollidingTag == PLATFORM_TAG) {
      this.gameManager?.Score(this._scoreMultiplier);
    }
  }

  onBeginContact(
    selfCollider: Collider2D,
    otherCollider: Collider2D,
    contact: IPhysics2DContact | null
  ) {
    // will be called once when two colliders begin to contact
    // console.log("onBeginContact");
    if (this._isOnGround == true) this._ignoreOneTimeGround = true;
    else {
      this._isOnGround = true;
      if (
        this._currentCollidingTag == PLATFORM_TAG &&
        otherCollider.tag == PLATFORM_TAG
      )
        Tutorial.instance.onPlayerSlidedOnAnotherWall();
    }

    this._currentCollidingTag = otherCollider.tag;

    if (!this._ignoreOneTimeGround)
      this.setSkate(this._currentCollidingTag != GROUND_TAG);
  }

  onEndContact(
    selfCollider: Collider2D,
    otherCollider: Collider2D,
    contact: IPhysics2DContact | null
  ) {
    // will be called once when the contact between two colliders just about to end.
    // console.log("onEndContact");
    if (this._ignoreOneTimeGround) this._ignoreOneTimeGround = false;
    else this._isOnGround = false;
  }

  setSkate(sliding: boolean) {
    for (let i = 0; i < this.slidingSkates.length; i++) {
      this.slidingSkates[i].active = false;
    }

    if (this.normalSkate) this.normalSkate.active = false;

    if (sliding) {
      this.slidingSkates[
        // Math.floor(Math.random() * this.slidingSkates.length)
        this._currentKeyDownIsZ ? 0 : 1
      ].active = true;
    } else {
      if (this.normalSkate) this.normalSkate.active = true;
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
