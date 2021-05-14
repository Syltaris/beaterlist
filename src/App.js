import "./App.css";
import React from "react";
import store from "store";

import { Pane, Heading } from "evergreen-ui";
import PlaylistTable from "./components/PlaylistTable";
import PlaylistImporter from "./components/PlaylistImporter";

const getMapByHash = async (hash) => {
  return (await fetch(`https://beatsaver.com/api/maps/by-hash/${hash}`)).json();
};

class App extends React.Component {
  state = {
    playlists: [], // {playlistTitle, playlistAuthor, image, songs: [{hash}]}
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
    const { playlists, songCache } = this.state;
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
        {playlists.map((playlist, idx) => (
          <PlaylistTable
            key={idx}
            playlist={this.getConvertedPlaylist(playlist)}
          />
        ))}
      </Pane>
    );
  }
}

export default App;
