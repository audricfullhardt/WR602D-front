export type GamePhase =
  | "auth"
  | "idle"
  | "playing"
  | "completed"
  | "game-over"
  | "defeat";

export interface HoleResult {
  levelId: number;
  par: number;
  strokes: number;
  score: number; // strokes - par
}
