import { Sprite } from "./Sprite";

export class Bee extends Sprite {
	// Constants
	static readonly SIZE = 76;
	static readonly MAX_FALL_SPEED = 4;
	static readonly HORIZONTAL_ACCEL = 0.5;
	static readonly SPRITE_COLS = 6;
	static readonly TOTAL_FRAMES = 12;

	constructor(x: number = 0, y: number = 0) {
		super(x, y);
	}

	update(
		keys: { up: boolean; down: boolean; left: boolean; right: boolean },
		width: number,
		height: number,
	) {
		// Physics
		if (keys.up) {
			this.vy -= 0.8; // lift
			if (this.vy < -Bee.MAX_FALL_SPEED) {
				this.vy = -Bee.MAX_FALL_SPEED;
			}
		} else {
			this.vy += 0.3; // gravity
		}

		// Limit fall speed
		if (this.vy > Bee.MAX_FALL_SPEED) {
			this.vy = Bee.MAX_FALL_SPEED;
		}

		// Horizontal movement
		if (keys.left) {
			this.vx -= Bee.HORIZONTAL_ACCEL;
			this.direction = -1;
		}
		if (keys.right) {
			this.vx += Bee.HORIZONTAL_ACCEL;
			this.direction = 1;
		}

		// Friction
		this.vx *= 0.9;

		// Apply velocity to position
		this.x += this.vx;
		this.y += this.vy;

		// Collision detection
		if (this.x < 0) {
			this.x = 0;
			this.vx = 0;
		}
		if (this.x > width - Bee.SIZE) {
			this.x = width - Bee.SIZE;
			this.vx = 0;
		}
		if (this.y < 0) {
			this.y = 0;
			this.vy = 0;
		}
		if (this.y > height - Bee.SIZE) {
			this.y = height - Bee.SIZE;
			this.vy = 0;
		}
	}

	getBackgroundPosition(): { x: number; y: number } {
		return {
			x: -(this.frameIndex % Bee.SPRITE_COLS) * Bee.SIZE,
			y: -Math.floor(this.frameIndex / Bee.SPRITE_COLS) * Bee.SIZE,
		};
	}
}
