import { beatSaverSongCache } from "./beatSaver";

export class Song {
  _hash = null; // unique id
  beatSaverSongObject = undefined; // data object retrieve from beat-saver server

  constructor(savedSong, songData = null) {
    this._hash = savedSong.hash;
    if (songData === null) {
      this.beatSaverSongObject = beatSaverSongCache.getSongDataByHash(
        this.hash
      );
    } else {
      this.beatSaverSongObject = songData;
    }
  }

  get hash() {
    return this._hash;
  }

  get coverURL() {
    return "https://beatsaver.com" + this.beatSaverSongObject?.coverURL;
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
    return this.beatSaverSongObject?.metadata.difficulties;
  }
  get description() {
    return this.beatSaverSongObject?.description;
  }
  get duration() {
    var date = new Date(0);
    date.setSeconds(this.beatSaverSongObject?.metadata.duration); // specify value for SECONDS here
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
