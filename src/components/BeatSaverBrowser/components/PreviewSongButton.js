import { observer } from "mobx-react-lite";
import AudioPlayer from "../../../stores/audioPlayer";
import mixpanel from "mixpanel-browser";

import { PlayIcon, IconButton, PauseIcon } from "evergreen-ui";

const previewSong = async (song) => {
  if (!AudioPlayer.paused) {
    AudioPlayer.pause();
  }
  AudioPlayer.loading = true;
  AudioPlayer.previewingSongHash = song.hash;
  AudioPlayer.playSongSrc(song.previewURL)//window.URL.createObjectURL(blob));
  AudioPlayer.loading = false;
};

const getButtonIcon = (songData) => {
  if (!(AudioPlayer.previewingSongHash === songData.hash)) {
    return PlayIcon;
  }

  if (AudioPlayer.loading) {
    return undefined;
  }

  if (AudioPlayer.paused) {
    return PlayIcon;
  }

  return PauseIcon;
};

const onClick = (songData) => {
  if (!(AudioPlayer.previewingSongHash === songData.hash)) {
    mixpanel.track("pressPreviewSongButton", {
      event_category: "beatSaverBrowser",
      event_label: "pressPreviewSongButton",
    });
    previewSong(songData);
    return;
  }

  if (AudioPlayer.paused) {
    AudioPlayer.play();
    mixpanel.track("pressPlaySong", {
      event_category: "beatSaverBrowser",
      event_label: "pressPlaySong",
    });
    return;
  }
  mixpanel.track("pressPauseSong", {
    event_category: "beatSaverBrowser",
    event_label: "pressPauseSong",
  });
  AudioPlayer.pause();
};

export const PreviewButton = ({ songData }) => (
  <IconButton
    intent={
      AudioPlayer.previewingSongHash === songData.hash ? "success" : undefined
    }
    isLoading={
      AudioPlayer.previewingSongHash === songData.hash && AudioPlayer.loading
    }
    icon={getButtonIcon(songData)}
    size="small"
    onClick={() => onClick(songData)}
  />
);

export default observer(PreviewButton);
