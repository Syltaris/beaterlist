import { useContext } from "react";

import { observer } from "mobx-react-lite";

import { Pane } from "evergreen-ui";
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
  <Pane
    width="100%"
    height="80vh"
    display="flex"
    flexDirection={userPreferences.playlistHorizontalMode ? "row" : "column"}
    //justifyContent="center"
    border="default"
    //overflowX="scroll"
  >
    {playlistStore.playlists.map((playlist, idx) => (
      <Pane>
        <PlaylistTable
          key={`${playlist.title}|${idx}`}
          playlistKey={`${playlist.title}|${idx}`}
          playlist={playlist}
        />
      </Pane>
    ))}
  </Pane>
));

export default PlaylistsContainer;
