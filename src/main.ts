import "./style.css";
import { Game } from "./classes/Game";

const ROOT = document.getElementById("app");

// Set up CSS variable for sprite size
document.documentElement.style.setProperty("--sprite-size", "152px");

if (!ROOT) throw new Error("Root not found");

// Initialize and start game
const game = new Game(ROOT);
game.start();
