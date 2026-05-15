export class InputManager {
  private _keys: {
    up: boolean;
    left: boolean;
    right: boolean;
  };
  private _mouseX: number = 0;
  private _mouseY: number = 0;

  constructor() {
    this._keys = { up: false, left: false, right: false };
  }

  get keys() {
    return this._keys;
  }

  get mouseX(): number {
    return this._mouseX;
  }

  get mouseY(): number {
    return this._mouseY;
  }

  setMousePosition(x: number, y: number): void {
    this._mouseX = x;
    this._mouseY = y;
  }

  registerKeyDown(key: "up" | "left" | "right"): void {
    this._keys[key] = true;
  }

  registerKeyUp(key: "up" | "left" | "right"): void {
    this._keys[key] = false;
  }

  isKeyPressed(key: "up" | "left" | "right"): boolean {
    return this._keys[key];
  }
}
