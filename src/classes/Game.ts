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
	static readonly KEYS = {
		up: ["ArrowUp", "z", "w", " "],
		left: ["ArrowLeft", "q", "a"],
		right: ["ArrowRight", "d"],
	};

	private rootElement: HTMLElement | null;

	constructor(rootElement: HTMLElement | null) {
		this.rootElement = rootElement;
		const sceneElement =
			document.querySelector(".scene") || document.querySelector("#app");
		this.width = sceneElement?.clientWidth || window.innerWidth;
		this.height = sceneElement?.clientHeight || window.innerHeight;
		this.bee = new Bee(100, 100);
		this.keys = {
			up: false,
			down: false,
			left: false,
			right: false,
		};
	}

	start() {
		this.setupEventListeners();
		this.setupAnimation();
		this.startGameLoop();
	}

	private setupEventListeners() {
		window.addEventListener("keydown", (e) => {
			if (Game.KEYS.up.includes(e.key)) {
				this.keys.up = true;
			}
			if (Game.KEYS.left.includes(e.key)) this.keys.left = true;
			if (Game.KEYS.right.includes(e.key)) this.keys.right = true;

			e.preventDefault(); // prevent scrolling when space is pressed
		});

		window.addEventListener("keyup", (e) => {
			if (Game.KEYS.up.includes(e.key)) this.keys.up = false;
			if (Game.KEYS.left.includes(e.key)) this.keys.left = false;
			if (Game.KEYS.right.includes(e.key)) this.keys.right = false;
		});
	}

	private setupAnimation() {
		setInterval(() => {
			this.bee.frameIndex = (this.bee.frameIndex + 1) % Bee.TOTAL_FRAMES;
		}, 25);
	}

	private startGameLoop() {
		const update = () => {
			this.update();
			if (this.rootElement) {
				this.rootElement.innerHTML = this.render();
			}
			requestAnimationFrame(update);
		};
		update();
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
