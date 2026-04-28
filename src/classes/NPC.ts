import type { Bee } from "./Bee";
import { Sprite } from "./Sprite";

export class NPC extends Sprite {
	message: string;
	imageSrc: string;
	scale: number;

	constructor(
		x: number,
		message: string,
		imageSrc: string,
		scale: number = 1,
	) {
		super(x, 0); // y will be set later based on ground level
		this.message = message;
		this.imageSrc = imageSrc;
		this.scale = scale;
	}

	// Verify if the bee is nearby
	isNearBee(bee: Bee): boolean {
		return Math.hypot(this.x - bee.x, this.y - bee.y) < 100; // interaction radius
	}

	update(): void {}
}
