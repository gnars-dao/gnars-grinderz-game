import {
  _decorator,
  Component,
  Node,
  Button,
  director,
  SpriteFrame,
  loader,
  ImageAsset,
} from "cc";
import { GameManager } from "../GameManager";
import { CharactersPageManager } from "./CharactersPageManager";
import { GetAllNFTCharacters } from "./GetAllNFTCharacters";
const { ccclass, property } = _decorator;

@ccclass("MenuManager")
export class MenuManager extends Component {
  static leaderboardServerAddress: string = "https://leaderboard.gnars.fun";
  // static leaderboardServerAddress: string = "http://localhost:3000";

  static instance: MenuManager;
  static wallerAccount: string = "";
  static posterSprites: SpriteFrame[] = [];

  static scores: Score[] = [];

  postersLink: string[] = [
    "https://image.shutterstock.com/image-photo/crazy-child-making-grimace-silly-260nw-1357079459.jpg",
  ];
  // [1]
  // dummy = '';

  // [2]
  @property(Node)
  charactersPage: Node | undefined;

  @property(Node)
  leaderboardPage: Node | undefined;

  @property(Node)
  mainPage: Node | undefined;

  @property(Node)
  connectWalletPage: Node | undefined;

  @property(Node)
  walletConnectLoadingPage: Node | undefined;

  @property(Node)
  gettingNFTsLoading: Node | undefined;

  @property(Node)
  noNFTsPage: Node | undefined;

  onLoad() {
    MenuManager.instance = this;
  }
  start() {
    // [3]
    if (MenuManager.wallerAccount == "") {
      if (typeof window.ethereum !== "undefined") {
        console.log("MetaMask is installed!");
        // this.getAccount();
      } else {
        console.log("MetaMask is NOT installed!");
      }
    } else {
      if (this.gettingNFTsLoading) this.gettingNFTsLoading.active = true;
      this.getMyNftsScores();
      if (this.connectWalletPage) this.connectWalletPage.active = false;
      // if (this.mainPage) this.mainPage.active = true;
    }
  }

  setCharactersPage() {
    if (this.gettingNFTsLoading && this.charactersPage) {
      this.gettingNFTsLoading.active = false;
      this.charactersPage.active = true;
    }

    this.charactersPage?.getComponent(CharactersPageManager)?.setCards();
  }

  async getAccount() {
    if (this.connectWalletPage) this.connectWalletPage.active = false;
    if (this.walletConnectLoadingPage)
      this.walletConnectLoadingPage.active = true;

    const accounts = await ethereum.request({ method: "eth_requestAccounts" });
    MenuManager.wallerAccount = accounts[0];
    console.log("the account is: !" + MenuManager.wallerAccount);

    if (this.walletConnectLoadingPage)
      this.walletConnectLoadingPage.active = false;
    if (this.gettingNFTsLoading) this.gettingNFTsLoading.active = true;
    this.node.addComponent(GetAllNFTCharacters);
  }
  // update (deltaTime: number) {
  //     // [4]
  // }

  goToCharactersPage() {
    if (!this.mainPage || !this.charactersPage) return;

    this.mainPage.active = false;
    this.charactersPage.active = true;
  }

  goToLeaderboardPage() {
    if (!this.mainPage || !this.leaderboardPage) return;

    this.mainPage.active = false;
    this.leaderboardPage.active = true;
  }

  goBackToMainPage() {
    if (!this.mainPage || !this.charactersPage || !this.leaderboardPage) return;

    this.mainPage.active = true;
    this.charactersPage.active = false;
    this.leaderboardPage.active = false;
  }
  playGame() {
    let scene = director.getScene();
    if (scene) scene.autoReleaseAssets = true;
    GameManager.tutorialActivated = false;
    director.loadScene("Game");
  }
  playTutorialGame() {
    let scene = director.getScene();
    if (scene) scene.autoReleaseAssets = true;
    GameManager.tutorialActivated = true;
    director.loadScene("Game");
  }

  getMyNftsScores() {
    MenuManager.scores = [];
    var myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
    let allNftIds: string[] = [];
    for (let i = 0; i < GetAllNFTCharacters.uris.length; i++) {
      allNftIds.push(GetAllNFTCharacters.uris[i].id + "");
    }

    let ids: number[] = [];
    for (let i = 0; i < allNftIds.length; i++) {
      ids[i] = parseInt(allNftIds[i]);
    }

    var raw = JSON.stringify({
      nftIDs: ids,
    });

    console.log(raw);

    var requestOptions = {
      method: "POST",
      headers: myHeaders,
      body: raw,
      redirect: "follow",
    };

    fetch(
      MenuManager.leaderboardServerAddress + "/v1/leaderboard/get",
      requestOptions
    )
      .then((response) => response.text())
      .then((result) => {
        console.log(result);
        let json = JSON.parse(result);
        for (let i = 0; i < json.data.scores.length; i++) {
          let scoreObj = new Score(
            json.data.scores[i].nft.id,
            json.data.scores[i].nft.icon,
            json.data.scores[i].score,
            json.data.scores[i].time,
            ""
          );

          MenuManager.scores.push(scoreObj);
        }
        this.loadPosters();
      })
      .catch((error) => console.log("error", error));
  }

  loadPosters() {
    var requestOptions = {
      method: "GET",
      redirect: "follow",
    };

    fetch(
      MenuManager.leaderboardServerAddress + "/v1/leaderboard/images",
      requestOptions
    )
      .then((response) => response.json())
      .then((result) => {
        this.postersLink = result.data;

        for (let i = 0; i < this.postersLink.length; i++) {
          var remoteUrl = this.postersLink[i];
          loader.load(remoteUrl, function (err, texture: ImageAsset) {
            console.log(texture);
            if (texture == null) return;

            // Use texture to create sprite frame
            let sp = new SpriteFrame();
            sp.texture = texture._texture;
            MenuManager.posterSprites.push(sp);
          });
        }

        setTimeout(() => {
          MenuManager.instance.setCharactersPage();
        }, 2000);
      })
      .catch((error) => console.log("error", error));
  }
}

export class Score {
  id: number = -1;
  iconSVG: string = "";
  score: number = -1;
  time: string = "";
  wallet_id: string = "";

  constructor(
    id: number,
    iconSVG: string,
    score: number,
    time: string,
    wallet_id: string
  ) {
    this.id = id;
    this.iconSVG = iconSVG;
    this.score = score;
    this.time = time;
    this.wallet_id = wallet_id;
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
