import { useContext } from "react";
import { observer, Observer } from "mobx-react-lite";

import {
  Table,
  Text,
  Pane,
  Heading,
  Pagination,
  SearchInput,
  Select,
  Spinner,
  toaster,
} from "evergreen-ui";
import { Draggable, Droppable } from "react-beautiful-dnd";

import {
  BeatSaverBrowserStoreContext,
  beatSaverBrowserCategories,
} from "../../stores/beatSaver";
import { UserPreferencesContext } from "../../stores/preferences";

import {
  getTableCellForCol,
  getTableCellPropsForCol,
  getColHeaderText,
} from "../../sharedUtils/playlistTable";
import { Song } from "../../stores/songs";

import PreviewSongButton from "./components/PreviewSongButton";

import { DROPPABLE_ID } from "./constants";

const BeatSaverBrowser = () => {
  const songStore = useContext(BeatSaverBrowserStoreContext);

  const preferences = useContext(UserPreferencesContext);
  const columnsToShow = preferences.getPlaylistColumnNamesToShow();

  return (
    <Pane
      maxWidth="600px"
      height="100vh"
      paddingLeft="20px"
      paddingRight="20px"
      backgroundColor="white"
    >
      <div style={{ display: "flex", flexDirection: "row" }}>
        <Heading marginTop="10px" marginBottom="10px">
          BeatSaver Browser
        </Heading>
        {songStore.loading && <Spinner marginLeft="auto" marginRight="0px" />}
      </div>
      <Text>
        Drag songs from here to your playlists to add songs directly. Currently,
        you can only either filter by category, or do a search, but not in
        conjunction with each other.
      </Text>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            marginBottom: 10,
            marginTop: 10,
          }}
        >
          <Select
            width="100px"
            marginRight="30px"
            value={songStore.category}
            onChange={(e) => {
              songStore.search = "";
              songStore.category = e.target.value;
              songStore.fetchSongs();
            }}
          >
            {beatSaverBrowserCategories.map((c) => (
              <option key={c} value={c}>
                {c.toLocaleUpperCase()}
              </option>
            ))}
          </Select>
          <SearchInput
            placeholder="Search..."
            onChange={(e) => {
              songStore.search = e.target.value;
            }}
            value={songStore.search}
            onKeyPress={(e) => {
              if (e.key === "Enter") {
                try {
                  songStore.fetchSongs();
                } catch (err) {
                  toaster.danger("An error has occured.");
                } finally {
                }
              }
            }}
          />
        </div>
      </div>
      <Table minWidth="400px" overflowX="scroll">
        <Table.Head height={42}>
          <Table.HeaderCell flexBasis={40} flexGrow={0} />
          {columnsToShow.map((key) => (
            <Table.TextHeaderCell key={key} {...getTableCellPropsForCol(key)}>
              {getColHeaderText(key)}
            </Table.TextHeaderCell>
          ))}
        </Table.Head>
        <Droppable droppableId={DROPPABLE_ID} isDropDisabled={true}>
          {(provided, snapshot) => (
            <Table.Body
              overflow="visible"
              display="flex"
              flexDirection="column"
              ref={provided.innerRef}
            >
              <Observer>
                {() =>
                  songStore.songsList.map((songData, idx) => (
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
                          <Table.Cell
                            flexBasis={40}
                            flexGrow={0}
                            flexShrink={0}
                          >
                            <PreviewSongButton songData={songData} />
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
                  ))
                }
              </Observer>
              {provided.placeholder}
            </Table.Body>
          )}
        </Droppable>
      </Table>
      <Pagination
        // beat saver uses 0 indexed pages
        page={songStore.page + 1}
        totalPages={songStore.totalPages}
        onPageChange={(page) => {
          songStore.page = page - 1;
          songStore.fetchSongs();
        }}
      />
    </Pane>
  );
};

export default observer(BeatSaverBrowser);
