/**
 * Display a modal dialog showing all available keyboard shortcuts.
 * Accessible via button click or keyboard shortcut (Ctrl+/ or ?).
 */
export function showKeyboardShortcutsDialog(): void {
  const dialog = document.getElementById("keyboardShortcutsDialog") as HTMLElement;
  const title = document.getElementById("keyboardShortcutsDialogTitle") as HTMLElement;
  const content = document.getElementById("keyboardShortcutsDialogContent") as HTMLElement;
  const closeButton = document.getElementById("keyboardShortcutsDialogClose") as HTMLButtonElement;

  if (!dialog || !title || !content || !closeButton) {
    console.error("Keyboard shortcuts dialog elements not found");
    return;
  }

  title.textContent = "Keyboard Shortcuts";
  content.innerHTML = "";

  const shortcuts: Array<{ category: string; items: Array<{ keys: string; description: string }> }> = [
    {
      category: "General",
      items: [
        { keys: "Ctrl+/ or ?", description: "Show keyboard shortcuts" },
        { keys: "Escape", description: "Close dialogs" },
        { keys: "Tab", description: "Navigate between controls" },
        { keys: "Enter / Space", description: "Activate focused button or control" },
      ],
    },
    {
      category: "Allocation & Reallocation Dialogs",
      items: [
        { keys: "Arrow Up/Down", description: "Navigate between suggestion buttons" },
        { keys: "Enter / Space", description: "Select focused suggestion" },
        { keys: "Escape", description: "Cancel and close dialog" },
        { keys: "Tab", description: "Move to next control (suggestions → dropdown → buttons)" },
      ],
    },
    {
      category: "Table Navigation",
      items: [
        { keys: "Click row", description: "Select event and highlight on map" },
        { keys: "Click map marker", description: "Select event and highlight in table" },
      ],
    },
  ];

  shortcuts.forEach((category) => {
    const categoryDiv = document.createElement("div");
    categoryDiv.style.marginBottom = "1.5em";

    const categoryTitle = document.createElement("h3");
    categoryTitle.textContent = category.category;
    categoryTitle.style.marginBottom = "0.5em";
    categoryTitle.style.fontSize = "1.1em";
    categoryTitle.style.fontWeight = "bold";
    categoryDiv.appendChild(categoryTitle);

    const shortcutsList = document.createElement("dl");
    shortcutsList.style.margin = "0";
    shortcutsList.style.padding = "0";

    category.items.forEach((item) => {
      const dt = document.createElement("dt");
      dt.style.fontWeight = "bold";
      dt.style.marginTop = "0.5em";
      dt.style.marginBottom = "0.25em";
      dt.textContent = item.keys;
      shortcutsList.appendChild(dt);

      const dd = document.createElement("dd");
      dd.style.marginLeft = "1.5em";
      dd.style.marginBottom = "0.5em";
      dd.style.color = "#666";
      dd.textContent = item.description;
      shortcutsList.appendChild(dd);
    });

    categoryDiv.appendChild(shortcutsList);
    content.appendChild(categoryDiv);
  });

  dialog.style.display = "block";
  dialog.setAttribute("aria-modal", "true");
  dialog.setAttribute("role", "dialog");
  dialog.setAttribute("aria-labelledby", "keyboardShortcutsDialogTitle");

  const handleClose = () => {
    dialog.style.display = "none";
    closeButton.removeEventListener("click", handleClose);
    document.removeEventListener("keydown", handleEscape);
  };

  const handleEscape = (e: KeyboardEvent) => {
    if (e.key === "Escape") {
      handleClose();
    }
  };

  closeButton.addEventListener("click", handleClose);
  document.addEventListener("keydown", handleEscape);

  closeButton.focus();
}

/**
 * Initialize keyboard shortcut handlers for showing the shortcuts dialog.
 * Listens for Ctrl+/ (or Cmd+/ on Mac) and ? key.
 */
export function initializeKeyboardShortcuts(): void {
  document.addEventListener("keydown", (e) => {
    // Ctrl+/ or Cmd+/ (Mac) or ? key
    if (
      (e.ctrlKey || e.metaKey) && e.key === "/" ||
      (!e.ctrlKey && !e.metaKey && e.key === "?" && !e.shiftKey)
    ) {
      // Don't trigger if user is typing in an input field
      const target = e.target as HTMLElement;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable
      ) {
        return;
      }

      e.preventDefault();
      showKeyboardShortcutsDialog();
    }
  });
}
