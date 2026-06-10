import { UIComponent } from "./UIComponent";
import { MAX_LIVES } from "../game/GameState";

export class Lives extends UIComponent {
  constructor() {
    super("div");
    this.root.id = "ui-lives";
  }

  update(lives: number): void {
    const filled = Math.max(0, lives);
    this.root.textContent = "♥".repeat(filled) + "♡".repeat(MAX_LIVES - filled);
  }
}
