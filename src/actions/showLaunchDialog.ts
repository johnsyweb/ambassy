import { EventAmbassadorMap } from "@models/EventAmbassadorMap";
import { RegionalAmbassadorMap } from "@models/RegionalAmbassadorMap";
import { EventDetailsMap } from "@models/EventDetailsMap";
import { ProspectiveEvent } from "@models/ProspectiveEvent";
import { EventDetails } from "@models/EventDetails";
import { findMatchingEvents } from "./findMatchingEvents";
import { suggestEventAllocation } from "./suggestEventAllocation";
import { calculateDistance } from "@utils/geography";

/**
 * Display a modal dialog for launching a prospect with optional event matching and EA allocation.
 * Shows matching events (if any) and allows REA to select an event and EA, or proceed without allocation.
 */
export function showLaunchDialog(
  prospect: ProspectiveEvent,
  eventDetails: EventDetailsMap,
  eventAmbassadors: EventAmbassadorMap,
  regionalAmbassadors: RegionalAmbassadorMap,
  onLaunch: (selectedEventName?: string, selectedEA?: string) => void,
  onCancel: () => void,
): void {
  const dialog = document.getElementById("reallocationDialog") as HTMLElement;
  const title = document.getElementById("reallocationDialogTitle") as HTMLElement;
  const content = document.getElementById("reallocationDialogContent") as HTMLElement;
  const cancelButton = document.getElementById("reallocationDialogCancel") as HTMLButtonElement;

  if (!dialog || !title || !content || !cancelButton) {
    console.error("Reallocation dialog elements not found");
    return;
  }

  title.textContent = `Launch Prospect: ${prospect.prospectEvent}`;
  content.innerHTML = "";

  const prospectInfoDiv = document.createElement("div");
  prospectInfoDiv.style.marginBottom = "1em";
  prospectInfoDiv.style.padding = "0.5em";
  prospectInfoDiv.style.backgroundColor = "#f5f5f5";
  prospectInfoDiv.style.borderRadius = "4px";

  const prospectInfo = document.createElement("p");
  prospectInfo.style.margin = "0.25em 0";
  prospectInfo.innerHTML = `
    <strong>Prospect:</strong> ${prospect.prospectEvent}<br>
    <strong>Location:</strong> ${prospect.country}, ${prospect.state}<br>
    ${prospect.coordinates ? `<strong>Coordinates:</strong> ${prospect.coordinates.latitude.toFixed(4)}° S, ${prospect.coordinates.longitude.toFixed(4)}° E` : ""}
  `;
  prospectInfoDiv.appendChild(prospectInfo);
  content.appendChild(prospectInfoDiv);

  const matchingEvents = findMatchingEvents(prospect, eventDetails, 50);
  let selectedEvent: EventDetails | null = null;
  let selectedEA: string | null = null;

  const updateContent = (): void => {
    content.innerHTML = "";
    content.appendChild(prospectInfoDiv);

    if (matchingEvents.length > 0 && !selectedEvent) {
      const matchesLabel = document.createElement("p");
      matchesLabel.textContent = "Potential matching events found:";
      matchesLabel.style.fontWeight = "bold";
      matchesLabel.style.marginBottom = "0.5em";
      content.appendChild(matchesLabel);

      const matchesContainer = document.createElement("div");
      matchesContainer.style.display = "flex";
      matchesContainer.style.flexDirection = "column";
      matchesContainer.style.gap = "0.5em";
      matchesContainer.style.marginBottom = "1em";
      matchesContainer.setAttribute("role", "group");
      matchesContainer.setAttribute("aria-label", "Matching events");

      matchingEvents.forEach((event) => {
        const button = document.createElement("button");
        button.type = "button";
        button.style.padding = "0.75em";
        button.style.textAlign = "left";
        button.style.border = "1px solid #ccc";
        button.style.borderRadius = "4px";
        button.style.backgroundColor = "#fff";
        button.style.cursor = "pointer";

        const buttonText = document.createElement("div");
        const nameSpan = document.createElement("span");
        nameSpan.style.fontWeight = "bold";
        nameSpan.textContent = event.properties.EventShortName || event.id;
        buttonText.appendChild(nameSpan);

        const contextDiv = document.createElement("div");
        contextDiv.style.fontSize = "0.9em";
        contextDiv.style.color = "#555";
        contextDiv.style.marginTop = "0.25em";

        if (prospect.coordinates && event.geometry.coordinates) {
          const [lng, lat] = event.geometry.coordinates;
          const distance = calculateDistance(
            prospect.coordinates.latitude,
            prospect.coordinates.longitude,
            lat,
            lng,
          );
          const distanceInfo = document.createElement("div");
          distanceInfo.textContent = `${distance.toFixed(1)} km away`;
          contextDiv.appendChild(distanceInfo);
        }

        if (event.properties.EventLocation) {
          const locationInfo = document.createElement("div");
          locationInfo.textContent = `Location: ${event.properties.EventLocation}`;
          contextDiv.appendChild(locationInfo);
        }

        buttonText.appendChild(contextDiv);
        button.appendChild(buttonText);

        button.addEventListener("click", () => {
          selectedEvent = event;
          updateContent();
        });

        button.addEventListener("keydown", (e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            selectedEvent = event;
            updateContent();
          }
        });

        matchesContainer.appendChild(button);
      });

      content.appendChild(matchesContainer);

      const proceedWithoutButton = document.createElement("button");
      proceedWithoutButton.type = "button";
      proceedWithoutButton.textContent = "Proceed without event allocation";
      proceedWithoutButton.style.padding = "0.75em";
      proceedWithoutButton.style.marginTop = "0.5em";
      proceedWithoutButton.style.backgroundColor = "#2196f3";
      proceedWithoutButton.style.color = "white";
      proceedWithoutButton.style.border = "none";
      proceedWithoutButton.style.borderRadius = "4px";
      proceedWithoutButton.style.cursor = "pointer";
      proceedWithoutButton.style.width = "100%";

      proceedWithoutButton.addEventListener("click", () => {
        dialog.style.display = "none";
        onLaunch();
      });

      proceedWithoutButton.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          dialog.style.display = "none";
          onLaunch();
        }
      });

      content.appendChild(proceedWithoutButton);
    } else if (selectedEvent) {
      const selectedEventInfo = document.createElement("div");
      selectedEventInfo.style.marginBottom = "1em";
      selectedEventInfo.style.padding = "0.5em";
      selectedEventInfo.style.backgroundColor = "#e3f2fd";
      selectedEventInfo.style.borderRadius = "4px";
      selectedEventInfo.innerHTML = `
        <p style="margin: 0.25em 0;">
          <strong>Selected Event:</strong> ${selectedEvent.properties.EventShortName || selectedEvent.id}
        </p>
      `;
      content.appendChild(selectedEventInfo);

      const changeEventButton = document.createElement("button");
      changeEventButton.type = "button";
      changeEventButton.textContent = "← Change event";
      changeEventButton.style.marginBottom = "1em";
      changeEventButton.style.padding = "0.5em";
      changeEventButton.style.backgroundColor = "#fff";
      changeEventButton.style.border = "1px solid #ccc";
      changeEventButton.style.borderRadius = "4px";
      changeEventButton.style.cursor = "pointer";

      changeEventButton.addEventListener("click", () => {
        selectedEvent = null;
        selectedEA = null;
        updateContent();
      });

      content.appendChild(changeEventButton);

      const suggestions = suggestEventAllocation(
        selectedEvent.id,
        eventAmbassadors,
        eventDetails,
        regionalAmbassadors,
      );
      const topSuggestions = suggestions.slice(0, 5);

      if (topSuggestions.length > 0) {
        const suggestionsLabel = document.createElement("p");
        suggestionsLabel.textContent = "Suggested Event Ambassadors:";
        suggestionsLabel.style.fontWeight = "bold";
        suggestionsLabel.style.marginBottom = "0.5em";
        content.appendChild(suggestionsLabel);

        const buttonsContainer = document.createElement("div");
        buttonsContainer.style.display = "flex";
        buttonsContainer.style.flexDirection = "column";
        buttonsContainer.style.gap = "0.5em";
        buttonsContainer.style.marginBottom = "1em";
        buttonsContainer.setAttribute("role", "group");
        buttonsContainer.setAttribute("aria-label", "Suggested Event Ambassadors");

        topSuggestions.forEach((suggestion) => {
          const button = document.createElement("button");
          button.type = "button";
          button.style.padding = "0.75em";
          button.style.textAlign = "left";
          button.style.border = "1px solid #ccc";
          button.style.borderRadius = "4px";
          button.style.backgroundColor = "#fff";
          button.style.cursor = "pointer";

          const buttonText = document.createElement("div");
          const nameSpan = document.createElement("span");
          nameSpan.style.fontWeight = "bold";
          nameSpan.textContent = suggestion.toAmbassador;
          buttonText.appendChild(nameSpan);

          const contextDiv = document.createElement("div");
          contextDiv.style.fontSize = "0.9em";
          contextDiv.style.color = "#555";
          contextDiv.style.marginTop = "0.25em";
          contextDiv.style.display = "flex";
          contextDiv.style.flexDirection = "column";
          contextDiv.style.gap = "0.25em";

          const liveCount = suggestion.liveEventsCount ?? 0;
          const prospectCount = suggestion.prospectEventsCount ?? 0;
          const totalCount = suggestion.allocationCount ?? liveCount + prospectCount;

          const allocationInfo = document.createElement("div");
          allocationInfo.textContent = `${liveCount} live, ${prospectCount} prospect, ${totalCount} total`;
          contextDiv.appendChild(allocationInfo);

          if (regionalAmbassadors) {
            let reaName: string | null = null;
            for (const [raName, ra] of regionalAmbassadors.entries()) {
              if (ra.supportsEAs.includes(suggestion.toAmbassador)) {
                reaName = raName;
                break;
              }
            }
            const reaInfo = document.createElement("div");
            reaInfo.textContent = `REA: ${reaName ?? "Unassigned"}`;
            contextDiv.appendChild(reaInfo);
          }

          if (suggestion.neighboringEvents && suggestion.neighboringEvents.length > 0) {
            const nearestEvent = suggestion.neighboringEvents[0];
            const distanceInfo = document.createElement("div");
            distanceInfo.textContent = `${nearestEvent.distanceKm.toFixed(1)} km to ${nearestEvent.name}`;
            contextDiv.appendChild(distanceInfo);
          }

          buttonText.appendChild(contextDiv);
          button.appendChild(buttonText);

          button.addEventListener("click", () => {
            selectedEA = suggestion.toAmbassador;
            updateContent();
          });

          button.addEventListener("keydown", (e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              selectedEA = suggestion.toAmbassador;
              updateContent();
            }
          });

          buttonsContainer.appendChild(button);
        });

        content.appendChild(buttonsContainer);
      }

      const otherContainer = document.createElement("div");
      otherContainer.style.marginBottom = "1em";

      const otherLabel = document.createElement("label");
      otherLabel.htmlFor = "otherEASelect";
      otherLabel.textContent = "Other Event Ambassador:";
      otherLabel.style.display = "block";
      otherLabel.style.marginBottom = "0.5em";
      otherLabel.style.fontWeight = "bold";
      otherContainer.appendChild(otherLabel);

      const dropdown = document.createElement("select");
      dropdown.id = "otherEASelect";
      dropdown.style.width = "100%";
      dropdown.style.padding = "0.5em";

      const defaultOption = document.createElement("option");
      defaultOption.value = "";
      defaultOption.textContent = "-- Select Event Ambassador --";
      dropdown.appendChild(defaultOption);

      eventAmbassadors.forEach((ea, eaName) => {
        const option = document.createElement("option");
        option.value = eaName;
        const liveCount = ea.events.length;
        const prospectCount = ea.prospectiveEvents?.length ?? 0;
        const totalCount = liveCount + prospectCount;
        option.textContent = `${eaName} (${liveCount}+${prospectCount}=${totalCount} allocations)`;
        dropdown.appendChild(option);
      });

      otherContainer.appendChild(dropdown);

      dropdown.addEventListener("change", () => {
        if (dropdown.value) {
          selectedEA = dropdown.value;
          updateContent();
        }
      });

      content.appendChild(otherContainer);

      if (!selectedEA) {
        const selectEALabel = document.createElement("p");
        selectEALabel.textContent = "Select an Event Ambassador to allocate this event, or launch without allocation:";
        selectEALabel.style.marginTop = "0.5em";
        selectEALabel.style.marginBottom = "0.5em";
        content.appendChild(selectEALabel);
      }

      const launchButton = document.createElement("button");
      launchButton.type = "button";
      launchButton.textContent = selectedEA
        ? `🚀 Launch and Allocate to ${selectedEA}`
        : "🚀 Launch without EA allocation";
      launchButton.style.padding = "0.75em 1em";
      launchButton.style.marginTop = "0.5em";
      launchButton.style.backgroundColor = "#4caf50";
      launchButton.style.color = "white";
      launchButton.style.border = "none";
      launchButton.style.borderRadius = "4px";
      launchButton.style.cursor = "pointer";
      launchButton.style.width = "100%";
      launchButton.disabled = false;

      launchButton.addEventListener("click", () => {
        if (!selectedEvent) {
          return;
        }
        dialog.style.display = "none";
        onLaunch(selectedEvent.id, selectedEA || undefined);
      });

      launchButton.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          if (!selectedEvent) {
            return;
          }
          dialog.style.display = "none";
          onLaunch(selectedEvent.id, selectedEA || undefined);
        }
      });

      content.appendChild(launchButton);
    } else {
      const noMatchesMessage = document.createElement("p");
      noMatchesMessage.textContent =
        "No matching events found. You can still launch this prospect without event allocation.";
      noMatchesMessage.style.marginBottom = "1em";
      content.appendChild(noMatchesMessage);

      const launchButton = document.createElement("button");
      launchButton.type = "button";
      launchButton.textContent = "🚀 Launch without event allocation";
      launchButton.style.padding = "0.75em 1em";
      launchButton.style.backgroundColor = "#4caf50";
      launchButton.style.color = "white";
      launchButton.style.border = "none";
      launchButton.style.borderRadius = "4px";
      launchButton.style.cursor = "pointer";
      launchButton.style.width = "100%";

      launchButton.addEventListener("click", () => {
        dialog.style.display = "none";
        onLaunch();
      });

      launchButton.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          dialog.style.display = "none";
          onLaunch();
        }
      });

      content.appendChild(launchButton);
    }
  };

  updateContent();

  const handleCancel = () => {
    dialog.style.display = "none";
    cancelButton.removeEventListener("click", handleCancel);
    onCancel();
  };

  cancelButton.addEventListener("click", handleCancel);

  dialog.style.display = "block";
  dialog.setAttribute("aria-modal", "true");
  dialog.setAttribute("role", "dialog");
  dialog.setAttribute("aria-labelledby", "reallocationDialogTitle");

  const firstButton = content.querySelector("button");
  if (firstButton) {
    firstButton.focus();
  }
}
