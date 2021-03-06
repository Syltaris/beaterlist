import { useContext } from "react";
import { observer } from "mobx-react-lite";
import { DragDropContext } from "react-beautiful-dnd";

import { toaster } from "evergreen-ui";
import PlaylistsContainer from "./components/PlaylistsContainer";
import BeatSaverBrowser from "./components/BeatSaverBrowser/";
import DeepPlaylistImportDialog from "./components/DeepPlaylistImportDialog";
import { UserPreferencesContext } from "./stores/preferences";
import Sidebar from "./components/Sidebar";
import TopNavbar from "./components/TopNavbar";

import { onDragEnd } from "./controllers/dragAndDrop";

import background from "./assets/background/tile.png";

const App = () => {
  const preferences = useContext(UserPreferencesContext);
  return (
    <div
      style={{
        width: "100%",
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        border: "default",
        background: `url(${background})`,
        backgroundRepeat: "repeat",
        backgroundSize: "200px 200px",
      }}
    >
      <DeepPlaylistImportDialog />

      <div
        style={{
          width: "100%",
          flexDirection: "row",
          display: "flex",
        }}
      >
        <div style={{ minWidth: 250 }}>
          <TopNavbar />
          <Sidebar />
        </div>

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
    </div>
  );
};

export default observer(App);
