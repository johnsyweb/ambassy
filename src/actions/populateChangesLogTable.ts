import { LogEntry } from "@models/LogEntry";
import { initializeTableSorting } from "./tableSorting";
import { EventDetailsMap } from "@models/EventDetailsMap";
import { CountryMap } from "@models/country";
import { buildEventHistoryUrl } from "@utils/eventHistoryUrl";

export function populateChangesLogTable(
  log: LogEntry[],
  eventDetails?: EventDetailsMap,
  countries?: CountryMap
) {
  const changesTableBody = document.querySelector('#changesTable tbody');
  if (!changesTableBody) {
    console.error('Table body not found for changes log');
    return;
  }
  changesTableBody.innerHTML = '';

  log.forEach(entry => {
    const row = document.createElement('tr');

    const changeTypeCell = document.createElement('td');
    changeTypeCell.textContent = entry.type;
    row.appendChild(changeTypeCell);

    const eventNameCell = document.createElement('td');
    
    // For "Issue Resolved" entries, try to create an event history link
    if (entry.type === "Issue Resolved" && eventDetails && countries) {
      const eventDetail = eventDetails.get(entry.event);
      if (eventDetail && eventDetail.properties.eventname) {
        const url = buildEventHistoryUrl(
          eventDetail.properties.eventname,
          eventDetail.properties.countrycode,
          countries
        );
        
        if (url) {
          const link = document.createElement("a");
          link.href = url;
          link.target = "_blank";
          link.rel = "noopener noreferrer";
          link.textContent = entry.event;
          link.className = "event-history-link";
          eventNameCell.appendChild(link);
        } else {
          eventNameCell.textContent = entry.event;
        }
      } else {
        eventNameCell.textContent = entry.event;
      }
    } else {
      eventNameCell.textContent = entry.event;
    }
    
    row.appendChild(eventNameCell);

    const originalValueCell = document.createElement('td');
    originalValueCell.textContent = entry.oldValue;
    row.appendChild(originalValueCell);

    const newValueCell = document.createElement('td');
    newValueCell.textContent = entry.newValue;
    row.appendChild(newValueCell);

    const timestampCell = document.createElement('td');
    timestampCell.textContent = new Date(entry.timestamp).toLocaleString();
    row.appendChild(timestampCell);

    changesTableBody.appendChild(row);
  });

  // Initialize sorting with default: Timestamp (column 4) descending (most recent first)
  // Only initialize if we have log entries
  if (log.length > 0) {
    initializeTableSorting('changesTable', 4, 'desc');
  }
}