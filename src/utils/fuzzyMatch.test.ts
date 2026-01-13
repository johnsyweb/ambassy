import { normalizeEventName, levenshteinDistance } from "./fuzzyMatch";

describe("normalizeEventName", () => {
  it("should convert to lowercase", () => {
    expect(normalizeEventName("EVENT NAME")).toBe("event name");
  });

  it("should remove parentheses and their content", () => {
    expect(normalizeEventName("Event Name (not currently operating)")).toBe("event name");
  });

  it("should trim whitespace", () => {
    expect(normalizeEventName("  Event Name  ")).toBe("event name");
  });

  it("should normalize multiple spaces to single space", () => {
    expect(normalizeEventName("Event   Name")).toBe("event name");
  });

  it("should handle multiple parentheses", () => {
    expect(normalizeEventName("Event (A) Name (B)")).toBe("event name");
  });

  it("should handle empty string", () => {
    expect(normalizeEventName("")).toBe("");
  });
});

describe("levenshteinDistance", () => {
  it("should return 0 for identical strings", () => {
    expect(levenshteinDistance("event", "event")).toBe(0);
  });

  it("should return length of string if other is empty", () => {
    expect(levenshteinDistance("event", "")).toBe(5);
    expect(levenshteinDistance("", "event")).toBe(5);
  });

  it("should calculate distance for single character difference", () => {
    expect(levenshteinDistance("event", "events")).toBe(1);
    expect(levenshteinDistance("event", "evnt")).toBe(1);
  });

  it("should calculate distance for multiple character differences", () => {
    expect(levenshteinDistance("event", "evnt")).toBe(1);
    expect(levenshteinDistance("event", "evnet")).toBe(2);
    expect(levenshteinDistance("event", "evnts")).toBe(2);
  });

  it("should handle case differences", () => {
    expect(levenshteinDistance("Event", "event")).toBe(1);
  });

  it("should handle completely different strings", () => {
    expect(levenshteinDistance("event", "other")).toBe(5);
  });
});
