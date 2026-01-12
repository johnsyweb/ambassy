import { EventDetails } from "@models/EventDetails";
import { EventDetailsMap } from "@models/EventDetailsMap";
import { searchEvents } from "./searchEvents";

export function showEventSearchDialog(
  issueEventName: string,
  events: EventDetailsMap,
  onSelect: (event: EventDetails) => void,
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

  title.textContent = `Search Events for: ${issueEventName}`;
  content.innerHTML = "";

  const searchContainer = document.createElement("div");
  searchContainer.style.marginBottom = "1em";

  const searchLabel = document.createElement("label");
  searchLabel.textContent = "Search for event:";
  searchLabel.style.display = "block";
  searchLabel.style.marginBottom = "0.5em";
  searchLabel.setAttribute("for", "eventSearchInput");
  searchContainer.appendChild(searchLabel);

  const searchInput = document.createElement("input");
  searchInput.type = "text";
  searchInput.id = "eventSearchInput";
  searchInput.placeholder = "Enter event name...";
  searchInput.style.width = "100%";
  searchInput.style.padding = "0.5em";
  searchInput.style.marginBottom = "1em";
  searchContainer.appendChild(searchInput);

  const resultsContainer = document.createElement("div");
  resultsContainer.id = "eventSearchResults";
  resultsContainer.style.maxHeight = "300px";
  resultsContainer.style.overflowY = "auto";
  resultsContainer.style.border = "1px solid #ccc";
  resultsContainer.style.borderRadius = "4px";
  resultsContainer.style.padding = "0.5em";
  searchContainer.appendChild(resultsContainer);

  content.appendChild(searchContainer);

  let searchTimeout: NodeJS.Timeout | null = null;

  const performSearch = (query: string) => {
    resultsContainer.innerHTML = "";

    if (!query || query.trim() === "") {
      const emptyMessage = document.createElement("p");
      emptyMessage.textContent = "Enter a search term to find events";
      emptyMessage.style.color = "#666";
      emptyMessage.style.textAlign = "center";
      emptyMessage.style.padding = "1em";
      resultsContainer.appendChild(emptyMessage);
      return;
    }

    const results = searchEvents(query, events);

    if (results.length === 0) {
      const noResults = document.createElement("p");
      noResults.textContent = "No events found. Try a different search term.";
      noResults.style.color = "#666";
      noResults.style.textAlign = "center";
      noResults.style.padding = "1em";
      resultsContainer.appendChild(noResults);
      return;
    }

    results.forEach((event) => {
      const resultButton = document.createElement("button");
      resultButton.type = "button";
      resultButton.style.width = "100%";
      resultButton.style.textAlign = "left";
      resultButton.style.padding = "0.75em";
      resultButton.style.marginBottom = "0.5em";
      resultButton.style.border = "1px solid #ccc";
      resultButton.style.borderRadius = "4px";
      resultButton.style.backgroundColor = "#fff";
      resultButton.style.cursor = "pointer";
      resultButton.setAttribute("role", "option");

      const eventName = document.createElement("div");
      eventName.style.fontWeight = "bold";
      eventName.textContent = event.properties.EventLongName || event.properties.EventShortName;
      resultButton.appendChild(eventName);

      const eventLocation = document.createElement("div");
      eventLocation.style.fontSize = "0.9em";
      eventLocation.style.color = "#666";
      eventLocation.textContent = event.properties.EventLocation || "Location not specified";
      resultButton.appendChild(eventLocation);

      const coordinates = document.createElement("div");
      coordinates.style.fontSize = "0.85em";
      coordinates.style.color = "#999";
      coordinates.textContent = `Coordinates: ${event.geometry.coordinates[1]}, ${event.geometry.coordinates[0]}`;
      resultButton.appendChild(coordinates);

      resultButton.addEventListener("click", () => {
        onSelect(event);
        dialog.style.display = "none";
        dialog.setAttribute("aria-hidden", "true");
      });

      resultButton.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect(event);
          dialog.style.display = "none";
          dialog.setAttribute("aria-hidden", "true");
        }
      });

      resultsContainer.appendChild(resultButton);
    });
  };

  searchInput.addEventListener("input", (e) => {
    const query = (e.target as HTMLInputElement).value;

    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }

    searchTimeout = setTimeout(() => {
      performSearch(query);
    }, 300);
  });

  searchInput.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      onCancel();
      dialog.style.display = "none";
      dialog.setAttribute("aria-hidden", "true");
    }
  });

  cancelButton.onclick = () => {
    onCancel();
    dialog.style.display = "none";
    dialog.setAttribute("aria-hidden", "true");
  };

  dialog.style.display = "block";
  dialog.setAttribute("aria-hidden", "false");
  searchInput.focus();

  performSearch(issueEventName);
}
