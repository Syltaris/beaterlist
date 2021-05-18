import { observer } from "mobx-react-lite";

import Header from "./components/Header";
import SongList from "./components/SongList";

// TODO: handle json types seperately
const PlaylistTable = ({ playlist }) => {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        padding: 20,
      }}
    >
      <Header playlist={playlist} />
      <SongList playlist={playlist} />
    </div>
  );
};

export default observer(PlaylistTable);
