import { observer } from "mobx-react-lite";
import AudioPlayer from "../../../stores/audioPlayer";
import JSZip from "jszip";
import mixpanel from "mixpanel-browser";

import { PlayIcon, IconButton, PauseIcon } from "evergreen-ui";

const previewSong = async (song) => {
  if (!AudioPlayer.paused) {
    AudioPlayer.pause();
  }
  AudioPlayer.loading = true;
  AudioPlayer.previewingSongHash = song.hash;
  const resp = await fetch("https://beatsaver.com" + song.downloadURL);

  var zipFile = new JSZip();
  const loadedZip = await zipFile.loadAsync(await resp.blob());
  const eggFile = Object.entries(loadedZip.files).find(([key, _]) =>
    key.includes(".egg")
  );
  if (eggFile) {
    // try to play file?
    const file = await eggFile[1].async("arraybuffer");
    const blob = new Blob([file], { type: "audio/wav" });

    const reader = new FileReader();
    reader.onload = function (e) {
      AudioPlayer.playSongSrc(window.URL.createObjectURL(blob));
      AudioPlayer.loading = false;
    };
    reader.readAsArrayBuffer(blob);
  }
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
