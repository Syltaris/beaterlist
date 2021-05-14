import React, { useState, useEffect } from "react";
import {
  Table,
  Avatar,
  Heading,
  DragHandleHorizontalIcon,
  FloppyDiskIcon,
  EditIcon,
  Tooltip,
  TextInput,
  Pane,
} from "evergreen-ui";
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

const DraggableRow = ({ columnsToShow, type, idx, song }) => {
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
          {columnsToShow.map((key) => (
            <Table.TextCell key={key}>{getColText(key, song)}</Table.TextCell>
          ))}
        </Table.Row>
      )}
    </Draggable>
  );
};

const exportPlaylist = (image, title, author, songsList) => {
  const bplistJson = {
    image,
    playlistTitle: title,
    playlistAuthor: author,
    songs: songsList.map((song) => ({
      songName: song.metadata.name,
      levelAuthorName: song.metadata.levelAuthorName,
      hash: song.hash,
      levelid: `custom_level_${song.hash}`,
      difficulties: song.metadata.characteristics.flatMap((characteristic) =>
        Object.entries(characteristic.difficulties)
          .filter(([key, value]) => value !== null)
          .map(([key, value]) => ({
            characteristic: characteristic.name,
            name: key,
          }))
      ),
    })),
  };

  var element = document.createElement("a");
  element.setAttribute(
    "href",
    "data:text/plain;charset=utf-8," +
      encodeURIComponent(JSON.stringify(bplistJson))
  );
  element.setAttribute("download", `${title}.bplist`);

  element.style.display = "none";
  document.body.appendChild(element);

  element.click();

  document.body.removeChild(element);
};

function openFileDialog(callback) {
  // this function must be called from  a user
  // activation event (ie an onclick event)

  // Create an input element
  var inputElement = document.createElement("input");
  // Set its type to file
  inputElement.type = "file";
  // Set accept to the file types you want the user to select.
  // Include both the file extension and the mime type
  inputElement.accept = "image/*";
  // Accept multiple files
  inputElement.multiple = false;
  // set onchange event to call callback when user has selected file
  inputElement.addEventListener("change", callback);
  // dispatch a click event to open the file dialog
  inputElement.dispatchEvent(new MouseEvent("click"));
}

// TODO: handle json types seperately
const PlaylistTable = ({ columnsToShow, playlist, songs }) => {
  const [editTextData, setEditTextData] = useState(false);

  const [image, setImage] = useState(playlist.image);
  const [title, setTitle] = useState(playlist.playlistTitle);
  const [author, setAuthor] = useState(playlist.playlistAuthor);

  const [songsList, setSongsList] = useState(songs);
  const [columns, setColumnsToShow] = useState(columnsToShow);

  useEffect(() => {
    setColumnsToShow(columnsToShow);
  }, [columnsToShow]);

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
    <div
      style={{
        width: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        border: "default",
        marginTop: 10,
      }}
    >
      {" "}
      <Pane display="flex" flexDirection="row" alignItems="center">
        {image && (
          <Avatar
            src={"data:image/png;" + image}
            size={50}
            onClick={() => {
              // get image upload and replace image in base64
              openFileDialog((event) => {
                let baseURL = "";
                const reader = new FileReader();
                const file = event.target.files[0];
                reader.readAsDataURL(file);
                reader.onload = () => {
                  baseURL = reader.result;
                  setImage(baseURL);
                };
              });
            }}
          />
        )}
        <Heading margin={10}>
          {editTextData ? (
            <>
              <TextInput
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />{" "}
              -{" "}
              <TextInput
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
              />
            </>
          ) : (
            <>
              {title} - {author}
            </>
          )}
        </Heading>
        <Tooltip content="Edit Title & Author">
          <EditIcon onClick={() => setEditTextData(!editTextData)} size={30} />
        </Tooltip>
        <Tooltip content="Download">
          <FloppyDiskIcon
            size={25}
            onClick={() => exportPlaylist(image, title, author, songsList)}
          />
        </Tooltip>
      </Pane>
      <DragDropContext onDragEnd={onDragEnd}>
        <Table maxWidth="80%">
          <Table.Head height={42}>
            <Table.HeaderCell flexBasis={40} flexGrow={0} />
            <Table.HeaderCell flexBasis={60} flexGrow={0}>
              Cover
            </Table.HeaderCell>
            {columns.map((key) => (
              <Table.HeaderCell key={key}>
                {camelCaseToWords(key)}
              </Table.HeaderCell>
            ))}
          </Table.Head>
          <Table.Body>
            <Droppable droppableId={title} type={TYPE}>
              {(provided, snapshot) => (
                <div ref={provided.innerRef}>
                  {songsList.map((song, idx) => (
                    <DraggableRow
                      columnsToShow={columns}
                      type={TYPE}
                      idx={idx}
                      song={song}
                    />
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </Table.Body>
        </Table>
      </DragDropContext>
    </div>
  );
};

export default PlaylistTable;
