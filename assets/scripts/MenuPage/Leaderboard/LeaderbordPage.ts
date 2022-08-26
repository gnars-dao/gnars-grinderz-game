import { _decorator, Component, Node, Prefab, instantiate } from "cc";
import { MenuManager, Score } from "../MenuManager";
import { LeaderbordItem } from "./LeaderbordItem";
const { ccclass, property } = _decorator;

@ccclass("LeaderbordPage")
export class LeaderbordPage extends Component {
  // [1]
  // dummy = '';

  // [2]
  @property(Prefab)
  leaderboardItemPrefab: Prefab | undefined;

  @property(Node)
  leaderboardItemsParent: Node | undefined;

  start() {
    // [3]

    this.showNFTs();
  }

  async showNFTs() {
    var requestOptions = {
      method: "GET",
      redirect: "follow",
    };

    fetch(
      MenuManager.leaderboardServerAddress + "/v1/leaderboard?page=0&size=30",
      requestOptions
    )
      .then((response) => response.json())
      .then((result) => {
        console.log(result);
        let leaderboardArr = result.data.leaderboard;

        for (let i = 0; i < leaderboardArr.length; i++) {
          let score = new Score(
            leaderboardArr[i].nft.id,
            leaderboardArr[i].nft.icon,
            leaderboardArr[i].score,
            leaderboardArr[i].time,
            leaderboardArr[i].wallet_id
          );

          if (!this.leaderboardItemPrefab || !this.leaderboardItemsParent)
            return;

          let item = instantiate(this.leaderboardItemPrefab);
          item.parent = this.leaderboardItemsParent;

          let leaderboardScript = item.getComponent(LeaderbordItem);
          if (leaderboardScript) leaderboardScript.set(score);
        }
      })
      .catch((error) => console.log("error", error));
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
