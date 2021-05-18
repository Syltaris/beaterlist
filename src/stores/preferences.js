import { createContext } from "react";
import store from "store";
import { makeAutoObservable } from "mobx";

const bplistSongKeys = [
  "cover",
  "name",
  "songAuthor",
  "levelAuthor",
  "difficulties",
  "downloads",
  "plays",
  "upvotes",
  "downvotes",
  "rating",
  "uploadDate",
  "key",
  "hash",
  "description",
];

const initColumnsToShow = () => {
  const output = {};
  bplistSongKeys.forEach((key) => (output[key] = false));
  return output;
};

class UserPreferencesStore {
  _playlistsHorizontalMode = false;
  _playlistColumnsToShow = undefined;
  _showBeatSaverBrowser = false;

  constructor() {
    makeAutoObservable(this);
    this._playlistsHorizontalMode =
      store.get("playlistHorizontalMode") || false;
    this._playlistColumnsToShow =
      store.get("playlistColumnsToShow") || initColumnsToShow();
    this._showBeatSaverBrowser = store.get("showBeatSaverBrowser") || false;
  }

  get playlistHorizontalMode() {
    return this._playlistsHorizontalMode;
  }
  set playlistHorizontalMode(flag) {
    this._playlistsHorizontalMode = flag;
    store.set("playlistHorizontalMode", this._playlistsHorizontalMode);
  }

  get playlistColumnsToShow() {
    return this._playlistColumnsToShow;
  }
  set playlistColumnsToShow(columns) {
    this._playlistColumnsToShow = columns;
    store.set("playlistColumnsToShow", this._playlistColumnsToShow); // probably can autorun the save function
  }

  get showBeatSaverBrowser() {
    return this._showBeatSaverBrowser;
  }
  set showBeatSaverBrowser(flag) {
    this._showBeatSaverBrowser = flag;
    this._showBeatSaverBrowser = store.set(
      "showBeatSaverBrowser",
      this._showBeatSaverBrowser
    );
  }

  setPlaylistColumnToShow(key, flag) {
    this._playlistColumnsToShow[key] = flag;
    store.set("playlistColumnsToShow", this._playlistColumnsToShow);
  }
  getPlaylistColumnNamesToShow() {
    const columns = Object.entries(this._playlistColumnsToShow)
      .filter(([_, value]) => value)
      .map(([key, _]) => key);
    if (columns.length === 0) {
      return Object.keys(this._playlistColumnsToShow);
    }
    return columns;
  }
}

export const userPreferencesStore = new UserPreferencesStore();
export const UserPreferencesContext = createContext(userPreferencesStore);
