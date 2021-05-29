import { useState, useContext, useEffect } from "react";
import { Playlist, PlaylistStoreContext } from "../stores/playlists";
import { beatSaverSongCache } from "../stores/beatSaver";
import { observer } from "mobx-react-lite";
import mixpanel from "mixpanel-browser";
import { JSONUncrush } from "jsoncrush";

import { Dialog, Table, Avatar, toaster, Spinner, Text } from "evergreen-ui";
import React from "react";

function removeHash() {
  if (window.location.protocol === "https:") {
    window.history.pushState(
      "",
      document.title,
      window.location.pathname + window.location.search
    );
  } else {
    window.location.hash = "";
  }
}

let playlistJson;
if (window.location.hash.includes("#importPlaylistJson=")) {
  const rawJsonString = JSONUncrush(
    decodeURIComponent(
      window.location.hash.substr(
        "#importPlaylistJson=".length,
        window.location.hash.length
      )
    )
  );
  const jsonString = JSON.parse(rawJsonString);

  // WARNING: no validation here, so anything goes
  // probably should do some simple checks, prevent attacks?
  if (Object.keys(jsonString).includes("title", "author", "songs")) {
    playlistJson = jsonString;
  }
}

const DeepPlaylistImportDialog = () => {
  const playlistStore = useContext(PlaylistStoreContext);
  // one-time, on-load logic
  const [loading, setLoading] = useState(false);
  const [playlistToAdd, setPlaylistToAdd] = useState(null);
  const [showDialog, setShowDialog] = useState(!!playlistJson);

  useEffect(() => {
    const fetchSongs = async () => {
      if (!!playlistJson) {
        setLoading(true);
        await beatSaverSongCache.retrieveMultipleSongData(
          playlistJson.songs.map((s) => s.hash)
        );
        setLoading(false);

        mixpanel.track("playlistDeepImporterOpened", {
          event_category: "playlistDeeplink",
          event_label: "playlistDeepImporterOpened",
        });

        setPlaylistToAdd(new Playlist(playlistJson, playlistStore));
      }
    };
    fetchSongs();
  }, [playlistStore]);

  return (
    <Dialog
      shouldCloseOnOverlayClick={false}
      isShown={showDialog}
      title={
        <div style={{ display: "flex", flexDirection: "column" }}>
          {`Add Playlist ${playlistJson?.title} from ${playlistJson?.author}?`}
        </div>
      }
      onCloseComplete={() => {
        setShowDialog(false);
        removeHash();
      }}
      isConfirmDisabled={loading}
      onConfirm={async () => {
        mixpanel.track("playlistDeepImporterConfirmPressed", {
          event_category: "playlistDeeplink",
          event_label: "playlistDeepImporterConfirmPressed",
        });
        playlistToAdd.id = playlistStore.getNewId();
        playlistStore.appendPlaylistToTop(playlistToAdd);

        setShowDialog(false);
        removeHash();
        toaster.success(
          `Playlist ${playlistToAdd.title} imported succesfully.`
        );
      }}
    >
      <Table maxHeight="450px" overflowY="scroll">
        <Table.Head height={42}>
          <Table.TextHeaderCell flexGrow={0} flexShrink={0} flexBasis={40}>
            Cover
          </Table.TextHeaderCell>
          <Table.TextHeaderCell>Name</Table.TextHeaderCell>
          <Table.TextHeaderCell flexGrow={0} flexShrink={0} flexBasis={130}>
            Song Author
          </Table.TextHeaderCell>
          <Table.TextHeaderCell flexGrow={0} flexShrink={0} flexBasis={130}>
            Level Author
          </Table.TextHeaderCell>
        </Table.Head>
        <Table.Body>
          {playlistToAdd?.songs.map((song) => {
            return (
              <Table.Row height={42}>
                <Table.Cell flexGrow={0} flexShrink={0} flexBasis={60}>
                  <Avatar src={song.coverURL} size={40} />
                </Table.Cell>
                <Table.TextCell>{song.name}</Table.TextCell>
                <Table.TextCell flexGrow={0} flexShrink={0} flexBasis={130}>
                  {song.songAuthor}
                </Table.TextCell>
                <Table.TextCell flexGrow={0} flexShrink={0} flexBasis={130}>
                  {song.levelAuthor}
                </Table.TextCell>
              </Table.Row>
            );
          })}
        </Table.Body>
      </Table>
      {loading && (
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "center",
          }}
        >
          <Spinner size={30} marginRight="5px" />{" "}
          <Text alignSelf="center">loading songs...please wait..</Text>
        </div>
      )}
    </Dialog>
  );
};

export default observer(DeepPlaylistImportDialog);
