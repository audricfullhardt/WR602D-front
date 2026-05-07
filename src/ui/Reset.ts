import { UIComponent } from "./UIComponent";
import { HoleResult } from "../game/types";
import { getScoreLabel } from "../game/Values";

export class Reset extends UIComponent {
  private messageEl: HTMLParagraphElement;

  constructor(onNext: () => void, onRestart: () => void) {
    super("div");
    this.root.id = "ui-reset";
    this.root.innerHTML = `
      <p></p>
      <button id="ui-reset-next">Trou suivant</button>
      <button id="ui-reset-restart">Recommencer</button>
    `;
    this.messageEl = this.root.querySelector("p")!;
    this.root.querySelector("#ui-reset-next")!.addEventListener("click", onNext);
    this.root.querySelector("#ui-reset-restart")!.addEventListener("click", onRestart);
  }

  update(result: HoleResult): void {
    const label = getScoreLabel(result.strokes, result.par);
    this.messageEl.textContent = `${result.strokes} coups — ${label}`;
  }
}
