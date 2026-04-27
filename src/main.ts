import "./style.css";

const ROOT = document.getElementById("app");

const WIDTH = window.innerWidth;
const HEIGHT = window.innerHeight;

const KEYS = {
	up: false,
	down: false,
	left: false,
	right: false,
};

const BEE_SIZE = 64;
const GRAVITY = 0.4;
const LIFT = -0.7;
const MAX_FALL_SPEED = 8;
const HORIZONTAL_ACCEL = 0.5;
const FRICTION = 0.9;

type GameState = {
	x: number;
	y: number;
	vx: number;
	vy: number;
};

const state: GameState = {
	x: 100,
	y: 100,
	vx: 0,
	vy: 0,
};

function render(state: GameState): string {
	return `
    <div class="scene">
      <div class="bee" style="transform: translate(${state.x}px, ${state.y}px)">
        <img src="/sprites/bee.png" alt="Bee">
      </div>
    </div>
  `;
}

window.addEventListener("keydown", (e) => {
	if (e.key === "ArrowUp") KEYS.up = true;
	if (e.key === "ArrowDown") KEYS.down = true;
	if (e.key === "ArrowLeft") KEYS.left = true;
	if (e.key === "ArrowRight") KEYS.right = true;
});

window.addEventListener("keyup", (e) => {
	if (e.key === "ArrowUp") KEYS.up = false;
	if (e.key === "ArrowDown") KEYS.down = false;
	if (e.key === "ArrowLeft") KEYS.left = false;
	if (e.key === "ArrowRight") KEYS.right = false;
});

function update() {
	if (KEYS.up) {
		state.vy += LIFT;
	} else {
		state.vy += GRAVITY;
	}

	// limit fall speed
	if (state.vy > MAX_FALL_SPEED) {
		state.vy = MAX_FALL_SPEED;
	}

	// horizontal movement
	if (KEYS.left) state.vx -= HORIZONTAL_ACCEL;
	if (KEYS.right) state.vx += HORIZONTAL_ACCEL;

	// friction horizontale
	state.vx *= FRICTION;

	// apply speed to position
	state.x += state.vx;
	state.y += state.vy;

	// left / right
	if (state.x < 0) {
		state.x = 0;
		state.vx = 0;
	}
	if (state.x > WIDTH - BEE_SIZE) {
		state.x = WIDTH - BEE_SIZE;
		state.vx = 0;
	}

	// top
	if (state.y < 0) {
		state.y = 0;
		state.vy = 0;
	}

	// floor
	if (state.y > HEIGHT - BEE_SIZE) {
		state.y = HEIGHT - BEE_SIZE;
		state.vy = 0;
	}
}

if (!ROOT) throw new Error("Root not found");

function gameLoop() {
	update();
	ROOT!.innerHTML = render(state);
	requestAnimationFrame(gameLoop);
}

gameLoop();
