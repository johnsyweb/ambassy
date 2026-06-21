import { EventIssue } from "@models/EventIssue";
import { EventAmbassadorMap } from "@models/EventAmbassadorMap";
import { RegionalAmbassadorMap } from "@models/RegionalAmbassadorMap";
import { resolveIssueWithCoordinates } from "./resolveIssue";
import { EventDetailsMap } from "@models/EventDetailsMap";
import { LogEntry } from "@models/LogEntry";
import { suggestparkrunUrl } from "@utils/fuzzyMatch";
import { appendPlaceLocationSearchUi } from "@utils/appendPlaceLocationSearchUi";
import { bindPlaceLocationSearch } from "@utils/placeLocationSearch";
import { inferIssueStateRegion } from "@utils/inferIssueStateRegion";

export function showAddressDialog(
  issue: EventIssue,
  eventDetailsMap: EventDetailsMap,
  eventAmbassadors: EventAmbassadorMap,
  regionalAmbassadors: RegionalAmbassadorMap,
  log: LogEntry[],
  onSuccess: () => void,
  onCancel: () => void,
): void {
  const dialog = document.getElementById("reallocationDialog") as HTMLElement;
  const title = document.getElementById(
    "reallocationDialogTitle",
  ) as HTMLElement;
  const content = document.getElementById(
    "reallocationDialogContent",
  ) as HTMLElement;
  const cancelButton = document.getElementById(
    "reallocationDialogCancel",
  ) as HTMLButtonElement;

  if (!dialog || !title || !content || !cancelButton) {
    console.error("Dialog elements not found");
    return;
  }

  title.textContent = `Enter Address for: ${issue.eventShortName}`;
  content.innerHTML = "";

  const container = document.createElement("div");
  container.style.padding = "1em";

  const instructions = document.createElement("p");
  instructions.textContent =
    "Enter state/region and address to find coordinates for this event:";
  instructions.style.marginBottom = "1em";
  container.appendChild(instructions);

  const bindings = appendPlaceLocationSearchUi(container, {
    stateInputId: "issueAddressStateInput",
    addressInputId: "issueAddressInput",
    placesListboxId: "issueAddressPlacesListbox",
    locationStatusId: "issueAddressLocationStatus",
    errorMessageId: "issueAddressLocationError",
    manualCoordinatesId: "issueAddressManualCoordinates",
    includeManualCoordinates: false,
  });

  bindings.stateInput.value = inferIssueStateRegion(
    issue.eventAmbassador,
    issue.regionalAmbassador,
    eventAmbassadors,
    regionalAmbassadors,
  );

  const urlInstructions = document.createElement("p");
  urlInstructions.textContent =
    "Suggested parkrun URL (edit if needed to extract complete event details):";
  urlInstructions.style.marginTop = "1em";
  urlInstructions.style.marginBottom = "0.5em";
  container.appendChild(urlInstructions);

  const urlInput = document.createElement("input");
  urlInput.type = "url";
  urlInput.placeholder = "https://www.parkrun.com.au/example/";
  urlInput.style.width = "100%";
  urlInput.style.padding = "0.5em";
  urlInput.style.marginBottom = "1em";
  urlInput.style.border = "1px solid #ccc";
  urlInput.style.borderRadius = "4px";
  urlInput.setAttribute("autocomplete", "off");
  void suggestparkrunUrl(issue.eventShortName)
    .then((url) => {
      urlInput.value = url;
    })
    .catch(() => {
      urlInput.value = `https://www.parkrun.com.au/${issue.eventShortName.toLowerCase().replace(/\s+/g, "")}/`;
    });
  container.appendChild(urlInput);

  const urlNote = document.createElement("small");
  urlNote.textContent =
    "Leave empty to skip metadata extraction and use basic event information only.";
  urlNote.style.color = "#666";
  urlNote.style.display = "block";
  urlNote.style.marginBottom = "1em";
  container.appendChild(urlNote);

  const resolveError = document.createElement("div");
  resolveError.style.color = "#d32f2f";
  resolveError.style.marginTop = "0.5em";
  resolveError.style.display = "none";
  resolveError.setAttribute("role", "alert");
  container.appendChild(resolveError);

  const buttonContainer = document.createElement("div");
  buttonContainer.style.display = "flex";
  buttonContainer.style.gap = "0.5em";
  buttonContainer.style.justifyContent = "flex-end";
  buttonContainer.style.marginTop = "1em";

  const resolveButton = document.createElement("button");
  resolveButton.type = "button";
  resolveButton.textContent = "Resolve";
  resolveButton.style.padding = "0.5em 1em";
  resolveButton.style.backgroundColor = "#007bff";
  resolveButton.style.color = "white";
  resolveButton.style.border = "none";
  resolveButton.style.borderRadius = "4px";
  resolveButton.style.cursor = "pointer";
  buttonContainer.appendChild(resolveButton);
  container.appendChild(buttonContainer);

  content.appendChild(container);

  const placeSearch = bindPlaceLocationSearch({
    bindings,
    commitMode: "preview",
    includeManualCoordinates: false,
    onResolved: async () => {
      // Preview mode stores selection internally.
    },
  });

  const handleCancel = () => {
    placeSearch.destroy();
    document.removeEventListener("keydown", handleKeyDown);
    dialog.style.display = "none";
    onCancel();
  };

  const handleResolve = async () => {
    const preview = placeSearch.getPreview();
    const address = bindings.addressInput.value.trim();
    const url = urlInput.value.trim();

    if (!preview) {
      resolveError.textContent =
        "Select a place from the list or search for an address first.";
      resolveError.style.display = "block";
      return;
    }

    if (!address) {
      resolveError.textContent = "Please enter an address.";
      resolveError.style.display = "block";
      return;
    }

    resolveError.style.display = "none";
    resolveButton.disabled = true;
    bindings.stateInput.disabled = true;
    bindings.addressInput.disabled = true;
    urlInput.disabled = true;

    try {
      await resolveIssueWithCoordinates(
        issue,
        preview.latitude,
        preview.longitude,
        address,
        eventDetailsMap,
        log,
        url || undefined,
      );
      placeSearch.destroy();
      dialog.style.display = "none";
      onSuccess();
    } catch (error) {
      resolveError.textContent =
        error instanceof Error ? error.message : "Resolution failed";
      resolveError.style.display = "block";
    } finally {
      resolveButton.disabled = false;
      bindings.stateInput.disabled = false;
      bindings.addressInput.disabled = false;
      urlInput.disabled = false;
    }
  };

  resolveButton.addEventListener("click", () => {
    void handleResolve();
  });

  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === "Escape") {
      event.preventDefault();
      handleCancel();
    }
  };

  cancelButton.addEventListener("click", handleCancel);
  bindings.addressInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      void handleResolve();
    }
  });
  document.addEventListener("keydown", handleKeyDown);

  dialog.style.display = "block";
  bindings.stateInput.focus();
}
