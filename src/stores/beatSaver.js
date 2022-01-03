import { createContext } from "react";
import store from "store";

import { makeAutoObservable } from "mobx";
import {
  getBeatSaverMapList,
  getMapById,
  getMapByHash,
  searchBeatSaverMapList,
} from "../controllers/api";
import { Song } from "./songs";

export const beatSaverBrowserCategories = ["plays", "latest"];

// beat saver server songs
class BeatSaverBrowserStore {
  _songsList = [];
  _totalPages = 5000; // Current API doesn't seem to have last page... last checked total around 4200 pages
  _page = 0;
  _search = "";
  _category = beatSaverBrowserCategories[0];
  _loading = false;

  constructor() {
    makeAutoObservable(this);

    this.fetchSongs();
  }

  fetchSongs = async () => {
    this.loading = true;
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
    this.songsList = resp.docs;
    this.loading = false;
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
  get loading() {
    return this._loading;
  }
  set loading(loading) {
    this._loading = loading;
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
    this.songCache = store.get("songCache") ?? {}; // id: data
  }

  manualAddSongData(data) {
    this.songCache[data.id] = data;
    store.set("songCache", this.songCache);
  }

  async retrieveSongData(id) {
    if (!(id in this.songCache)) {
      const resp = await getMapById(id);
      if (resp.error) return;
      this.songCache[id] = resp;
      store.set("songCache", this.songCache);
    } // else, skip (unless needs to overwrite for some reason?)
  }

  // would love to use Promise.all if no rate limit :(
  async retrieveMultipleSongData(ids, hashes, rateLimitDelay = 500) {
    const songsFound = [];
    const missingIds = [];
    for (const id of ids) {
      if (id in this.songCache) {
        songsFound.push(new Song(id, this.songCache[id]));
      } else {
        missingIds.push(id);
      }
    }
    for (const id of missingIds) {
      try {
        const resp = await getMapById(id);
        if (resp.error) continue;
        this.songCache[id] = resp;
        songsFound.push(new Song(id, resp));
      } catch (err) {
        console.error(err);
      }
      await new Promise((res) => setTimeout(res, rateLimitDelay)); // sleep
    }
    // smelly, but hashes will always miss
    for (const hash of hashes) {
      try {
        const resp = await getMapByHash(hash);
        if (resp.error) continue;
        this.songCache[resp.id] = resp;
        songsFound.push(new Song(resp.id, resp));
      } catch (err) {
        console.error(err);
        console.log("yas is error");
      }
      await new Promise((res) => setTimeout(res, rateLimitDelay)); // sleep
    }

    store.set("songCache", this.songCache);
    return songsFound;
  }

  async getSongDataById(id) {
    if (!(id in this.songCache)) {
      await this.retrieveSongData(id);
    }
    return this.songCache[id];
  }
}

export const beatSaverSongCache = new BeatSaverSongCache();
