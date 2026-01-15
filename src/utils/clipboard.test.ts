import { copyToClipboard } from "./clipboard";

describe("clipboard", () => {
  const originalClipboard = navigator.clipboard;
  const mockWriteText = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    Object.defineProperty(navigator, "clipboard", {
      value: { writeText: mockWriteText },
      writable: true,
      configurable: true,
    });
  });

  afterEach(() => {
    Object.defineProperty(navigator, "clipboard", {
      value: originalClipboard,
      writable: true,
      configurable: true,
    });
  });

  describe("copyToClipboard", () => {
    it("should copy text to clipboard using Clipboard API", async () => {
      mockWriteText.mockResolvedValue(undefined);

      await copyToClipboard("test content");

      expect(mockWriteText).toHaveBeenCalledWith("test content");
    });

    it("should throw error if Clipboard API fails", async () => {
      mockWriteText.mockRejectedValue(new Error("Clipboard write failed"));

      await expect(copyToClipboard("test content")).rejects.toThrow("Clipboard write failed");
    });

    it("should fall back to execCommand if Clipboard API unavailable", async () => {
      Object.defineProperty(navigator, "clipboard", {
        value: undefined,
        writable: true,
        configurable: true,
      });

      // Mock execCommand by replacing it on document
      const originalExecCommand = document.execCommand;
      document.execCommand = jest.fn().mockReturnValue(true);
      const mockTextarea = document.createElement("textarea");
      mockTextarea.select = jest.fn();
      mockTextarea.setSelectionRange = jest.fn();
      const createElementSpy = jest.spyOn(document, "createElement").mockReturnValue(mockTextarea);
      const appendChildSpy = jest.spyOn(document.body, "appendChild").mockImplementation();
      const removeChildSpy = jest.spyOn(document.body, "removeChild").mockImplementation();

      await copyToClipboard("test content");

      expect(document.execCommand).toHaveBeenCalledWith("copy");
      expect(createElementSpy).toHaveBeenCalledWith("textarea");

      // Restore original
      document.execCommand = originalExecCommand;
      createElementSpy.mockRestore();
      appendChildSpy.mockRestore();
      removeChildSpy.mockRestore();
    });

    it("should throw error if both Clipboard API and execCommand fail", async () => {
      Object.defineProperty(navigator, "clipboard", {
        value: undefined,
        writable: true,
        configurable: true,
      });

      // Mock execCommand by replacing it on document
      const originalExecCommand = document.execCommand;
      const mockExecCommand = jest.fn().mockReturnValue(false);
      document.execCommand = mockExecCommand as typeof document.execCommand;

      // Mock createElement to return a textarea with style object
      const mockStyle = {};
      const mockTextarea = {
        value: "",
        select: jest.fn(),
        setSelectionRange: jest.fn(),
        focus: jest.fn(),
        style: mockStyle,
      };
      // Allow style properties to be set
      Object.defineProperty(mockTextarea, "style", {
        value: mockStyle,
        writable: true,
        configurable: true,
      });
      const createElementSpy = jest.spyOn(document, "createElement").mockReturnValue(mockTextarea as unknown as HTMLElement);
      const appendChildSpy = jest.spyOn(document.body, "appendChild").mockImplementation();
      const removeChildSpy = jest.spyOn(document.body, "removeChild").mockImplementation();

      await expect(copyToClipboard("test content")).rejects.toThrow();

      // Restore original
      document.execCommand = originalExecCommand;
      createElementSpy.mockRestore();
      appendChildSpy.mockRestore();
      removeChildSpy.mockRestore();
    });
  });
});
