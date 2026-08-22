import { describe, expect, it } from "vitest";
import { averageOfScores, roundToTwo } from "./math-functions";

describe("roundToTwo", () => {
  it("rounds to two decimal places", () => {
    expect(roundToTwo(1.234)).toBe(1.23);
    expect(roundToTwo(1.235)).toBe(1.24);
    expect(roundToTwo(123.456)).toBe(123.46);
  });

  it("keeps values with fewer than two decimals unchanged", () => {
    expect(roundToTwo(0)).toBe(0);
    expect(roundToTwo(5)).toBe(5);
    expect(roundToTwo(1.2)).toBe(1.2);
  });

  it("handles rounding edge cases", () => {
    expect(roundToTwo(0.005)).toBe(0.01);
    expect(roundToTwo(1.005)).toBe(1.01);
    expect(roundToTwo(2.675)).toBe(2.68);
  });
});

describe("averageOfScores", () => {
  it("returns 0 when there are no valid scores", () => {
    expect(averageOfScores([])).toBe(0);
    expect(averageOfScores([null, undefined, ""])).toBe(0);
    expect(averageOfScores(["?", "x"])).toBe(0);
  });

  it("averages numeric scores", () => {
    expect(averageOfScores(["2", "4"])).toBe(3);
    expect(averageOfScores([2, 4, 6])).toBe(4);
  });

  it("includes a 0 score in the average", () => {
    expect(averageOfScores(["0", "4"])).toBe(2);
    expect(averageOfScores(["0"])).toBe(0);
    expect(averageOfScores(["0", "0", "3"])).toBe(1);
  });

  it("ignores non-numeric scores", () => {
    expect(averageOfScores(["?", "5"])).toBe(5);
  });
});
