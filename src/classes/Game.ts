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
	// Constants
	static readonly KEY_NAMES = {
		up: ["ArrowUp", "z", "w", " "],
		left: ["ArrowLeft", "q", "a"],
		right: ["ArrowRight", "d"],
	};
	static readonly SKY_SCALE = 1.2;

	private canvas: HTMLCanvasElement;
	private ctx: CanvasRenderingContext2D;
	private rootElement: HTMLElement;

	// Images
	private skyImage: HTMLImageElement;
	private beeSprite: HTMLImageElement;
	private groundImage: HTMLImageElement;
	private imagesLoaded: number = 0;
	private totalImages: number = 3;

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
		this.skyImage = new Image();

		this.beeSprite.onload = () => this.imagesLoaded++;
		this.groundImage.onload = () => this.imagesLoaded++;
		this.skyImage.onload = () => this.imagesLoaded++;

		this.skyImage.src = "/sprites/sky.png";
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
		// Wait for images to load
		if (this.imagesLoaded < this.totalImages) {
			this.ctx.fillStyle = "lightblue";
			this.ctx.fillRect(0, 0, this.width, this.height);
			this.ctx.fillStyle = "black";
			this.ctx.font = "20px sans-serif";
			this.ctx.fillText("Loading...", this.width / 2 - 50, this.height / 2);
			return;
		}

		// Background
		this.ctx.fillStyle = "lightblue"; // backup color
		this.ctx.fillRect(0, 0, this.width, this.height);

		// Sky with parallax effect
		const skyW = this.skyImage.naturalWidth * Game.SKY_SCALE;
		for (let x = -(this.cameraX * 0.05) % skyW; x < this.width; x += skyW) {
			// 0.05 = 5% of camera speed
			this.ctx.drawImage(
				this.skyImage,
				x,
				0,
				skyW,
				this.skyImage.naturalHeight * Game.SKY_SCALE,
			);
		}

		// Ground
		const groundW = this.groundImage.naturalWidth;
		for (let x = -(this.cameraX % groundW); x < this.width; x += groundW - 1) { // -1 to prevent little weird space
			this.ctx.drawImage(
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

		this.ctx.save();
		if (this.bee.direction === -1) {
			this.ctx.translate(screenX + Bee.SIZE, screenY);
			this.ctx.scale(-1, 1);
			this.ctx.drawImage(
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
			this.ctx.drawImage(
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
		this.ctx.restore();
	}
}
