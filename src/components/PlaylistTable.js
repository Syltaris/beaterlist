import React from "react";
import { Table } from "evergreen-ui";

const bplistSongKeys = [
  "songName",
  "levelAuthorName",
  "hash",
  "levelid",
  "difficulties",
];

const getColText = (key, col) => {
  if (col && key == "difficulties") {
    return col.map((c) => c.name).join(",");
  } else if (typeof col == "string") {
    return col;
  }
  return "col";
};

const camelCaseToWords = (text) => {
  var result = text.replace(/([A-Z])/g, " $1");
  var finalResult = result.charAt(0).toUpperCase() + result.slice(1);
  return finalResult;
};

// TODO: handle json types seperately
const PlaylistTable = ({ type, playlist }) => (
  <Table width="80%">
    <Table.Head>
      {bplistSongKeys.map((key) => (
        <Table.HeaderCell key={key}>{camelCaseToWords(key)}</Table.HeaderCell>
      ))}
    </Table.Head>
    <Table.Body minHeight={240}>
      {playlist.songs.map((song) => (
        <Table.Row
          key={song.hash}
          isSelectable
          onSelect={() => alert(song.hash)}
        >
          {bplistSongKeys.map((key) => (
            <Table.TextCell>{getColText(key, song[key])}</Table.TextCell>
          ))}
        </Table.Row>
      ))}
    </Table.Body>
  </Table>
);

export default PlaylistTable;
