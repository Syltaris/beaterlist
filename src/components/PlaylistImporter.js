import { Button } from "evergreen-ui";
import { observer } from "mobx-react-lite";

const PlaylistImporter = ({ onImportClick, ...props }) => {
  return (
    <Button
      onClick={() => {
        var element = document.createElement("input");
        element.setAttribute("type", "file");
        element.setAttribute("multiple", true);
        element.setAttribute("accept", ".bplist,.json");

        element.addEventListener("change", async (e) => {
          const files = Object.values(e.target.files);
          // assume bplist and json files can be parsed as json
          const playlists = await Promise.all(
            files.map(async (file) => ({
              type: file.name.split(".")[1],
              data: JSON.parse(await file.text()),
            }))
          );
          onImportClick(playlists);
        });

        element.style.display = "none";
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
      }}
      {...props}
    >
      Import playlist(s)
    </Button>
  );
};

export default observer(PlaylistImporter);
