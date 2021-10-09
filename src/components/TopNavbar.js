import { useState } from "react";
import {
  Pane,
  Text,
  HelpIcon,
  SideSheet,
  Heading,
  Paragraph,
} from "evergreen-ui";
import mixpanel from "mixpanel-browser";
import { observer } from "mobx-react-lite"; // may not need it

export const Navbar = () => {
  const [openHelp, setOpenHelp] = useState(false);
  return (
    <Pane
      width="100%"
      height="100px"
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      paddingLeft="20px"
      paddingRight="20px"
      paddingTop="10px"
      paddingBottom="10px"
      background="linear-gradient(45deg, #f03030 0%, #309eff 80%)"
    >
      <Heading color="white" size={900}>
        BeaterList{" "}
        <HelpIcon
          color="white"
          onClick={() => {
            mixpanel.track("toggleHelp", {
              event_category: "sidebarConfig",
              event_label: "toggleHelp",
              value: !openHelp,
            });
            setOpenHelp(!openHelp);
          }}
        />
      </Heading>
      <Text color="white">
        by{" "}
        <a
          href="https://zexuan.tk/projects/#beaterlist"
          rel="noopener noreferrer"
          target="blank"
          style={{ color: "white" }}
        >
          zexurge
        </a>
      </Text>
      <SideSheet
        isShown={openHelp}
        onCloseComplete={() => {
          mixpanel.track("closeHelp", {
            event_category: "sidebarConfig",
            event_label: "closeHelp",
          });
          setOpenHelp(false);
        }}
      >
        <Pane margin={40}>
          <Heading>Things to know</Heading>
          <Paragraph marginTop={10}>
            UPDATE: Due to BeatSaver's new API changes, you WILL need to clear your
            browser cache/application data in order to ... crashing. Apologies for
            the inconvenience.
          </Paragraph >
          <Paragraph marginTop={10}>
            Any changes you make will be saved automatically, so you don't have
            to worry about losing data when refreshing. (if it happens, let me
            know so I can fix the bug)
          </Paragraph>
          <Paragraph marginTop={10}>
            ALL of the data here is stored locally in your browser. This means
            that if there are any updates to this site, or if you are using
            incognito mode, or clear the browser data, ALL of the data will be
            lost!
          </Paragraph>
          <Paragraph marginTop={10}>
            If you run into issues (crashing/white out) when importing multiple
            playlists, try importing them in smaller batches. Clear the browser
            data to resolve the issue. BeatSaver APIs need to be rate limited so
            we can't retrieve too much data too quickly from them :(
          </Paragraph>
          <Paragraph marginTop={10}>So, do backup your data often :)</Paragraph>

          <Heading marginTop={20}>How to use</Heading>
          <Paragraph marginTop={10}>
            You can start by creating an empty playlist on the sidebar on the
            left, or import existing .bplist files or .json files from your
            Playlists folder to load your playlists.
          </Paragraph>
          <Paragraph marginTop={10}>
            You can then start to add new songs (by key) to the playlists
            directly, re-order them by drag-and-dropping them around. The songs
            can also be moved between playlists.
          </Paragraph>
          <Paragraph marginTop={10}>
            You can also reorder the playlists themselves by dragging them
            (though the d-n-d UI is still a bit buggy for now).
          </Paragraph>

          <Heading marginTop={20}>BeatSaver browser</Heading>
          <Paragraph marginTop={10}>
            I have integrated a BeatSaver browser here, so you can browse for
            songs here and drag-and-drop them directly to your playlists! I have
            also setup a simple preview song functionality so you can quickly
            find and add songs you like.
          </Paragraph>

          <Heading marginTop={20}>Exporting playlists</Heading>
          <Paragraph marginTop={10}>
            You can download each playlist individually by clicking the save
            icon at the top of each playlist. Or, just export them all in a .zip
            file using the 'Export all playlists' button.
          </Paragraph>
          <Paragraph marginTop={10}>
            You can then just dump the files into the Playlists folder, and
            refresh the playlists in game, or import them individually using
            ModAssistant (or via BMBF/Playlist Editor Pro for Quest)
          </Paragraph>
        </Pane>
      </SideSheet>
    </Pane>
  );
};
export default observer(Navbar);
