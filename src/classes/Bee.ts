import { Sprite } from "./Sprite";

export class Bee extends Sprite {
	static readonly FRAME_W = 152;
	static readonly FRAME_H = 152;
	static readonly SIZE = 76;
	static readonly MAX_FALL_SPEED = 300;
	static readonly HORIZONTAL_ACCEL = 800;
	static readonly SPRITE_COLS = 6;
	static readonly TOTAL_FRAMES = 12;

	private _vx: number;
	private _vy: number;
	private _frameIndex: number;
	private _direction: 1 | -1;
	private _isFrozen: boolean = false;

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
		}
	}
	get direction(): 1 | -1 {
		return this._direction;
	}
	set direction(value: 1 | -1) {
		this._direction = value;
	}
	get isFrozen(): boolean {
		return this._isFrozen;
	}
	set isFrozen(value: boolean) {
		this._isFrozen = value;
	}

	update(
		keys: { up: boolean; down: boolean; left: boolean; right: boolean },
		width: number,
		height: number,
		groundHeight: number = 0,
		dt: number = 0.016,
	) {
		if (keys.up) {
			this._vy -= 1200 * dt; // lift
			if (this._vy < -Bee.MAX_FALL_SPEED) this._vy = -Bee.MAX_FALL_SPEED;
		} else {
			this._vy += 900 * dt; // gravity
		}

		if (this._vy > Bee.MAX_FALL_SPEED) this._vy = Bee.MAX_FALL_SPEED;

		// Handle horizontal movement
		if (keys.left && !keys.right) {
			this._vx -= Bee.HORIZONTAL_ACCEL * dt;
			this.direction = -1;
		} else if (keys.right && !keys.left) {
			this._vx += Bee.HORIZONTAL_ACCEL * dt;
			this.direction = 1;
		}
		// If both are pressed, they cancel each other (no acceleration, direction unchanged)

		this._vx *= Math.pow(0.01, dt); // friction

		// Apply velocity — une seule fois
		this.x += this._vx * dt;
		this.y += this._vy * dt;

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
