import { Sprite } from "./Sprite";

export class Bee extends Sprite {
	static readonly FRAME_W = 152;
	static readonly FRAME_H = 152;
	static readonly SIZE = 76;
	static readonly MAX_FALL_SPEED = 2;
	static readonly HORIZONTAL_ACCEL = 1;
	static readonly SPRITE_COLS = 6;
	static readonly TOTAL_FRAMES = 12;

	private _vx: number;
	private _vy: number;

	private _frameIndex: number;
	private _direction: 1 | -1;

	constructor(x: number = 0, y: number = 0) {
		super(x, y);
		this._frameIndex = 0;
		this._direction = 1;
		this._vx = 0;
		this._vy = 0;
	}

	get frameIndex(): number {
		return this._frameIndex;
	}

	set frameIndex(value: number) {
		if (value >= 0 && value < Bee.TOTAL_FRAMES) {
			this._frameIndex = value;
		} else {
			console.warn(`Invalid frame index: ${value}. Must be between 0 and ${Bee.TOTAL_FRAMES - 1}`);
		}
	}

	get direction(): 1 | -1 {
		return this._direction;
	}

	set direction(value: 1 | -1) {
		this._direction = value;
	}

	update(
		keys: { up: boolean; down: boolean; left: boolean; right: boolean },
		width: number,
		height: number,
		groundHeight: number = 0,
		dt: number = 1, // delta time normalised to 60fps
	) {
		// Physics
		if (keys.up) {
			this._vy -= 0.4 * dt; // lift
			if (this._vy < -Bee.MAX_FALL_SPEED) this._vy = -Bee.MAX_FALL_SPEED;
		} else {
			this._vy += 0.15 * dt; // gravity
		}

		// Limit fall speed
		if (this._vy > Bee.MAX_FALL_SPEED) this._vy = Bee.MAX_FALL_SPEED;

		// Horizontal movement
		if (keys.left) {
			this._vx -= Bee.HORIZONTAL_ACCEL * dt;
			this.direction = -1;
		}
		if (keys.right) {
			this._vx += Bee.HORIZONTAL_ACCEL * dt;
			this.direction = 1;
		}

		this._vx *= Math.pow(0.45, dt); // friction
		this.x += this._vx * dt;
		this.y += this._vy * dt;

		// Apply velocity to position
		this.x += this._vx;
		this.y += this._vy;

		// Collision detection
		if (this.x < 0) {
			this.x = 0;
			this._vx = 0;
		}
		if (this.x > width - Bee.SIZE) {
			this.x = width - Bee.SIZE;
			this._vx = 0;
		}
		if (this.y < 0) {
			this.y = 0;
			this._vy = 0;
		}
		const floor = height - Bee.SIZE - groundHeight;
		if (this.y > floor) {
			this.y = floor;
			this._vy = 0;
		}
	}
}
