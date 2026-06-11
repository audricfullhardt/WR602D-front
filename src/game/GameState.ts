import { GamePhase, HoleResult } from "./types";
import { LevelConfig } from "./levels/LevelConfig";
import { LEVELS } from "./levels/levels";

export const MAX_LIVES = 3;
export const MAX_STROKES = 6;

export class GameState {
  private phase: GamePhase = "idle";
  private currentStrokes = 0;
  private currentLevelIndex = 0;
  private history: HoleResult[] = [];
  private lives = MAX_LIVES;

  getPhase(): GamePhase { return this.phase; }
  getStrokes(): number { return this.currentStrokes; }
  getHistory(): HoleResult[] { return [...this.history]; }
  getLives(): number { return this.lives; }
  isGameOver(): boolean { return this.lives <= 0; }

  getCurrentLevel(): LevelConfig {
    return LEVELS[this.currentLevelIndex];
  }

  getTotalStrokes(): number {
    return this.history.reduce((sum, h) => sum + h.strokes, 0);
  }

  getTotalPar(): number {
    return this.history.reduce((sum, h) => sum + h.par, 0);
  }

  requireAuth(): void {
    this.phase = "auth";
  }

  goToStart(): void {
    this.phase = "idle";
  }

  startGame(): void {
    this.phase = "playing";
  }

  addStroke(): void {
    this.currentStrokes++;
  }

  completeHole(): void {
    const level = this.getCurrentLevel();
    this.history.push({
      levelId: level.id,
      par: level.par,
      strokes: this.currentStrokes,
      score: this.currentStrokes - level.par,
    });
    const isLast = this.currentLevelIndex === LEVELS.length - 1;
    this.phase = isLast ? "game-over" : "completed";
  }

  loseLife(): void {
    if (this.lives <= 0) return;
    this.lives--;
    if (this.lives <= 0) {
      this.phase = "defeat";
    } else {
      this.currentStrokes = 0;
    }
  }

  nextHole(): void {
    this.currentLevelIndex++;
    this.currentStrokes = 0;
    this.phase = "playing";
  }

  reset(): void {
    this.phase = "idle";
    this.currentStrokes = 0;
    this.currentLevelIndex = 0;
    this.history = [];
    this.lives = MAX_LIVES;
  }
}
