import { useContext } from "react";
import { observer, Observer } from "mobx-react-lite";
import { Droppable, Draggable } from "react-beautiful-dnd";

import PlaylistTable from "./PlaylistTable/";

import { UserPreferencesContext } from "../stores/preferences";
import { PlaylistStoreContext } from "../stores/playlists";

export const DROPPABLE_ID = "PLAYLIST";

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

const PlaylistsViewer = observer(({ userPreferences, playlistStore }) => {
  const horizontalMode = userPreferences.playlistHorizontalMode;
  return (
    <Droppable
      droppableId={DROPPABLE_ID}
      type={DROPPABLE_ID}
      direction={horizontalMode ? "horizontal" : "vertical"}
    >
      {(provided) => (
        <>
          <div
            ref={provided.innerRef}
            style={{
              width: horizontalMode ? "100%" : "100%",
              minWidth: "600px",
              height: "100vh",

              display: "flex",
              flexDirection: horizontalMode ? "row" : "column",
              border: "default",
              overflowX: "scroll",
            }}
          >
            <Observer>
              {() =>
                playlistStore.playlists.map((playlist, idx) => (
                  <Draggable
                    key={playlist.id}
                    draggableId={playlist.id}
                    index={idx}
                  >
                    {(provided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                      >
                        <PlaylistTable
                          key={`${playlist.title}|${idx}`}
                          playlistKey={`${playlist.title}|${idx}`}
                          playlist={playlist}
                        />
                      </div>
                    )}
                  </Draggable>
                ))
              }
            </Observer>
          </div>
          {provided.placeholder}
        </>
      )}
    </Droppable>
  );
});

export default PlaylistsContainer;
