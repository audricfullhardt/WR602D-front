export class HUD {
  private container: HTMLDivElement;
  private strokesEl: HTMLSpanElement;
  private messageEl: HTMLDivElement;

  constructor() {
    this.container = document.createElement("div");
    this.container.id = "hud";

    this.container.innerHTML = `
        <div id="hud-strokes">
          Coups : <span id="hud-strokes-count">0</span>
        </div>
        <div id="hud-message"></div>
      `;

    document.body.appendChild(this.container);

    this.strokesEl = document.getElementById(
      "hud-strokes-count"
    ) as HTMLSpanElement;
    this.messageEl = document.getElementById("hud-message") as HTMLDivElement;
  }

  updateStrokes(count: number): void {
    this.strokesEl.textContent = String(count);
  }

  showMessage(text: string): void {
    this.messageEl.textContent = text;
    this.messageEl.style.opacity = "1";
  }

  showResetMessage(): void {
    this.showMessage("Cliquez pour recommencer");
  }

  hideMessage(): void {
    this.messageEl.style.opacity = "0";
  }
}
