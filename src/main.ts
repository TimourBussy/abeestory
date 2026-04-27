import "./style.css";
import { Game } from "./classes/Game";

const ROOT = document.getElementById("app");

// Set up CSS variable for sprite size
const SPRITE_SIZE = 76;
document.documentElement.style.setProperty("--sprite-size", `${SPRITE_SIZE}px`);

if (!ROOT) throw new Error("Root not found");

// Initialize game
const GAME = new Game();

// Game loop
function gameLoop() {
	GAME.update();
	ROOT!.innerHTML = GAME.render();
	requestAnimationFrame(gameLoop);
}

gameLoop();
