import { useContext } from "react";
import { observer } from "mobx-react-lite";
import { DragDropContext } from "react-beautiful-dnd";

import { toaster } from "evergreen-ui";
import PlaylistsContainer from "./components/PlaylistsContainer";
import BeatSaverBrowser from "./components/BeatSaverBrowser/";
import { UserPreferencesContext } from "./stores/preferences";
import Sidebar from "./components/Sidebar";

import { onDragEnd } from "./controllers/dragAndDrop";

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
        backgroundColor: "#f9f9f9",
      }}
    >
      <div
        style={{
          width: "100%",
          flexDirection: "row",
          display: "flex",
        }}
      >
        <div style={{ minWidth: 250 }}>
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
