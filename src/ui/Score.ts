import { UIComponent } from "./UIComponent";

export class Score extends UIComponent {
  private strokesEl: HTMLSpanElement;
  private parEl: HTMLSpanElement;

  constructor() {
    super("div");
    this.root.id = "ui-score";
    this.root.innerHTML = `Coups : <span>0</span> / Par <span>-</span>`;
    const spans = this.root.querySelectorAll("span");
    this.strokesEl = spans[0] as HTMLSpanElement;
    this.parEl = spans[1] as HTMLSpanElement;
  }

  update(strokes: number, par: number): void {
    this.strokesEl.textContent = String(strokes);
    this.parEl.textContent = String(par);
  }
}
