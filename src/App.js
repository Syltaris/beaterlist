import { useContext } from "react";
import { observer } from "mobx-react-lite";
import { DragDropContext } from "react-beautiful-dnd";

import { Pane, toaster } from "evergreen-ui";
import PlaylistsContainer from "./components/PlaylistsContainer";
import BeatSaverBrowser from "./components/BeatSaverBrowser";
import { UserPreferencesContext } from "./stores/preferences";
import Sidebar from "./components/Sidebar";
import TopNavbar from "./components/TopNavbar";

import { onDragEnd } from "./controllers/dragAndDrop";

// TodO:
// persist config
// delete playlist?
// create playlists
// add songs by hash?
// playlist import to persist playlist
// list to list exchanges
// image for new playlist
// placeholder for empty playlist
// playlist title edit collision check
// (import will need to do replacement checks)

// load in playlist browser (beat saver), to drag playlists in
// more columns, beautified difficulties

const App = () => {
  const preferences = useContext(UserPreferencesContext);
  return (
    <Pane
      width="100%"
      height="100vh"
      display="flex"
      flexDirection="column"
      alignItems="center"
      border="default"
    >
      <TopNavbar />
      <div
        style={{
          width: "100%",
          flexDirection: "row",
          display: "flex",
        }}
      >
        <Pane minWidth="300px" padding={30}>
          <Sidebar />
        </Pane>

        <DragDropContext
          onDragEnd={(props) => {
            try {
              onDragEnd(props);
            } catch (err) {
              console.error(err);
              toaster.danger(err.message);
            }
          }}
        >
          {preferences.showBeatSaverBrowser && <BeatSaverBrowser />}
          <PlaylistsContainer />
        </DragDropContext>
      </div>
    </Pane>
  );
};

export default observer(App);
