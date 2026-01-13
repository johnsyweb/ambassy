import { ReallocationSuggestion } from "@models/ReallocationSuggestion";
import { EventAmbassadorMap } from "@models/EventAmbassadorMap";
import { RegionalAmbassadorMap } from "@models/RegionalAmbassadorMap";
import { EventDetailsMap } from "@models/EventDetailsMap";
import { calculateDistance } from "../utils/geography";
import { ProspectiveEventList } from "@models/ProspectiveEventList";

/**
 * Display a modal dialog with prioritised ambassador suggestions for reallocating an event or event ambassador.
 * Shows top 3-5 suggestions as buttons and provides "Other" dropdown for manual selection.
 */
export function showReallocationDialog(
  itemName: string,
  currentAmbassador: string,
  suggestions: ReallocationSuggestion[],
  eventAmbassadors?: EventAmbassadorMap,
  regionalAmbassadors?: RegionalAmbassadorMap,
  onSelect?: (ambassadorName: string) => void,
  onCancel?: () => void,
  eventDetails?: EventDetailsMap,
  prospects?: ProspectiveEventList
): void {
  const dialog = document.getElementById("reallocationDialog") as HTMLElement;
  const title = document.getElementById("reallocationDialogTitle") as HTMLElement;
  const content = document.getElementById("reallocationDialogContent") as HTMLElement;
  const cancelButton = document.getElementById("reallocationDialogCancel") as HTMLButtonElement;

  if (!dialog || !title || !content || !cancelButton) {
    console.error("Reallocation dialog elements not found");
    return;
  }

  // Determine if this is for events (EA) or event ambassadors (RA)
  const isEventReallocation = eventAmbassadors !== undefined;
  const itemLabel = isEventReallocation ? "Event" : "Event Ambassador";
  title.textContent = `Reallocate ${itemLabel}: ${itemName}`;
  content.innerHTML = "";

  const topSuggestions = suggestions.slice(0, 5);
  const suggestionsContainer = document.createElement("div");
  suggestionsContainer.style.marginBottom = "1em";

  if (topSuggestions.length > 0) {
    const suggestionsLabel = document.createElement("p");
    suggestionsLabel.textContent = "Suggested recipients:";
    suggestionsLabel.style.fontWeight = "bold";
    suggestionsLabel.style.marginBottom = "0.5em";
    suggestionsContainer.appendChild(suggestionsLabel);

    const buttonsContainer = document.createElement("div");
    buttonsContainer.style.display = "flex";
    buttonsContainer.style.flexDirection = "column";
    buttonsContainer.style.gap = "0.5em";
    buttonsContainer.setAttribute("role", "group");
    buttonsContainer.setAttribute("aria-label", "Suggested recipients");

    topSuggestions.forEach((suggestion, index) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "suggestion-button";
      
      const buttonText = document.createElement("div");
      buttonText.style.textAlign = "left";
      
      const nameSpan = document.createElement("span");
      nameSpan.style.fontWeight = "bold";
      nameSpan.textContent = suggestion.toAmbassador;
      buttonText.appendChild(nameSpan);
      
      if (isEventReallocation) {
        const contextDiv = document.createElement("div");
        contextDiv.style.fontSize = "0.9em";
        contextDiv.style.color = "#555";
        contextDiv.style.marginTop = "0.25em";
        contextDiv.style.display = "flex";
        contextDiv.style.flexDirection = "column";
        contextDiv.style.gap = "0.25em";

        const liveCount = suggestion.liveEventsCount ?? 0;
        const prospectCount = suggestion.prospectEventsCount ?? 0;
        const totalCount = suggestion.allocationCount ?? (liveCount + prospectCount);

        const allocationInfo = document.createElement("div");
        allocationInfo.textContent = `${liveCount} live, ${prospectCount} prospect, ${totalCount} total`;
        contextDiv.appendChild(allocationInfo);

        if (regionalAmbassadors) {
          let reaName: string | null = null;
          for (const [raName, ra] of regionalAmbassadors) {
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
        } else if (liveCount === 0 && prospectCount === 0) {
          const noEventsInfo = document.createElement("div");
          noEventsInfo.textContent = "No events assigned";
          contextDiv.appendChild(noEventsInfo);
        }

        buttonText.appendChild(contextDiv);
      } else if (suggestion.allocationCount !== undefined) {
        const allocationSpan = document.createElement("span");
        allocationSpan.style.marginLeft = "0.5em";
        allocationSpan.style.color = "#666";
        allocationSpan.style.fontWeight = "normal";
        allocationSpan.textContent = `(${suggestion.allocationCount} allocation${suggestion.allocationCount !== 1 ? "s" : ""})`;
        buttonText.appendChild(allocationSpan);
      }
      
      const scoreSpan = document.createElement("span");
      scoreSpan.style.marginLeft = "0.5em";
      scoreSpan.style.color = "#999";
      scoreSpan.style.fontSize = "0.9em";
      scoreSpan.textContent = `Score: ${suggestion.score.toFixed(0)}`;
      buttonText.appendChild(scoreSpan);
      
      if (suggestion.reasons && suggestion.reasons.length > 0) {
        const reasonsDiv = document.createElement("div");
        reasonsDiv.style.fontSize = "0.9em";
        reasonsDiv.style.color = "#555";
        reasonsDiv.style.marginTop = "0.25em";
        reasonsDiv.textContent = suggestion.reasons.join(", ");
        buttonText.appendChild(reasonsDiv);
      }
      
      if (suggestion.warnings && suggestion.warnings.length > 0) {
        const warningsDiv = document.createElement("div");
        warningsDiv.style.fontSize = "0.9em";
        warningsDiv.style.color = "#d32f2f";
        warningsDiv.style.marginTop = "0.25em";
        warningsDiv.style.fontWeight = "bold";
        warningsDiv.textContent = `⚠ ${suggestion.warnings.join(", ")}`;
        buttonText.appendChild(warningsDiv);
      }
      
      button.appendChild(buttonText);
      button.style.padding = "0.75em 1em";
      button.style.textAlign = "left";
      button.style.border = suggestion.warnings && suggestion.warnings.length > 0 ? "2px solid #ff9800" : "1px solid #333";
      button.style.borderRadius = "4px";
      button.style.backgroundColor = index === 0 ? "#e3f2fd" : "white";
      button.style.cursor = "pointer";
      button.setAttribute("tabindex", index === 0 ? "0" : "-1");
      
      const liveCount = suggestion.liveEventsCount ?? 0;
      const prospectCount = suggestion.prospectEventsCount ?? 0;
      const totalCount = suggestion.allocationCount ?? (liveCount + prospectCount);
      let ariaLabel = `${suggestion.toAmbassador}, ${liveCount} live events, ${prospectCount} prospect events, ${totalCount} total allocations`;
      
      if (isEventReallocation && regionalAmbassadors) {
        let reaName: string | null = null;
        for (const [raName, ra] of regionalAmbassadors) {
          if (ra.supportsEAs.includes(suggestion.toAmbassador)) {
            reaName = raName;
            break;
          }
        }
        ariaLabel += `, REA: ${reaName ?? "Unassigned"}`;
      }
      
      if (suggestion.neighboringEvents && suggestion.neighboringEvents.length > 0) {
        const nearestEvent = suggestion.neighboringEvents[0];
        ariaLabel += `, ${nearestEvent.distanceKm.toFixed(1)} km to ${nearestEvent.name}`;
      } else if (liveCount === 0 && prospectCount === 0) {
        ariaLabel += ", No events assigned";
      }
      
      ariaLabel += `, score ${suggestion.score.toFixed(0)}. ${suggestion.reasons?.join(", ") || ""}${suggestion.warnings ? `. Warnings: ${suggestion.warnings.join(", ")}` : ""}`;
      button.setAttribute("aria-label", ariaLabel);

      button.addEventListener("click", () => {
        dialog.style.display = "none";
        cleanup();
        onSelect?.(suggestion.toAmbassador);
      });

      button.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          e.stopPropagation();
          dialog.style.display = "none";
          cleanup();
          onSelect?.(suggestion.toAmbassador);
        } else if (e.key === "ArrowDown") {
          e.preventDefault();
          const nextButton = buttonsContainer.querySelector(`button.suggestion-button:nth-child(${index + 2})`) as HTMLButtonElement;
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
          const prevButton = buttonsContainer.querySelector(`button.suggestion-button:nth-child(${index})`) as HTMLButtonElement;
          if (prevButton) {
            button.setAttribute("tabindex", "-1");
            prevButton.setAttribute("tabindex", "0");
            prevButton.focus();
          }
        }
      });

      buttonsContainer.appendChild(button);
    });

    suggestionsContainer.appendChild(buttonsContainer);
  }

  const otherContainer = document.createElement("div");
  otherContainer.style.marginTop = "1em";

  const otherLabel = document.createElement("label");
  otherLabel.textContent = "Other:";
  otherLabel.style.display = "block";
  otherLabel.style.marginBottom = "0.5em";
  otherLabel.setAttribute("for", "otherRecipientSelect");
  otherContainer.appendChild(otherLabel);

  const dropdown = document.createElement("select");
  dropdown.id = "otherRecipientSelect";
  dropdown.style.width = "100%";
  dropdown.style.padding = "0.5em";
  dropdown.setAttribute("tabindex", topSuggestions.length > 0 ? "-1" : "0");

  const emptyOption = document.createElement("option");
  emptyOption.value = "";
  emptyOption.textContent = isEventReallocation ? "Select an ambassador" : "Select or leave blank to unassign";
  dropdown.appendChild(emptyOption);

  const allAmbassadors = isEventReallocation
    ? Array.from((eventAmbassadors as EventAmbassadorMap).keys())
        .filter(ambassador => ambassador !== currentAmbassador)
        .sort()
    : Array.from((regionalAmbassadors as RegionalAmbassadorMap).keys())
        .filter(ambassador => ambassador !== currentAmbassador)
        .sort();
  
  const reallocatingEventName = isEventReallocation && suggestions.length > 0 && suggestions[0].items.length > 0
    ? suggestions[0].items[0]
    : itemName;
  
  allAmbassadors.forEach((ambassador) => {
    const optionElement = document.createElement("option");
    optionElement.value = ambassador;

    let displayText = ambassador;
    if (isEventReallocation && eventAmbassadors) {
      const ea = eventAmbassadors.get(ambassador);
      if (ea) {
        const liveCount = ea.events.length;
        const prospectCount = ea.prospectiveEvents?.length ?? 0;
        const totalCount = liveCount + prospectCount;
        
        let reaName: string | null = null;
        if (regionalAmbassadors) {
          for (const [raName, ra] of regionalAmbassadors) {
            if (ra.supportsEAs.includes(ambassador)) {
              reaName = raName;
              break;
            }
          }
        }
        
        const reaDisplay = reaName ?? "Unassigned";
        const allocationText = `(${liveCount}+${prospectCount}=${totalCount} allocation${totalCount !== 1 ? "s" : ""})`;
        
        let distanceText = "";
        // Get coordinates for the reallocating item (event or prospect)
        let reallocCoords: { lat: number; lon: number } | null = null;
        
        if (eventDetails) {
          const reallocatingEvent = eventDetails.get(reallocatingEventName);
          if (reallocatingEvent?.geometry?.coordinates) {
            const [reallocLon, reallocLat] = reallocatingEvent.geometry.coordinates;
            reallocCoords = { lat: reallocLat, lon: reallocLon };
          }
        }
        
        // If not found in eventDetails, check if it's a prospect
        if (!reallocCoords && prospects) {
          const prospect = prospects.getAll().find(p => p.prospectEvent === reallocatingEventName);
          if (prospect?.coordinates && prospect.geocodingStatus === 'success') {
            reallocCoords = {
              lat: prospect.coordinates.latitude,
              lon: prospect.coordinates.longitude
            };
          }
        }
        
        if (reallocCoords && (ea.events.length > 0 || (ea.prospectiveEvents && ea.prospectiveEvents.length > 0))) {
          let nearestEvent: { name: string; distanceKm: number } | null = null;
          
          // Check live events
          if (eventDetails) {
            for (const eventName of ea.events) {
              const eventDetail = eventDetails.get(eventName);
              if (eventDetail?.geometry?.coordinates) {
                const [eventLon, eventLat] = eventDetail.geometry.coordinates;
                const distance = calculateDistance(reallocCoords.lat, reallocCoords.lon, eventLat, eventLon);
                if (!nearestEvent || distance < nearestEvent.distanceKm) {
                  nearestEvent = { name: eventName, distanceKm: distance };
                }
              }
            }
          }
          
          // Check prospect events
          if (prospects && ea.prospectiveEvents) {
            for (const prospectId of ea.prospectiveEvents) {
              const prospectEvent = prospects.findById(prospectId);
              if (prospectEvent?.coordinates && prospectEvent.geocodingStatus === 'success') {
                const distance = calculateDistance(
                  reallocCoords.lat,
                  reallocCoords.lon,
                  prospectEvent.coordinates.latitude,
                  prospectEvent.coordinates.longitude
                );
                if (!nearestEvent || distance < nearestEvent.distanceKm) {
                  nearestEvent = { name: prospectEvent.prospectEvent, distanceKm: distance };
                }
              }
            }
          }
          
          if (nearestEvent) {
            distanceText = ` - ${nearestEvent.distanceKm.toFixed(1)} km to ${nearestEvent.name}`;
          }
        }
        
        displayText = `${ambassador} ${allocationText} [${reaDisplay}]${distanceText}`;
      }
    }

    optionElement.textContent = displayText;
    dropdown.appendChild(optionElement);
  });

  dropdown.addEventListener("keydown", (e) => {
    if (e.key === "ArrowUp" && dropdown.selectedIndex === 0) {
      e.preventDefault();
      const lastButton = content.querySelector("button.suggestion-button:last-of-type") as HTMLButtonElement;
      if (lastButton) {
        dropdown.setAttribute("tabindex", "-1");
        lastButton.setAttribute("tabindex", "0");
        lastButton.focus();
      }
    } else if (e.key === "Escape") {
      e.preventDefault();
      handleCancel();
    }
  });

  dropdown.addEventListener("change", () => {
    if (dropdown.value || !isEventReallocation) {
      dialog.style.display = "none";
      cleanup();
      onSelect?.(dropdown.value);
    }
  });

  otherContainer.appendChild(dropdown);
  content.appendChild(suggestionsContainer);
  content.appendChild(otherContainer);

  const handleCancel = () => {
    dialog.style.display = "none";
    cleanup();
    onCancel?.();
  };

  const handleEscape = (e: KeyboardEvent) => {
    if (e.key === "Escape") {
      handleCancel();
    }
  };

  const cleanup = () => {
    document.removeEventListener("keydown", handleEscape);
    cancelButton.onclick = null;
  };

  cancelButton.onclick = handleCancel;
  document.addEventListener("keydown", handleEscape);

  dialog.style.display = "block";
  const firstButton = content.querySelector("button.suggestion-button") as HTMLButtonElement;
  if (firstButton) {
    firstButton.focus();
  } else {
    dropdown.setAttribute("tabindex", "0");
    dropdown.focus();
  }
}
