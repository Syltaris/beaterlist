import { useContext } from "react";
import { observer } from "mobx-react-lite";
import { UserPreferencesContext } from "../../stores/preferences";

import Header from "./components/Header";
import SongList from "./components/SongList";

// TODO: handle json types seperately
const PlaylistTable = ({ playlist }) => {
  const userPreferences = useContext(UserPreferencesContext);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        padding: 20,
        maxWidth: userPreferences.playlistHorizontalMode ? "800px" : "100%",
      }}
    >
      <Header playlist={playlist} />
      <SongList playlist={playlist} />
    </div>
  );
};

export default observer(PlaylistTable);
