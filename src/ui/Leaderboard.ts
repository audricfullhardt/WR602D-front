import { getScores, shareScore, Score } from "../api/scores";

const MAX_ROWS = 10;

export class Leaderboard {
  private root: HTMLElement;
  private bodyEl: HTMLElement;
  private modal: HTMLElement;
  private modalText: HTMLElement;
  private currentUsername: string | null = null;

  constructor(parent: HTMLElement) {
    this.root = document.createElement("div");
    this.root.id = "ui-leaderboard";
    this.root.innerHTML = `
      <h3>Meilleurs scores</h3>
      <div class="ui-leaderboard-body"></div>
    `;
    this.bodyEl = this.root.querySelector(".ui-leaderboard-body")!;
    parent.appendChild(this.root);

    this.modal = document.createElement("div");
    this.modal.id = "ui-share-modal";
    this.modal.hidden = true;
    this.modal.innerHTML = `
      <div class="ui-share-card">
        <p class="ui-share-title">Lien copié !</p>
        <p class="ui-share-token"></p>
        <button type="button">Fermer</button>
      </div>
    `;
    this.modalText = this.modal.querySelector(".ui-share-token")!;
    this.modal
      .querySelector("button")!
      .addEventListener("click", () => (this.modal.hidden = true));
    document.body.appendChild(this.modal);
  }

  async load(currentUsername: string | null): Promise<void> {
    this.currentUsername = currentUsername;
    this.bodyEl.innerHTML = `<p class="ui-leaderboard-status">Chargement…</p>`;

    try {
      const scores = await getScores({ orderByCompletedAt: "desc" });
      this.render(scores.slice(0, MAX_ROWS));
    } catch {
      this.bodyEl.innerHTML = `<p class="ui-leaderboard-status">Scores indisponibles</p>`;
    }
  }

  private render(scores: Score[]): void {
    if (scores.length === 0) {
      this.bodyEl.innerHTML = `<p class="ui-leaderboard-status">Aucun score pour le moment</p>`;
      return;
    }

    const rows = scores
      .map((score, i) => {
        const isOwn =
          this.currentUsername !== null &&
          score.username === this.currentUsername;
        const action = isOwn
          ? `<button type="button" class="ui-share-btn" data-id="${score.id}">Partager mon score</button>`
          : "";
        return `<tr>
          <td>${i + 1}</td>
          <td>${score.username ?? "—"}</td>
          <td>${score.holeNumber}</td>
          <td>${score.strokes}</td>
          <td>${action}</td>
        </tr>`;
      })
      .join("");

    this.bodyEl.innerHTML = `
      <table>
        <thead>
          <tr><th>#</th><th>Joueur</th><th>Trou</th><th>Coups</th><th></th></tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    `;

    this.bodyEl.querySelectorAll(".ui-share-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const id = Number((btn as HTMLElement).dataset.id);
        this.share(id, btn as HTMLButtonElement);
      });
    });
  }

  private async share(scoreId: number, btn: HTMLButtonElement): Promise<void> {
    btn.disabled = true;
    try {
      const result = await shareScore(scoreId);
      const link = result.url ?? result.token;
      try {
        await navigator.clipboard.writeText(link);
      } catch {
        /* clipboard indisponible : on affiche quand même le lien */
      }
      this.modalText.textContent = link;
      this.modal.hidden = false;
    } catch {
      this.modalText.textContent = "Partage impossible";
      this.modal.hidden = false;
    } finally {
      btn.disabled = false;
    }
  }
}
