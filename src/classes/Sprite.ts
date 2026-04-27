export abstract class Sprite {
	x: number;
	y: number;
	vx: number;
	vy: number;
	frameIndex: number;
	direction: 1 | -1;

	constructor(x: number, y: number) {
		this.x = x;
		this.y = y;
		this.vx = 0;
		this.vy = 0;
		this.frameIndex = 0;
		this.direction = 1;
	}

	abstract update(keys: any, width: number, height: number): void;
	abstract getBackgroundPosition(): { x: number; y: number };
}
