import type { Bee } from "./Bee";
import { Sprite } from "./Sprite";

export class NPC extends Sprite {
	static readonly NEARBY_DISTANCE = 125;

	private _message: string[];

	private _imageSrc: string;
	private _scale: number;
	private _randomYOffset: number;

	constructor(
		x: number,
		message: string[],
		imageSrc: string,
		scale: number = Math.random() * 0.1 + 0.95, // Random scale between 0.95 and 1.05
	) {
		super(x, 0); // y will be set later based on ground level
		this._message = message;
		this._imageSrc = imageSrc;
		this._scale = scale;
		this._randomYOffset = Math.random() * 10;
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

	get message(): string[] {
		return this._message;
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
