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
  set id(id) {
    this._id = id;
  }

  get image() {
    return this._image;
  }
  set image(image) {
    this._image = image;
    this.store.savePlaylist(this);
  }

  get title() {
    return this._title;
  }
  set title(title) {
    this._title = title;
    this.store.savePlaylist(this);
  }

  get author() {
    return this._author;
  }
  set author(author) {
    this._author = author;
    this.store.savePlaylist(this);
  }

  get songs() {
    return this._songs;
  }
  set songs(songs) {
    this._songs = songs;
    this.store.savePlaylist(this);
  }

  get sharableImportLink() {
    const playlistJson = this.asJson();
    delete playlistJson.id;
    delete playlistJson.image;

    const link = `${
      window.location.origin
    }/#importPlaylistJson=${encodeURIComponent(JSON.stringify(playlistJson))}`;

    return link;
  }

  delete() {
    this.store.deletePlaylist(this);
  }

  removeSong(song) {
    const idx = this._songs.indexOf(song);
    this._songs.splice(idx, 1);
    this.store.savePlaylist(this);
  }

  insertSongAtIdx(song, idx) {
    this._songs.splice(idx, 0, song);
    this.store.savePlaylist(this);
  }

  addSongByHash(songHash) {
    this.songs.push(new Song({ hash: songHash }));
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
    this.store.savePlaylist(this);

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
      this.store.savePlaylist(this);
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
  _playlists = []; // loaded Playlist instances

  constructor() {
    makeAutoObservable(this);

    const playlistIds = store.get("playlistIdsLUT");

    if (playlistIds && playlistIds.length > 0) {
      this.playlists = playlistIds.map((id) => {
        const playlistJson = store.get(id);
        return new Playlist(playlistJson, this);
      });
    }
  }

  get playlists() {
    return this._playlists;
  }
  set playlists(playlists) {
    this._playlists = playlists;
  }
  get playlistIds() {
    return this._playlistIds;
  }
  set playlistIds(playlistIds) {
    this._playlistIds = playlistIds;
  }

  getNewId() {
    const playlistIds = this.playlists.map((p) => p.id);
    let newId = uuidv4();

    while (playlistIds.includes(newId)) {
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
    return playlist;
  }

  appendPlaylistToTop(playlist) {
    this.playlists.splice(0, 0, playlist);
    this.savePlaylist(playlist);
    this.savePlaylistLUT();
  }

  deletePlaylist(playlist) {
    const idx = this._playlists.indexOf(playlist);
    this._playlists.splice(idx, 1);

    store.remove(playlist.id);
    this.savePlaylistLUT();
  }

  movePlaylist(playlist, idx) {
    this.playlists.splice(this.playlists.indexOf(playlist), 1);
    this.playlists.splice(idx, 0, playlist);

    this.savePlaylistLUT();
  }

  savePlaylistLUT() {
    store.set(
      "playlistIdsLUT",
      this.playlists.map((p) => p.id)
    );
  }

  savePlaylist(playlist) {
    const playlistJson = playlist.asJson();
    store.set(playlist.id, playlistJson);
  }

  saveAllPlaylists() {
    const playlistsJson = this._playlists.map((playlist) => playlist.asJson());
    store.set("playlists", playlistsJson);
  }

  addPlaylistFromBplistData = async (data) => {
    // do preloading here for multiple songs
    const loadedSongHashes = await beatSaverSongCache.retrieveMultipleSongData(
      data.songs.map((song) => song.hash)
    );
    const playlist = new Playlist(
      {
        id: this.getNewId(),
        image: data.image,
        title: data.playlistTitle,
        author: data.playlistAuthor,
        songs: data.songs.filter((s) => loadedSongHashes.includes(s.hash)),
      },
      this
    );
    this.appendPlaylistToTop(playlist);
  };
}

export const playlistStore = new PlaylistStore();
export const PlaylistStoreContext = createContext(playlistStore);
