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

      const execCommandSpy = jest.spyOn(document, "execCommand").mockReturnValue(true);
      const createElementSpy = jest.spyOn(document, "createElement").mockReturnValue({
        value: "",
        select: jest.fn(),
        setSelectionRange: jest.fn(),
      } as unknown as HTMLTextAreaElement);
      const appendChildSpy = jest.spyOn(document.body, "appendChild").mockImplementation();
      const removeChildSpy = jest.spyOn(document.body, "removeChild").mockImplementation();

      await copyToClipboard("test content");

      expect(execCommandSpy).toHaveBeenCalledWith("copy");
      expect(createElementSpy).toHaveBeenCalledWith("textarea");

      execCommandSpy.mockRestore();
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

      jest.spyOn(document, "execCommand").mockReturnValue(false);

      await expect(copyToClipboard("test content")).rejects.toThrow();
    });
  });
});
