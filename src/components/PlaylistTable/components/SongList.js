import { useContext, useState } from "react";
import { observer } from "mobx-react-lite";

import {
  Table,
  Avatar,
  DragHandleHorizontalIcon,
  DeleteIcon,
  Dialog,
  Badge,
  toaster,
} from "evergreen-ui";
import { Draggable, Droppable } from "react-beautiful-dnd";

import { UserPreferencesContext } from "../../../stores/preferences";

import { camelCaseToWords } from "../../../utils/string";

const difficultyBadgePropsMap = {
  easy: { text: "EZ", color: "green" },
  normal: { text: "N", color: "blue" },
  hard: { text: "H", color: "yellow" },
  expert: { text: "E", color: "red" },
  expertPlus: { text: "E+", color: "purple" },
};

const getDifficultyBadge = (difficultyKey) => {
  if (!(difficultyKey in difficultyBadgePropsMap)) {
    console.error("missing difficulty key: ", difficultyKey);
    return;
  }
  const { text, color } = difficultyBadgePropsMap[difficultyKey];
  return <Badge color={color}>{text}</Badge>;
};

const getColText = (key, song) => {
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

const getTableCellPropsForCol = (key) => {
  let props = {
    flexBasis: 120,
    flexGrow: 0,
    flexShrink: 0,
  };
  if (key === "description") {
    props = {
      flexBasis: 600,
      flexGrow: 0,
      flexShrink: 0,
    };
  } else if (key === "cover") {
    props = {
      flexBasis: 60,
      flexGrow: 0,
      flexShrink: 0,
    };
  } else if (key === "hash") {
    props = {
      flexBasis: 300,
      flexGrow: 0,
      flexShrink: 0,
    };
  } else if (
    ["downloads", "plays", "upvotes", "downvotes", "rating", "key"].includes(
      key
    )
  ) {
    // small width cells
    props = {
      flexBasis: 72,
      flexGrow: 0,
      flexShrink: 0,
    };
  }

  return props;
};

const getTableCellForCol = (key, song) => {
  if (key === "cover") {
    return (
      <Table.Cell {...getTableCellPropsForCol(key)}>
        <Avatar src={song.coverURL} size={40} />
      </Table.Cell>
    );
  }

  if (key === "difficulties") {
    return (
      <Table.Cell {...getTableCellPropsForCol(key)}>
        {Object.entries(song.difficulties)
          .filter(([_, flag]) => flag)
          .map(([difficultyKey, _]) => difficultyKey)
          .sort((k1, k2) => {
            const difficultyKeys = Object.keys(difficultyBadgePropsMap);
            return difficultyKeys.indexOf(k1) - difficultyKeys.indexOf(k2);
          })
          .map((difficultyKey) => getDifficultyBadge(difficultyKey))}
      </Table.Cell>
    );
  }

  return (
    <Table.TextCell key={key} {...getTableCellPropsForCol(key)}>
      {getColText(key, song)}
    </Table.TextCell>
  );
};

const getColHeaderText = (key) => {
  // to handle special small width text
  switch (key) {
    case "upvotes":
      return "👍";
    case "downvotes":
      return "👎";
    case "downloads":
      return "💾";
    case "plays":
      return "▶️";
    case "rating":
      return "💯";
    case "key":
      return "🔑";
    default:
      return camelCaseToWords(key);
  }
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
    </Draggable>
  );
};

export const SongList = ({ playlist }) => {
  const preferences = useContext(UserPreferencesContext);
  const columnsToShow = preferences.getPlaylistColumnNamesToShow();

  const [songToRemove, setSongToRemove] = useState(null);
  return (
    <Table minWidth="300px" overflowX="scroll">
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
