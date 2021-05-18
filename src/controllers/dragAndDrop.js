import { beatSaverBrowserStore } from "../stores/beatSaver";
import { playlistStore } from "../stores/playlists";

export const onDragEnd = ({ destination, source }) => {
  // the only one that is required
  console.log(destination, source);
  if (!destination || !source) {
    return;
  }
  const destIdx = destination.index;
  const sourceIdx = source.index;

  if (destination.droppableId === source.droppableId && destIdx === sourceIdx) {
    return;
  }

  // beat saver browser logic
  if (source.droppableId === "BEAT_SAVER_BROWSER") {
    const destinationPlaylist = playlistStore.playlists.find(
      (p) => p.id === destination.droppableId
    );
    const songToAdd = beatSaverBrowserStore.songsList[source.index];
    console.log("hiyaya", songToAdd.hash);
    destinationPlaylist.addSongBySongData(songToAdd, destIdx);
    playlistStore.saveAllPlaylists();
    return;
  }

  // playlists reordering logic
  if (
    source.droppableId === "playlists" &&
    destination.droppableId === "playlists"
  ) {
    const playlistToMove = playlistStore.playlists[source.index];
    playlistStore.movePlaylist(playlistToMove, destination.index);
    return;
  }

  // droppableId are playlist unique ids
  // very kludgey, should use some id?
  const sourcePlaylist = playlistStore.playlists.find(
    (p) => p.id === source.droppableId
  );
  // move within list
  if (destination.droppableId === source.droppableId) {
    const songToMove = sourcePlaylist.songs[sourceIdx];
    sourcePlaylist.removeSong(songToMove); // could be optimized, currently does extra search
    sourcePlaylist.insertSongAtIdx(songToMove, destIdx);
    console.log("moving within", songToMove, sourceIdx, destIdx);
  } else {
    // move across list
    const destinationPlaylist = playlistStore.playlists.find(
      (p) => p.id === destination.droppableId
    );
    const songToMove = sourcePlaylist.songs[sourceIdx];

    if (
      destinationPlaylist.songs.find((song) => song.hash === songToMove.hash)
    ) {
      throw Error("Song already exists in this playlist.");
    }

    sourcePlaylist.removeSong(songToMove);
    destinationPlaylist.insertSongAtIdx(songToMove, destIdx);
  }
  playlistStore.saveAllPlaylists();
};
