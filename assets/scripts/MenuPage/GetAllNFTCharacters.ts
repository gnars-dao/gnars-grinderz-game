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
  Vec3,
} from "cc";
import Web3 from "web3/dist/web3.min.js";

import * as abiModule from "../abi/abi";
import { MenuManager } from "./MenuManager";
const { ccclass, property } = _decorator;

const abi = abiModule.default;
var ownerAddress = "";
// const contractAddress = "0x270671D530F58158Cf0B5Edc956AF59fcebb9761"; // rinkeby
const contractAddress = "0x494715B2a3C75DaDd24929835B658a1c19bd4552"; // mainnet

// console.log(Web3);

var web3 = new Web3(
  new Web3.providers.WebsocketProvider(
    // "wss://rinkeby.infura.io/ws/v3/991fec2f08fd429ab31cdc05b3971945" // rinkeby
    "wss://speedy-nodes-nyc.moralis.io/5f7b3ba1e8c6d2f6f768edf3/eth/mainnet/ws"
  )
  // new Web3.providers.HttpProvider("") // For http rpc
);

var myContract = new web3.eth.Contract(abi, contractAddress);

@ccclass("GetAllNFTCharacters")
export class GetAllNFTCharacters extends Component {
  static uris: UriObject[] = [];
  // [1]
  // dummy = '';

  // [2]
  @property(Sprite)
  sprite: Sprite | undefined;

  onLoad() {
    let spriteObject = new Node();
    spriteObject.position = new Vec3(-1000, -1000);
    this.sprite = spriteObject.addComponent(Sprite);
  }

  start() {
    ownerAddress = MenuManager.wallerAccount;
    // [3]
    console.log("started fetching images");
    let b64 = "";
    myContract.methods
      .balanceOf(ownerAddress)
      .call()
      .then(async (count: number) => {
        console.log("the count is: " + count);
        if (count == 0) {
          if (
            MenuManager.instance.gettingNFTsLoading &&
            MenuManager.instance.noNFTsPage
          ) {
            MenuManager.instance.gettingNFTsLoading.active = false;
            MenuManager.instance.noNFTsPage.active = true;
          }
        }

        let ids = [];
        for (let i = 0; i < count; i++) {
          let id = -1;
          id = await myContract.methods
            .tokenOfOwnerByIndex(ownerAddress, i)
            .call()
            .catch((err: any) => console.log(err));
          let uri = await myContract.methods
            .tokenURI(id)
            .call()
            .catch((err: any) => console.log(err));
          if (id != -1) {
            ids.push(id);

            uri = JSON.parse(
              //   Buffer.from(
              //     uri.replace("data:application/json;base64,", ""),
              //     "base64"
              //   ).toString()
              Base64.decode(uri.replace("data:application/json;base64,", ""))
            );
            // uri.image = Buffer.from(
            //   uri.image.replace("data:image/svg+xml;base64,", ""),
            //   "base64"
            // )
            //   .toString()
            //   .replace(/100%/g, "0%");

            // console.log('before change: ',uri.image);

            let uriObject = new UriObject();
            uriObject.name = uri.name;
            uriObject.id = id;

            uri.image = Base64.decode(
              uri.image.replace("data:image/svg+xml;base64,", "")
            ).replace(/100%/g, "0%");
            b64 = "data:image/svg+xml;base64," + Base64.encode(uri.image);

            // console.log('after change: ',b64);

            console.log("got nft #" + i + " the count is :" + count);
            console.log(uri);

            uriObject.imageSVG = b64;
            if (this.sprite == null) return;
            base64SvgToBase64Png(b64, 512, this.sprite).then((result) => {
              console.log(result);

              //sprite is the cc.Sprite component you wish to display the image on

              uriObject.img = <SpriteFrame>result;
              GetAllNFTCharacters.uris.push(uriObject);
              if (GetAllNFTCharacters.uris.length == count) {
                console.log("finished adding NFTs");

                MenuManager.instance.getMyNftsScores();
              }
            });
          }
        }

        console.log(GetAllNFTCharacters.uris);
        console.log(
          "---------------------------------------------------------"
        );
      })
      .catch((err: any) => {
        console.log(err);
      });
  }

  // update (deltaTime: number) {
  //     // [4]
  // }
}

export function base64SvgToBase64Png(
  originalBase64: string,
  width: number,
  sprite: Sprite
) {
  return new Promise((resolve) => {
    let img = document.createElement("img");
    img.onload = function () {
      document.body.appendChild(img);
      let canvas = document.createElement("canvas");
      let ratio = img.clientWidth / img.clientHeight || 1;
      document.body.removeChild(img);
      canvas.width = width;
      canvas.height = width / ratio;
      let ctx = canvas.getContext("2d");
      if (ctx == null) return;
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      try {
        let data = canvas.toDataURL("image/png");

        /////////////////////////////////////////////////////////////////

        //Draw on canvas what you want...

        const texture = new Texture2D();

        sprite.spriteFrame = new SpriteFrame();
        sprite.spriteFrame.texture = texture;

        sprite.spriteFrame.rect = new math.Rect(
          0,
          0,
          canvas.width,
          canvas.height
        );
        texture.image = new ImageAsset(canvas);
        /////////////////////////////////////////////////////////////////

        resolve(sprite.spriteFrame);
      } catch (e) {
        resolve(null);
      }
    };
    img.src = originalBase64;
  });
}

const _keyStr: string =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";

/**
 * utf8的编码
 *
 * @param {string} str
 * @returns
 */
function _utf8_encode(str: string) {
  str = str.replace(/\r\n/g, "\n");
  let utftext = "";

  for (let n = 0; n < str.length; n++) {
    let c = str.charCodeAt(n);

    if (c < 128) {
      utftext += String.fromCharCode(c);
    } else if (c > 127 && c < 2048) {
      utftext += String.fromCharCode((c >> 6) | 192);
      utftext += String.fromCharCode((c & 63) | 128);
    } else {
      utftext += String.fromCharCode((c >> 12) | 224);
      utftext += String.fromCharCode(((c >> 6) & 63) | 128);
      utftext += String.fromCharCode((c & 63) | 128);
    }
  }

  return utftext;
}

/**
 * utf8的解码
 *
 * @param {string} str
 * @returns
 */
function _utf8_decode(utftext: string) {
  let str = "";
  let i = 0;
  let c = 0;
  let c1 = 0;
  let c2 = 0;
  let c3 = 0;
  while (i < utftext.length) {
    c = utftext.charCodeAt(i);
    if (c < 128) {
      str += String.fromCharCode(c);
      i++;
    } else if (c > 191 && c < 224) {
      c2 = utftext.charCodeAt(i + 1);
      str += String.fromCharCode(((c & 31) << 6) | (c2 & 63));
      i += 2;
    } else {
      c2 = utftext.charCodeAt(i + 1);
      c3 = utftext.charCodeAt(i + 2);
      str += String.fromCharCode(
        ((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63)
      );
      i += 3;
    }
  }
  return str;
}

class Base64 {
  /**
   *
   * base64的编码
   * @static
   * @param {string} input
   * @returns
   * @memberof Base64
   */
  static encode(input: string) {
    let output = "";
    let chr1, chr2, chr3, enc1, enc2, enc3, enc4;
    let i = 0;
    input = _utf8_encode(input);
    while (i < input.length) {
      chr1 = input.charCodeAt(i++);
      chr2 = input.charCodeAt(i++);
      chr3 = input.charCodeAt(i++);
      enc1 = chr1 >> 2;
      enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
      enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
      enc4 = chr3 & 63;

      if (isNaN(chr2)) {
        enc3 = enc4 = 64;
      } else if (isNaN(chr3)) {
        enc4 = 64;
      }
      output =
        output +
        _keyStr.charAt(enc1) +
        _keyStr.charAt(enc2) +
        _keyStr.charAt(enc3) +
        _keyStr.charAt(enc4);
    }
    return output;
  }

  /**
   *
   * base64的解码
   * @static
   * @param {string} input
   * @returns
   * @memberof Base64
   */
  static decode(input: string) {
    let output = "";
    let chr1, chr2, chr3;
    let enc1, enc2, enc3, enc4;
    let i = 0;
    input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");
    while (i < input.length) {
      enc1 = _keyStr.indexOf(input.charAt(i++));
      enc2 = _keyStr.indexOf(input.charAt(i++));
      enc3 = _keyStr.indexOf(input.charAt(i++));
      enc4 = _keyStr.indexOf(input.charAt(i++));
      chr1 = (enc1 << 2) | (enc2 >> 4);
      chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
      chr3 = ((enc3 & 3) << 6) | enc4;
      output = output + String.fromCharCode(chr1);
      if (enc3 != 64) {
        output = output + String.fromCharCode(chr2);
      }
      if (enc4 != 64) {
        output = output + String.fromCharCode(chr3);
      }
    }
    output = _utf8_decode(output);
    return output;
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

class UriObject {
  img: SpriteFrame = new SpriteFrame();
  name: string = "";
  imageSVG: string = "";
  id: number = 0;
}
