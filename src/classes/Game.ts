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

	constructor() {
		const sceneElement = document.querySelector(".scene") || document.querySelector("#app");
		this.width = sceneElement?.clientWidth || window.innerWidth;
		this.height = sceneElement?.clientHeight || window.innerHeight;
		this.bee = new Bee(100, 100);
		this.keys = {
			up: false,
			down: false,
			left: false,
			right: false,
		};

		this.setupEventListeners();
		this.setupAnimation();
	}

	private setupEventListeners() {
		window.addEventListener("keydown", (e) => {
			if (e.key === "ArrowUp") this.keys.up = true;
			if (e.key === "ArrowDown") this.keys.down = true;
			if (e.key === "ArrowLeft") this.keys.left = true;
			if (e.key === "ArrowRight") this.keys.right = true;
		});

		window.addEventListener("keyup", (e) => {
			if (e.key === "ArrowUp") this.keys.up = false;
			if (e.key === "ArrowDown") this.keys.down = false;
			if (e.key === "ArrowLeft") this.keys.left = false;
			if (e.key === "ArrowRight") this.keys.right = false;
		});
	}

	private setupAnimation() {
		const ANIMATION_DELAY = 100; // ms
		setInterval(() => {
			this.bee.frameIndex = (this.bee.frameIndex + 1) % Bee.TOTAL_FRAMES;
		}, ANIMATION_DELAY);
	}

	update() {
		this.bee.update(this.keys, this.width, this.height);
	}

	render(): string {
		const bgPos = this.bee.getBackgroundPosition();
		return `
      <div class="scene">
        <div class="bee" style="
          transform: translate(${this.bee.x}px, ${this.bee.y}px);
          background-position: ${bgPos.x}px ${bgPos.y}px">
        </div>
      </div>
    `;
	}
}
