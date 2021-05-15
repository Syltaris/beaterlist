import React, { useState, useContext } from "react";
import { observer } from "mobx-react-lite";
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
  Button,
} from "evergreen-ui";
import { DragDropContext, Draggable, Droppable } from "react-beautiful-dnd";

import { UserPreferencesContext } from "../stores/preferences";

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

const camelCaseToWords = (text) => {
  var result = text.replace(/([A-Z])/g, " $1");
  var finalResult = result.charAt(0).toUpperCase() + result.slice(1);
  return finalResult;
};

const DraggableRow = ({ type, idx, song }) => {
  const preferences = useContext(UserPreferencesContext);
  const columnsToShow = preferences.getPlaylistColumnNamesToShow();
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
            <Avatar
              src={`https://beatsaver.com${song.beatSaverSongObject.coverURL}`}
              size={40}
            />
          </Table.Cell>
          {columnsToShow.map((key) => (
            <Table.TextCell key={key}>{getColText(key, song)}</Table.TextCell>
          ))}
        </Table.Row>
      )}
    </Draggable>
  );
};

const exportPlaylist = (playlist) => {
  const bplistJson = playlist.asBplistJson();
  var element = document.createElement("a");
  element.setAttribute(
    "href",
    "data:text/plain;charset=utf-8," +
      encodeURIComponent(JSON.stringify(bplistJson))
  );
  element.setAttribute("download", `${playlist.title}.bplist`);

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
const PlaylistTable = ({ playlist }) => {
  console.log(playlist, "rerends.");
  const [editTextData, setEditTextData] = useState(false);
  const [titleInput, setTitleInput] = useState(playlist.title);
  const [authorInput, setAuthorInput] = useState(playlist.author);

  const preferences = useContext(UserPreferencesContext);
  const columnsToShow = preferences.getPlaylistColumnNamesToShow();

  const onDragEnd = ({ destination, source }) => {
    // the only one that is required
    if (!destination || !source) {
      return;
    }

    const destIdx = destination.index;
    const sourceIdx = source.index;

    const listToUpdate = [...playlist.songs];
    const itemToInsert = listToUpdate[sourceIdx];
    listToUpdate.splice(sourceIdx, 1);
    listToUpdate.splice(destIdx, 0, itemToInsert);
    playlist.songs = listToUpdate;
  };

  const TYPE = `${playlist.title}${playlist.author}`;

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
        {playlist.image && (
          <Avatar
            src={"data:image/png;" + playlist.image}
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
                  playlist.image = baseURL;
                };
              });
            }}
          />
        )}
        <Heading margin={10}>
          {editTextData ? (
            <>
              <TextInput
                value={titleInput}
                width="150px"
                onChange={(e) => setTitleInput(e.target.value)}
              />{" "}
              -{" "}
              <TextInput
                value={authorInput}
                width="150px"
                onChange={(e) => setAuthorInput(e.target.value)}
              />
            </>
          ) : (
            <>
              {playlist.title} - {playlist.author}
            </>
          )}
        </Heading>
        <Tooltip content="Edit Title & Author">
          {editTextData ? (
            <>
              <Button
                intent="success"
                onClick={() => {
                  playlist.title = titleInput;
                  playlist.author = authorInput;
                  setEditTextData(false);
                }}
              >
                Save
              </Button>
              <Button
                intent="danger"
                onClick={() => {
                  setTitleInput(playlist.title);
                  setAuthorInput(playlist.author);
                  setEditTextData(false);
                }}
              >
                Discard
              </Button>
            </>
          ) : (
            <EditIcon onClick={() => setEditTextData(true)} size={30} />
          )}
        </Tooltip>
        <Tooltip content="Download">
          <FloppyDiskIcon size={25} onClick={() => exportPlaylist(playlist)} />
        </Tooltip>
      </Pane>
      <DragDropContext onDragEnd={onDragEnd}>
        <Table maxWidth="80%">
          <Table.Head height={42}>
            <Table.HeaderCell flexBasis={40} flexGrow={0} />
            <Table.HeaderCell flexBasis={60} flexGrow={0}>
              Cover
            </Table.HeaderCell>
            {columnsToShow.map((key) => (
              <Table.HeaderCell key={key}>
                {camelCaseToWords(key)}
              </Table.HeaderCell>
            ))}
          </Table.Head>
          <Table.Body>
            <Droppable droppableId={playlist.title} type={TYPE}>
              {(provided, snapshot) => (
                <div ref={provided.innerRef}>
                  {playlist.songs.map((song, idx) => (
                    <DraggableRow type={TYPE} idx={idx} song={song} />
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

export default observer(PlaylistTable);
