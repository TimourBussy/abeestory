import type { Bee } from "./Bee";
import { Sprite } from "./Sprite";

export class NPC extends Sprite {
	message: string;
	imageSrc: string;
	scale: number;
	randomYOffset: number;

	constructor(
		x: number,
		message: string,
		imageSrc: string,
		scale: number = Math.random() * 0.1 + 0.95, // Random scale between 0.95 and 1.05
	) {
		super(x, 0); // y will be set later based on ground level
		this.message = message;
		this.imageSrc = imageSrc;
		this.scale = scale;
		this.randomYOffset = Math.random() * 10;
	}

	// Verify if the bee is nearby
	isNearBee(bee: Bee): boolean {
		return Math.hypot(this.x - bee.x, this.y - bee.y) < 100; // interaction radius
	}

	update(): void {}
}
