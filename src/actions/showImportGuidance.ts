import { loadFromStorage, saveToStorage } from "@utils/storage";
import {
  ImportGuidanceState,
  createImportGuidanceState,
} from "@models/ImportGuidanceState";

const STORAGE_KEY = "importGuidanceState";

export function shouldShowImportGuidance(): boolean {
  const state = loadFromStorage<ImportGuidanceState>(STORAGE_KEY);
  if (!state) {
    return false;
  }
  return !state.hasImportedData && !state.guidanceDismissed;
}

export function showImportGuidance(): void {
  const introduction = document.getElementById("introduction");
  if (!introduction) {
    return;
  }

  const existingGuidance = document.getElementById("importGuidance");
  if (existingGuidance) {
    return;
  }

  const guidance = document.createElement("div");
  guidance.id = "importGuidance";
  guidance.style.marginTop = "2em";
  guidance.style.padding = "1.5em";
  guidance.style.backgroundColor = "#e3f2fd";
  guidance.style.border = "2px solid #2196f3";
  guidance.style.borderRadius = "8px";
  guidance.setAttribute("role", "region");
  guidance.setAttribute("aria-labelledby", "importGuidanceTitle");

  const title = document.createElement("h2");
  title.id = "importGuidanceTitle";
  title.textContent = "Open Shared State";
  title.style.marginTop = "0";
  title.style.marginBottom = "1em";
  guidance.appendChild(title);

  const instructions = document.createElement("div");
  instructions.innerHTML = `
    <p style="margin-bottom: 1em;">
      <strong>Have you received shared data from a colleague?</strong> You can open it here to see their changes.
    </p>
    <ol style="margin-left: 1.5em; margin-bottom: 1em;">
      <li style="margin-bottom: 0.5em;">Click the <strong>📂 Open Saved State</strong> button above</li>
      <li style="margin-bottom: 0.5em;">Select the shared file you received, or paste a shared URL or clipboard data</li>
      <li style="margin-bottom: 0.5em;">Your colleague's data will be loaded and displayed</li>
    </ol>
    <p style="margin-bottom: 1em; color: #666;">
      <strong>Tip:</strong> You can also drag and drop the shared file directly onto this page.
    </p>
  `;
  guidance.appendChild(instructions);

  const dismissButton = document.createElement("button");
  dismissButton.textContent = "Got it, thanks!";
  dismissButton.style.padding = "0.5em 1em";
  dismissButton.style.backgroundColor = "#2196f3";
  dismissButton.style.color = "white";
  dismissButton.style.border = "none";
  dismissButton.style.borderRadius = "4px";
  dismissButton.style.cursor = "pointer";
  dismissButton.addEventListener("click", () => {
    dismissImportGuidance();
  });
  guidance.appendChild(dismissButton);

  introduction.appendChild(guidance);

  const state = loadFromStorage<ImportGuidanceState>(STORAGE_KEY) || createImportGuidanceState();
  state.lastGuidanceShown = Date.now();
  saveToStorage(STORAGE_KEY, state);
}

export function dismissImportGuidance(): void {
  const guidance = document.getElementById("importGuidance");
  if (guidance) {
    guidance.style.display = "none";
  }

  const state = loadFromStorage<ImportGuidanceState>(STORAGE_KEY) || createImportGuidanceState();
  state.guidanceDismissed = true;
  state.lastGuidanceShown = Date.now();
  saveToStorage(STORAGE_KEY, state);
}

export function markDataImported(): void {
  const guidance = document.getElementById("importGuidance");
  if (guidance) {
    guidance.style.display = "none";
  }

  const state = loadFromStorage<ImportGuidanceState>(STORAGE_KEY) || createImportGuidanceState();
  state.hasImportedData = true;
  saveToStorage(STORAGE_KEY, state);
}
