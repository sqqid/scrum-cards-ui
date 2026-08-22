export function roundToTwo(num: number): number {
  return +(Math.round(Number(num + "e+2")) + "e-2");
}

export function averageOfScores(scores: (string | number | null | undefined)[]): number {
  const validNumbers = scores
    .filter((score): score is string | number => score != null && score !== "")
    .filter((score) => !isNaN(parseInt(String(score))))
    .map((score) => parseInt(String(score), 10));

  return validNumbers.length > 0 ? validNumbers.reduce((a, b) => a + b) / validNumbers.length : 0;
}
