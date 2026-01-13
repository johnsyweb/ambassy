import { EventIssue } from "@models/EventIssue";
import { resolveIssueWithAddress } from "./resolveIssue";
import { EventDetailsMap } from "@models/EventDetailsMap";
import { LogEntry } from "@models/LogEntry";
import { suggestParkrunUrl } from "../utils/fuzzyMatch";

export function showAddressDialog(
  issue: EventIssue,
  eventDetailsMap: EventDetailsMap,
  log: LogEntry[],
  onSuccess: () => void,
  onCancel: () => void
): void {
  const dialog = document.getElementById("reallocationDialog") as HTMLElement;
  const title = document.getElementById("reallocationDialogTitle") as HTMLElement;
  const content = document.getElementById("reallocationDialogContent") as HTMLElement;
  const cancelButton = document.getElementById("reallocationDialogCancel") as HTMLButtonElement;

  if (!dialog || !title || !content || !cancelButton) {
    console.error("Dialog elements not found");
    return;
  }

  title.textContent = `Enter Address for: ${issue.eventShortName}`;
  content.innerHTML = "";

  const container = document.createElement("div");
  container.style.padding = "1em";

  const instructions = document.createElement("p");
  instructions.textContent = "Enter a street address to automatically find coordinates for this event:";
  instructions.style.marginBottom = "1em";
  container.appendChild(instructions);

  const input = document.createElement("input");
  input.type = "text";
  input.placeholder = "e.g., Unit 10, 82/86 Minnie St, Southport QLD 4215";
  input.style.width = "100%";
  input.style.padding = "0.5em";
  input.style.marginBottom = "1em";
  input.style.border = "1px solid #ccc";
  input.style.borderRadius = "4px";
  container.appendChild(input);

  // URL suggestion section
  const urlInstructions = document.createElement("p");
  urlInstructions.textContent = "Suggested parkrun URL (edit if needed to extract complete event details):";
  urlInstructions.style.marginTop = "1em";
  urlInstructions.style.marginBottom = "0.5em";
  container.appendChild(urlInstructions);

  const urlInput = document.createElement("input");
  urlInput.type = "url";
  urlInput.placeholder = "https://www.parkrun.com.au/example/";
  // Load suggested URL asynchronously
  suggestParkrunUrl(issue.eventShortName).then(url => {
    urlInput.value = url;
  }).catch(() => {
    // Fallback if countries aren't loaded yet
    urlInput.value = `https://www.parkrun.com.au/${issue.eventShortName.toLowerCase().replace(/\s+/g, '')}/`;
  });
  urlInput.style.width = "100%";
  urlInput.style.padding = "0.5em";
  urlInput.style.marginBottom = "1em";
  urlInput.style.border = "1px solid #ccc";
  urlInput.style.borderRadius = "4px";
  container.appendChild(urlInput);

  const urlNote = document.createElement("small");
  urlNote.textContent = "Leave empty to skip metadata extraction and use basic event information only.";
  urlNote.style.color = "#666";
  urlNote.style.display = "block";
  urlNote.style.marginBottom = "1em";
  container.appendChild(urlNote);

  const buttonContainer = document.createElement("div");
  buttonContainer.style.display = "flex";
  buttonContainer.style.gap = "0.5em";
  buttonContainer.style.justifyContent = "flex-end";

  const geocodeButton = document.createElement("button");
  geocodeButton.innerHTML = "✅ Geocode Address";
  geocodeButton.style.padding = "0.5em 1em";
  geocodeButton.style.backgroundColor = "#007bff";
  geocodeButton.style.color = "white";
  geocodeButton.style.border = "none";
  geocodeButton.style.borderRadius = "4px";
  geocodeButton.style.cursor = "pointer";

  const loadingIndicator = document.createElement("span");
  loadingIndicator.textContent = "Geocoding...";
  loadingIndicator.style.display = "none";
  loadingIndicator.style.marginLeft = "0.5em";

  const errorMessage = document.createElement("div");
  errorMessage.style.color = "red";
  errorMessage.style.marginTop = "0.5em";
  errorMessage.style.display = "none";

  buttonContainer.appendChild(geocodeButton);
  buttonContainer.appendChild(loadingIndicator);
  container.appendChild(buttonContainer);
  container.appendChild(errorMessage);

  content.appendChild(container);

  // Event handlers
  const handleGeocode = async () => {
    const address = input.value.trim();
    const url = urlInput.value.trim();

    if (!address) {
      errorMessage.textContent = "Please enter an address";
      errorMessage.style.display = "block";
      return;
    }

    errorMessage.style.display = "none";
    geocodeButton.disabled = true;
    loadingIndicator.style.display = "inline";
    input.disabled = true;
    urlInput.disabled = true;

    try {
      await resolveIssueWithAddress(issue, address, eventDetailsMap, log, url || undefined);
      dialog.style.display = "none";
      onSuccess();
    } catch (error) {
      errorMessage.textContent = error instanceof Error ? error.message : "Geocoding failed";
      errorMessage.style.display = "block";
    } finally {
      geocodeButton.disabled = false;
      loadingIndicator.style.display = "none";
      input.disabled = false;
      urlInput.disabled = false;
    }
  };

  const handleCancel = () => {
    dialog.style.display = "none";
    onCancel();
  };

  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === "Enter") {
      event.preventDefault();
      handleGeocode();
    } else if (event.key === "Escape") {
      event.preventDefault();
      handleCancel();
    }
  };

  // Attach event listeners
  geocodeButton.addEventListener("click", handleGeocode);
  cancelButton.addEventListener("click", handleCancel);
  input.addEventListener("keydown", handleKeyDown);

  // Show dialog
  dialog.style.display = "block";
  input.focus();

  // Clean up function (though dialog handles its own cleanup)
  return;
}