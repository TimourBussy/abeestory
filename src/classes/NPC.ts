import type { Bee } from "./Bee";
import { Sprite } from "./Sprite";

export class NPC extends Sprite {
	static readonly NEARBY_DISTANCE = 125;

	private _imageSrc: string;
	private _scale: number;
	private _randomYOffset: number;

	private _triangleOffsetX: number; // (for better align with the npc sprite)
	private _triangleOffsetY: number;

	private _name: string;
	private _message: string[];

	constructor(
		x: number,
		name: string,
		message: string[],
		imageSrc: string,
		triangleOffsetX: number = 0,
		triangleOffsetY: number = 0,
		scale: number = Math.random() * 0.1 + 0.95, // Random scale between 0.95 and 1.05
	) {
		super(x, 0); // y will be set later based on ground level
		this._name = name;
		this._message = message;
		this._imageSrc = imageSrc;
		this._scale = scale;
		this._randomYOffset = Math.random() * 10;
		this._triangleOffsetX = triangleOffsetX;
		this._triangleOffsetY = triangleOffsetY;
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

	get triangleOffsetY(): number {
		return this._triangleOffsetY;
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
	isNearBee(bee: Bee): boolean {
		return (
			Math.abs(this.x - bee.x) < NPC.NEARBY_DISTANCE &&
			bee.y > this.y - NPC.NEARBY_DISTANCE
		);
	}

	update() {}
}
