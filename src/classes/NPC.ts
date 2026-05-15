import { Bee } from "./Bee";
import { Sprite } from "./Sprite";

export class NPC extends Sprite {
  static readonly NEARBY_DISTANCE = 45;

  private _imageSrc: string;
  private _scale: number;
  private _randomYOffset: number;

  private _triangleOffsetX: number; // (for better align with the npc sprite)

  private _name: string;
  private _message: string[];

  constructor(
    x: number,
    name: string,
    message: string[],
    imageSrc: string,
    triangleOffsetX: number = 0,
    scale: number = Math.random() * 0.1 + 0.95, // Random scale between 0.95 and 1.05
  ) {
    super(x, 0); // y will be set later based on ground level
    this._name = name;
    this._message = message;
    this._imageSrc = imageSrc;
    this._scale = scale;
    this._randomYOffset = Math.random() * 10;
    this._triangleOffsetX = triangleOffsetX;
  }

  get imageSrc(): string {
    return this._imageSrc;
  }

  get scale(): number {
    return this._scale;
  }

  get randomYOffset(): number {
    return this._randomYOffset;
  }

  get triangleOffsetX(): number {
    return this._triangleOffsetX;
  }

  get name(): string {
    return this._name;
  }

  get message(): string[] {
    return this._message;
  }

  set message(value: string[]) {
    this._message = value;
  }

  // Verify if the bee is nearby
  isNearBee(
    bee: Bee,
    npcWidth: number = 0,
    npcHeight: number = 0,
  ): boolean {
    // Calculate bounds for NPC and bee
    const npcLeft = this.x;
    const npcRight = this.x + npcWidth;
    const npcTop = this.y;
    const npcBottom = this.y + npcHeight;

    const beeLeft = bee.x;
    const beeRight = bee.x + Bee.SIZE;
    const beeTop = bee.y;
    const beeBottom = bee.y + Bee.SIZE;

    // Calculate distance between closest edges horizontally
    let xDistance = 0;
    if (npcRight < beeLeft) {
      // NPC is to the left of bee
      xDistance = beeLeft - npcRight;
    } else if (beeRight < npcLeft) {
      // Bee is to the left of NPC
      xDistance = npcLeft - beeRight;
    }
    // else they overlap, xDistance = 0

    // Calculate distance between closest edges vertically
    let yDistance = 0;
    if (npcBottom < beeTop) {
      // NPC is above bee
      yDistance = beeTop - npcBottom;
    } else if (beeBottom < npcTop) {
      // Bee is above NPC
      yDistance = npcTop - beeBottom;
    }
    // else they overlap, yDistance = 0

    return (
      xDistance < NPC.NEARBY_DISTANCE && yDistance < NPC.NEARBY_DISTANCE
    );
  }

  update() {}
}
