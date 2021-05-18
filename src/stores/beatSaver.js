import { createContext } from "react";
import store from "store";

import { makeAutoObservable } from "mobx";
import { getBeatSaverMapList, getMapByHash } from "../controllers/api";

// beat saver server songs
class BeatSaverBrowserStore {
  _songsList = [];

  constructor() {
    makeAutoObservable(this);
  }

  fetchSongs = async (page, type) => {
    const resp = await getBeatSaverMapList(page, type);
    console.log(resp);
    this.songsList = resp.docs;
  };

  get songsList() {
    return this._songsList;
  }

  set songsList(songsList) {
    this._songsList = songsList;
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
