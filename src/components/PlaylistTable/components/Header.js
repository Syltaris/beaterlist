import { useState } from "react";

import { observer } from "mobx-react-lite";
import mixpanel from "mixpanel-browser";
import {
  Avatar,
  Heading,
  FloppyDiskIcon,
  EditIcon,
  Tooltip,
  TextInput,
  Pane,
  DeleteIcon,
  Dialog,
  AddIcon,
  Spinner,
  IconButton,
  TickIcon,
  CrossIcon,
  ShareIcon,
  Text,
  toaster,
} from "evergreen-ui";

const exportPlaylist = (playlist) => {
  var element = document.createElement("a");
  element.setAttribute(
    "href",
    "data:text/plain;charset=utf-8," +
      encodeURIComponent(JSON.stringify(playlist.asBplistJson()))
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

  const onSongKeyAdd = async () => {
    try {
      setAddSongError(false);
      setShowAddSongLoader(true);
      const addedSongData = await playlist.addSongByKey(songKeyInput);
      toaster.success(`${addedSongData.name} added to ${playlist.title}.`);
      mixpanel.track("addNewSongByKeySuccess", {
        event_category: "playlist",
        event_label: "addNewSongByKeySuccess",
      });
    } catch (err) {
      setAddSongError(true);
      toaster.danger(err.message);
      mixpanel.track("addNewSongByKeyFail", {
        event_category: "playlist",
        event_label: "addNewSongByKeyFail",
      });
    } finally {
      setShowAddSongLoader(false);
    }
  };

  return (
    <Pane
      display="flex"
      flexDirection="row"
      alignItems="center"
      paddingBottom="5px"
    >
      <Avatar
        src={playlist.image && "data:image/png;" + playlist.image}
        name={playlist.title}
        size={50}
        onClick={() => {
          mixpanel.track("playlistImageChange", {
            event_category: "playlist",
            event_label: "playlistImageChange",
          });
          // get image upload and replace image in base64
          openFileDialog((event) => {
            let baseURL = "";
            const reader = new FileReader();
            const file = event.target.files[0];
            reader.readAsDataURL(file);
            reader.onload = () => {
              baseURL = reader.result;
              playlist.image = baseURL;
              toaster.success("Image saved and updated.");
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
            <Tooltip content="Save/Confirm">
              <IconButton
                icon={TickIcon}
                intent="success"
                onClick={() => {
                  mixpanel.track("playlistTitleAuthorUpdate", {
                    event_category: "playlist",
                    event_label: "playlistTitleAuthorUpdate",
                  });
                  playlist.title = titleInput;
                  playlist.author = authorInput;
                  setEditTextData(false);
                }}
                marginLeft="2px"
              />
            </Tooltip>
            <Tooltip content="Discard Changes">
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
            </Tooltip>
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
            onClick={() => {
              mixpanel.track("playlistEditToggle", {
                event_category: "playlist",
                event_label: "playlistEditToggle",
                value: !editTextData,
              });
              setEditTextData(!editTextData);
            }}
            marginLeft="2px"
          />
        </Tooltip>
        <Tooltip content="Create sharable import link">
          <IconButton
            icon={ShareIcon}
            onClick={() => {
              mixpanel.track("playlistShareClicked", {
                event_category: "playlist",
                event_label: "playlistShareClicked",
              });
              navigator.clipboard.writeText(playlist.sharableImportLink);
              toaster.success("Link copied to clipboard.");
              console.log(playlist.sharableImportLink);
            }}
            marginLeft="2px"
          />
        </Tooltip>
        <Tooltip content="Download">
          <IconButton
            icon={FloppyDiskIcon}
            marginLeft="2px"
            onClick={() => {
              mixpanel.track("savePlaylst", {
                event_category: "playlist",
                event_label: "savePlaylst",
              });
              exportPlaylist(playlist);
            }}
          />
        </Tooltip>
        <Tooltip content="Delete">
          <IconButton
            icon={DeleteIcon}
            marginLeft="2px"
            onClick={() => {
              mixpanel.track("deletePlaylist", {
                event_category: "playlist",
                event_label: "deletePlaylist",
              });
              setShowDeleteConfirmation(true);
            }}
          />
        </Tooltip>
        <Tooltip content="Add new song">
          <IconButton
            icon={AddIcon}
            marginLeft="2px"
            onClick={() => {
              mixpanel.track("addSongByKey", {
                event_category: "playlist",
                event_label: "addSongByKey",
              });
              setShowAddDialog(true);
            }}
          />
        </Tooltip>
      </div>
      <Dialog
        /* this will vanish immediatetly on confirm, can consider moving out to global modals */
        isShown={showDeleteConfirmation}
        title={`Delete ${playlist.title}?`}
        onCloseComplete={() => setShowDeleteConfirmation(false)}
        onConfirm={() => {
          mixpanel.track("deletePlaylistConfirmation", {
            event_category: "playlist",
            event_label: "deletePlaylistConfirmation",
          });
          playlist.delete();
          toaster.success(`${playlist.title} deleted successfully.`);
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
        onConfirm={onSongKeyAdd}
        confirmLabel={"Add"}
      >
        {showAddSongLoader && <Spinner />}
        <Text>Add the song key 🔑 you want to add here:</Text>
        <TextInput
          marginLeft="10px"
          width="80px"
          isInvalid={addSongError}
          value={songKeyInput}
          onChange={(e) => setSongKeyInput(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === "Enter") {
              onSongKeyAdd();
            }
          }}
        ></TextInput>
      </Dialog>
    </Pane>
  );
};

export default observer(Header);
