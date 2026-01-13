import { EventAmbassadorMap } from "@models/EventAmbassadorMap";
import { RegionalAmbassadorMap } from "@models/RegionalAmbassadorMap";
import { CapacityStatus } from "@models/CapacityStatus";
import { loadCapacityLimits, checkEventAmbassadorCapacity, checkRegionalAmbassadorCapacity } from "@actions/checkCapacity";
import { colorPalette } from "@actions/colorPalette";
import { EventTeamsTableDataMap, eventAmbassadorsFrom, regionalAmbassadorsFrom } from "@models/EventTeamsTableData";
import { loadProspectiveEvents } from "@actions/persistProspectiveEvents";
import { EventDetailsMap } from "@models/EventDetailsMap";
import { CountryMap } from "@models/country";
import { buildEventHistoryUrl } from "@utils/eventHistoryUrl";

// Forward declaration - will be set by index.ts
let handleOffboardEventAmbassador: (name: string) => void = () => {
  console.warn("handleOffboardEventAmbassador not initialized");
};
let handleOffboardRegionalAmbassador: (name: string) => void = () => {
  console.warn("handleOffboardRegionalAmbassador not initialized");
};

export function setOffboardingHandlers(
  eventHandler: (name: string) => void,
  regionalHandler: (name: string) => void
): void {
  handleOffboardEventAmbassador = eventHandler;
  handleOffboardRegionalAmbassador = regionalHandler;
}

function assignColorToName(name: string, allNames: string[]): string {
  const index = allNames.indexOf(name);
  return index >= 0 ? colorPalette[index % colorPalette.length] : "#808080";
}

export function populateAmbassadorsTable(
  eventAmbassadors: EventAmbassadorMap,
  regionalAmbassadors: RegionalAmbassadorMap,
  eventTeamsTableData?: EventTeamsTableDataMap,
  eventDetails?: EventDetailsMap,
  countries?: CountryMap
): void {
  populateEventAmbassadorsTable(eventAmbassadors, eventTeamsTableData, eventDetails, countries);
  populateRegionalAmbassadorsTable(regionalAmbassadors, eventTeamsTableData);
}

// Forward declaration - will be set by index.ts
let handleReallocateEA: ((eaName: string) => void) | null = null;

export function setEAReallocateHandler(handler: (eaName: string) => void): void {
  handleReallocateEA = handler;
}

function populateEventAmbassadorsTable(
  eventAmbassadors: EventAmbassadorMap,
  eventTeamsTableData?: EventTeamsTableDataMap,
  eventDetails?: EventDetailsMap,
  countries?: CountryMap
): void {
  const tableBody = document.querySelector("#eventAmbassadorsTable tbody");
  if (!tableBody) {
    console.error("Event Ambassadors Table Body not found");
    return;
  }
  tableBody.innerHTML = "";

  const sortedAmbassadors = Array.from(eventAmbassadors.entries()).sort((a, b) =>
    a[0].localeCompare(b[0])
  );

  const allEANames = eventTeamsTableData 
    ? eventAmbassadorsFrom(eventTeamsTableData)
    : Array.from(eventAmbassadors.keys()).sort((a, b) => a.localeCompare(b));

  sortedAmbassadors.forEach(([name, ambassador]) => {
    const row = document.createElement("tr");
    row.setAttribute("data-ea-name", name);

    // Load prospective events for this ambassador once
    const prospectiveEvents = loadProspectiveEvents().filter(event =>
      event.eventAmbassador === name && event.ambassadorMatchStatus === 'matched'
    );
    const prospectiveEventNames = prospectiveEvents.map(event => event.prospectEvent);

    const nameCell = document.createElement("td");
    const nameContainer = document.createElement("div");
    nameContainer.style.display = "flex";
    nameContainer.style.alignItems = "center";
    nameContainer.style.gap = "8px";

    const colorIndicator = document.createElement("span");
    const color = assignColorToName(name, allEANames);
    colorIndicator.style.display = "inline-block";
    colorIndicator.style.width = "12px";
    colorIndicator.style.height = "12px";
    colorIndicator.style.borderRadius = "50%";
    colorIndicator.style.backgroundColor = color;
    colorIndicator.style.border = "1px solid #333";
    colorIndicator.style.flexShrink = "0";
    colorIndicator.title = `Map color: ${color}`;
    nameContainer.appendChild(colorIndicator);

    const nameSpan = document.createElement("span");
    nameSpan.textContent = name;
    nameContainer.appendChild(nameSpan);

    nameCell.appendChild(nameContainer);
    row.appendChild(nameCell);

    const allocationsCell = document.createElement("td");
    const eventCount = ambassador.events.length;
    const prospectiveCount = prospectiveEvents.length;
    const totalCount = eventCount + prospectiveCount;

    const limits = loadCapacityLimits();
    const status = ambassador.capacityStatus ?? checkEventAmbassadorCapacity(totalCount, limits);

    let emoji = "";
    if (status === CapacityStatus.UNDER) {
      emoji = "⬇️";
    } else if (status === CapacityStatus.WITHIN) {
      emoji = "✅";
    } else if (status === CapacityStatus.OVER) {
      emoji = "⚠️";
    }

    if (prospectiveCount > 0) {
      allocationsCell.textContent = `${totalCount} (${eventCount} live + ${prospectiveCount} prospects) ${emoji}`;
    } else {
      allocationsCell.textContent = `${totalCount} ${emoji}`;
    }
    row.appendChild(allocationsCell);

    const eventsCell = document.createElement("td");
    const allEvents = [...ambassador.events];

    if (allEvents.length === 0 && prospectiveEventNames.length === 0) {
      eventsCell.textContent = "No events assigned";
      eventsCell.style.fontStyle = "italic";
      eventsCell.style.color = "#666";
    } else {
      const eventParts: (HTMLElement | string)[] = [];

      if (allEvents.length > 0) {
        const liveEventElements: (HTMLElement | string)[] = [];
        allEvents.forEach((eventName, index) => {
          if (index > 0) {
            liveEventElements.push(", ");
          }
          
          if (eventDetails && countries) {
            const eventDetail = eventDetails.get(eventName);
            if (eventDetail) {
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
                link.textContent = eventName;
                link.className = "event-history-link";
                liveEventElements.push(link);
              } else {
                const span = document.createElement("span");
                span.textContent = eventName;
                span.title = "Event history unavailable - missing country domain";
                span.setAttribute("aria-label", "Event history unavailable - missing country domain");
                liveEventElements.push(span);
              }
            } else {
              const span = document.createElement("span");
              span.textContent = eventName;
              span.title = "Event history unavailable - event details not found";
              span.setAttribute("aria-label", "Event history unavailable - event details not found");
              liveEventElements.push(span);
            }
          } else {
            liveEventElements.push(eventName);
          }
        });
        eventParts.push(...liveEventElements);
      }

      if (prospectiveEventNames.length > 0) {
        if (eventParts.length > 0) {
          eventParts.push("; ");
        }
        eventParts.push(`Prospects: ${prospectiveEventNames.join(", ")}`);
      }

      eventParts.forEach((part) => {
        if (typeof part === "string") {
          eventsCell.appendChild(document.createTextNode(part));
        } else {
          eventsCell.appendChild(part);
        }
      });
    }
    row.appendChild(eventsCell);

    const actionsCell = document.createElement("td");
    const actionsContainer = document.createElement("div");
    actionsContainer.style.display = "flex";
    actionsContainer.style.gap = "6px";
    actionsContainer.style.alignItems = "center";
    
    const reallocateButton = document.createElement("button");
    reallocateButton.innerHTML = "🤝🏼 Reallocate";
    reallocateButton.type = "button";
    reallocateButton.className = "reallocate-ea-button";
    reallocateButton.title = `Reallocate ${name} to a different Regional Ambassador`;
    reallocateButton.setAttribute("aria-label", `Reallocate Event Ambassador ${name}`);
    reallocateButton.style.padding = "2px 8px";
    reallocateButton.style.fontSize = "0.85em";
    reallocateButton.style.cursor = "pointer";
    reallocateButton.disabled = !handleReallocateEA;
    
    reallocateButton.onclick = (e) => {
      e.stopPropagation();
      if (handleReallocateEA) {
        handleReallocateEA(name);
      }
    };
    
    reallocateButton.onkeydown = (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        e.stopPropagation();
        if (handleReallocateEA) {
          handleReallocateEA(name);
        }
      }
    };
    
    const offboardButton = document.createElement("button");
    offboardButton.innerHTML = "🚪 Offboard";
    offboardButton.type = "button";
    offboardButton.title = `Offboard ${name}`;
    offboardButton.setAttribute("aria-label", `Offboard Event Ambassador ${name}`);
    offboardButton.style.padding = "2px 8px";
    offboardButton.style.fontSize = "0.85em";
    offboardButton.style.cursor = "pointer";
    offboardButton.addEventListener("click", (e) => {
      e.stopPropagation();
      handleOffboardEventAmbassador(name);
    });
    
    offboardButton.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        e.stopPropagation();
        handleOffboardEventAmbassador(name);
      }
    });
    
    actionsContainer.appendChild(reallocateButton);
    actionsContainer.appendChild(offboardButton);
    actionsCell.appendChild(actionsContainer);
    row.appendChild(actionsCell);

    tableBody.appendChild(row);
  });
}

function populateRegionalAmbassadorsTable(regionalAmbassadors: RegionalAmbassadorMap, eventTeamsTableData?: EventTeamsTableDataMap): void {
  const tableBody = document.querySelector("#regionalAmbassadorsTable tbody");
  if (!tableBody) {
    console.error("Regional Ambassadors Table Body not found");
    return;
  }
  tableBody.innerHTML = "";

  const sortedAmbassadors = Array.from(regionalAmbassadors.entries()).sort((a, b) =>
    a[0].localeCompare(b[0])
  );

  const allREANames = eventTeamsTableData
    ? regionalAmbassadorsFrom(eventTeamsTableData)
    : Array.from(regionalAmbassadors.keys()).sort((a, b) => a.localeCompare(b));

  sortedAmbassadors.forEach(([name, ambassador]) => {
    const row = document.createElement("tr");

    const nameCell = document.createElement("td");
    const nameContainer = document.createElement("div");
    nameContainer.style.display = "flex";
    nameContainer.style.alignItems = "center";
    nameContainer.style.gap = "8px";
    
    const colorIndicator = document.createElement("span");
    const color = assignColorToName(name, allREANames);
    colorIndicator.style.display = "inline-block";
    colorIndicator.style.width = "12px";
    colorIndicator.style.height = "12px";
    colorIndicator.style.borderRadius = "50%";
    colorIndicator.style.backgroundColor = color;
    colorIndicator.style.border = "1px solid #333";
    colorIndicator.style.flexShrink = "0";
    colorIndicator.title = `Map color: ${color}`;
    nameContainer.appendChild(colorIndicator);
    
    const nameSpan = document.createElement("span");
    nameSpan.textContent = name;
    nameContainer.appendChild(nameSpan);
    
    nameCell.appendChild(nameContainer);
    row.appendChild(nameCell);

    const stateCell = document.createElement("td");
    stateCell.textContent = ambassador.state;
    row.appendChild(stateCell);

    const allocationsCell = document.createElement("td");
    const eaCount = ambassador.supportsEAs.length;
    const limits = loadCapacityLimits();
    const status = ambassador.capacityStatus ?? checkRegionalAmbassadorCapacity(eaCount, limits);
    
    let emoji = "";
    if (status === CapacityStatus.UNDER) {
      emoji = "⬇️";
    } else if (status === CapacityStatus.WITHIN) {
      emoji = "✅";
    } else if (status === CapacityStatus.OVER) {
      emoji = "⚠️";
    }
    
    allocationsCell.textContent = `${eaCount} ${emoji}`;
    row.appendChild(allocationsCell);

    const easCell = document.createElement("td");
    if (ambassador.supportsEAs.length === 0) {
      easCell.textContent = "No Event Ambassadors assigned";
      easCell.style.fontStyle = "italic";
      easCell.style.color = "#666";
    } else {
      easCell.textContent = ambassador.supportsEAs.join(", ");
    }
    row.appendChild(easCell);

    const actionsCell = document.createElement("td");
    const offboardButton = document.createElement("button");
    offboardButton.innerHTML = "🚪 Offboard";
    offboardButton.type = "button";
    offboardButton.title = `Offboard ${name}`;
    offboardButton.setAttribute("aria-label", `Offboard Regional Ambassador ${name}`);
    offboardButton.style.padding = "2px 8px";
    offboardButton.style.fontSize = "0.85em";
    offboardButton.style.cursor = "pointer";
    offboardButton.addEventListener("click", (e) => {
      e.stopPropagation();
      handleOffboardRegionalAmbassador(name);
    });
    
    offboardButton.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        e.stopPropagation();
        handleOffboardRegionalAmbassador(name);
      }
    });
    
    actionsCell.appendChild(offboardButton);
    row.appendChild(actionsCell);

    tableBody.appendChild(row);
  });
}

