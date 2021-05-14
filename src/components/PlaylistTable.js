import React, { useState, useCallback } from "react";
import { Table, Avatar, Heading, DragHandleHorizontalIcon } from "evergreen-ui";
import { DragDropContext, Draggable, Droppable } from "react-beautiful-dnd";
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

const DraggableRow = ({ type, idx, song }) => {
  return (
    <Draggable key={song.hash} draggableId={song.hash} index={idx} type={type}>
      {(provided, snapshot) => (
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
            <Avatar src={`https://beatsaver.com${song.coverURL}`} size={40} />
          </Table.Cell>
          {bplistSongKeys.map((key) => (
            <Table.TextCell key={key}>{getColText(key, song)}</Table.TextCell>
          ))}
        </Table.Row>
      )}
    </Draggable>
  );
};

// TODO: handle json types seperately
const PlaylistTable = ({ title, author, songs }) => {
  const [songsList, setSongsList] = useState(songs);

  const onDragEnd = ({ destination, source }) => {
    // the only one that is required
    if (!destination || !source) {
      return;
    }

    const destIdx = destination.index;
    const sourceIdx = source.index;

    // insert dragIdx item to hoverIdx position
    setSongsList((list) => {
      const listToUpdate = [...list];
      const itemToInsert = listToUpdate[sourceIdx];
      listToUpdate.splice(sourceIdx, 1);
      listToUpdate.splice(destIdx, 0, itemToInsert);
      return listToUpdate;
    });
  };

  const TYPE = `${title}${author}`;

  return (
    <>
      <Heading margin={10}>
        {title} - {author}
      </Heading>
      <DragDropContext onDragEnd={onDragEnd}>
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
            <Droppable droppableId={title} type={TYPE}>
              {(provided, snapshot) => (
                <div ref={provided.innerRef}>
                  {songsList.map((song, idx) => (
                    <DraggableRow type={TYPE} idx={idx} song={song} />
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </Table.Body>
        </Table>
      </DragDropContext>
    </>
  );
};

export default PlaylistTable;
