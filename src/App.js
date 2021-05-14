import "./App.css";
import React from "react";
import store from "store";

import { Pane, Heading, Checkbox } from "evergreen-ui";
import PlaylistTable from "./components/PlaylistTable";
import PlaylistImporter from "./components/PlaylistImporter";

const getMapByHash = async (hash) => {
  return (await fetch(`https://beatsaver.com/api/maps/by-hash/${hash}`)).json();
};

const bplistSongKeys = ["name", "description", "difficulties"];

const initColumnsToShow = () => {
  const output = {};
  bplistSongKeys.forEach((key) => (output[key] = false));
  return output;
};

class App extends React.Component {
  state = {
    horizontalMode: false,
    playlists: [], // {playlistTitle, playlistAuthor, image, songs: [{hash}]}
    columnsToShow: initColumnsToShow(),
  };

  componentDidMount() {
    const songCache = store.get("songCache") || {}; // hash: data
    this.setState({
      songCache,
    });
  }

  getConvertedPlaylist = (playlist) => {
    const { songCache } = this.state;

    return {
      ...playlist.data,
      songs: playlist.data.songs.map((song) => songCache[song.hash]),
    };
  };

  render() {
    const { playlists, songCache, horizontalMode, columnsToShow } = this.state;

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
            onImportClick={async (playlists) => {
              // refactor this out
              let updateCache = false;
              for (const playlist of playlists) {
                for (const song of playlist.data.songs) {
                  if (!(song.hash in songCache)) {
                    // load beat saver map, save to local cache after
                    const resp = await getMapByHash(song.hash);
                    await new Promise((res) => setTimeout(res, 100)); // sleep 0.1s
                    console.log(resp);
                    updateCache = true;

                    this.setState((prevState) => {
                      let oldCache = prevState.songCache;
                      oldCache[song.hash] = resp;
                      return {
                        songCache: oldCache,
                      };
                    });
                  }
                }
              }

              if (updateCache) {
                store.set("songCache", songCache);
              }
              this.setState({ playlists }); // bplists
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
                key={playlist.data.playlistTitle + idx}
                playlist={playlist.data}
                songs={playlist.data.songs.map((song) => songCache[song.hash])}
              />
            ))}
          </Pane>
        </div>
      </Pane>
    );
  }
}

export default App;
