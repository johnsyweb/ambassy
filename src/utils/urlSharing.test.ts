import { createDataUrl, parseDataUrl, isDataUrlValid } from "./urlSharing";

describe("urlSharing", () => {
  const testJson = JSON.stringify({ test: "data" });
  const maxSize = 1.5 * 1024 * 1024;

  describe("createDataUrl", () => {
    it("should create a valid data URL from JSON string", () => {
      const url = createDataUrl(testJson);

      expect(url).toMatch(/^data:application\/json;base64,/);
      expect(url.length).toBeGreaterThan(0);
    });

    it("should encode JSON correctly in Base64", () => {
      const url = createDataUrl(testJson);
      const base64Part = url.split(",")[1];
      const decoded = Buffer.from(base64Part, "base64").toString("utf-8");

      expect(decoded).toBe(testJson);
    });

    it("should handle empty JSON", () => {
      const url = createDataUrl("{}");

      expect(url).toMatch(/^data:application\/json;base64,/);
    });

    it("should handle large JSON strings", () => {
      const largeJson = JSON.stringify({ data: "x".repeat(100000) });
      const url = createDataUrl(largeJson);

      expect(url).toMatch(/^data:application\/json;base64,/);
    });
  });

  describe("parseDataUrl", () => {
    it("should parse valid data URL and return JSON string", () => {
      const url = createDataUrl(testJson);
      const parsed = parseDataUrl(url);

      expect(parsed).toBe(testJson);
    });

    it("should throw error for invalid data URL format", () => {
      expect(() => parseDataUrl("not-a-data-url")).toThrow();
    });

    it("should throw error for non-JSON data URL", () => {
      const textUrl = "data:text/plain;base64,dGVzdA==";
      expect(() => parseDataUrl(textUrl)).toThrow();
    });

    it("should throw error for invalid Base64", () => {
      const invalidUrl = "data:application/json;base64,!!!invalid!!!";
      expect(() => parseDataUrl(invalidUrl)).toThrow();
    });
  });

  describe("isDataUrlValid", () => {
    it("should return true for valid data URL", () => {
      const url = createDataUrl(testJson);
      expect(isDataUrlValid(url)).toBe(true);
    });

    it("should return false for invalid format", () => {
      expect(isDataUrlValid("not-a-data-url")).toBe(false);
    });

    it("should return false for non-JSON MIME type", () => {
      expect(isDataUrlValid("data:text/plain;base64,dGVzdA==")).toBe(false);
    });

    it("should check size limits", () => {
      const smallUrl = createDataUrl(testJson);
      expect(isDataUrlValid(smallUrl, maxSize)).toBe(true);

      const largeJson = JSON.stringify({ data: "x".repeat(maxSize + 1000) });
      const largeUrl = createDataUrl(largeJson);
      expect(isDataUrlValid(largeUrl, maxSize)).toBe(false);
    });
  });
});
