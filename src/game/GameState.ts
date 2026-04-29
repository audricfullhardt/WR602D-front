export class GameState {
  private strokes: number = 0;
  private holeCompleted: boolean = false;

  addStroke(): void {
    this.strokes++;
  }

  getStrokes(): number {
    return this.strokes;
  }

  completeHole(): void {
    this.holeCompleted = true;
  }

  isHoleCompleted(): boolean {
    return this.holeCompleted;
  }

  reset(): void {
    this.strokes = 0;
    this.holeCompleted = false;
  }
}
