import "./App.css";
import React, { useState } from "react";

import { Pane, Heading } from "evergreen-ui";
import PlaylistTable from "./components/PlaylistTable";
import PlaylistImporter from "./components/PlaylistImporter";

const getMapByHash = async (hash) => {
  return await fetch(`https://beatsaver.com/api/maps/by-hash/${hash}`);
};

function App() {
  const [playlists, setPlaylists] = useState([]);
  return (
    <div className="App">
      <Pane
        minHeight={600}
        width="100%"
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        border="default"
      >
        <PlaylistImporter
          onImportClick={async (playlists) => {
            setPlaylists(playlists); // bplists
          }}
        />
        <Heading>Playlists</Heading>
        {playlists.map((playlist) => (
          <PlaylistTable
            key={playlist.playlistTitle}
            type={playlist.type}
            playlist={playlist.data}
          />
        ))}
      </Pane>
    </div>
  );
}

export default App;
