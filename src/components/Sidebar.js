import { useContext } from "react";
import { Heading, Checkbox, Button, toaster } from "evergreen-ui";
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
      <div style={{ display: "flex", flexDirection: "column" }}>
        <Button
          onClick={() => {
            playlistStore.createNewPlaylist();
            toaster.success("New Playlist created.");
          }}
          marginBottom="10px"
        >
          Add new playlist
        </Button>
        <PlaylistImporter
          marginBottom="10px"
          onImportClick={async (playlists) => {
            const promises = playlists.map((playlist) =>
              playlistStore.addPlaylistFromBplistData(playlist.data)
            );
            const out = await Promise.all(promises); // can check type here
            toaster.success(
              `Successfully imported ${out.length} playlist${
                out.length === 1 ? "" : "s"
              }.`
            );
          }}
        />
        <Button
          onClick={() => {
            preferences.showBeatSaverBrowser =
              !preferences.showBeatSaverBrowser;
          }}
          marginBottom="10px"
        >
          {preferences.showBeatSaverBrowser
            ? "Hide BeatSaver browser"
            : "Show BeatSaver browser"}
        </Button>{" "}
      </div>
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
    </>
  );
};

export default observer(Sidebar);
