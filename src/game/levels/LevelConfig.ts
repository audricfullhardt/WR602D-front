export type ObstacleType = "bumper";

export interface ObstacleConfig {
  type: ObstacleType;
  position: [number, number, number];
  radius?: number;
  height?: number;
  movement?: {
    axis: "x" | "z";
    range: number;
    speed: number;
  };
}

export interface LevelConfig {
  id: number;
  name: string;
  par: number;
  floorSize: { width: number; depth: number };
  walls: { position: [number, number, number]; size: [number, number, number] }[];
  holePosition: [number, number, number];
  ballStart: [number, number, number];
  obstacles?: ObstacleConfig[];
}
