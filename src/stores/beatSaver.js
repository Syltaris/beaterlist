import { createContext } from "react";
import store from "store";

import { makeAutoObservable } from "mobx";
import {
  getBeatSaverMapList,
  getMapByHash,
  searchBeatSaverMapList,
} from "../controllers/api";

export const beatSaverBrowserCategories = [
  "hot",
  "rating",
  "latest",
  "downloads",
  "plays",
];

// beat saver server songs
class BeatSaverBrowserStore {
  _songsList = [];
  _totalPages = null;
  _page = 0;
  _search = "";
  _category = beatSaverBrowserCategories[0];

  constructor() {
    makeAutoObservable(this);

    this.fetchSongs();
  }

  fetchSongs = async () => {
    let resp;
    try {
      if (this.search !== null && this.search !== "") {
        resp = await searchBeatSaverMapList(this.page, this.search);
      } else {
        resp = await getBeatSaverMapList(this.page, this.category);
      }
    } catch (err) {
      throw err;
    }
    console.log(resp);
    this.totalPages = resp.lastPage;
    this.songsList = resp.docs;
  };

  get songsList() {
    return this._songsList;
  }
  set songsList(songsList) {
    this._songsList = songsList;
  }
  get totalPages() {
    return this._totalPages;
  }
  set totalPages(totalPages) {
    this._totalPages = totalPages;
  }
  get page() {
    return this._page;
  }
  set page(page) {
    this._page = page;
  }
  get category() {
    return this._category;
  }
  set category(category) {
    if (category !== this._category) {
      this.page = 0;
    }
    this._category = category;
  }
  get search() {
    return this._search;
  }
  set search(search) {
    if (search !== this._search) {
      this.page = 0;
    }
    this._search = search;
  }
}

export const beatSaverBrowserStore = new BeatSaverBrowserStore();
export const BeatSaverBrowserStoreContext = createContext(
  beatSaverBrowserStore
);

// stores a cache of beat-saver song data
class BeatSaverSongCache {
  songCache = null;

  constructor() {
    this.songCache = store.get("songCache") ?? {}; // hash: data
  }

  manualAddSongData(data) {
    this.songCache[data.hash] = data;
    store.set("songCache", this.songCache);
  }

  async retrieveSongData(hash) {
    if (!(hash in this.songCache)) {
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
    if (!(hash in this.songCache)) {
      this.retrieveSongData(hash);
    }
    return this.songCache[hash];
  }
}

export const beatSaverSongCache = new BeatSaverSongCache();
