import { showKeyboardShortcutsDialog, initializeKeyboardShortcuts } from "./showKeyboardShortcutsDialog";

describe("showKeyboardShortcutsDialog", () => {
  let dialog: HTMLElement;
  let title: HTMLElement;
  let content: HTMLElement;
  let closeButton: HTMLButtonElement;

  beforeEach(() => {
    document.body.innerHTML = `
      <div id="keyboardShortcutsDialog" role="dialog" aria-labelledby="keyboardShortcutsDialogTitle" aria-modal="true" style="display: none;">
        <h2 id="keyboardShortcutsDialogTitle">Keyboard Shortcuts</h2>
        <div id="keyboardShortcutsDialogContent"></div>
        <button type="button" id="keyboardShortcutsDialogClose">Close</button>
      </div>
    `;

    dialog = document.getElementById("keyboardShortcutsDialog")!;
    title = document.getElementById("keyboardShortcutsDialogTitle")!;
    content = document.getElementById("keyboardShortcutsDialogContent")!;
    closeButton = document.getElementById("keyboardShortcutsDialogClose") as HTMLButtonElement;
  });

  afterEach(() => {
    document.body.innerHTML = "";
  });

  it("should display dialog with keyboard shortcuts", () => {
    showKeyboardShortcutsDialog();

    expect(dialog.style.display).not.toBe("none");
    expect(title.textContent).toBe("Keyboard Shortcuts");
    expect(content.textContent).toContain("Ctrl+/ or ?");
  });

  it("should display shortcut categories", () => {
    showKeyboardShortcutsDialog();

    expect(content.textContent).toContain("General");
    expect(content.textContent).toContain("Allocation & Reallocation Dialogs");
    expect(content.textContent).toContain("Table Navigation");
  });

  it("should close dialog when close button is clicked", () => {
    showKeyboardShortcutsDialog();

    expect(dialog.style.display).not.toBe("none");
    closeButton.click();
    expect(dialog.style.display).toBe("none");
  });

  it("should close dialog when Escape key is pressed", () => {
    showKeyboardShortcutsDialog();

    expect(dialog.style.display).not.toBe("none");
    const escapeEvent = new KeyboardEvent("keydown", { key: "Escape" });
    document.dispatchEvent(escapeEvent);
    expect(dialog.style.display).toBe("none");
  });

  it("should be accessible", () => {
    showKeyboardShortcutsDialog();

    expect(dialog.getAttribute("role")).toBe("dialog");
    expect(dialog.getAttribute("aria-modal")).toBe("true");
    expect(dialog.getAttribute("aria-labelledby")).toBe("keyboardShortcutsDialogTitle");
  });

  it("should focus close button when opened", () => {
    showKeyboardShortcutsDialog();

    expect(document.activeElement).toBe(closeButton);
  });
});

describe("initializeKeyboardShortcuts", () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <div id="keyboardShortcutsDialog" role="dialog" aria-labelledby="keyboardShortcutsDialogTitle" aria-modal="true" style="display: none;">
        <h2 id="keyboardShortcutsDialogTitle">Keyboard Shortcuts</h2>
        <div id="keyboardShortcutsDialogContent"></div>
        <button type="button" id="keyboardShortcutsDialogClose">Close</button>
      </div>
      <input type="text" id="testInput" />
    `;
  });

  afterEach(() => {
    document.body.innerHTML = "";
  });

  it("should open dialog when Ctrl+/ is pressed", () => {
    initializeKeyboardShortcuts();

    const ctrlSlashEvent = new KeyboardEvent("keydown", {
      key: "/",
      ctrlKey: true,
    });
    document.dispatchEvent(ctrlSlashEvent);

    const dialog = document.getElementById("keyboardShortcutsDialog") as HTMLElement;
    expect(dialog.style.display).not.toBe("none");
  });

  it("should open dialog when ? key is pressed", () => {
    initializeKeyboardShortcuts();

    const questionEvent = new KeyboardEvent("keydown", {
      key: "?",
    });
    document.dispatchEvent(questionEvent);

    const dialog = document.getElementById("keyboardShortcutsDialog") as HTMLElement;
    expect(dialog.style.display).not.toBe("none");
  });

  it("should not open dialog when typing in input field", () => {
    initializeKeyboardShortcuts();

    const input = document.getElementById("testInput") as HTMLInputElement;
    input.focus();

    const ctrlSlashEvent = new KeyboardEvent("keydown", {
      key: "/",
      ctrlKey: true,
    });
    Object.defineProperty(ctrlSlashEvent, "target", {
      value: input,
      writable: false,
    });
    document.dispatchEvent(ctrlSlashEvent);

    const dialog = document.getElementById("keyboardShortcutsDialog") as HTMLElement;
    expect(dialog.style.display).toBe("none");
  });
});
