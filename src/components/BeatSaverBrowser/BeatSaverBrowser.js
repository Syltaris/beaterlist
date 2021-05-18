import { useState, useEffect, useContext } from "react";
import { observer } from "mobx-react-lite";

import {
  Table,
  Text,
  DragHandleHorizontalIcon,
  Pane,
  Heading,
} from "evergreen-ui";
import { Draggable, Droppable } from "react-beautiful-dnd";

import { BeatSaverBrowserStoreContext } from "../../stores/beatSaver";
import { UserPreferencesContext } from "../../stores/preferences";

import {
  getTableCellForCol,
  getTableCellPropsForCol,
  getColHeaderText,
} from "../../sharedUtils/playlistTable";
import { Song } from "../../stores/songs";

const BeatSaverBrowser = () => {
  const [page, setPage] = useState(0);
  const songStore = useContext(BeatSaverBrowserStoreContext);
  const songsList = songStore.songsList;

  useEffect(() => songStore.fetchSongs(page, "plays"), [page]);

  const preferences = useContext(UserPreferencesContext);
  const columnsToShow = preferences.getPlaylistColumnNamesToShow();

  return (
    <Pane maxWidth="600px">
      <Heading marginTop="10px" marginBottom="10px">
        BeatSaver Browser
      </Heading>
      <Text>Drag songs from here to your playlists to add songs directly.</Text>
      <Table minWidth="400px" overflowX="scroll">
        <Table.Head height={42}>
          <Table.HeaderCell flexBasis={40} flexGrow={0} />
          {columnsToShow.map((key) => (
            <Table.TextHeaderCell key={key} {...getTableCellPropsForCol(key)}>
              {getColHeaderText(key)}
            </Table.TextHeaderCell>
          ))}
        </Table.Head>
        <Droppable droppableId="BEAT_SAVER_BROWSER" isDropDisabled={true}>
          {(provided, snapshot) => (
            <Table.Body
              display="flex"
              flexDirection="column"
              ref={provided.innerRef}
            >
              {songsList.map((songData, idx) => (
                <Draggable
                  key={songData.hash}
                  draggableId={`browser-${songData.hash}`}
                  index={idx}
                >
                  {(provided, snapshot) => (
                    <Table.Row
                      height={40}
                      key={songData.hash}
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                    >
                      <Table.Cell flexBasis={40} flexGrow={0} flexShrink={0}>
                        <DragHandleHorizontalIcon />
                      </Table.Cell>
                      {columnsToShow.map((key) =>
                        getTableCellForCol(
                          key,
                          new Song(songData.hash, songData)
                        )
                      )}
                    </Table.Row>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </Table.Body>
          )}
        </Droppable>
      </Table>
    </Pane>
  );
};

export default observer(BeatSaverBrowser);
