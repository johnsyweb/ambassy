import { shareStateAsFile, shareStateAsUrl, shareStateToClipboard } from "./shareState";
import { exportApplicationState } from "./exportState";
import { markStateExported } from "./trackChanges";
import { copyToClipboard } from "@utils/clipboard";
import { createDataUrl } from "@utils/urlSharing";
import { ApplicationState } from "@models/ApplicationState";

jest.mock("./exportState");
jest.mock("./trackChanges");
jest.mock("@utils/clipboard");
jest.mock("@utils/urlSharing");
jest.mock("@utils/storage", () => ({
  loadFromStorage: jest.fn(),
  saveToStorage: jest.fn(),
}));

describe("shareState", () => {
  const mockState: ApplicationState = {
    version: "1.0.0",
    exportedAt: new Date().toISOString(),
    data: {
      eventAmbassadors: [],
      eventTeams: [],
      regionalAmbassadors: [],
      changesLog: [],
    },
  };

  const mockBlob = new Blob([JSON.stringify(mockState)], { type: "application/json" });

  beforeEach(() => {
    jest.clearAllMocks();
    (exportApplicationState as jest.Mock).mockReturnValue(mockBlob);
    (markStateExported as jest.Mock).mockImplementation(() => {});
  });

  describe("shareStateAsFile", () => {
    it("should export state and return file result", async () => {
      const result = await shareStateAsFile();

      expect(exportApplicationState).toHaveBeenCalled();
      expect(result.method).toBe("file");
      expect(result.success).toBe(true);
      expect(result.data).toBeInstanceOf(Blob);
      expect(result.timestamp).toBeGreaterThan(0);
      expect(markStateExported).toHaveBeenCalled();
    });

    it("should handle export errors", async () => {
      (exportApplicationState as jest.Mock).mockImplementation(() => {
        throw new Error("Export failed");
      });

      const result = await shareStateAsFile();

      expect(result.method).toBe("file");
      expect(result.success).toBe(false);
      expect(result.error).toContain("Export failed");
      expect(markStateExported).not.toHaveBeenCalled();
    });
  });

  describe("shareStateAsUrl", () => {
    const mockDataUrl = "data:application/json;base64,eyJ0ZXN0IjoiZGF0YSJ9";

    beforeEach(() => {
      (createDataUrl as jest.Mock).mockReturnValue(mockDataUrl);
    });

    it("should create data URL and return url result", async () => {
      const jsonString = JSON.stringify(mockState);
      (exportApplicationState as jest.Mock).mockReturnValue(
        new Blob([jsonString], { type: "application/json" })
      );

      const result = await shareStateAsUrl();

      expect(exportApplicationState).toHaveBeenCalled();
      expect(createDataUrl).toHaveBeenCalledWith(jsonString);
      expect(result.method).toBe("url");
      expect(result.success).toBe(true);
      expect(result.data).toBe(mockDataUrl);
      expect(markStateExported).toHaveBeenCalled();
    });

    it("should handle state too large for URL", async () => {
      const largeJson = JSON.stringify({ data: "x".repeat(2 * 1024 * 1024) });
      (exportApplicationState as jest.Mock).mockReturnValue(
        new Blob([largeJson], { type: "application/json" })
      );

      const result = await shareStateAsUrl();

      expect(result.method).toBe("url");
      expect(result.success).toBe(false);
      expect(result.error).toContain("too large");
      expect(markStateExported).not.toHaveBeenCalled();
    });

    it("should handle export errors", async () => {
      (exportApplicationState as jest.Mock).mockImplementation(() => {
        throw new Error("Export failed");
      });

      const result = await shareStateAsUrl();

      expect(result.method).toBe("url");
      expect(result.success).toBe(false);
      expect(result.error).toContain("Export failed");
    });
  });

  describe("shareStateToClipboard", () => {
    it("should copy JSON to clipboard and return clipboard result", async () => {
      const jsonString = JSON.stringify(mockState);
      (exportApplicationState as jest.Mock).mockReturnValue(
        new Blob([jsonString], { type: "application/json" })
      );
      (copyToClipboard as jest.Mock).mockResolvedValue(undefined);

      const result = await shareStateToClipboard();

      expect(exportApplicationState).toHaveBeenCalled();
      expect(copyToClipboard).toHaveBeenCalledWith(jsonString);
      expect(result.method).toBe("clipboard");
      expect(result.success).toBe(true);
      expect(result.data).toBeNull();
      expect(markStateExported).toHaveBeenCalled();
    });

    it("should handle clipboard errors", async () => {
      const jsonString = JSON.stringify(mockState);
      (exportApplicationState as jest.Mock).mockReturnValue(
        new Blob([jsonString], { type: "application/json" })
      );
      (copyToClipboard as jest.Mock).mockRejectedValue(new Error("Clipboard unavailable"));

      const result = await shareStateToClipboard();

      expect(result.method).toBe("clipboard");
      expect(result.success).toBe(false);
      expect(result.error).toContain("Clipboard unavailable");
      expect(markStateExported).not.toHaveBeenCalled();
    });

    it("should handle export errors", async () => {
      (exportApplicationState as jest.Mock).mockImplementation(() => {
        throw new Error("Export failed");
      });

      const result = await shareStateToClipboard();

      expect(result.method).toBe("clipboard");
      expect(result.success).toBe(false);
      expect(result.error).toContain("Export failed");
    });
  });
});
