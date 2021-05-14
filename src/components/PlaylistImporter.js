import React from "react";
import { FilePicker } from "evergreen-ui";

const PlaylistImporter = ({ onImportClick }) => (
  <FilePicker
    multiple
    width={250}
    onChange={async (files) => {
      // assume bplist and json files can be parsed as json
      console.log(files);
      const playlists = await Promise.all(
        files.map(async (file) => ({
          type: file.name.split(".")[1],
          data: JSON.parse(await file.text()),
        }))
      );
      onImportClick(playlists);
    }}
    placeholder="Import playlist(s)"
  />
);

export default PlaylistImporter;
