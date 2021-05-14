import React, { useState } from "react";
import { Table, Avatar, Heading, DragHandleHorizontalIcon } from "evergreen-ui";
import { DndProvider, useDrop, useDrag } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";

/*
{
    "metadata":{
            "difficulties":{"easy":false,"normal":true,"hard":true,"expert":true,"expertPlus":false},
        "duration":0,
        "automapper":null,
        "characteristics":[
            {
                "name":"Standard",
                "difficulties": {
                    "easy":null,
                    "normal":{"duration":355.7663269042969,"length":167,"bombs":334,"notes":375,"obstacles":9,"njs":10,"njsOffset":0},
                    "hard":{"duration":355.7450866699219,"length":167,"bombs":306,"notes":480,"obstacles":3,"njs":10,"njsOffset":0},
                    "expert":{"duration":355.7450866699219,"length":167,"bombs":138,"notes":662,"obstacles":3,"njs":10,"njsOffset":0},
                    "expertPlus":null
                }
            }
        ],
        "songName":"Technologic",
        "songSubName":"Daft Punk",
        "songAuthorName":"Awfulnaut",
        "levelAuthorName":"awfulnaut",
        "bpm":127
    },
    "stats":{
        "downloads":428745,
        "plays":6632,
        "downVotes":186,
        "upVotes":9789,
        "heat":120.6632514,
        "rating":0.9512470277249632
    },
    "description":"Expert / Hard / Normal",
    "deletedAt":null,
    "_id":"5cff620e48229f7d88fc67a8",
    "key":"747",
    "name":"Technologic - Daft Punk (Update)",
    "uploader":{"_id":"5cff0b7398cc5a672c84edac","username":"awfulnaut"},
    "uploaded":"2018-06-30T18:30:38.000Z",
    "hash":"831247d7d02e948e5d03622748bb130b5057023d",
    "directDownload":"/cdn/747/831247d7d02e948e5d03622748bb130b5057023d.zip",
    "downloadURL":"/api/download/key/747",
    "coverURL":"/cdn/747/831247d7d02e948e5d03622748bb130b5057023d.jpg"
}
*/

const bplistSongKeys = ["name", "description", "difficulties"];

const getColText = (key, song) => {
  // special cases
  switch (key) {
    case "difficulties":
      return Object.entries(song.metadata.difficulties)
        .filter(([key, value]) => value)
        .map(([key, _]) => key)
        .join(",");
    default:
      break;
  }

  // very dirty way to parse out the relevant col data
  if (key in song) {
    return song[key];
  } else if (key in song.metadata) {
    return song.metadata[key];
  }
};

const camelCaseToWords = (text) => {
  var result = text.replace(/([A-Z])/g, " $1");
  var finalResult = result.charAt(0).toUpperCase() + result.slice(1);
  return finalResult;
};

const DraggableRow = ({ idx, song, moveRow }) => {
  const dragRef = React.useRef(null);
  const [{ isDragging }, drag, preview] = useDrag({
    type: "TABLE_ROW",
    item: { index: idx },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  });

  const dropRef = React.useRef(null);
  const [, drop] = useDrop({
    accept: "TABLE_ROW",
    hover(item, monitor) {
      if (!dropRef.current) {
        return;
      }
      const dragIndex = item.index;
      const hoverIndex = idx;
      // Don't replace items with themselves
      if (dragIndex === hoverIndex) {
        return;
      }
      // Determine rectangle on screen
      const hoverBoundingRect = dropRef.current.getBoundingClientRect();
      // Get vertical middle
      const hoverMiddleY =
        (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
      // Determine mouse position
      const clientOffset = monitor.getClientOffset();
      // Get pixels to the top
      const hoverClientY = clientOffset.y - hoverBoundingRect.top;
      // Only perform the move when the mouse has crossed half of the items height
      // When dragging downwards, only move when the cursor is below 50%
      // When dragging upwards, only move when the cursor is above 50%
      // Dragging downwards
      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
        return;
      }
      // Dragging upwards
      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
        return;
      }
      // Time to actually perform the action
      moveRow(dragIndex, hoverIndex);
      // Note: we're mutating the monitor item here!
      // Generally it's better to avoid mutations,
      // but it's good here for the sake of performance
      // to avoid expensive index searches.
      item.index = hoverIndex;
    },
  });

  preview(drop(dropRef));
  drag(dragRef);

  return (
    <div ref={dropRef} style={{ cursor: isDragging ? "move" : "pointer" }}>
      <Table.Row ref={dragRef} key={song.hash} isSelectable height={42}>
        <Table.Cell flexBasis={40} flexGrow={0}>
          <DragHandleHorizontalIcon />
        </Table.Cell>
        <Table.Cell flexBasis={60} flexGrow={0}>
          <Avatar src={`https://beatsaver.com${song.coverURL}`} size={40} />
        </Table.Cell>
        {bplistSongKeys.map((key) => (
          <Table.TextCell key={key}>{getColText(key, song)}</Table.TextCell>
        ))}
      </Table.Row>
    </div>
  );
};

// TODO: handle json types seperately
const PlaylistTable = ({ title, author, songs }) => {
  const [songsList, setSongsList] = useState(songs);
  return (
    <>
      <Heading margin={10}>
        {title} - {author}
      </Heading>
      <DndProvider backend={HTML5Backend}>
        <Table width="80%">
          <Table.Head height={42}>
            <Table.HeaderCell flexBasis={40} flexGrow={0} />
            <Table.HeaderCell flexBasis={60} flexGrow={0}>
              Cover
            </Table.HeaderCell>
            {bplistSongKeys.map((key) => (
              <Table.HeaderCell key={key}>
                {camelCaseToWords(key)}
              </Table.HeaderCell>
            ))}
          </Table.Head>
          <Table.Body minHeight={240}>
            {songsList.map((song, idx) => (
              <DraggableRow
                idx={idx}
                song={song}
                moveRow={(dragIdx, hoverIdx) => {
                  // insert dragIdx item to hoverIdx position
                  const listToUpdate = songsList;
                  const itemToInsert = listToUpdate[dragIdx];
                  listToUpdate.splice(dragIdx, 1);
                  listToUpdate.splice(hoverIdx, 0, itemToInsert);
                  console.log(dragIdx, hoverIdx, listToUpdate);
                  setSongsList([...listToUpdate]);
                }}
              />
            ))}
          </Table.Body>
        </Table>
      </DndProvider>
    </>
  );
};

export default PlaylistTable;
