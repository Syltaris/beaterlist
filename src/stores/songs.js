import { beatSaverSongCache } from "./beatSaver";
import { makeAutoObservable } from "mobx";

export class Song {
  _hash = null; // unique id
  beatSaverSongObject = undefined; // data object retrieve from beat-saver server

  constructor(savedSong, songData = null) {
    makeAutoObservable(this);
    this._hash = savedSong.hash;
    if (songData === null) {
      beatSaverSongCache.getSongDataByHash(this.hash).then((songData) => {
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

  get hash() {
    return this._hash;
  }

  get coverURL() {
    return (
      this.beatSaverSongObject &&
      "https://beatsaver.com" + this.beatSaverSongObject?.coverURL
    );
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
    return Object.entries(this.beatSaverSongObject.metadata.difficulties)
      .filter(([_, flag]) => flag)
      .map(([key, _]) => key);
  }
  get nps() {
    const nps = {};
    if (!this.beatSaverSongObject) {
      return nps;
    }
    for (const difficulty of this.difficulties) {
      const charNps = [];
      for (const char of this.beatSaverSongObject.metadata.characteristics) {
        const diff = char.difficulties[difficulty];
        if (diff) {
          const calcNps =
            diff.duration === 0
              ? 0
              : Number.parseFloat(diff.notes / diff.duration).toPrecision(2);
          charNps.push({
            [char.name]: calcNps,
          });
        }
      }
      nps[difficulty] = charNps;
    }

    return nps;
  }

  get description() {
    return this.beatSaverSongObject?.description;
  }
  get duration() {
    var date = new Date(0);
    let duration = this.beatSaverSongObject?.metadata.duration;

    if (duration === 0) {
      // find from characteristics/difficulties (assumes at least 1 char?)
      // needs cleanup
      const characteristic =
        this.beatSaverSongObject?.metadata.characteristics[0];
      if (!characteristic) {
        return "?";
      }
      duration = Object.values(characteristic.difficulties).find(
        (d) => d && d.duration
      )?.duration;
    }
    // if duration can't be found anywhere
    if (!duration) {
      return "?";
    }

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
    return this.beatSaverSongObject?.stats.upVotes;
  }
  get downvotes() {
    return this.beatSaverSongObject?.stats.downVotes;
  }
  get rating() {
    return Number.parseFloat(
      this.beatSaverSongObject?.stats.rating * 100 ?? 0.0
    ).toPrecision(2);
  }
  get uploadDate() {
    return new Date(this.beatSaverSongObject?.uploaded).toLocaleDateString();
  }
  get key() {
    return this.beatSaverSongObject?.key;
  }

  asJson() {
    // only need hash, as the rest of the data can be retrieved from cache
    return {
      hash: this.hash,
    };
  }

  asBplistJson() {
    return {
      hash: this.hash,
      levelid: `custom_level_${this.hash}`,
      songName: this.beatSaverSongObject.metadata.name,
      levelAuthorName: this.beatSaverSongObject.metadata.levelAuthorName,
      difficulties: this.beatSaverSongObject.metadata.characteristics.flatMap(
        (characteristic) =>
          Object.entries(characteristic.difficulties)
            .filter(([key, value]) => value !== null)
            .map(([key, value]) => ({
              characteristic: characteristic.name,
              name: key,
            }))
      ),
    };
  }
}

/*
{
    "metadata":{
        "difficulties":{"easy":false,"normal":true,"hard":true,"expert":true,"expertPlus":false},
        "duration":0,
        "automapper":null,
        "characteristics":[
            {
                "name":"Standard",
                "difficulties": {
                    "easy":null,
                    "normal":{"duration":355.7663269042969,"length":167,"bombs":334,"notes":375,"obstacles":9,"njs":10,"njsOffset":0},
                    "hard":{"duration":355.7450866699219,"length":167,"bombs":306,"notes":480,"obstacles":3,"njs":10,"njsOffset":0},
                    "expert":{"duration":355.7450866699219,"length":167,"bombs":138,"notes":662,"obstacles":3,"njs":10,"njsOffset":0},
                    "expertPlus":null
                }
            }
        ],
        "songName":"Technologic",
        "songSubName":"Daft Punk",
        "songAuthorName":"Awfulnaut",
        "levelAuthorName":"awfulnaut",
        "bpm":127
    },
    "stats":{
        "downloads":428745,
        "plays":6632,
        "downVotes":186,
        "upVotes":9789,
        "heat":120.6632514,
        "rating":0.9512470277249632
    },
    "description":"Expert / Hard / Normal",
    "deletedAt":null,
    "_id":"5cff620e48229f7d88fc67a8",
    "key":"747",
    "name":"Technologic - Daft Punk (Update)",
    "uploader":{"_id":"5cff0b7398cc5a672c84edac","username":"awfulnaut"},
    "uploaded":"2018-06-30T18:30:38.000Z",
    "hash":"831247d7d02e948e5d03622748bb130b5057023d",
    "directDownload":"/cdn/747/831247d7d02e948e5d03622748bb130b5057023d.zip",
    "downloadURL":"/api/download/key/747",
    "coverURL":"/cdn/747/831247d7d02e948e5d03622748bb130b5057023d.jpg"
}
*/
