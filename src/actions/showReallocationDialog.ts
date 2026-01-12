import { ReallocationSuggestion } from "@models/ReallocationSuggestion";
import { EventAmbassadorMap } from "@models/EventAmbassadorMap";

/**
 * Display a modal dialog with prioritised ambassador suggestions for reallocating an event.
 * Shows top 3-5 suggestions as buttons and provides "Other" dropdown for manual selection.
 */
export function showReallocationDialog(
  eventShortName: string,
  currentAmbassador: string,
  suggestions: ReallocationSuggestion[],
  eventAmbassadors: EventAmbassadorMap,
  onSelect: (ambassadorName: string) => void,
  onCancel: () => void
): void {
  const dialog = document.getElementById("reallocationDialog") as HTMLElement;
  const title = document.getElementById("reallocationDialogTitle") as HTMLElement;
  const content = document.getElementById("reallocationDialogContent") as HTMLElement;
  const cancelButton = document.getElementById("reallocationDialogCancel") as HTMLButtonElement;

  if (!dialog || !title || !content || !cancelButton) {
    console.error("Reallocation dialog elements not found");
    return;
  }

  title.textContent = `Reallocate Event: ${eventShortName}`;
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
      
      const scoreSpan = document.createElement("span");
      scoreSpan.style.marginLeft = "0.5em";
      scoreSpan.style.color = "#666";
      scoreSpan.textContent = `(Score: ${suggestion.score.toFixed(0)})`;
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
      button.setAttribute("aria-label", `${suggestion.toAmbassador}, score ${suggestion.score.toFixed(0)}. ${suggestion.reasons?.join(", ") || ""}${suggestion.warnings ? `. Warnings: ${suggestion.warnings.join(", ")}` : ""}`);

      button.addEventListener("click", () => {
        dialog.style.display = "none";
        cleanup();
        onSelect(suggestion.toAmbassador);
      });

      button.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          e.stopPropagation();
          dialog.style.display = "none";
          cleanup();
          onSelect(suggestion.toAmbassador);
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
  emptyOption.textContent = "Select an ambassador";
  dropdown.appendChild(emptyOption);

  const allAmbassadors = Array.from(eventAmbassadors.keys())
    .filter(ambassador => ambassador !== currentAmbassador)
    .sort();
  allAmbassadors.forEach((ambassador) => {
    const optionElement = document.createElement("option");
    optionElement.value = ambassador;
    optionElement.textContent = ambassador;
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
    if (dropdown.value) {
      dialog.style.display = "none";
      cleanup();
      onSelect(dropdown.value);
    }
  });

  otherContainer.appendChild(dropdown);
  content.appendChild(suggestionsContainer);
  content.appendChild(otherContainer);

  const handleCancel = () => {
    dialog.style.display = "none";
    cleanup();
    onCancel();
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
