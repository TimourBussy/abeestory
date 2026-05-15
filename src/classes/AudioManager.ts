export class AudioManager {
  private _bgMusic: HTMLAudioElement;
  private _isMuted: boolean = false;

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
  toggleMute(): void {
    this._isMuted = !this._isMuted;
    if (this._isMuted) {
      this._bgMusic.pause();
    } else {
      this._bgMusic.play().catch((err) => {
        console.log("Audio playback failed:", err);
      });
    }
  }
  
  set volume(volume: number) {
    this._bgMusic.volume = Math.max(0, Math.min(1, volume));
  }

  get volume(): number {
    return this._bgMusic.volume;
  }

  get isMuted(): boolean {
    return this._isMuted;
  }
}
