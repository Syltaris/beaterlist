import { createContext } from "react";
import store from "store";
import { makeAutoObservable } from "mobx";

const bplistSongKeys = ["name", "description", "difficulties"];

const initColumnsToShow = () => {
  const output = {};
  bplistSongKeys.forEach((key) => (output[key] = false));
  return output;
};

export class UserPreferencesStore {
  _playlistsHorizontalMode = false;
  _playlistColumnsToShow = undefined;

  constructor() {
    makeAutoObservable(this);
    this._playlistsHorizontalMode =
      store.get("playlistHorizontalMode") || false;
    this._playlistColumnsToShow =
      store.get("playlistColumnsToShow") || initColumnsToShow();
  }

  get playlistHorizontalMode() {
    return this._playlistsHorizontalMode;
  }
  set playlistHorizontalMode(flag) {
    this._playlistsHorizontalMode = flag;
    store.set("playlistHorizontalMode", flag);
  }

  get playlistColumnsToShow() {
    return this._playlistColumnsToShow;
  }
  set playlistColumnsToShow(columns) {
    this._playlistColumnsToShow = columns;
    store.set("playlistColumnsToShow", this._playlistColumnsToShow); // probably can autorun the save function
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

export const UserPreferencesContext = createContext();
