import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";

import { PlaylistStoreContext, PlaylistStore } from "./stores/playlists";
import {
  UserPreferencesContext,
  UserPreferencesStore,
} from "./stores/preferences";

ReactDOM.render(
  <React.StrictMode>
    <PlaylistStoreContext.Provider value={new PlaylistStore()}>
      <UserPreferencesContext.Provider value={new UserPreferencesStore()}>
        <App />
      </UserPreferencesContext.Provider>
    </PlaylistStoreContext.Provider>
  </React.StrictMode>,
  document.getElementById("root")
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
