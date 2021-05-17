import { useState, useEffect, useContext } from "react";
import { observer } from "mobx-react-lite";

import { Table, Button } from "evergreen-ui";
import { Draggable, Droppable } from "react-beautiful-dnd";

import { BeatSaverBrowserStoreContext } from "../stores/playlists";

const BeatSaverBrowser = () => {
  const [page, setPage] = useState(0);
  const songStore = useContext(BeatSaverBrowserStoreContext);
  const songsList = songStore.songsList;

  useEffect(() => songStore.fetchSongs(page), [page]);

  return (
    <Table width="200px">
      <Button onClick={songStore.fetchSongs}>Load</Button>
      <Table.Head height={42}>
        <Table.HeaderCell flexBasis={40} flexGrow={0} />
        <Table.HeaderCell flexBasis={60} flexGrow={0}>
          Cover
        </Table.HeaderCell>
      </Table.Head>
      <Droppable droppableId="BEAT_SAVER_BROWSER" isDropDisabled={true}>
        {(provided, snapshot) => (
          <Table.Body
            display="flex"
            flexDirection="column"
            ref={provided.innerRef}
          >
            {songsList.map((s, idx) => (
              <Draggable draggableId={`browser-${s.hash}`} index={idx}>
                {(provided, snapshot) => (
                  <Table.Row
                    height={40}
                    key={s.hash}
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                  >
                    <Table.TextCell>{s.name}</Table.TextCell>
                  </Table.Row>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </Table.Body>
        )}
      </Droppable>
    </Table>
  );
};

export default observer(BeatSaverBrowser);
