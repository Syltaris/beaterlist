import { Badge, Table, Avatar } from "evergreen-ui";
import { camelCaseToWords } from "../utils/string";

export const difficultyBadgePropsMap = {
  easy: { text: "EZ", color: "green" },
  normal: { text: "N", color: "blue" },
  hard: { text: "H", color: "yellow" },
  expert: { text: "E", color: "red" },
  expertPlus: { text: "E+", color: "purple" },
};

export const getDifficultyBadge = (difficultyKey) => {
  if (!(difficultyKey in difficultyBadgePropsMap)) {
    console.error("missing difficulty key: ", difficultyKey);
    return;
  }
  const { text, color } = difficultyBadgePropsMap[difficultyKey];
  return (
    <Badge key={difficultyKey} color={color}>
      {text}
    </Badge>
  );
};

export const getColText = (key, song) => {
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

export const getTableCellPropsForCol = (key) => {
  // levelAuthor, songAuthor, difficulties
  let props = {
    flexBasis: 150,
    flexGrow: 0,
    flexShrink: 0,
  };
  if (key === "description") {
    props = {
      flexBasis: 600,
      flexGrow: 0,
      flexShrink: 0,
    };
  } else if (key === "hash") {
    props = {
      flexBasis: 300,
      flexGrow: 0,
      flexShrink: 0,
    };
  } else if (key === "name") {
    props = {
      flexBasis: 200,
      flexGrow: 0,
      flexShrink: 0,
    };
  } else if (key === "uploadDate") {
    props = {
      flexBasis: 120,
      flexGrow: 0,
      flexShrink: 0,
    };
  } else if (key === "duration") {
    props = {
      flexBasis: 90,
      flexGrow: 0,
      flexShrink: 0,
    };
  } else if (key === "cover") {
    props = {
      flexBasis: 60,
      flexGrow: 0,
      flexShrink: 0,
    };
  } else if (
    ["downloads", "plays", "upvotes", "downvotes", "rating", "key"].includes(
      key
    )
  ) {
    // small width cells
    props = {
      flexBasis: 72,
      flexGrow: 0,
      flexShrink: 0,
    };
  }

  return props;
};

export const getTableCellForCol = (key, song) => {
  if (key === "cover") {
    return (
      <Table.Cell key={key} {...getTableCellPropsForCol(key)}>
        <Avatar src={song.coverURL} size={40} />
      </Table.Cell>
    );
  }

  if (key === "difficulties") {
    return (
      <Table.Cell key={key} {...getTableCellPropsForCol(key)}>
        {Object.entries(song.difficulties)
          .filter(([_, flag]) => flag)
          .map(([difficultyKey, _]) => difficultyKey)
          .sort((k1, k2) => {
            const difficultyKeys = Object.keys(difficultyBadgePropsMap);
            return difficultyKeys.indexOf(k1) - difficultyKeys.indexOf(k2);
          })
          .map((difficultyKey) => getDifficultyBadge(difficultyKey))}
      </Table.Cell>
    );
  }

  return (
    <Table.TextCell key={key} {...getTableCellPropsForCol(key)}>
      {getColText(key, song)}
    </Table.TextCell>
  );
};

export const getColHeaderText = (key) => {
  // to handle special small width text
  switch (key) {
    case "upvotes":
      return "👍";
    case "downvotes":
      return "👎";
    case "downloads":
      return "💾";
    case "plays":
      return "▶️";
    case "rating":
      return "💯";
    case "key":
      return "🔑";
    default:
      return camelCaseToWords(key);
  }
};
