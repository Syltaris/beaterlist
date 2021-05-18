import { observer } from "mobx-react-lite";
import { DragDropContext } from "react-beautiful-dnd";

import { Pane } from "evergreen-ui";
import PlaylistsContainer from "./components/PlaylistsContainer";
import BeatSaverBrowser from "./components/BeatSaverBrowser";
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

        <DragDropContext onDragEnd={onDragEnd}>
          <Pane>
            <BeatSaverBrowser />
          </Pane>

          <PlaylistsContainer />
        </DragDropContext>
      </div>
    </Pane>
  );
};

export default observer(App);
