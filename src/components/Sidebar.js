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
import { saveAs } from "file-saver";
import JSZip from "jszip";

import TopNavbar from "./TopNavbar";
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
  const [exporting, setExporting] = useState(false);
  return (
    <div
      style={{
        backgroundColor: "white",
        height: "100vh",
      }}
    >
      <TopNavbar />

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          paddingTop: 20,
          paddingBottom: 20,
          paddingLeft: 30,
          paddingRight: 30,
        }}
      >
        <Button
          onClick={() => {
            window.gtag("event", "showBeatSaverBrowser", {
              event_category: "sidebarConfig",
              event_label: "showBeatSaverBrowser",
              value: !preferences.showBeatSaverBrowser,
            });
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
            window.gtag("event", "createNewPlaylist", {
              event_category: "sidebarConfig",
              event_label: "createNewPlaylist",
            });
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
            window.gtag("event", "importPlaylists", {
              event_category: "sidebarConfig",
              event_label: "importPlaylists",
              value: playlists.length,
            });
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

        <Button
          isLoading={exporting}
          onClick={async () => {
            window.gtag("event", "exportPlaylists", {
              event_category: "sidebarConfig",
              event_label: "exportPlaylists",
            });
            setExporting(true);
            const zip = new JSZip();
            playlistStore.playlists.forEach((playlist, idx) => {
              zip.file(
                `[${idx}]-${playlist.title}.bplist`,
                JSON.stringify(playlist.asBplistJson())
              );
            });
            const content = await zip.generateAsync({ type: "blob" });
            saveAs(
              content,
              `beaterlist-${new Date().toLocaleDateString()}.zip`
            );
            setExporting(false);
          }}
          marginBottom="10px"
        >
          Export all playlists
        </Button>
      </div>
      <div style={{ paddingLeft: 20, paddingRight: 20 }}>
        <Heading>Playlists Config</Heading>
        <Checkbox
          label="Horizontal Mode"
          checked={horizontalMode}
          onChange={(e) => {
            window.gtag("event", "toggleHorizontalMode", {
              event_category: "sidebarConfig",
              event_label: "toggleHorizontalMode",
              value: e.target.checked,
            });
            preferences.playlistHorizontalMode = e.target.checked;
          }}
        />

        <Heading>Columns To Show</Heading>
        {Object.keys(preferences.playlistColumnsToShow).map((key) => (
          <Checkbox
            key={key}
            label={camelCaseToWords(key)}
            checked={columnsToShow[key]}
            onChange={(e) => {
              window.gtag("event", "columnsToShow", {
                event_category: "sidebarConfig",
                event_label: "columnsToShow",
                value: JSON.stringify(columnsToShow),
              });
              preferences.setPlaylistColumnToShow(key, e.target.checked);
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default observer(Sidebar);
