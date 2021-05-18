import { useState } from "react";

import { observer } from "mobx-react-lite";

import {
  Avatar,
  Heading,
  FloppyDiskIcon,
  EditIcon,
  Tooltip,
  TextInput,
  Pane,
  Button,
  DeleteIcon,
  Dialog,
  AddIcon,
  Spinner,
  IconButton,
  TickIcon,
  CrossIcon,
} from "evergreen-ui";

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

export const Header = ({ playlist }) => {
  const [editTextData, setEditTextData] = useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);

  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showAddSongLoader, setShowAddSongLoader] = useState(false);
  const [addSongError, setAddSongError] = useState(false);
  const [songKeyInput, setSongKeyInput] = useState("");

  const [titleInput, setTitleInput] = useState(playlist.title);
  const [authorInput, setAuthorInput] = useState(playlist.author);
  return (
    <Pane display="flex" flexDirection="row" alignItems="center" padding="5px">
      <Avatar
        src={playlist.image && "data:image/png;" + playlist.image}
        name={playlist.title}
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
      <Heading margin={10}>
        {editTextData ? (
          <>
            <TextInput
              value={titleInput}
              width="100px"
              onChange={(e) => setTitleInput(e.target.value)}
            />{" "}
            -{" "}
            <TextInput
              value={authorInput}
              width="100px"
              onChange={(e) => setAuthorInput(e.target.value)}
            />
            <IconButton
              icon={TickIcon}
              intent="success"
              onClick={() => {
                playlist.title = titleInput;
                playlist.author = authorInput;
                setEditTextData(false);
              }}
              marginLeft="2px"
            />
            <IconButton
              icon={CrossIcon}
              intent="danger"
              onClick={() => {
                setTitleInput(playlist.title);
                setAuthorInput(playlist.author);
                setEditTextData(false);
              }}
              marginLeft="2px"
            />
          </>
        ) : (
          <>
            {playlist.title} - {playlist.author}
          </>
        )}
      </Heading>
      <div style={{ marginLeft: "auto", marginRight: 0 }}>
        <Tooltip content="Edit Title & Author">
          <IconButton
            icon={EditIcon}
            onClick={() => setEditTextData(!editTextData)}
            marginRight="2px"
          />
        </Tooltip>
        <Tooltip content="Download">
          <IconButton
            icon={FloppyDiskIcon}
            marginRight="2px"
            onClick={() => exportPlaylist(playlist)}
          />
        </Tooltip>
        <Tooltip content="Delete">
          <IconButton
            icon={DeleteIcon}
            marginRight="2px"
            onClick={() => setShowDeleteConfirmation(true)}
          />
        </Tooltip>
        <Tooltip content="Add new song">
          <IconButton
            icon={AddIcon}
            marginRight="2px"
            onClick={() => setShowAddDialog(true)}
          />
        </Tooltip>
      </div>
      <Dialog
        /* this will vanish immediatetly on confirm, can consider moving out to global modals */
        isShown={showDeleteConfirmation}
        title={`Delete ${playlist.title}?`}
        onCloseComplete={() => setShowDeleteConfirmation(false)}
        onConfirm={() => {
          playlist.delete();
          setShowDeleteConfirmation(false);
        }}
        confirmLabel={"Confirm"}
        intent="danger"
      >
        This action is irreverisble!
      </Dialog>

      <Dialog
        shouldCloseOnOverlayClick={false}
        isShown={showAddDialog}
        title={`Add new song to ${playlist.title}`}
        onCloseComplete={() => setShowAddDialog(false)}
        onConfirm={async () => {
          try {
            setAddSongError(false);
            setShowAddSongLoader(true);
            await playlist.addSongByKey(songKeyInput);
          } catch (err) {
            setAddSongError(true);
            console.log(err);
          } finally {
            setShowAddSongLoader(false);
          }
        }}
        confirmLabel={"Add"}
      >
        {showAddSongLoader && <Spinner />}
        Add the song key you want to add here:
        <TextInput
          isInvalid={addSongError}
          value={songKeyInput}
          onChange={(e) => setSongKeyInput(e.target.value)}
        ></TextInput>
      </Dialog>
    </Pane>
  );
};

export default observer(Header);
