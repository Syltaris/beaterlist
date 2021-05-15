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
  _playlistColumnsToShow = initColumnsToShow();

  constructor() {
    makeAutoObservable(this);
  }

  get playlistHorizontalMode() {
    return this._playlistsHorizontalMode;
  }
  set playlistHorizontalMode(flag) {
    this._playlistsHorizontalMode = flag;
  }

  get playlistColumnsToShow() {
    return this._playlistColumnsToShow;
  }
  set playlistColumnsToShow(columns) {
    this._playlistColumnsToShow = columns;
  }

  setPlaylistColumnToShow(key, flag) {
    this._playlistColumnsToShow[key] = flag;
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
