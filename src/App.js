import { useContext } from "react";
import { observer } from "mobx-react-lite";
import { DragDropContext, Draggable, Droppable } from "react-beautiful-dnd";

import { Pane, Heading, Checkbox, Button } from "evergreen-ui";
import PlaylistTable from "./components/PlaylistTable";
import PlaylistImporter from "./components/PlaylistImporter";
import BeatSaverBrowser from "./components/BeatSaverBrowser";

import {
  BeatSaverBrowserStoreContext,
  PlaylistStoreContext,
} from "./stores/playlists";
import { UserPreferencesContext } from "./stores/preferences";

// TodO:
// persist config
// delete playlist?
// create playlists
// add songs by hash?
// playlist import to persist playlist
// list to list exchanges

// image for new playlist
// placeholder for empty playlist
// load in playlist browser (beat saver), to drag playlists in
// more columns, beautified difficulties
// playlist title edit collision check
// (import will need to do replacement checks)

const App = () => {
  const preferences = useContext(UserPreferencesContext);
  const horizontalMode = preferences.playlistHorizontalMode;
  const columnsToShow = preferences.playlistColumnsToShow;

  const playlistStore = useContext(PlaylistStoreContext);
  const playlists = playlistStore.playlists;

  const beatSaverBrowserSongStore = useContext(BeatSaverBrowserStoreContext);

  let filteredColumns = Object.entries(columnsToShow)
    .filter(([_, value]) => value)
    .map(([key, _]) => key);
  if (filteredColumns.length === 0) {
    filteredColumns = Object.keys(columnsToShow);
  }

  const onDragEnd = ({ destination, source }) => {
    // the only one that is required
    console.log(destination, source);
    if (!destination || !source) {
      return;
    }
    const destIdx = destination.index;
    const sourceIdx = source.index;

    // beat saver browser logic
    if (source.droppableId === "BEAT_SAVER_BROWSER") {
      const destinationPlaylist = playlistStore.playlists.find(
        (p) => p.id === destination.droppableId
      );
      const songToAdd = beatSaverBrowserSongStore.songsList[source.index];
      console.log("hiyaya", songToAdd.hash);
      destinationPlaylist.addSongBySongData(songToAdd, destIdx);
      playlistStore.saveAllPlaylists();
      return;
    }

    // playlists reordering logic
    if (
      source.droppableId === "playlists" &&
      destination.droppableId === "playlists"
    ) {
      const playlistToMove = playlistStore.playlists[source.index];
      playlistStore.movePlaylist(playlistToMove, destination.index);
      return;
    }

    if (
      destination.droppableId === source.droppableId &&
      destIdx === sourceIdx
    ) {
      return;
    }

    // droppableId are playlist unique ids
    // very kludgey, should use some id?
    const sourcePlaylist = playlistStore.playlists.find(
      (p) => p.id === source.droppableId
    );
    // move within list
    if (destination.droppableId === source.droppableId) {
      const songToMove = sourcePlaylist.songs[sourceIdx];
      sourcePlaylist.removeSong(songToMove); // could be optimized, currently does extra search
      sourcePlaylist.insertSongAtIdx(songToMove, destIdx);
      console.log("moving within", songToMove, sourceIdx, destIdx);
    } else {
      // move across list
      const destinationPlaylist = playlistStore.playlists.find(
        (p) => p.id === destination.droppableId
      );
      const songToMove = sourcePlaylist.songs[sourceIdx];
      sourcePlaylist.removeSong(songToMove);
      destinationPlaylist.insertSongAtIdx(songToMove, destIdx);
    }
    playlistStore.saveAllPlaylists();
  };

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

        <DragDropContext onDragEnd={onDragEnd}>
          <Pane>
            <BeatSaverBrowser />
          </Pane>

          <Droppable type="playlists" droppableId="playlists">
            {(provider) => (
              <>
                <Pane
                  ref={provider.innerRef}
                  width="100%"
                  height="80vh"
                  display="flex"
                  flexDirection={horizontalMode ? "row" : "column"}
                  //justifyContent="center"
                  border="default"
                  //overflowX="scroll"
                >
                  {playlists.map((playlist, idx) => (
                    <Draggable
                      draggableId={`playlist-${playlist.id}`}
                      index={idx}
                    >
                      {(provided) => (
                        <Pane
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                        >
                          <PlaylistTable
                            key={`${playlist.title}|${idx}`}
                            playlistKey={`${playlist.title}|${idx}`}
                            playlist={playlist}
                          />
                        </Pane>
                      )}
                    </Draggable>
                  ))}
                </Pane>
                {provider.placeholder}
              </>
            )}
          </Droppable>
        </DragDropContext>
      </div>
    </Pane>
  );
};

export default observer(App);
