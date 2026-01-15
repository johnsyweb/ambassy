import { EventAmbassadorMap } from "@models/EventAmbassadorMap";
import { RegionalAmbassadorMap } from "@models/RegionalAmbassadorMap";
import { CapacityStatus } from "@models/CapacityStatus";
import { loadCapacityLimits, checkEventAmbassadorCapacity, checkRegionalAmbassadorCapacity } from "@actions/checkCapacity";
import { colorPalette } from "@actions/colorPalette";
import { EventTeamsTableDataMap, eventAmbassadorsFrom, regionalAmbassadorsFrom } from "@models/EventTeamsTableData";
import { loadProspectiveEvents } from "@actions/persistProspectiveEvents";
import { initializeTableSorting } from "./tableSorting";

// Forward declaration - will be set by index.ts
let handleOffboardEventAmbassador: (name: string) => void = () => {
  console.warn("handleOffboardEventAmbassador not initialized");
};
let handleOffboardRegionalAmbassador: (name: string) => void = () => {
  console.warn("handleOffboardRegionalAmbassador not initialized");
};
let handleTransitionEAToREA: (name: string) => void = () => {
  console.warn("handleTransitionEAToREA not initialized");
};
let handleTransitionREAToEA: (name: string) => void = () => {
  console.warn("handleTransitionREAToEA not initialized");
};

export function setOffboardingHandlers(
  eventHandler: (name: string) => void,
  regionalHandler: (name: string) => void
): void {
  handleOffboardEventAmbassador = eventHandler;
  handleOffboardRegionalAmbassador = regionalHandler;
}

export function setTransitionHandlers(
  eaToReaHandler: (name: string) => void,
  reaToEaHandler: (name: string) => void
): void {
  handleTransitionEAToREA = eaToReaHandler;
  handleTransitionREAToEA = reaToEaHandler;
}

function assignColorToName(name: string, allNames: string[]): string {
  const index = allNames.indexOf(name);
  return index >= 0 ? colorPalette[index % colorPalette.length] : "#808080";
}

export function populateAmbassadorsTable(
  eventAmbassadors: EventAmbassadorMap,
  regionalAmbassadors: RegionalAmbassadorMap,
  eventTeamsTableData?: EventTeamsTableDataMap
): void {
  populateEventAmbassadorsTable(eventAmbassadors, eventTeamsTableData);
  populateRegionalAmbassadorsTable(regionalAmbassadors, eventTeamsTableData);
}

// Forward declaration - will be set by index.ts
let handleReallocateEA: ((eaName: string) => void) | null = null;

export function setEAReallocateHandler(handler: (eaName: string) => void): void {
  handleReallocateEA = handler;
}

function populateEventAmbassadorsTable(eventAmbassadors: EventAmbassadorMap, eventTeamsTableData?: EventTeamsTableDataMap): void {
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

    const reaCell = document.createElement("td");
    reaCell.textContent = ambassador.regionalAmbassador || "—";
    if (!ambassador.regionalAmbassador) {
      reaCell.style.fontStyle = "italic";
      reaCell.style.color = "#666";
    }
    row.appendChild(reaCell);

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

    const stateCell = document.createElement("td");
    stateCell.textContent = ambassador.state || "—";
    if (!ambassador.state) {
      stateCell.style.fontStyle = "italic";
      stateCell.style.color = "#666";
    }
    row.appendChild(stateCell);

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
      const eventParts = [];

      if (allEvents.length > 0) {
        eventParts.push(allEvents.join(", "));
      }

      if (prospectiveEventNames.length > 0) {
        eventParts.push(`Prospects: ${prospectiveEventNames.join(", ")}`);
      }

      eventsCell.textContent = eventParts.join("; ");
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
    
    const transitionButton = document.createElement("button");
    transitionButton.innerHTML = "⬆️ Transition to REA";
    transitionButton.type = "button";
    transitionButton.title = `Transition ${name} to Regional Ambassador`;
    transitionButton.setAttribute("aria-label", `Transition Event Ambassador ${name} to Regional Ambassador`);
    transitionButton.style.padding = "2px 8px";
    transitionButton.style.fontSize = "0.85em";
    transitionButton.style.cursor = "pointer";
    transitionButton.addEventListener("click", (e) => {
      e.stopPropagation();
      handleTransitionEAToREA(name);
    });
    
    transitionButton.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        e.stopPropagation();
        handleTransitionEAToREA(name);
      }
    });
    
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
    actionsContainer.appendChild(transitionButton);
    actionsContainer.appendChild(offboardButton);
    actionsCell.appendChild(actionsContainer);
    row.appendChild(actionsCell);

    tableBody.appendChild(row);
  });

  // Initialize sorting with default: Regional Ambassador (column 0) ascending
  initializeTableSorting('eventAmbassadorsTable', 0, 'asc');
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
    row.setAttribute("data-ra-name", name);

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

    if (ambassador.eventsForReallocation && ambassador.eventsForReallocation.length > 0) {
      const eventsForReallocationCell = document.createElement("td");
      eventsForReallocationCell.textContent = `Events for reallocation: ${ambassador.eventsForReallocation.join(", ")}`;
      eventsForReallocationCell.style.fontStyle = "italic";
      eventsForReallocationCell.style.color = "#666";
      row.appendChild(eventsForReallocationCell);
    }

    const actionsCell = document.createElement("td");
    const transitionButton = document.createElement("button");
    transitionButton.innerHTML = "⬇️ Transition to EA";
    transitionButton.type = "button";
    transitionButton.title = `Transition ${name} to Event Ambassador`;
    transitionButton.setAttribute("aria-label", `Transition Regional Ambassador ${name} to Event Ambassador`);
    transitionButton.style.padding = "2px 8px";
    transitionButton.style.fontSize = "0.85em";
    transitionButton.style.cursor = "pointer";
    transitionButton.addEventListener("click", (e) => {
      e.stopPropagation();
      handleTransitionREAToEA(name);
    });
    
    transitionButton.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        e.stopPropagation();
        handleTransitionREAToEA(name);
      }
    });
    
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
    
    actionsCell.appendChild(transitionButton);
    actionsCell.appendChild(offboardButton);
    row.appendChild(actionsCell);

    tableBody.appendChild(row);
  });

  // Initialize sorting with default: Name (column 0) ascending
  initializeTableSorting('regionalAmbassadorsTable', 0, 'asc');
}

