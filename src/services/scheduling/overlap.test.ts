import { describe, it, expect } from "vitest";
import { periodsOverlap } from "./overlap";

const d = (h: number, m = 0) => new Date(2026, 9, 13, h, m);

describe("periodsOverlap", () => {
  it("um antes do outro — não sobrepõe", () =>
    expect(periodsOverlap(d(8), d(9), d(10), d(11))).toBe(false));
  it("um depois do outro — não sobrepõe", () =>
    expect(periodsOverlap(d(10), d(11), d(8), d(9))).toBe(false));
  it("encostados — não sobrepõe", () =>
    expect(periodsOverlap(d(10), d(10, 30), d(10, 30), d(11))).toBe(false));
  it("um dentro do outro — sobrepõe", () =>
    expect(periodsOverlap(d(8), d(12), d(9), d(10))).toBe(true));
  it("cruzando a borda — sobrepõe", () =>
    expect(periodsOverlap(d(10), d(10, 30), d(10, 20), d(10, 50))).toBe(true));
});
