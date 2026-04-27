export class Bee {
	x: number;
	y: number;
	vx: number;
	vy: number;
	frameIndex: number;

	// Constants
	static readonly SIZE = 76;
	static readonly GRAVITY = 0.3;
	static readonly LIFT = -0.7;
	static readonly MAX_FALL_SPEED = 2;
	static readonly HORIZONTAL_ACCEL = 0.4;
	static readonly FRICTION = 0.9;
	static readonly SPRITE_COLS = 6;
	static readonly TOTAL_FRAMES = 12;

	constructor(x: number = 0, y: number = 0) {
		this.x = x;
		this.y = y;
		this.vx = 0;
		this.vy = 0;
		this.frameIndex = 0;
	}

	update(
		keys: { up: boolean; down: boolean; left: boolean; right: boolean },
		width: number,
		height: number,
	) {
		// Physics
		if (keys.up) {
			this.vy += Bee.LIFT;
			if (this.vy < -Bee.MAX_FALL_SPEED) {
				this.vy = -Bee.MAX_FALL_SPEED;
			}
		} else {
			this.vy += Bee.GRAVITY;
		}

		// Limit fall speed
		if (this.vy > Bee.MAX_FALL_SPEED) {
			this.vy = Bee.MAX_FALL_SPEED;
		}

		// Horizontal movement
		if (keys.left) this.vx -= Bee.HORIZONTAL_ACCEL;
		if (keys.right) this.vx += Bee.HORIZONTAL_ACCEL;

		// Friction
		this.vx *= Bee.FRICTION;

		// Apply velocity to position
		this.x += this.vx;
		this.y += this.vy;

		// Collision detection
		// Left / Right
		if (this.x < 0) {
			this.x = 0;
			this.vx = 0;
		}
		if (this.x > width - Bee.SIZE) {
			this.x = width - Bee.SIZE;
			this.vx = 0;
		}

		// Top
		if (this.y < 0) {
			this.y = 0;
			this.vy = 0;
		}

		// Floor
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
