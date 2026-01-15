import { showSharingDialog } from "./showSharingDialog";
import { shareStateAsFile, shareStateAsUrl, shareStateToClipboard } from "./shareState";
import { downloadStateFile } from "./exportState";

jest.mock("./shareState");
jest.mock("./exportState");

describe("showSharingDialog", () => {
  let dialog: HTMLElement;
  let title: HTMLElement;
  let content: HTMLElement;
  let cancelButton: HTMLButtonElement;

  beforeEach(() => {
    document.body.innerHTML = `
      <div id="reallocationDialog" style="display: none;">
        <h2 id="reallocationDialogTitle"></h2>
        <div id="reallocationDialogContent"></div>
        <button id="reallocationDialogCancel">Cancel</button>
      </div>
    `;

    dialog = document.getElementById("reallocationDialog") as HTMLElement;
    title = document.getElementById("reallocationDialogTitle") as HTMLElement;
    content = document.getElementById("reallocationDialogContent") as HTMLElement;
    cancelButton = document.getElementById("reallocationDialogCancel") as HTMLButtonElement;

    jest.clearAllMocks();
    global.URL.createObjectURL = jest.fn(() => "blob:test-url");
    global.URL.revokeObjectURL = jest.fn();
  });

  it("should display sharing dialog with three options", () => {
    showSharingDialog();

    expect(dialog.style.display).toBe("block");
    expect(title.textContent).toBe("Share State");
    expect(content.innerHTML).toContain("Save to File");
    expect(content.innerHTML).toContain("Copy Share Link");
    expect(content.innerHTML).toContain("Copy State Text");
  });

  it("should handle file download sharing", async () => {
    const mockBlob = new Blob(["test"], { type: "application/json" });
    (shareStateAsFile as jest.Mock).mockResolvedValue({
      method: "file",
      success: true,
      data: mockBlob,
      timestamp: Date.now(),
    });

    showSharingDialog();

    const fileButton = content.querySelector("button") as HTMLButtonElement;
    fileButton.click();

    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(shareStateAsFile).toHaveBeenCalled();
    expect(downloadStateFile).toHaveBeenCalled();
  });

  it("should handle URL sharing", async () => {
    const mockUrl = "data:application/json;base64,test";
    (shareStateAsUrl as jest.Mock).mockResolvedValue({
      method: "url",
      success: true,
      data: mockUrl,
      timestamp: Date.now(),
    });

    showSharingDialog();

    const buttons = content.querySelectorAll("button");
    const urlButton = buttons[1] as HTMLButtonElement;
    urlButton.click();

    // Wait for async operation to complete
    await new Promise((resolve) => setTimeout(resolve, 100));

    expect(shareStateAsUrl).toHaveBeenCalled();
    
    // The URL is displayed in an input field within the success message
    // The URL is encoded and wrapped: currentUrl + ?state= + encodeURIComponent(mockUrl)
    const urlInput = content.querySelector('input[type="text"]') as HTMLInputElement;
    expect(urlInput).toBeTruthy();
    expect(urlInput?.value).toContain(encodeURIComponent(mockUrl));
  });

  it("should handle clipboard sharing", async () => {
    (shareStateToClipboard as jest.Mock).mockResolvedValue({
      method: "clipboard",
      success: true,
      data: null,
      timestamp: Date.now(),
    });

    showSharingDialog();

    const buttons = content.querySelectorAll("button");
    const clipboardButton = buttons[2] as HTMLButtonElement;
    clipboardButton.click();

    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(shareStateToClipboard).toHaveBeenCalled();
    expect(content.innerHTML).toContain("copied to clipboard");
  });

  it("should display error message on sharing failure", async () => {
    (shareStateAsFile as jest.Mock).mockResolvedValue({
      method: "file",
      success: false,
      error: "Export failed",
      timestamp: Date.now(),
    });

    showSharingDialog();

    const fileButton = content.querySelector("button") as HTMLButtonElement;
    fileButton.click();

    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(content.innerHTML).toContain("Export failed");
  });

  it("should close dialog when cancel button is clicked", () => {
    showSharingDialog();
    expect(dialog.style.display).toBe("block");

    cancelButton.click();

    expect(dialog.style.display).toBe("none");
  });

  it("should close dialog on Escape key", () => {
    showSharingDialog();
    expect(dialog.style.display).toBe("block");

    const escapeEvent = new KeyboardEvent("keydown", { key: "Escape" });
    document.dispatchEvent(escapeEvent);

    expect(dialog.style.display).toBe("none");
  });
});
