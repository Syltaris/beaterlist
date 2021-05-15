import { createContext } from "react";
import store from "store";
import { makeAutoObservable } from "mobx";

// move api calls to another file
const getMapByHash = async (hash) => {
  return (await fetch(`https://beatsaver.com/api/maps/by-hash/${hash}`)).json();
};

// stores a cache of beat-saver song data
export class BeatSaverSongCache {
  songCache = null;

  constructor() {
    this.songCache = store.get("songCache") ?? {}; // hash: data
  }

  async retrieveSongData(hash) {
    if (!hash in this.songCache) {
      const resp = await getMapByHash(hash);
      this.songCache[hash] = resp;
    } // else, skip (unless needs to overwrite for some reason?)

    store.set("songCache", this.songCache);
  }

  // would love to use Promise.all if no rate limit :(
  async retrieveMultipleSongData(hashes, rateLimitDelay = 100) {
    const missingHashes = hashes.filter((hash) => !hash in this.songCache);
    for (const hash of missingHashes) {
      const resp = await getMapByHash(hash);
      await new Promise((res) => setTimeout(res, rateLimitDelay)); // sleep
      this.songCache[hash] = resp;
    }

    store.set("songCache", this.songCache);
  }

  getSongDataByHash(hash) {
    if (!hash in this.songCache) {
      this.retrieveSongData(hash);
    }
    return this.songCache[hash];
  }
}

export const beatSaverSongCache = new BeatSaverSongCache();

export class PlaylistStore {
  playlists = [];

  constructor() {
    makeAutoObservable(this);

    const savedPlaylists = store.get("playlists");
    if (savedPlaylists) {
      const playlists = [];
      for (const playlist in savedPlaylists) {
        playlists.push(new Playlist(playlist)); // converts json to Playlist objects
      }
      this.playlists = playlists;
    }
  }

  addPlaylistFromBplistData(data) {
    const playlist = new Playlist({
      image: data.image,
      title: data.playlistTitle,
      author: data.playlistAuthor,
      songs: data.songs,
    });
    this.playlists.push(playlist);
  }
}

export const PlaylistStoreContext = createContext();

export class Playlist {
  _image = ""; // base64
  _title = "";
  _author = "";
  _songs = []; // array of Songs

  constructor(savedPlaylist) {
    makeAutoObservable(this);
    this.image = savedPlaylist.image;
    this.title = savedPlaylist.title;
    this.author = savedPlaylist.author;
    this.songs = savedPlaylist.songs.map((song) => new Song(song));
  }

  get image() {
    return this._image;
  }
  set image(image) {
    this._image = image;
  }

  get title() {
    return this._title;
  }
  set title(title) {
    this._title = title;
  }

  get author() {
    return this._author;
  }
  set author(author) {
    this._author = author;
  }

  get songs() {
    return this._songs;
  }
  set songs(songs) {
    this._songs = songs;
  }

  asBplistJson() {
    return {
      image: this.image,
      playlistTitle: this.title,
      playlistAuthor: this.author,
      songs: this.songs.map((song) => song.asJson()),
    };
  }
}

export class Song {
  hash = null; // unique id
  beatSaverSongObject = null; // data object retrieve from beat-saver server

  constructor(savedSong) {
    this.hash = savedSong.hash;
    this.beatSaverSongObject = beatSaverSongCache.getSongDataByHash(this.hash);
  }

  get name() {
    return this.beatSaverSongObject.metadata.songName;
  }
  get author() {
    return this.beatSaverSongObject.metadata.songAuthorName;
  }
  get levelAuthor() {
    return this.beatSaverSongObject.metadata.levelAuthorName;
  }
  get difficulties() {
    return this.beatSaverSongObject.metadata.difficulties;
  }
  get description() {
    return this.beatSaverSongObject.description;
  }

  asJson() {
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
