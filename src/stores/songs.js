import { beatSaverSongCache } from "./beatSaver";
import { makeAutoObservable } from "mobx";

export class Song {
  _id = null; // unique id
  beatSaverSongObject = undefined; // data object retrieve from beat-saver server

  constructor(id, songData = null) {
    makeAutoObservable(this);
    this._id = id;
    if (songData === null) {
      beatSaverSongCache.getSongDataById(this.id).then((songData) => {
        this.beatSaverSongObject = songData;
      });
    } else {
      this.beatSaverSongObject = songData;
    }
  }

  get beatSaverSongObject() {
    return this._beatSaverSongObject;
  }
  set beatSaverSongObject(beatSaverSongObject) {
    this._beatSaverSongObject = beatSaverSongObject;
  }

  get id() {
    return this._id;
  }
  get key() {
    return this.id // for simplicity sake, since both are the same
  }
  get hash(){
    // not too sure, should be by the latest version's song hash
    return this.beatSaverSongObject?.versions[0].hash
  }

  get coverURL() {
    return  this.beatSaverSongObject?.versions[0].coverURL
  }
  get previewURL() {
    return  this.beatSaverSongObject?.versions[0].previewURL
  }
  get name() {
    return this.beatSaverSongObject?.metadata.songName;
  }
  get songAuthor() {
    return this.beatSaverSongObject?.metadata.songAuthorName;
  }
  get levelAuthor() {
    return this.beatSaverSongObject?.metadata.levelAuthorName;
  }
  get difficulties() {
    if (!this.beatSaverSongObject) {
      return [];
    }
    return this.beatSaverSongObject.versions[0].diffs // versions? assuming 1st is latest...
  }

  get description() {
    return this.beatSaverSongObject?.description;
  }
  get duration() {
    var date = new Date(0);
    let duration = this.beatSaverSongObject?.metadata.duration;
    date.setSeconds(duration); // specify value for SECONDS here
    var timeString = date.toISOString().substr(14, 5);
    return timeString;
  }

  get downloads() {
    return this.beatSaverSongObject?.stats.downloads;
  }
  get plays() {
    return this.beatSaverSongObject?.stats.plays;
  }
  get upvotes() {
    return this.beatSaverSongObject?.stats.upvotes;
  }
  get downvotes() {
    return this.beatSaverSongObject?.stats.downvotes;
  }
  get rating() {
    return Number.parseFloat(
      this.beatSaverSongObject?.stats.score * 100 ?? 0.0
    ).toPrecision(2);
  }
  get uploadDate() {
    return new Date(this.beatSaverSongObject?.uploaded).toLocaleDateString();
  }
  asJson() {
    // only need id/key, as the rest of the data can be retrieved from cache
    return {
      id: this.id,
    };
  }

  asBplistJson() {
    return {
      key: this.id,
      hash: this.hash,
      name: this.beatSaverSongObject?.name,
      uploader: this.beatSaverSongObject?.uploader.name,
    };
  }
}
  
/*
{
      "id": "ff9",
      "name": "Smooth Criminal - Michael Jackson",
      "description": "This Beat Saber track is created by Atlasik and contains only Expert+ difficulty, the expert+ difficulty is extremely hard, maybe that hard no one will even pass through it. It is possible but im not 100% sure because i didn't tried it. ( :P )",
      "uploader": {
        "id": 50421,
        "name": "atlasik",
        "uniqueSet": true,
        "hash": "5cff0b7498cc5a672c850572",
        "avatar": "https://www.gravatar.com/avatar/5cff0b7498cc5a672c850572?d=retro",
        "type": "SIMPLE"
      },
      "metadata": {
        "bpm": 120,
        "duration": 257,
        "songName": "Smooth Criminal",
        "songSubName": "Michael Jackson",
        "songAuthorName": "Atlasik",
        "levelAuthorName": "Atlasik"
      },
      "stats": {
        "plays": 1,
        "downloads": 375,
        "upvotes": 107,
        "downvotes": 625,
        "score": 0.1947
      },
      "uploaded": "2018-08-15T16:09:48Z",
      "automapper": false,
      "ranked": false,
      "qualified": false,
      "versions": [
        {
          "hash": "cb9f1581ff6c09130c991db8823c5953c660688f",
          "key": "ff9",
          "state": "Published",
          "createdAt": "2018-08-15T16:09:48Z",
          "sageScore": 4,
          "diffs": [
            {
              "njs": 10,
              "offset": 0,
              "notes": 982,
              "bombs": 197,
              "obstacles": 81,
              "nps": 3.838,
              "length": 597,
              "characteristic": "Standard",
              "difficulty": "ExpertPlus",
              "events": 1,
              "chroma": false,
              "me": false,
              "ne": false,
              "cinema": false,
              "seconds": 298.5,
              "paritySummary": {
                "errors": 373,
                "warns": 132,
                "resets": 16
              }
            }
          ],
          "downloadURL": "https://as.cdn.beatsaver.com/cb9f1581ff6c09130c991db8823c5953c660688f.zip",
          "coverURL": "https://as.cdn.beatsaver.com/cb9f1581ff6c09130c991db8823c5953c660688f.jpg",
          "previewURL": "https://as.cdn.beatsaver.com/cb9f1581ff6c09130c991db8823c5953c660688f.mp3"
        }
      ],
      "createdAt": "2018-08-15T16:09:48Z",
      "updatedAt": "2018-08-15T16:09:48Z",
      "lastPublishedAt": "2018-08-15T16:09:48Z"
    },
*/
