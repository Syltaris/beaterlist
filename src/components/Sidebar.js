import { useContext } from "react";
import { Heading, Checkbox, Button } from "evergreen-ui";
import { observer } from "mobx-react-lite";

import PlaylistImporter from "./PlaylistImporter";

import { UserPreferencesContext } from "../stores/preferences";

import { PlaylistStoreContext } from "../stores/playlists";

import { camelCaseToWords } from "../utils/string";

export const Sidebar = () => {
  const preferences = useContext(UserPreferencesContext);
  const horizontalMode = preferences.playlistHorizontalMode;
  const columnsToShow = preferences.playlistColumnsToShow;

  const playlistStore = useContext(PlaylistStoreContext);
  return (
    <>
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
          label={camelCaseToWords(key)}
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
    </>
  );
};

export default observer(Sidebar);
