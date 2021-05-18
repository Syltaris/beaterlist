import { useContext, useState } from "react";
import {
  Heading,
  Checkbox,
  Button,
  toaster,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "evergreen-ui";
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

  const [loading, setLoading] = useState(false);
  return (
    <div
      style={{
        paddingLeft: 30,
        paddingRight: 30,
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          paddingTop: 20,
          paddingBottom: 20,
        }}
      >
        <Button
          onClick={() => {
            preferences.showBeatSaverBrowser =
              !preferences.showBeatSaverBrowser;
          }}
          marginBottom="10px"
        >
          {preferences.showBeatSaverBrowser ? (
            <>
              Hide BeatSaver browser
              <ChevronLeftIcon />
            </>
          ) : (
            <>
              Show BeatSaver browser
              <ChevronRightIcon />
            </>
          )}
        </Button>
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
          isLoading={loading}
          marginBottom="10px"
          onImportClick={async (playlists) => {
            const promises = playlists.map((playlist) =>
              playlistStore.addPlaylistFromBplistData(playlist.data)
            );
            setLoading(true);
            const out = await Promise.all(promises); // can check type here
            setLoading(false);
            toaster.success(
              `Successfully imported ${out.length} playlist${
                out.length === 1 ? "" : "s"
              }.`
            );
          }}
        />
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
    </div>
  );
};

export default observer(Sidebar);
