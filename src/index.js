import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";

import { PlaylistStoreContext, playlistStore } from "./stores/playlists";
import {
  UserPreferencesContext,
  userPreferencesStore,
} from "./stores/preferences";
import {
  BeatSaverBrowserStoreContext,
  beatSaverBrowserStore,
} from "./stores/beatSaver";

ReactDOM.render(
  <React.StrictMode>
    <PlaylistStoreContext.Provider value={playlistStore}>
      <BeatSaverBrowserStoreContext.Provider value={beatSaverBrowserStore}>
        <UserPreferencesContext.Provider value={userPreferencesStore}>
          <App />
        </UserPreferencesContext.Provider>
      </BeatSaverBrowserStoreContext.Provider>
    </PlaylistStoreContext.Provider>
  </React.StrictMode>,
  document.getElementById("root")
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
