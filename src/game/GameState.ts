import { GamePhase, HoleResult, LevelConfig } from "./types";
import { LEVELS } from "./Levels";

export class GameState {
  private phase: GamePhase = "idle";
  private currentStrokes = 0;
  private currentLevelIndex = 0;
  private history: HoleResult[] = [];

  getPhase(): GamePhase { return this.phase; }
  getStrokes(): number { return this.currentStrokes; }
  getHistory(): HoleResult[] { return [...this.history]; }

  getCurrentLevel(): LevelConfig {
    return LEVELS[this.currentLevelIndex];
  }

  getTotalStrokes(): number {
    return this.history.reduce((sum, h) => sum + h.strokes, 0);
  }

  getTotalPar(): number {
    return this.history.reduce((sum, h) => sum + h.par, 0);
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
  }
}
