import { useState, useContext } from "react";
import { observer } from "mobx-react-lite";

import { Pane, Heading, Checkbox } from "evergreen-ui";
import PlaylistTable from "./components/PlaylistTable";
import PlaylistImporter from "./components/PlaylistImporter";

import { PlaylistStoreContext } from "./stores/playlists";

const bplistSongKeys = ["name", "description", "difficulties"];

const initColumnsToShow = () => {
  const output = {};
  bplistSongKeys.forEach((key) => (output[key] = false));
  return output;
};

// TodO:
// create playlists
// list to list exchanges
// delete playlist?
// playlist import to persist playlist (import will need to do replacement checks)
// add songs by hash?
// load in playlist browser (beat saver), to drag playlists in
// more columns, beautified difficulties
// persist config

const App = () => {
  const [horizontalMode, setHorizontalMode] = useState(false);
  const [columnsToShow, setColumnsToShow] = useState(initColumnsToShow());

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
        <PlaylistImporter
          onImportClick={(playlists) => {
            for (const playlist of playlists) {
              console.log("imp:", playlist);
              playlistStore.addPlaylistFromBplistData(playlist.data); // can check type here
            }
          }}
        />
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
              this.setState({ horizontalMode: e.target.checked });
            }}
          />

          <Heading>Columns To Show</Heading>
          {bplistSongKeys.map((key) => (
            <Checkbox
              key={key}
              label={key}
              checked={columnsToShow[key]}
              onChange={(e) => {
                this.setState((prevState) => {
                  const columnsToUpdate = prevState.columnsToShow;
                  columnsToUpdate[key] = e.target.checked;
                  return {
                    columnsToShow: columnsToUpdate,
                  };
                });
              }}
            />
          ))}
        </Pane>
        <Pane
          width="100%"
          height="80vh"
          display="flex"
          flexDirection={horizontalMode ? "row" : "column"}
          //justifyContent="center"
          border="default"
          overflowX="scroll"
        >
          {playlists.map((playlist, idx) => (
            <PlaylistTable
              columnsToShow={filteredColumns}
              key={playlist.title + idx}
              playlist={playlist}
            />
          ))}
        </Pane>
      </div>
    </Pane>
  );
};

export default observer(App);
