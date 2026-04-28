import { Sprite } from "./Sprite";

export class Bee extends Sprite {
	// Constants
	static readonly FRAME_W = 152;
	static readonly FRAME_H = 152;
	static readonly SIZE = 76;
	static readonly MAX_FALL_SPEED = 4;
	static readonly HORIZONTAL_ACCEL = 0.3;
	static readonly SPRITE_COLS = 6;
	static readonly TOTAL_FRAMES = 12;

	frameIndex: number;
	direction: 1 | -1;
	vx: number;
	vy: number;

	constructor(x: number = 0, y: number = 0) {
		super(x, y);
		this.frameIndex = 0;
		this.direction = 1;
		this.vx = 0;
		this.vy = 0;
	}

	update(
		keys: { up: boolean; down: boolean; left: boolean; right: boolean },
		width: number,
		height: number,
		groundHeight: number = 0,
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
		const floor = height - Bee.SIZE - groundHeight;
		if (this.y > floor) {
			this.y = floor;
			this.vy = 0;
		}
	}
}
