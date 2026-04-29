import { Bee } from "./Bee";
import { NPC } from "./NPC";
import { DialogManager } from "./DialogManager";

export class Game {
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
	static readonly FONT_WEIGHT = "bold";
	static readonly FONT_FAMILY = "Papyrus";

	// ============ CANVAS & RENDERING ============
	private _canvas: HTMLCanvasElement;
	private _ctx: CanvasRenderingContext2D;
	private _rootElement: HTMLElement;
	private _width: number;
	private _height: number;

	// ============ TIMING ============
	private _tick: number = 0;
	private _lastTime: number = 0;

	// ============ INPUT ============
	private _keys: {
		up: boolean;
		down: boolean;
		left: boolean;
		right: boolean;
	};

	// ============ IMAGES ============
	private _skyImage: HTMLImageElement | null = null;
	private _beeSprite: HTMLImageElement | null = null;
	private _groundImage: HTMLImageElement | null = null;
	private _textboxImage: HTMLImageElement | null = null;
	private _npcImages: Map<string, HTMLImageElement> = new Map();
	private _npcFaceImages: Map<string, HTMLImageElement> = new Map();
	private _groundHeight: number = 62; // default value until ground image is loaded

	// ============ GAME WORLD (Actors) ============
	private _bee: Bee;
	private _npcs: NPC[] = [];

	// ============ SYSTEMS ============
	private _dialogManager: DialogManager;
	private _cameraX: number = 0;

	constructor(rootElement: HTMLElement) {
		this._rootElement = rootElement;

		// Canvas setup
		this._canvas = document.createElement("canvas");
		this._canvas.width = Game.GAME_WIDTH;
		this._canvas.height = Game.GAME_HEIGHT;
		this._rootElement.appendChild(this._canvas);

		this._ctx = this._canvas.getContext("2d")!;
		this._width = Game.GAME_WIDTH;
		this._height = Game.GAME_HEIGHT;

		window.addEventListener("resize", () => {
			const scale = Math.min(
				window.innerWidth / Game.GAME_WIDTH,
				window.innerHeight / Game.GAME_HEIGHT,
			);
			this._canvas.style.width = `${Game.GAME_WIDTH * scale}px`;
			this._canvas.style.height = `${Game.GAME_HEIGHT * scale}px`;
		});
		// Immediate trigger to set initial canvas size
		window.dispatchEvent(new Event("resize"));

		// Create NPCs
		this._npcs.push(
			new NPC(
				1000,
				"Apiculteur Connecté",
				["Hello World!"],
				"/sprites/npc1.png",
				18,
				0,
			),
		);

		// Create bee
		this._bee = new Bee(100, this._height - Bee.SIZE - this._groundHeight);
		this._keys = { up: false, down: false, left: false, right: false };

		// Initialize dialog manager
		this._dialogManager = new DialogManager();

		// Load all images via Promise.all
		(async (): Promise<void> => {
			// Collect unique NPC image sources
			const npcSrcs = [...new Set(this._npcs.map((npc) => npc.imageSrc))];

			const [sky, bee, ground, textbox, ...npcImgs] = await Promise.all([
				this.loadImage("/sprites/sky.png"),
				this.loadImage("/sprites/bee.png"),
				this.loadImage("/sprites/ground.png"),
				this.loadImage("/sprites/textbox.png"),
				...npcSrcs.map((src) => this.loadImage(src)),
			]);

			this._skyImage = sky;
			this._beeSprite = bee;
			this._groundImage = ground;
			this._textboxImage = textbox;
			this._groundHeight = ground.naturalHeight - 62;

			npcSrcs.forEach((src, i) => this._npcImages.set(src, npcImgs[i]));

			// Load NPC face images if they exist
			const faceSrcs = npcSrcs.map((src) => {
				const name = src.split("/").pop()?.split(".")[0];
				return `/sprites/${name}_face.png`;
			});

			const faceImgs = await Promise.allSettled(
				faceSrcs.map((src) => this.loadImage(src)),
			);

			faceImgs.forEach((result, i) => {
				if (result.status === "fulfilled") {
					this._npcFaceImages.set(npcSrcs[i], result.value);
				}
			});
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
			if (Game.KEY_CODES.up.includes(e.code)) this._keys.up = true;
			if (Game.KEY_CODES.left.includes(e.code)) this._keys.left = true;
			if (Game.KEY_CODES.right.includes(e.code)) this._keys.right = true;

			// Handle space bar for dialog interaction
			if (e.code === "Space") {
				e.preventDefault();
				this._dialogManager.handleInteraction(this._npcs, this._bee);
			}
		});
		window.addEventListener("keyup", (e) => {
			if (Game.KEY_CODES.up.includes(e.code)) this._keys.up = false;
			if (Game.KEY_CODES.left.includes(e.code)) this._keys.left = false;
			if (Game.KEY_CODES.right.includes(e.code)) this._keys.right = false;
		});

		// Setup animation
		setInterval(() => {
			if (this._keys.up || this._keys.left || this._keys.right) {
				this._bee.frameIndex = (this._bee.frameIndex + 1) % Bee.TOTAL_FRAMES;
			} else {
				this._bee.frameIndex = 2; // sleeping frame
			}
		}, 25);

		// Start game loop
		const loop = (timestamp: number) => {
			const dt = this._lastTime
				? (timestamp - this._lastTime) / (1000 / 60)
				: 1;
			this._lastTime = timestamp;
			this.update(dt);
			this.draw();
			requestAnimationFrame(loop);
		};
		requestAnimationFrame(loop);
	}

	update(dt: number = 1) {
		this._bee.update(
			this._keys,
			Game.WORLD_WIDTH,
			this._height,
			this._groundHeight,
			dt,
		);
		this._npcs.forEach((npc) => {
			const npcImage = this._npcImages.get(npc.imageSrc);
			if (npcImage) {
				npc.y =
					this._height -
					npcImage.naturalHeight * npc.scale -
					this._groundHeight -
					npc.randomYOffset;
			}
			npc.update();
		});

		// Camera follows the bee horizontally
		this._cameraX +=
			(this._bee.x - this._width / 2 + Bee.SIZE / 2 - this._cameraX) * 0.1 * dt;
		if (this._cameraX < 0) this._cameraX = 0;

		this._tick += dt;
	}

	private draw() {
		const ctx = this._ctx;

		// Loading screen
		if (!(this._skyImage && this._beeSprite && this._groundImage)) {
			ctx.fillStyle = Game.SKY_BACKUP_COLOR;
			ctx.fillRect(0, 0, this._width, this._height);
			ctx.fillStyle = "black";
			ctx.font = "20px sans-serif";
			ctx.fillText("Loading...", this._width / 2 - 50, this._height / 2);
			return;
		}

		// Background
		ctx.fillStyle = Game.SKY_BACKUP_COLOR;
		ctx.fillRect(0, 0, this._width, this._height);

		// Sky with parallax effect
		const skyW = this._skyImage.naturalWidth * Game.SKY_SCALE;
		for (let x = -(this._cameraX * 0.05) % skyW; x < this._width; x += skyW) {
			ctx.drawImage(
				this._skyImage,
				x,
				0,
				skyW,
				this._skyImage.naturalHeight * Game.SKY_SCALE,
			);
		}

		// Ground
		const groundW = this._groundImage.naturalWidth;
		for (
			let x = -(this._cameraX % groundW);
			x < this._width;
			x += groundW - 1
		) {
			ctx.drawImage(
				this._groundImage,
				x,
				this._height - this._groundImage.naturalHeight,
			);
		}

		// NPCs
		this._npcs.forEach((npc) => {
			const npcImage = this._npcImages.get(npc.imageSrc);
			if (!npcImage) return;

			ctx.drawImage(
				npcImage,
				0,
				0,
				npcImage.naturalWidth,
				npcImage.naturalHeight,
				npc.x - this._cameraX,
				npc.y,
				npcImage.naturalWidth * npc.scale,
				npcImage.naturalHeight * npc.scale,
			);

			if (!npc.isNearBee(this._bee)) return;

			const indicatorX =
				npc.x -
				this._cameraX +
				(npcImage.naturalWidth * npc.scale) / 2 +
				npc.triangleOffsetX;
			const indicatorY =
				npc.y - 23 + Math.sin(this._tick * 0.1) * 4 + npc.triangleOffsetY; // up and down movement

			// Draw little triangle indicator above NPC
			ctx.save();
			ctx.fillStyle = "orange";
			ctx.beginPath();
			ctx.moveTo(indicatorX, indicatorY + 12);
			ctx.lineTo(indicatorX - 8, indicatorY);
			ctx.lineTo(indicatorX + 8, indicatorY);
			ctx.closePath();
			ctx.fill();
			ctx.restore();
		});

		// Bee
		const screenX = this._bee.x - this._cameraX;
		const screenY = this._bee.y;
		const col = this._bee.frameIndex % Bee.SPRITE_COLS;
		const row = Math.floor(this._bee.frameIndex / Bee.SPRITE_COLS);

		ctx.save();
		if (this._bee.direction === -1) {
			ctx.translate(screenX + Bee.SIZE, screenY);
			ctx.scale(-1, 1);
			ctx.drawImage(
				this._beeSprite,
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
				this._beeSprite,
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

		// Draw textbox if dialog is active
		if (this._dialogManager.activeDialogNPC && this._textboxImage) {
			const textboxWidth = this._width * 0.6;
			const textboxHeight =
				textboxWidth *
				(this._textboxImage.naturalHeight / this._textboxImage.naturalWidth); // Auto-scale height to maintain aspect ratio
			const textboxX = (this._width - textboxWidth) / 2;
			const textboxY = this._height - textboxHeight;

			// Draw textbox background
			ctx.drawImage(
				this._textboxImage,
				textboxX,
				textboxY,
				textboxWidth,
				textboxHeight,
			);

			// Draw NPC head (face image if available)
			const npcFaceImage = this._npcFaceImages.get(this._npcs[0].imageSrc);
			if (npcFaceImage) {
				// Simple square image - just position and draw
				const faceSize = textboxHeight * 0.53; // 80% of textbox height
				const faceX = textboxX + textboxWidth * 0.081;
				const faceY = textboxY + textboxHeight * 0.227;
				const faceW = faceSize * 0.951; // reduce width to fit better in the face frame
				const faceH = faceSize;

				ctx.save();
				ctx.beginPath();
				ctx.roundRect(faceX, faceY, faceW, faceH, 7); // little radius for better fit
				ctx.clip();

				// DEBUG: Background to visualize positioning
				// ctx.fillStyle = "rgba(255, 0, 0, 0.5)";
				// ctx.fillRect(faceX, faceY, faceW, faceH);

				ctx.drawImage(npcFaceImage, faceX, faceY, faceW, faceH);

				ctx.restore();
			}

			// Draw text
			ctx.fillStyle = "yellow";
			ctx.font = `bold ${Math.round(
				// Fit NPC name to available width
				this.fitTextToWidth(
					ctx,
					this._npcs[0].name,
					textboxWidth * 0.23,
					Math.round((textboxWidth / 960) * 21),
				),
			)}px Papyrus`;
			ctx.textBaseline = "middle";
			ctx.textAlign = "center";
			ctx.fillText(
				this._npcs[0].name,
				textboxX + textboxWidth * 0.396,
				textboxY + textboxHeight * 0.259,
			);

			ctx.fillStyle = "black";
			ctx.font = `bold ${Math.round((textboxWidth / 960) * 26)}px Papyrus`;
			ctx.textBaseline = "top";
			ctx.textAlign = "left";
			ctx.fillText(
				this._npcs[0].message[0],
				textboxX + textboxWidth * 0.29,
				textboxY + textboxHeight * 0.4,
			);
		}

		// DEBUG - DISPLAY TEXTBOX
		// if (this._npcs[0].message && this._textboxImage) {
		// 	const textboxWidth = this._width * 0.6;
		// 	const textboxHeight =
		// 		textboxWidth *
		// 		(this._textboxImage.naturalHeight / this._textboxImage.naturalWidth); // Auto-scale height to maintain aspect ratio
		// 	const textboxX = (this._width - textboxWidth) / 2;
		// 	const textboxY = this._height - textboxHeight;

		// 	// Draw textbox background
		// 	ctx.drawImage(
		// 		this._textboxImage,
		// 		textboxX,
		// 		textboxY,
		// 		textboxWidth,
		// 		textboxHeight,
		// 	);

		// 	// Draw NPC head (face image if available)
		// 	const npcFaceImage = this._npcFaceImages.get(this._npcs[0].imageSrc);
		// 	if (npcFaceImage) {
		// 		// Simple square image - just position and draw
		// 		const faceSize = textboxHeight * 0.53; // 80% of textbox height
		// 		const faceX = textboxX + textboxWidth * 0.081;
		// 		const faceY = textboxY + textboxHeight * 0.227;
		// 		const faceW = faceSize * 0.951; // reduce width to fit better in the face frame
		// 		const faceH = faceSize;

		// 		ctx.save();
		// 		ctx.beginPath();
		// 		ctx.roundRect(faceX, faceY, faceW, faceH, 7); // little radius for better fit
		// 		ctx.clip();

		// 		// DEBUG: Background to visualize positioning
		// 		// ctx.fillStyle = "rgba(255, 0, 0, 0.5)";
		// 		// ctx.fillRect(faceX, faceY, faceW, faceH);

		// 		ctx.drawImage(npcFaceImage, faceX, faceY, faceW, faceH);

		// 		ctx.restore();
		// 	}

		// 	// Draw text
		// 	ctx.fillStyle = "yellow";
		// 	ctx.font = `bold ${Math.round(
		// 		// Fit NPC name to available width
		// 		this.fitTextToWidth(
		// 			ctx,
		// 			this._npcs[0].name,
		// 			textboxWidth * 0.23,
		// 			Math.round((textboxWidth / 960) * 21),
		// 		),
		// 	)}px Papyrus`;
		// 	ctx.textBaseline = "middle";
		// 	ctx.textAlign = "center";
		// 	ctx.fillText(
		// 		this._npcs[0].name,
		// 		textboxX + textboxWidth * 0.396,
		// 		textboxY + textboxHeight * 0.259,
		// 	);

		// 	ctx.fillStyle = "black";
		// 	ctx.font = `bold ${Math.round((textboxWidth / 960) * 26)}px Papyrus`;
		// 	ctx.textBaseline = "top";
		// 	ctx.textAlign = "left";
		// 	ctx.fillText(
		// 		this._npcs[0].message[0],
		// 		textboxX + textboxWidth * 0.29,
		// 		textboxY + textboxHeight * 0.4,
		// 	);
		// }
	}

	/**
	 * Fits text to a max width by reducing font size if needed
	 * Returns the final font size that fits
	 */
	private fitTextToWidth(
		ctx: CanvasRenderingContext2D,
		text: string,
		maxWidth: number,
		baseFontSize: number,
	): number {
		let fontSize = baseFontSize;
		ctx.font = `${Game.FONT_WEIGHT} ${Math.round(fontSize)}px ${Game.FONT_FAMILY}`;
		let textWidth = ctx.measureText(text).width;

		// Reduce font size until text fits with 10px margin on each side
		while (textWidth > maxWidth - 20 && fontSize > 8) {
			fontSize -= 0.5;
			ctx.font = `${Game.FONT_WEIGHT} ${Math.round(fontSize)}px ${Game.FONT_FAMILY}`;
			textWidth = ctx.measureText(text).width;
		}

		return fontSize;
	}
}
