import { Bee } from "./Bee";

export class CameraManager {
  private _cameraX: number = 0;
  private readonly _worldWidth: number;
  private readonly _gameWidth: number;

  constructor(worldWidth: number, gameWidth: number) {
    this._worldWidth = worldWidth;
    this._gameWidth = gameWidth;
  }

  get cameraX(): number {
    return this._cameraX;
  }

  update(bee: Bee, dt: number): void {
    // Camera follows the bee horizontally
    this._cameraX +=
      (bee.x - this._gameWidth / 2 + Bee.SIZE / 2 - this._cameraX) *
      (1 - Math.pow(0.01, dt));

    // Clamp camera to world bounds
    if (this._cameraX < 0) this._cameraX = 0;
    if (this._cameraX > this._worldWidth - this._gameWidth) {
      this._cameraX = this._worldWidth - this._gameWidth;
    }
  }
}
