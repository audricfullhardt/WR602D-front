import { GameState } from "../game/GameState";
import { Score } from "./Score";
import { Lives } from "./Lives";
import { Auth } from "./Auth";
import { Start } from "./Start";
import { Reset } from "./Reset";
import { GameOver } from "./GameOver";
import { Leaderboard } from "./Leaderboard";
import { Logout } from "./Logout";
import { getUser, isAuthenticated } from "../api/auth";

interface HUDCallbacks {
  onAuthenticated: () => void;
  onGuest: () => void;
  onStart: () => void;
  onNextHole: () => void;
  onRestart: () => void;
  onLogout: () => void;
}

export class HUD {
  private score: Score;
  private lives: Lives;
  private auth: Auth;
  private start: Start;
  private reset: Reset;
  private gameover: GameOver;
  private leaderboard: Leaderboard;
  private logout: Logout;

  constructor(callbacks: HUDCallbacks) {
    this.score = new Score();
    this.lives = new Lives();
    this.auth = new Auth({
      onAuthenticated: callbacks.onAuthenticated,
      onGuest: callbacks.onGuest,
    });
    this.start = new Start(callbacks.onStart);
    this.reset = new Reset(callbacks.onNextHole, callbacks.onRestart);
    this.gameover = new GameOver(callbacks.onRestart);
    this.leaderboard = new Leaderboard(this.gameover.getLeaderboardSlot());
    this.logout = new Logout(callbacks.onLogout);
  }

  update(gameState: GameState): void {
    this.score.hide();
    this.lives.hide();
    this.auth.hide();
    this.start.hide();
    this.reset.hide();
    this.gameover.hide();
    this.logout.hide();

    const phase = gameState.getPhase();
    const level = gameState.getCurrentLevel();

    switch (phase) {
      case "auth":
        this.auth.show();
        break;

      case "idle":
        this.start.show();
        if (isAuthenticated()) this.logout.show();
        break;

      case "playing":
        this.score.update(gameState.getStrokes(), level.par);
        this.score.show();
        this.lives.update(gameState.getLives());
        this.lives.show();
        if (isAuthenticated()) this.logout.show();
        break;

      case "completed": {
        const history = gameState.getHistory();
        const last = history[history.length - 1];
        this.score.update(last.strokes, last.par);
        this.score.show();
        this.lives.update(gameState.getLives());
        this.lives.show();
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
        this.leaderboard.load(getUser()?.username ?? null);
        break;

      case "defeat":
        this.gameover.updateDefeat();
        this.gameover.show();
        break;
    }
  }
}
