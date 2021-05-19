import { createContext } from "react";
import store from "store";
import { makeAutoObservable } from "mobx";
import { v4 as uuidv4 } from "uuid";

import { Song } from "./songs";
import { beatSaverSongCache } from "./beatSaver";
import { getMapByKey } from "../controllers/api";

export class Playlist {
  _id = null;
  _image = null; // base64
  _title = "";
  _author = "";
  _songs = []; // array of Songs

  store = undefined;

  constructor(savedPlaylist, store) {
    makeAutoObservable(this);
    this._id = savedPlaylist.id; // custom id
    this._image = savedPlaylist.image;
    this._title = savedPlaylist.title;
    this._author = savedPlaylist.author;
    this._songs = savedPlaylist.songs.map((song) => new Song(song));
    this.store = store;
  }

  get id() {
    return this._id;
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
    const idx = this._songs.indexOf(song);
    this._songs.splice(idx, 1);
  }

  insertSongAtIdx(song, idx) {
    this._songs.splice(idx, 0, song);
  }

  async addSongByKey(songKey) {
    /* try to find song in beat-saver
     if have, save the data, and the song, save the playlist after
     if not, do nothing
     */
    let songData;
    try {
      const resp = await getMapByKey(songKey);
      songData = await resp.json();
    } catch (err) {
      throw Error(`Could not retreive song with key: ${songKey}`);
    }

    const duplicateSong = this._songs.find(
      (song) => song.hash === songData.hash
    );
    if (duplicateSong) {
      throw Error("Song already exists in playlist.");
    }

    beatSaverSongCache.manualAddSongData(songData);
    this.songs.push(new Song({ hash: songData.hash }));
    this.store.saveAllPlaylists(); // quite expensive, should only save itself in the future

    return songData;
  }

  async addSongBySongData(songData, idx = undefined) {
    const hash = songData.hash;
    if (idx === undefined) {
      idx = this._songs.length;
    }
    try {
      if (this._songs.find((s) => s.hash === hash)) {
        return; // should show some dup error
      }
      beatSaverSongCache.manualAddSongData(songData);
      this._songs.splice(idx, 0, new Song({ hash })); // let Song handle fetching
      this.store.saveAllPlaylists(); // quite expensive, should only save itself in the future
    } catch (err) {
      throw err;
    }
  }

  asJson() {
    return {
      id: this._id,
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

class PlaylistStore {
  _playlists = [];

  constructor() {
    makeAutoObservable(this);

    const savedPlaylists = store.get("playlists");
    if (savedPlaylists) {
      const playlists = [];
      for (const playlist of savedPlaylists) {
        playlists.push(new Playlist(playlist, this)); // converts json to Playlist objects
      }
      this._playlists = playlists;
    }
  }

  get playlists() {
    return this._playlists;
  }

  getNewId() {
    const allIds = [this._playlists.map((p) => p.id)];
    let newId = uuidv4();

    while (allIds.includes(newId)) {
      newId = uuidv4();
    }

    return newId;
  }

  createNewPlaylist() {
    const playlist = new Playlist(
      {
        id: this.getNewId(),
        image: null,
        title: "New Playlist",
        author: "Beaterlist",
        songs: [],
      },
      this
    );
    this.appendPlaylistToTop(playlist);
  }

  appendPlaylistToTop(playlist) {
    this._playlists.splice(0, 0, playlist);
    this.saveAllPlaylists();
  }

  deletePlaylist(playlist) {
    const idx = this._playlists.indexOf(playlist);
    this._playlists.splice(idx, 1);
    this.saveAllPlaylists();
  }

  movePlaylist(playlist, idx) {
    this._playlists.splice(this._playlists.indexOf(playlist), 1);
    this._playlists.splice(idx, 0, playlist);
    this.saveAllPlaylists();
  }

  saveAllPlaylists() {
    const playlistsJson = this._playlists.map((playlist) => playlist.asJson());
    store.set("playlists", playlistsJson);
  }

  addPlaylistFromBplistData = async (data) => {
    // do preloading here for multiple songs
    await beatSaverSongCache.retrieveMultipleSongData(
      data.songs.map((song) => song.hash)
    );
    const playlist = new Playlist(
      {
        id: this.getNewId(),
        image: data.image,
        title: data.playlistTitle,
        author: data.playlistAuthor,
        songs: data.songs,
      },
      this
    );
    this.appendPlaylist(playlist);
  };
}

export const playlistStore = new PlaylistStore();
export const PlaylistStoreContext = createContext(playlistStore);
