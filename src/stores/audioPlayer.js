import { makeAutoObservable } from "mobx";

class AudioPlayer {
  _audioPlayer = new Audio();
  _previewingSongFile = null;
  _previewingSongHash = null;
  _loading = false;
  _paused = false;

  constructor() {
    makeAutoObservable(this);
    this._audioPlayer.onended = () => (this.previewingSongHash = null);
  }

  get previewingSongHash() {
    return this._previewingSongHash;
  }
  set previewingSongHash(previewingSongHash) {
    this._previewingSongHash = previewingSongHash;
  }
  get loading() {
    return this._loading;
  }
  set loading(loading) {
    this._loading = loading;
  }
  get paused() {
    return this._paused;
  }
  set paused(paused) {
    this._paused = paused;
  }

  playSongSrc(src) {
    this.paused = false;
    this._audioPlayer.pause();
    this._audioPlayer.currentTime = 0;

    this._audioPlayer.src = src;
    this._audioPlayer.play();
  }

  play() {
    this.paused = false;
    this._audioPlayer.play();
  }

  pause() {
    this.paused = true;
    this._audioPlayer.pause();
  }
}

export default new AudioPlayer();
