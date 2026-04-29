import { Bee } from "./Bee";
import { NPC } from "./NPC";

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
	static readonly WORLD_WIDTH = 5000;
	static readonly GAME_WIDTH = 1280;
	static readonly GAME_HEIGHT = 720;
	static readonly SKY_BACKUP_COLOR = "lightblue";
	static readonly SKY_SCALE = 1.2;
	static readonly KEY_CODES = {
		up: ["ArrowUp", "KeyW"],
		left: ["ArrowLeft", "KeyA"],
		right: ["ArrowRight", "KeyD"],
	};

	private canvas: HTMLCanvasElement;
	private ctx: CanvasRenderingContext2D;
	private rootElement: HTMLElement;

	// Images
	private skyImage: HTMLImageElement | null = null;
	private beeSprite: HTMLImageElement | null = null;
	private groundImage: HTMLImageElement | null = null;
	private npcImages: Map<string, HTMLImageElement> = new Map();
	private groundHeight: number = 62; // valeur par défaut jusqu'au chargement

	// NPCs
	private npcs: NPC[] = [];

	// Camera
	private cameraX: number = 0;

	constructor(rootElement: HTMLElement) {
		this.rootElement = rootElement;

		// Canvas setup
		this.canvas = document.createElement("canvas");
		this.canvas.width = Game.GAME_WIDTH;
		this.canvas.height = Game.GAME_HEIGHT;
		this.rootElement.appendChild(this.canvas);

		this.ctx = this.canvas.getContext("2d")!;
		this.width = Game.GAME_WIDTH;
		this.height = Game.GAME_HEIGHT;

		// Create NPCs
		this.npcs.push(new NPC(1200, "Hello World!", "/sprites/npc1.png"));

		// Create bee
		this.bee = new Bee(100, this.height - Bee.SIZE - this.groundHeight);
		this.keys = { up: false, down: false, left: false, right: false };

		// Load all images via Promise.all
		(async (): Promise<void> => {
			// Collect unique NPC image sources
			const npcSrcs = [...new Set(this.npcs.map((npc) => npc.imageSrc))];

			const [sky, bee, ground, ...npcImgs] = await Promise.all([
				this.loadImage("/sprites/sky.png"),
				this.loadImage("/sprites/bee.png"),
				this.loadImage("/sprites/ground.png"),
				...npcSrcs.map((src) => this.loadImage(src)),
			]);

			this.skyImage = sky;
			this.beeSprite = bee;
			this.groundImage = ground;
			this.groundHeight = ground.naturalHeight - 62;

			npcSrcs.forEach((src, i) => this.npcImages.set(src, npcImgs[i]));
		})();
	}

	private loadImage(src: string): Promise<HTMLImageElement> {
		return new Promise((resolve, reject) => {
			const img = new Image();
			img.onload = () => resolve(img);
			img.onerror = () => reject(new Error(`Failed to load image: ${src}`));
			img.src = src;
		});
	}

	start() {
		// Setup event listeners
		window.addEventListener("keydown", (e) => {
			if (Game.KEY_CODES.up.includes(e.code)) this.keys.up = true;
			if (Game.KEY_CODES.left.includes(e.code)) this.keys.left = true;
			if (Game.KEY_CODES.right.includes(e.code)) this.keys.right = true;
			e.preventDefault();
		});
		window.addEventListener("keyup", (e) => {
			if (Game.KEY_CODES.up.includes(e.code)) this.keys.up = false;
			if (Game.KEY_CODES.left.includes(e.code)) this.keys.left = false;
			if (Game.KEY_CODES.right.includes(e.code)) this.keys.right = false;
		});

		// Setup animation
		setInterval(() => {
			if (this.keys.up || this.keys.left || this.keys.right) {
				this.bee.frameIndex = (this.bee.frameIndex + 1) % Bee.TOTAL_FRAMES;
			} else {
				this.bee.frameIndex = 2; // sleeping frame
			}
		}, 25);

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
			Game.WORLD_WIDTH,
			this.height,
			this.groundHeight,
		);
		this.npcs.forEach((npc) => {
			const npcImage = this.npcImages.get(npc.imageSrc);
			if (npcImage) {
				npc.y =
					this.height -
					npcImage.naturalHeight * npc.scale -
					this.groundHeight -
					npc.randomYOffset;
			}
			npc.update();
		});

		// Camera follows the bee horizontally
		this.cameraX +=
			(this.bee.x - this.width / 2 + Bee.SIZE / 2 - this.cameraX) * 0.1;
		if (this.cameraX < 0) this.cameraX = 0;
	}

	draw() {
		const ctx = this.ctx;

		// Loading screen
		if (!(this.skyImage && this.beeSprite && this.groundImage)) {
			ctx.fillStyle = Game.SKY_BACKUP_COLOR;
			ctx.fillRect(0, 0, this.width, this.height);
			ctx.fillStyle = "black";
			ctx.font = "20px sans-serif";
			ctx.fillText("Loading...", this.width / 2 - 50, this.height / 2);
			return;
		}

		// Background
		ctx.fillStyle = Game.SKY_BACKUP_COLOR;
		ctx.fillRect(0, 0, this.width, this.height);

		// Sky with parallax effect
		const skyW = this.skyImage.naturalWidth * Game.SKY_SCALE;
		for (let x = -(this.cameraX * 0.05) % skyW; x < this.width; x += skyW) {
			ctx.drawImage(
				this.skyImage,
				x,
				0,
				skyW,
				this.skyImage.naturalHeight * Game.SKY_SCALE,
			);
		}

		// Ground
		const groundW = this.groundImage.naturalWidth;
		for (let x = -(this.cameraX % groundW); x < this.width; x += groundW - 1) {
			ctx.drawImage(
				this.groundImage,
				x,
				this.height - this.groundImage.naturalHeight,
			);
		}

		// NPCs
		this.npcs.forEach((npc) => {
			const npcImage = this.npcImages.get(npc.imageSrc);
			if (!npcImage) return;

			ctx.drawImage(
				npcImage,
				0,
				0,
				npcImage.naturalWidth,
				npcImage.naturalHeight,
				npc.x - this.cameraX,
				npc.y,
				npcImage.naturalWidth * npc.scale,
				npcImage.naturalHeight * npc.scale,
			);
		});

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
				row * Bee.FRAME_H,
				Bee.FRAME_W,
				Bee.FRAME_H,
				0,
				0,
				Bee.SIZE,
				Bee.SIZE,
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
