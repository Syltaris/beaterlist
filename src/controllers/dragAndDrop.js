import { beatSaverBrowserStore } from "../stores/beatSaver";
import { playlistStore } from "../stores/playlists";

import { DROPPABLE_ID as browserDroppableId } from "../components/BeatSaverBrowser/constants";
import { DROPPABLE_ID as playlistsDroppableId } from "../components/PlaylistsContainer";

export const onDragEnd = ({ destination, source }) => {
  // the only one that is required
  if (!destination || !source) {
    return;
  }
  const destIdx = destination.index;
  const sourceIdx = source.index;

  if (destination.droppableId === source.droppableId && destIdx === sourceIdx) {
    return;
  }

  // beat saver browser logic
  if (source.droppableId === browserDroppableId) {
    const destinationPlaylist = playlistStore.playlists.find(
      (p) => p.id === destination.droppableId
    );
    const songToAdd = beatSaverBrowserStore.songsList[source.index];

    if (
      destinationPlaylist.songs.find((song) => song.hash === songToAdd.hash)
    ) {
      throw Error("Song already exists in this playlist.");
    }

    destinationPlaylist.addSongBySongData(songToAdd, destIdx);
    playlistStore.saveAllPlaylists();
    return;
  }

  // playlists reordering logic
  if (
    source.droppableId === playlistsDroppableId &&
    destination.droppableId === playlistsDroppableId
  ) {
    const playlistToMove = playlistStore.playlists[source.index];
    playlistStore.movePlaylist(playlistToMove, destination.index);
    playlistStore.saveAllPlaylists();
    return;
  }

  // droppableId are playlist unique ids
  const sourcePlaylist = playlistStore.playlists.find(
    (p) => p.id === source.droppableId
  );
  // move within list
  if (destination.droppableId === source.droppableId) {
    const songToMove = sourcePlaylist.songs[sourceIdx];
    sourcePlaylist.removeSong(songToMove); // could be optimized, currently does extra search
    sourcePlaylist.insertSongAtIdx(songToMove, destIdx);
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
