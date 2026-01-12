import { EventIssue } from "@models/EventIssue";
import { EventDetails } from "@models/EventDetails";
import { resolveIssueWithAddress } from "./resolveIssue";
import { EventDetailsMap } from "@models/EventDetailsMap";
import { LogEntry } from "@models/LogEntry";

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

  const buttonContainer = document.createElement("div");
  buttonContainer.style.display = "flex";
  buttonContainer.style.gap = "0.5em";
  buttonContainer.style.justifyContent = "flex-end";

  const geocodeButton = document.createElement("button");
  geocodeButton.textContent = "Geocode Address";
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
    if (!address) {
      errorMessage.textContent = "Please enter an address";
      errorMessage.style.display = "block";
      return;
    }

    errorMessage.style.display = "none";
    geocodeButton.disabled = true;
    loadingIndicator.style.display = "inline";
    input.disabled = true;

    try {
      await resolveIssueWithAddress(issue, address, eventDetailsMap, log);
      dialog.style.display = "none";
      onSuccess();
    } catch (error) {
      errorMessage.textContent = error instanceof Error ? error.message : "Geocoding failed";
      errorMessage.style.display = "block";
    } finally {
      geocodeButton.disabled = false;
      loadingIndicator.style.display = "none";
      input.disabled = false;
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