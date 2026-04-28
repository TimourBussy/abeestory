import type { Bee } from "./Bee";
import { Sprite } from "./Sprite";

export class NPC extends Sprite {
	message: string;

	// Constants
	static readonly FRAME_W = 64;

	constructor(x: number, y: number, message: string) {
		super(x, y);
		this.message = message;
	}

	// Verify if the bee is nearby
	isNearBee(bee: Bee): boolean {
		const dist = Math.hypot(this.x - bee.x, this.y - bee.y);
		return dist < 100; // interaction radius
	}

	update(): void {
		// Idle animation only
		this.frameIndex = (this.frameIndex + 0.05) % 4;
	}

	getBackgroundPosition() {
		return {
			x: Math.floor(this.frameIndex) * NPC.FRAME_W,
			y: 0,
		};
	}
}
