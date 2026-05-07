import { GameState } from "../game/GameState";
import { Score } from "./Score";
import { Start } from "./Start";
import { Reset } from "./Reset";
import { GameOver } from "./GameOver";

interface HUDCallbacks {
  onStart: () => void;
  onNextHole: () => void;
  onRestart: () => void;
}

export class HUD {
  private score: Score;
  private start: Start;
  private reset: Reset;
  private gameover: GameOver;

  constructor(callbacks: HUDCallbacks) {
    this.score = new Score();
    this.start = new Start(callbacks.onStart);
    this.reset = new Reset(callbacks.onNextHole, callbacks.onRestart);
    this.gameover = new GameOver(callbacks.onRestart);
  }

  update(gameState: GameState): void {
    this.score.hide();
    this.start.hide();
    this.reset.hide();
    this.gameover.hide();

    const phase = gameState.getPhase();
    const level = gameState.getCurrentLevel();

    switch (phase) {
      case "idle":
        this.start.show();
        break;

      case "playing":
        this.score.update(gameState.getStrokes(), level.par);
        this.score.show();
        break;

      case "completed": {
        const history = gameState.getHistory();
        const last = history[history.length - 1];
        this.score.update(last.strokes, last.par);
        this.score.show();
        this.reset.update(last);
        this.reset.show();
        break;
      }

      case "game-over":
        this.gameover.update(
          gameState.getHistory(),
          gameState.getTotalStrokes(),
          gameState.getTotalPar()
        );
        this.gameover.show();
        break;
    }
  }
}
