import { UIComponent } from "./UIComponent";
import { HoleResult } from "../game/types";
import { getScoreLabel } from "../game/Values";

export class GameOver extends UIComponent {
  private titleEl: HTMLHeadingElement;
  private bodyEl: HTMLDivElement;

  constructor(onRestart: () => void) {
    super("div");
    this.root.id = "ui-gameover";
    this.root.innerHTML = `
      <h2></h2>
      <div class="ui-gameover-body"></div>
      <div class="ui-leaderboard-slot"></div>
      <button>Rejouer</button>
    `;
    this.titleEl = this.root.querySelector("h2")!;
    this.bodyEl = this.root.querySelector(".ui-gameover-body")!;
    this.root.querySelector("button")!.addEventListener("click", onRestart);
  }

  getLeaderboardSlot(): HTMLElement {
    return this.root.querySelector(".ui-leaderboard-slot")!;
  }

  updateDefeat(): void {
    this.titleEl.textContent = "Plus de vies — Partie terminée";
    this.bodyEl.innerHTML = "";
  }

  update(history: HoleResult[], totalStrokes: number, totalPar: number): void {
    this.titleEl.textContent = "Partie terminée !";

    const rows = history.map(h => {
      const diff = h.score >= 0 ? `+${h.score}` : String(h.score);
      return `<tr>
        <td>${h.levelId + 1}</td>
        <td>${h.par}</td>
        <td>${h.strokes}</td>
        <td>${diff}</td>
        <td>${getScoreLabel(h.strokes, h.par)}</td>
      </tr>`;
    }).join("");

    const totalDiff = totalStrokes - totalPar;
    const totalDiffStr = totalDiff >= 0 ? `+${totalDiff}` : String(totalDiff);

    this.bodyEl.innerHTML = `
      <table>
        <thead>
          <tr><th>Trou</th><th>Par</th><th>Coups</th><th>Score</th><th></th></tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
      <p class="ui-gameover-total">Total : ${totalStrokes} coups (${totalDiffStr} / par)</p>
    `;
  }
}
