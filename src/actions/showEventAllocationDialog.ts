import { EventAmbassadorMap } from "@models/EventAmbassadorMap";
import { RegionalAmbassadorMap } from "@models/RegionalAmbassadorMap";
import { EventDetailsMap } from "@models/EventDetailsMap";
import { EventTeamMap } from "@models/EventTeamMap";
import { ReallocationSuggestion } from "@models/ReallocationSuggestion";
import { suggestEventAllocation } from "./suggestEventAllocation";

/**
 * Display a modal dialog for allocating an unallocated event to an Event Ambassador.
 * Shows top 3-5 suggestions as buttons and provides "Other" dropdown for manual selection.
 */
export function showEventAllocationDialog(
  eventName: string,
  eventDetails: EventDetailsMap,
  eventAmbassadors: EventAmbassadorMap,
  regionalAmbassadors: RegionalAmbassadorMap,
  eventTeams: EventTeamMap,
  onSelect: (eaName: string) => void,
  onCancel: () => void,
  suggestions?: ReallocationSuggestion[]
): void {
  const dialog = document.getElementById("reallocationDialog") as HTMLElement;
  const title = document.getElementById("reallocationDialogTitle") as HTMLElement;
  const content = document.getElementById("reallocationDialogContent") as HTMLElement;
  const cancelButton = document.getElementById("reallocationDialogCancel") as HTMLButtonElement;

  if (!dialog || !title || !content || !cancelButton) {
    console.error("Reallocation dialog elements not found");
    return;
  }

  if (eventAmbassadors.size === 0) {
    title.textContent = `Allocate Event: ${eventName}`;
    content.innerHTML = `
      <p style="color: #d32f2f; font-weight: bold;">
        No Event Ambassadors available. Please onboard an Event Ambassador first.
      </p>
    `;
    dialog.style.display = "block";
    dialog.setAttribute("aria-modal", "true");
    dialog.setAttribute("role", "dialog");
    dialog.setAttribute("aria-labelledby", "reallocationDialogTitle");

    const handleCancel = () => {
      dialog.style.display = "none";
      cancelButton.removeEventListener("click", handleCancel);
      onCancel();
    };

    cancelButton.addEventListener("click", handleCancel);
    return;
  }

  const eventDetail = eventDetails.get(eventName);
  const eventTeam = eventTeams.get(eventName);
  const eventDirectors = eventTeam?.eventDirectors.join(", ") || "N/A";

  title.textContent = `Allocate Event: ${eventName}`;
  content.innerHTML = "";

  const eventInfoDiv = document.createElement("div");
  eventInfoDiv.style.marginBottom = "1em";
  eventInfoDiv.style.padding = "0.5em";
  eventInfoDiv.style.backgroundColor = "#f5f5f5";
  eventInfoDiv.style.borderRadius = "4px";

  if (eventDetail) {
    const eventInfo = document.createElement("p");
    eventInfo.style.margin = "0.25em 0";
    eventInfo.innerHTML = `
      <strong>Event:</strong> ${eventDetail.properties.EventLongName || eventName}<br>
      <strong>Event Director(s):</strong> ${eventDirectors}<br>
      <strong>Location:</strong> ${eventDetail.properties.EventLocation || "N/A"}
    `;
    eventInfoDiv.appendChild(eventInfo);
  }

  content.appendChild(eventInfoDiv);

  const suggestionsToUse =
    suggestions || suggestEventAllocation(eventName, eventAmbassadors, eventDetails, regionalAmbassadors);
  const topSuggestions = suggestionsToUse.slice(0, 5);
  const suggestionsContainer = document.createElement("div");
  suggestionsContainer.style.marginBottom = "1em";

  if (topSuggestions.length > 0) {
    const suggestionsLabel = document.createElement("p");
    suggestionsLabel.textContent = "Suggested Event Ambassadors:";
    suggestionsLabel.style.fontWeight = "bold";
    suggestionsLabel.style.marginBottom = "0.5em";
    suggestionsContainer.appendChild(suggestionsLabel);

    const buttonsContainer = document.createElement("div");
    buttonsContainer.style.display = "flex";
    buttonsContainer.style.flexDirection = "column";
    buttonsContainer.style.gap = "0.5em";
    buttonsContainer.setAttribute("role", "group");
    buttonsContainer.setAttribute("aria-label", "Suggested Event Ambassadors");

    topSuggestions.forEach((suggestion) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "suggestion-button";
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

      if (suggestion.reasons && suggestion.reasons.length > 0) {
        const reasonsDiv = document.createElement("div");
        reasonsDiv.style.fontSize = "0.85em";
        reasonsDiv.style.color = "#666";
        reasonsDiv.textContent = suggestion.reasons.join(" • ");
        contextDiv.appendChild(reasonsDiv);
      }

      if (suggestion.warnings && suggestion.warnings.length > 0) {
        const warningsDiv = document.createElement("div");
        warningsDiv.style.fontSize = "0.85em";
        warningsDiv.style.color = "#d32f2f";
        warningsDiv.textContent = `⚠ ${suggestion.warnings.join(" • ")}`;
        contextDiv.appendChild(warningsDiv);
      }

      buttonText.appendChild(contextDiv);
      button.appendChild(buttonText);

      button.addEventListener("click", () => {
        dialog.style.display = "none";
        onSelect(suggestion.toAmbassador);
      });

      button.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          dialog.style.display = "none";
          onSelect(suggestion.toAmbassador);
        } else if (e.key === "ArrowDown") {
          e.preventDefault();
          const buttons = Array.from(buttonsContainer.querySelectorAll("button.suggestion-button")) as HTMLButtonElement[];
          const currentIndex = buttons.indexOf(button);
          const nextButton = buttons[currentIndex + 1];
          if (nextButton) {
            button.setAttribute("tabindex", "-1");
            nextButton.setAttribute("tabindex", "0");
            nextButton.focus();
          } else {
            const dropdown = content.querySelector("select#otherRecipientSelect") as HTMLSelectElement;
            if (dropdown) {
              button.setAttribute("tabindex", "-1");
              dropdown.setAttribute("tabindex", "0");
              dropdown.focus();
            }
          }
        } else if (e.key === "ArrowUp") {
          e.preventDefault();
          const buttons = Array.from(buttonsContainer.querySelectorAll("button.suggestion-button")) as HTMLButtonElement[];
          const currentIndex = buttons.indexOf(button);
          const prevButton = buttons[currentIndex - 1];
          if (prevButton) {
            button.setAttribute("tabindex", "-1");
            prevButton.setAttribute("tabindex", "0");
            prevButton.focus();
          }
        }
      });

      button.setAttribute("tabindex", "0");
      buttonsContainer.appendChild(button);
    });

    suggestionsContainer.appendChild(buttonsContainer);
  }

  content.appendChild(suggestionsContainer);

  const otherContainer = document.createElement("div");
  otherContainer.style.marginTop = "1em";

  const otherLabel = document.createElement("label");
  otherLabel.htmlFor = "otherRecipientSelect";
  otherLabel.textContent = "Other Event Ambassador:";
  otherLabel.style.display = "block";
  otherLabel.style.marginBottom = "0.5em";
  otherLabel.style.fontWeight = "bold";
  otherContainer.appendChild(otherLabel);

  const dropdown = document.createElement("select");
  dropdown.id = "otherRecipientSelect";
  dropdown.style.width = "100%";
  dropdown.style.padding = "0.5em";
  dropdown.setAttribute("tabindex", topSuggestions.length > 0 ? "-1" : "0");

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

  const selectButton = document.createElement("button");
  selectButton.type = "button";
  selectButton.textContent = "Allocate";
  selectButton.style.marginTop = "0.5em";
  selectButton.style.padding = "0.5em 1em";
  selectButton.style.backgroundColor = "#4caf50";
  selectButton.style.color = "white";
  selectButton.style.border = "none";
  selectButton.style.borderRadius = "4px";
  selectButton.style.cursor = "pointer";

  selectButton.addEventListener("click", () => {
    const selectedEA = dropdown.value;
    if (selectedEA) {
      dialog.style.display = "none";
      onSelect(selectedEA);
    }
  });

  dropdown.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && dropdown.value) {
      e.preventDefault();
      dialog.style.display = "none";
      onSelect(dropdown.value);
    }
  });

  otherContainer.appendChild(selectButton);
  content.appendChild(otherContainer);

  dialog.style.display = "block";
  dialog.setAttribute("aria-modal", "true");
  dialog.setAttribute("role", "dialog");
  dialog.setAttribute("aria-labelledby", "reallocationDialogTitle");

  const handleCancel = () => {
    dialog.style.display = "none";
    cancelButton.removeEventListener("click", handleCancel);
    onCancel();
  };

  const handleEscape = (e: KeyboardEvent) => {
    if (e.key === "Escape") {
      handleCancel();
      document.removeEventListener("keydown", handleEscape);
    }
  };

  cancelButton.addEventListener("click", handleCancel);
  document.addEventListener("keydown", handleEscape);

  cancelButton.focus();
}
