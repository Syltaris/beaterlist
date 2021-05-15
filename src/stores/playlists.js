import { createContext } from "react";
import store from "store";
import { makeAutoObservable } from "mobx";

// move api calls to another file
const getMapByHash = async (hash) => {
  return (await fetch(`https://beatsaver.com/api/maps/by-hash/${hash}`)).json();
};

const getMapByKey = async (songKey) => {
  return await fetch(`https://beatsaver.com/api/maps/detail/${songKey}`);
};

// stores a cache of beat-saver song data
export class BeatSaverSongCache {
  songCache = null;

  constructor() {
    this.songCache = store.get("songCache") ?? {}; // hash: data
  }

  manualAddSongData(data) {
    this.songCache[data.hash] = data;
    store.set("songCache", this.songCache);
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
    const missingHashes = hashes.filter((hash) => !(hash in this.songCache));
    console.log("getting hashes", missingHashes);
    for (const hash of missingHashes) {
      console.log("getting from beat-saver server ", hash);
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
      for (const playlist of savedPlaylists) {
        playlists.push(new Playlist(playlist, this)); // converts json to Playlist objects
      }
      this.playlists = playlists;
    }
  }

  createNewPlaylist() {
    const playlist = new Playlist(
      {
        image: "",
        title: "New Playlist",
        author: "Beaterlist",
        songs: [],
      },
      this
    );
    this.playlists.push(playlist);
    this.saveAllPlaylists();
  }

  deletePlaylist(playlist) {
    const idx = this.playlists.indexOf(playlist);
    this.playlists.splice(idx, 1);
    this.saveAllPlaylists();
  }

  saveAllPlaylists() {
    const playlistsJson = this.playlists.map((playlist) => playlist.asJson());
    store.set("playlists", playlistsJson);
  }

  addPlaylistFromBplistData = async (data) => {
    // do preloading here for multiple songs
    await beatSaverSongCache.retrieveMultipleSongData(
      data.songs.map((song) => song.hash)
    );
    const playlist = new Playlist(
      {
        image: data.image,
        title: data.playlistTitle,
        author: data.playlistAuthor,
        songs: data.songs,
      },
      this
    );
    this.playlists.push(playlist);

    this.saveAllPlaylists();
  };
}

export const PlaylistStoreContext = createContext();

export class Playlist {
  _image = ""; // base64
  _title = "";
  _author = "";
  _songs = []; // array of Songs

  store = undefined;

  constructor(savedPlaylist, store) {
    makeAutoObservable(this);
    this._image = savedPlaylist.image;
    this._title = savedPlaylist.title;
    this._author = savedPlaylist.author;
    this._songs = savedPlaylist.songs.map((song) => new Song(song));
    this.store = store;
  }

  get image() {
    return this._image;
  }
  set image(image) {
    this._image = image;
    this.store.saveAllPlaylists(); // quite expensive, should only save itself in the future
  }

  get title() {
    return this._title;
  }
  set title(title) {
    this._title = title;
    this.store.saveAllPlaylists(); // quite expensive, should only save itself in the future
  }

  get author() {
    return this._author;
  }
  set author(author) {
    this._author = author;
    this.store.saveAllPlaylists(); // quite expensive, should only save itself in the future
  }

  get songs() {
    return this._songs;
  }
  set songs(songs) {
    this._songs = songs;
    this.store.saveAllPlaylists(); // quite expensive, should only save itself in the future
  }

  delete() {
    this.store.deletePlaylist(this);
  }

  removeSong(song) {
    const idx = this.songs.indexOf(song);
    this.songs.splice(idx, 1);
  }

  async addSongByKey(songKey) {
    // try to find song in beat-saver
    // if have, save the data, and the song, save the playlist after
    // if not, do nothing
    try {
      const resp = await getMapByKey(songKey);
      const songData = await resp.json();
      console.log(songData);
      const duplicateSong = this.songs.find(
        (song) => song.hash === songData.hash
      );
      if (duplicateSong) {
        return; // should show some error here tho
      }
      beatSaverSongCache.manualAddSongData(songData);
      this._songs.push(new Song({ hash: songData.hash }));
      this.store.saveAllPlaylists(); // quite expensive, should only save itself in the future
    } catch (err) {
      throw err;
    }
  }

  asJson() {
    return {
      image: this.image,
      title: this.title,
      author: this.author,
      songs: this.songs.map((song) => song.asJson()),
    };
  }

  asBplistJson() {
    return {
      image: this.image,
      playlistTitle: this.title,
      playlistAuthor: this.author,
      songs: this.songs.map((song) => song.asBplistJson()),
    };
  }
}

export class Song {
  hash = null; // unique id
  beatSaverSongObject = undefined; // data object retrieve from beat-saver server

  constructor(savedSong) {
    this.hash = savedSong.hash;
    this.beatSaverSongObject = beatSaverSongCache.getSongDataByHash(this.hash);
  }

  get name() {
    return this.beatSaverSongObject?.metadata.songName;
  }
  get author() {
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
  get coverURL() {
    return "https://beatsaver.com" + this.beatSaverSongObject?.coverURL;
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
