import { useContext } from "react";
import { observer } from "mobx-react-lite";
import { Pane } from "evergreen-ui";
import { UserPreferencesContext } from "../../stores/preferences";

import Header from "./components/Header";
import SongList from "./components/SongList";

const PlaylistTable = ({ playlist }) => {
  const userPreferences = useContext(UserPreferencesContext);

  return (
    <Pane
      style={{
        display: "flex",
        flexDirection: "column",
        padding: 10,
        margin: 10,
        maxWidth: userPreferences.playlistHorizontalMode ? "800px" : "100%",
        borderRadius: 15,
        backgroundColor: "white",
      }}
      elevation={2}
    >
      <Header playlist={playlist} />
      <SongList playlist={playlist} />
    </Pane>
  );
};

export default observer(PlaylistTable);
