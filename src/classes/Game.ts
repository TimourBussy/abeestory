import { Bee } from "./Bee";

export class Game {
	bee: Bee;
	width: number;
	height: number;
	keys: {
		up: boolean;
		down: boolean;
		left: boolean;
		right: boolean;
	};
	static readonly KEY_NAMES = {
		up: ["ArrowUp", "z", "w", " "],
		left: ["ArrowLeft", "q", "a"],
		right: ["ArrowRight", "d"],
	};

	private canvas: HTMLCanvasElement;
	private ctx: CanvasRenderingContext2D;
	private rootElement: HTMLElement;

	// Images
	private beeSprite: HTMLImageElement;
	private groundImage: HTMLImageElement;
	private imagesLoaded: number = 0;
	private totalImages: number = 2;

	// Camera
	private cameraX: number = 0;

	constructor(rootElement: HTMLElement) {
		this.rootElement = rootElement;

		// Canvas setup
		this.canvas = document.createElement("canvas");
		this.canvas.width = window.innerWidth;
		this.canvas.height = window.innerHeight;
		this.rootElement.appendChild(this.canvas);

		this.ctx = this.canvas.getContext("2d")!;
		this.width = this.canvas.width;
		this.height = this.canvas.height;

		this.bee = new Bee(100, 100);
		this.keys = { up: false, down: false, left: false, right: false };

		// Resize
		window.addEventListener("resize", () => {
			this.canvas.width = window.innerWidth;
			this.canvas.height = window.innerHeight;
			this.width = this.canvas.width;
			this.height = this.canvas.height;
		});

		// Load images
		this.beeSprite = new Image();
		this.groundImage = new Image();

		this.beeSprite.onload = () => this.imagesLoaded++;
		this.groundImage.onload = () => this.imagesLoaded++;

		this.beeSprite.src = "/sprites/bee.png";
		this.groundImage.src = "/sprites/ground.png";
	}

	start() {
		// Setup event listeners
		window.addEventListener("keydown", (e) => {
			if (Game.KEY_NAMES.up.includes(e.key)) this.keys.up = true;
			if (Game.KEY_NAMES.left.includes(e.key)) this.keys.left = true;
			if (Game.KEY_NAMES.right.includes(e.key)) this.keys.right = true;
			e.preventDefault();
		});
		window.addEventListener("keyup", (e) => {
			if (Game.KEY_NAMES.up.includes(e.key)) this.keys.up = false;
			if (Game.KEY_NAMES.left.includes(e.key)) this.keys.left = false;
			if (Game.KEY_NAMES.right.includes(e.key)) this.keys.right = false;
		});

		// Setup animation
		setInterval(() => {
			this.bee.frameIndex = (this.bee.frameIndex + 1) % Bee.TOTAL_FRAMES;
		}, 100);

		// Start game loop
		const loop = () => {
			this.update();
			this.draw();
			requestAnimationFrame(loop);
		};
		loop();
	}

	update() {
		this.bee.update(
			this.keys,
			this.width,
			this.height,
			this.groundImage.naturalHeight - 62,
		);

		// Camera follows the bee horizontally
		this.cameraX +=
			(this.bee.x - this.width / 2 + Bee.SIZE / 2 - this.cameraX) * 0.1; // smooth follow
		if (this.cameraX < 0) this.cameraX = 0;
	}

	draw() {
		const ctx = this.ctx;

		// Wait for images to load
		if (this.imagesLoaded < this.totalImages) {
			ctx.fillStyle = "lightblue";
			ctx.fillRect(0, 0, this.width, this.height);
			ctx.fillStyle = "black";
			ctx.font = "20px sans-serif";
			ctx.fillText("Loading...", this.width / 2 - 50, this.height / 2);
			return;
		}

		// Fond
		ctx.fillStyle = "lightblue";
		ctx.fillRect(0, 0, this.width, this.height);

		// Ground
		const groundW = this.groundImage.naturalWidth;
		for (let x = -(this.cameraX % groundW); x < this.width; x += groundW) {
			ctx.drawImage(
				this.groundImage,
				x,
				this.height - this.groundImage.naturalHeight,
			);
		}

		// Bee
		const screenX = this.bee.x - this.cameraX;
		const screenY = this.bee.y;

		const col = this.bee.frameIndex % Bee.SPRITE_COLS;
		const row = Math.floor(this.bee.frameIndex / Bee.SPRITE_COLS);

		ctx.save();
		if (this.bee.direction === -1) {
			ctx.translate(screenX + Bee.SIZE, screenY);
			ctx.scale(-1, 1);
			ctx.drawImage(
				this.beeSprite,
				col * Bee.FRAME_W,
				row * Bee.FRAME_H, // position in the spritesheet
				Bee.FRAME_W,
				Bee.FRAME_H, // size of one frame in the spritesheet
				0,
				0, // destination
				Bee.SIZE,
				Bee.SIZE, // displayed size
			);
		} else {
			ctx.drawImage(
				this.beeSprite,
				col * Bee.FRAME_W,
				row * Bee.FRAME_H,
				Bee.FRAME_W,
				Bee.FRAME_H,
				screenX,
				screenY,
				Bee.SIZE,
				Bee.SIZE,
			);
		}
		ctx.restore();
	}
}
