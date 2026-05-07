export class Values {
  static readonly HOLE_IN_ONE = "Hole in one !";
  static readonly EAGLE = "Eagle";
  static readonly BIRDIE = "Birdie";
  static readonly PAR = "Par";
  static readonly BOGEY = "Bogey";
  static readonly DOUBLE_BOGEY = "Double bogey";
  static readonly TRIPLE_BOGEY = "Triple bogey";
  static readonly QUADRUPLE_BOGEY = "Quadruple bogey";
  static readonly MAX_STROKES = "Trop de coups...";
}

export function getScoreLabel(strokes: number, par: number): string {
  if (strokes === 1) return Values.HOLE_IN_ONE;
  const score = strokes - par;
  if (score <= -2) return Values.EAGLE;
  if (score === -1) return Values.BIRDIE;
  if (score === 0) return Values.PAR;
  if (score === 1) return Values.BOGEY;
  if (score === 2) return Values.DOUBLE_BOGEY;
  if (score === 3) return Values.TRIPLE_BOGEY;
  if (score === 4) return Values.QUADRUPLE_BOGEY;
  return Values.MAX_STROKES;
}
