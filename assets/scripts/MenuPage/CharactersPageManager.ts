import { _decorator, Component, Node, Prefab, instantiate } from "cc";
import { CharacterCard } from "./CharacterCard";
import { GetAllNFTCharacters } from "./GetAllNFTCharacters";
const { ccclass, property } = _decorator;

@ccclass("CharactersPageManager")
export class CharactersPageManager extends Component {
    static instance :CharactersPageManager
  static selectedCard: number = 0;
  // [1]
  // dummy = '';
  allCards: CharacterCard[] = [];

  // [2]
  @property(Prefab)
  characterCardPrefab: Prefab | undefined;

  @property(Node)
  cardsParentObject: Node | undefined;
  
  onLoad(){
  CharactersPageManager.instance=this

  }

  start() {
    // [3]
  }

  setCards() {
    for (let i = 0; i < GetAllNFTCharacters.uris.length; i++) {
      if (this.characterCardPrefab && this.cardsParentObject) {
        let card = instantiate(this.characterCardPrefab);
        card.parent = this.cardsParentObject;

        if (GetAllNFTCharacters.uris[i].img != undefined) {
          let cardClass = card.getComponent(CharacterCard);
          if (cardClass) {
            this.allCards.push(cardClass);
            cardClass.Set(
              GetAllNFTCharacters.uris[i].img,
              GetAllNFTCharacters.uris[i].name,
              i
            );
          }
        }
      }
    }
  }

  updateAllCards() {
    for (let i = 0; i < this.allCards.length; i++) {
      this.allCards[i].updateCard();
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
