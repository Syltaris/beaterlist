import { useContext } from "react";
import { observer } from "mobx-react-lite";

import { Pane, Heading, Checkbox, Button } from "evergreen-ui";
import PlaylistTable from "./components/PlaylistTable";
import PlaylistImporter from "./components/PlaylistImporter";

import { PlaylistStoreContext } from "./stores/playlists";
import { UserPreferencesContext } from "./stores/preferences";

// TodO:
// persist config
// delete playlist?
// create playlists

// add songs by hash?
// list to list exchanges
// playlist import to persist playlist (import will need to do replacement checks)
// playlist title edit collision check
// load in playlist browser (beat saver), to drag playlists in
// more columns, beautified difficulties

const App = () => {
  const preferences = useContext(UserPreferencesContext);
  const horizontalMode = preferences.playlistHorizontalMode;
  const columnsToShow = preferences.playlistColumnsToShow;

  const playlistStore = useContext(PlaylistStoreContext);
  const playlists = playlistStore.playlists;

  let filteredColumns = Object.entries(columnsToShow)
    .filter(([_, value]) => value)
    .map(([key, _]) => key);
  if (filteredColumns.length === 0) {
    filteredColumns = Object.keys(columnsToShow);
  }

  return (
    <Pane
      width="100%"
      height="100vh"
      display="flex"
      flexDirection="column"
      alignItems="center"
      //justifyContent="center"
      border="default"
    >
      <Pane
        width="100%"
        height="50px"
        display="flex"
        flexDirection="row"
        justifyContent="space-between"
        alignItems="center"
        paddingLeft="20px"
        paddingRight="20px"
        paddingTop="10px"
        paddingBottom="10px"
        backgroundColor="#012548"
      >
        <Heading color="white">BeaterList</Heading>
      </Pane>
      <div
        style={{
          width: "100%",
          flexDirection: "row",
          display: "flex",
        }}
      >
        <Pane minWidth="300px" padding={30}>
          <Heading>Playlists Config</Heading>
          <Checkbox
            label="Horizontal Mode"
            checked={horizontalMode}
            onChange={(e) => {
              preferences.playlistHorizontalMode = e.target.checked;
            }}
          />

          <Heading>Columns To Show</Heading>
          {Object.keys(preferences.playlistColumnsToShow).map((key) => (
            <Checkbox
              key={key}
              label={key}
              checked={columnsToShow[key]}
              onChange={(e) =>
                preferences.setPlaylistColumnToShow(key, e.target.checked)
              }
            />
          ))}

          <PlaylistImporter
            onImportClick={async (playlists) => {
              const promises = playlists.map((playlist) =>
                playlistStore.addPlaylistFromBplistData(playlist.data)
              );
              const out = await Promise.all(promises); // can check type here
              console.log(playlists, "plist", out, promises);
            }}
          />
          <Button onClick={() => playlistStore.createNewPlaylist()}>
            Add new playlist
          </Button>
        </Pane>
        <Pane
          width="100%"
          height="80vh"
          display="flex"
          flexDirection={horizontalMode ? "row" : "column"}
          //justifyContent="center"
          border="default"
          //overflowX="scroll"
        >
          {playlists.map((playlist, idx) => (
            <PlaylistTable key={playlist.title + idx} playlist={playlist} />
          ))}
        </Pane>
      </div>
    </Pane>
  );
};

export default observer(App);
