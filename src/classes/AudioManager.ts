export class AudioManager {
  private _bgMusic: HTMLAudioElement;

  constructor() {
    this._bgMusic = new Audio("/audio/bg_music.wav");
    this._bgMusic.loop = true;
    this._bgMusic.volume = 0.5;
  }

  playBackgroundMusic(): Promise<void> {
    return this._bgMusic.play().catch((err) => {
      console.log("Audio playback failed:", err);
    });
  }

  pauseBackgroundMusic() {
    this._bgMusic.pause();
  }

  set volume(volume: number) {
    this._bgMusic.volume = Math.max(0, Math.min(1, volume));
  }

  get volume(): number {
    return this._bgMusic.volume;
  }
}
