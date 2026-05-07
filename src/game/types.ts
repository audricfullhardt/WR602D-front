export type GamePhase = "idle" | "playing" | "completed" | "game-over";

export interface LevelConfig {
  id: number;
  par: number;
  name: string;
}

export interface HoleResult {
  levelId: number;
  par: number;
  strokes: number;
  score: number; // strokes - par
}
