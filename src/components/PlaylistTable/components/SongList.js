import { useContext, useState } from "react";
import { observer } from "mobx-react-lite";

import {
  Table,
  Avatar,
  DragHandleHorizontalIcon,
  DeleteIcon,
  Dialog,
} from "evergreen-ui";
import { Draggable, Droppable } from "react-beautiful-dnd";

import { UserPreferencesContext } from "../../../stores/preferences";

const getColText = (key, song) => {
  if (!song) {
    return "";
  }
  // special cases
  switch (key) {
    case "difficulties":
      return Object.entries(song.difficulties)
        .filter(([key, value]) => value)
        .map(([key, _]) => key)
        .join(",");
    default:
      break;
  }

  // very dirty way to parse out the relevant col data
  if (key in song) {
    return song[key];
  }
};

const camelCaseToWords = (text) => {
  var result = text.replace(/([A-Z])/g, " $1");
  var finalResult = result.charAt(0).toUpperCase() + result.slice(1);
  return finalResult;
};

const DraggableRow = ({ idx, playlistId, song, onRemoveSongClick }) => {
  const preferences = useContext(UserPreferencesContext);
  const columnsToShow = preferences.getPlaylistColumnNamesToShow();
  return (
    <Draggable
      key={song.hash}
      draggableId={`${playlistId}-${song.hash}`}
      index={idx}
    >
      {(provided) => (
        <Table.Row
          key={song.hash}
          isSelectable
          height={42}
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
        >
          <Table.Cell flexBasis={40} flexGrow={0}>
            <DragHandleHorizontalIcon />
          </Table.Cell>
          <Table.Cell flexBasis={60} flexGrow={0}>
            <Avatar src={song.coverURL} size={40} />
          </Table.Cell>
          {columnsToShow.map((key) => (
            <Table.TextCell key={key}>{getColText(key, song)}</Table.TextCell>
          ))}
          <Table.Cell flexBasis={35} flexGrow={0}>
            <DeleteIcon onClick={() => onRemoveSongClick(song)} />
          </Table.Cell>
        </Table.Row>
      )}
    </Draggable>
  );
};

export const SongList = ({ playlist }) => {
  const preferences = useContext(UserPreferencesContext);
  const columnsToShow = preferences.getPlaylistColumnNamesToShow();

  const [songToRemove, setSongToRemove] = useState(null);
  return (
    <Table maxWidth="80%">
      <Table.Head height={42}>
        <Table.HeaderCell flexBasis={40} flexGrow={0} />
        <Table.HeaderCell flexBasis={60} flexGrow={0}>
          Cover
        </Table.HeaderCell>
        {columnsToShow.map((key) => (
          <Table.HeaderCell key={key}>{camelCaseToWords(key)}</Table.HeaderCell>
        ))}
      </Table.Head>
      <Table.Body display="flex">
        <Dialog
          isShown={!!songToRemove}
          title={`Delete ${songToRemove?.name} from ${playlist.title}?`}
          onCloseComplete={() => setSongToRemove(null)}
          onConfirm={() => {
            playlist.removeSong(songToRemove);
            setSongToRemove(null);
          }}
          confirmLabel={"Confirm"}
          intent="danger"
        >
          This action is irreverisble!
        </Dialog>
        <Droppable key={playlist.id} droppableId={playlist.id}>
          {(provided, snapshot) => (
            <div ref={provided.innerRef} style={{ flex: 1, minHeight: "40px" }}>
              {playlist.songs.map((song, idx) => (
                <DraggableRow
                  idx={idx}
                  playlistId={playlist.id}
                  song={song}
                  onRemoveSongClick={(song) => setSongToRemove(song)}
                />
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </Table.Body>
    </Table>
  );
};

export default observer(SongList);
