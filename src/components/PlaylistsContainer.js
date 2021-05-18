import { useContext } from "react";

import { observer } from "mobx-react-lite";

import PlaylistTable from "./PlaylistTable/";

import { UserPreferencesContext } from "../stores/preferences";
import { PlaylistStoreContext } from "../stores/playlists";

const PlaylistsContainer = () => {
  const userPreferences = useContext(UserPreferencesContext);
  const playlistStore = useContext(PlaylistStoreContext);
  return (
    <PlaylistsViewer
      userPreferences={userPreferences}
      playlistStore={playlistStore}
    />
  );
};

const PlaylistsViewer = observer(({ userPreferences, playlistStore }) => (
  <div
    style={{
      width: userPreferences.playlistHorizontalMode ? "100%" : "50%",
      height: "80vh",
      display: "flex",
      flexDirection: userPreferences.playlistHorizontalMode ? "row" : "column",
      border: "default",
    }}
  >
    {playlistStore.playlists.map((playlist, idx) => (
      <PlaylistTable
        key={`${playlist.title}|${idx}`}
        playlistKey={`${playlist.title}|${idx}`}
        playlist={playlist}
      />
    ))}
  </div>
));

export default PlaylistsContainer;
