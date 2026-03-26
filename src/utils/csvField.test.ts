import { csvStringCell } from "./csvField";

describe("csvStringCell", () => {
  it("returns empty string for null and undefined", () => {
    expect(csvStringCell(null)).toBe("");
    expect(csvStringCell(undefined)).toBe("");
  });

  it("stringifies other values", () => {
    expect(csvStringCell("x")).toBe("x");
    expect(csvStringCell(42)).toBe("42");
  });
});
