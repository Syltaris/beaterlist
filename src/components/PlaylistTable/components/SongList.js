import { useContext, useState } from "react";
import { observer, Observer } from "mobx-react-lite";

import {
  Table,
  DragHandleHorizontalIcon,
  DeleteIcon,
  Dialog,
  toaster,
} from "evergreen-ui";
import { Draggable, Droppable } from "react-beautiful-dnd";

import { UserPreferencesContext } from "../../../stores/preferences";

import {
  getTableCellForCol,
  getTableCellPropsForCol,
  getColHeaderText,
} from "../../../sharedUtils/playlistTable";

const DraggableRow = ({ idx, playlistId, song, onRemoveSongClick }) => {
  const preferences = useContext(UserPreferencesContext);
  const columnsToShow = preferences.getPlaylistColumnNamesToShow();
  return (
    <Draggable
      key={song.id}
      draggableId={`${playlistId}-${song.id}`}
      index={idx}
    >
      {(provided) => (
        <Observer>
          {() => (
            <Table.Row
              key={song.id}
              isSelectable
              height={42}
              ref={provided.innerRef}
              {...provided.draggableProps}
              {...provided.dragHandleProps}
            >
              <Table.Cell flexBasis={40} flexGrow={0} flexShrink={0}>
                <DragHandleHorizontalIcon />
              </Table.Cell>
              {columnsToShow.map((key) => getTableCellForCol(key, song))}
              <Table.Cell
                flexBasis={35}
                flexGrow={0}
                flexShrink={0}
                marginRight={0}
                marginLeft="auto"
              >
                <DeleteIcon onClick={() => onRemoveSongClick(song)} />
              </Table.Cell>
            </Table.Row>
          )}
        </Observer>
      )}
    </Draggable>
  );
};
export const SongList = ({ playlist }) => {
  const preferences = useContext(UserPreferencesContext);
  const columnsToShow = preferences.getPlaylistColumnNamesToShow();

  const [songToRemove, setSongToRemove] = useState(null);
  return (
    <Table minWidth="400px" overflowX="scroll">
      <Table.Head height={42}>
        <Table.HeaderCell flexBasis={40} flexGrow={0} />
        {columnsToShow.map((key) => (
          <Table.TextHeaderCell key={key} {...getTableCellPropsForCol(key)}>
            {getColHeaderText(key)}
          </Table.TextHeaderCell>
        ))}
        <Table.HeaderCell
          flexBasis={35}
          flexGrow={0}
          flexShrink={0}
          marginRight={0}
          marginLeft="auto"
        />
      </Table.Head>
      <Table.Body overflow="visible">
        <Droppable key={playlist.id} droppableId={playlist.id}>
          {(provided, snapshot) => (
            <div ref={provided.innerRef} style={{ minHeight: "40px" }}>
              <Observer>
                {() =>
                  playlist.songs.map((song, idx) => (
                    <DraggableRow
                      key={song.id}
                      idx={idx}
                      playlistId={playlist.id}
                      song={song}
                      onRemoveSongClick={(song) => setSongToRemove(song)}
                    />
                  ))
                }
              </Observer>
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </Table.Body>
      <Dialog
        isShown={!!songToRemove}
        title={`Delete ${songToRemove?.name} from ${playlist.title}?`}
        onCloseComplete={() => setSongToRemove(null)}
        onConfirm={() => {
          playlist.removeSong(songToRemove);
          setSongToRemove(null);
          toaster.success(
            `${songToRemove.name} deleted from ${playlist.title}.`
          );
        }}
        confirmLabel={"Confirm"}
        intent="danger"
      >
        This action is irreverisble!
      </Dialog>
    </Table>
  );
};

export default observer(SongList);
