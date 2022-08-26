import {
  _decorator,
  Component,
  Node,
  Sprite,
  SpriteFrame,
  ImageAsset,
  Texture2D,
  RenderTexture,
  math,
  Label,
  Color,
  color,
  director,
} from "cc";
import { CharactersPageManager } from "./MenuPage/CharactersPageManager";
import { GetAllNFTCharacters } from "./MenuPage/GetAllNFTCharacters";
import { MenuManager } from "./MenuPage/MenuManager";
import { Tutorial } from "./Tutorial";

const { ccclass, property } = _decorator;
@ccclass("GameManager")
export class GameManager extends Component {
  static instance: GameManager;
  static tutorialActivated: boolean = false;
  _remainingTime: number = 60;
  _score: number = 0;
  _scoreAddedFactor: number = 20;
  _gameOver: boolean = false;
  _dt: number = 0;

  @property(Label)
  remainingTimeLabel: Label | undefined;

  @property(Sprite)
  timeImage: Sprite | undefined;

  @property(Label)
  scoreLabel: Label | undefined;

  @property(Node)
  gameOverPanel: Node | undefined;

  @property(Label)
  gameOverCurrentScore: Label | undefined;

  @property(Label)
  gameOverBestScore: Label | undefined;

  onLoad() {
    GameManager.instance = this;
    if (GameManager.tutorialActivated) {
      let tut = this.node.getComponent(Tutorial);
      if (tut) tut.enabled = true;
      if (this.timeImage) this.timeImage.node.active = false;
      if (this.remainingTimeLabel) this.remainingTimeLabel.node.active = false;
      if (this.scoreLabel) this.scoreLabel.node.active = false;
      this._remainingTime = 1000;
    }
  }

  startGameAfterTutorial() {
    GameManager.tutorialActivated = false;
    this._remainingTime = 60;
    this._score = 0;
    if (this.remainingTimeLabel) this.remainingTimeLabel.string = "0";
    if (this.scoreLabel) this.scoreLabel.string = "0";
    if (this.timeImage) this.timeImage.node.active = true;
    if (this.remainingTimeLabel) this.remainingTimeLabel.node.active = true;
    if (this.scoreLabel) this.scoreLabel.node.active = true;
  }

  update(dt: number) {
    this._dt = dt;
    this._remainingTime -= dt;

    if (this._remainingTime < 0 && !this._gameOver) {
      //game over
    } else if (this._remainingTime > 0 && this.remainingTimeLabel) {
      this.remainingTimeLabel.string = Math.floor(this._remainingTime) + "";

      if (this._remainingTime < 10 && this.timeImage) {
        this.remainingTimeLabel.color = Color.RED;
        this.timeImage.color = Color.RED;
      }
    }
  }

  goBackToMainMenu() {
    setTimeout(() => {
      let scene = director.getScene();
      if (scene) scene.autoReleaseAssets = true;
      director.loadScene("Menu");
    }, 3000);
  }

  Score(mult: number = 1) {
    if (this._gameOver) return;

    this._score += this._dt * this._scoreAddedFactor * mult;

    if (this.scoreLabel) this.scoreLabel.string = Math.floor(this._score) + "";
  }

  groundHit() {
    if (this._gameOver) return;

    if (this._remainingTime < 0 && !this._gameOver) {
      //game over
      this._gameOver = true;

      let highestScore = this.getCurrentHighScore();
      if (
        this.gameOverCurrentScore &&
        this.gameOverBestScore &&
        this.gameOverPanel
      ) {
        this.gameOverCurrentScore.string = Math.floor(this._score) + "";
        this.gameOverBestScore.string = highestScore + "";
        this.gameOverPanel.active = true;
      }
      this.goBackToMainMenu();

      //sending the score if high score is beaten

      if (this._score > highestScore) {
        if (this.gameOverBestScore)
          this.gameOverBestScore.string = Math.floor(this._score) + "";
        //sending
        var myHeaders = new Headers();
        myHeaders.append("Content-Type", "application/json");

        var raw = JSON.stringify({
          wallet_id: MenuManager.wallerAccount,
          nft: {
            id: GetAllNFTCharacters.uris[CharactersPageManager.selectedCard].id,
            icon: GetAllNFTCharacters.uris[CharactersPageManager.selectedCard]
              .imageSVG,
          },
          score: Math.floor(this._score),
        });
        console.log(raw);

        var requestOptions = {
          method: "POST",
          headers: myHeaders,
          body: raw,
          redirect: "follow",
        };

        fetch(
          MenuManager.leaderboardServerAddress + "/v1/leaderboard/set",
          requestOptions
        )
          .then((response) => response.text())
          .then((result) => console.log(result))
          .catch((error) => console.log("error", error));
      }
    }
  }
  getCurrentHighScore() {
    let nftId = GetAllNFTCharacters.uris[CharactersPageManager.selectedCard].id;

    for (let i = 0; i < MenuManager.scores.length; i++) {
      if (MenuManager.scores[i].id == nftId) return MenuManager.scores[i].score;
    }

    return 0;
  }
}
