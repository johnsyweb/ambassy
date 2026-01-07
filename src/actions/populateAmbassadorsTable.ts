import { EventAmbassadorMap } from "@models/EventAmbassadorMap";
import { RegionalAmbassadorMap } from "@models/RegionalAmbassadorMap";
import { CapacityStatus } from "@models/CapacityStatus";

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

export function populateAmbassadorsTable(
  eventAmbassadors: EventAmbassadorMap,
  regionalAmbassadors: RegionalAmbassadorMap
): void {
  populateEventAmbassadorsTable(eventAmbassadors);
  populateRegionalAmbassadorsTable(regionalAmbassadors);
}

function populateEventAmbassadorsTable(eventAmbassadors: EventAmbassadorMap): void {
  const tableBody = document.querySelector("#eventAmbassadorsTable tbody");
  if (!tableBody) {
    console.error("Event Ambassadors Table Body not found");
    return;
  }
  tableBody.innerHTML = "";

  const sortedAmbassadors = Array.from(eventAmbassadors.entries()).sort((a, b) =>
    a[0].localeCompare(b[0])
  );

  sortedAmbassadors.forEach(([name, ambassador]) => {
    const row = document.createElement("tr");

    const nameCell = document.createElement("td");
    const nameContainer = document.createElement("div");
    nameContainer.style.display = "flex";
    nameContainer.style.alignItems = "center";
    nameContainer.style.gap = "8px";
    
    const nameSpan = document.createElement("span");
    nameSpan.textContent = name;
    nameContainer.appendChild(nameSpan);
    
    // Add capacity status badge
    if (ambassador.capacityStatus) {
      const badge = document.createElement("span");
      badge.textContent = `[${ambassador.capacityStatus}]`;
      badge.style.padding = "2px 6px";
      badge.style.borderRadius = "3px";
      badge.style.fontSize = "0.85em";
      
      if (ambassador.capacityStatus === CapacityStatus.WITHIN) {
        badge.style.backgroundColor = "#d4edda";
        badge.style.color = "#155724";
      } else if (ambassador.capacityStatus === CapacityStatus.UNDER) {
        badge.style.backgroundColor = "#fff3cd";
        badge.style.color = "#856404";
      } else if (ambassador.capacityStatus === CapacityStatus.OVER) {
        badge.style.backgroundColor = "#f8d7da";
        badge.style.color = "#721c24";
      }
      
      nameContainer.appendChild(badge);
    }
    
    // Add offboard button
    const offboardButton = document.createElement("button");
    offboardButton.textContent = "Offboard";
    offboardButton.type = "button";
    offboardButton.title = `Offboard ${name}`;
    offboardButton.style.padding = "2px 8px";
    offboardButton.style.fontSize = "0.85em";
    offboardButton.style.cursor = "pointer";
    offboardButton.addEventListener("click", () => {
      handleOffboardEventAmbassador(name);
    });
    nameContainer.appendChild(offboardButton);
    
    nameCell.appendChild(nameContainer);
    row.appendChild(nameCell);

    const eventsCell = document.createElement("td");
    if (ambassador.events.length === 0) {
      eventsCell.textContent = "No events assigned";
      eventsCell.style.fontStyle = "italic";
      eventsCell.style.color = "#666";
    } else {
      eventsCell.textContent = ambassador.events.join(", ");
    }
    row.appendChild(eventsCell);

    tableBody.appendChild(row);
  });
}

function populateRegionalAmbassadorsTable(regionalAmbassadors: RegionalAmbassadorMap): void {
  const tableBody = document.querySelector("#regionalAmbassadorsTable tbody");
  if (!tableBody) {
    console.error("Regional Ambassadors Table Body not found");
    return;
  }
  tableBody.innerHTML = "";

  const sortedAmbassadors = Array.from(regionalAmbassadors.entries()).sort((a, b) =>
    a[0].localeCompare(b[0])
  );

  sortedAmbassadors.forEach(([name, ambassador]) => {
    const row = document.createElement("tr");

    const nameCell = document.createElement("td");
    const nameContainer = document.createElement("div");
    nameContainer.style.display = "flex";
    nameContainer.style.alignItems = "center";
    nameContainer.style.gap = "8px";
    
    const nameSpan = document.createElement("span");
    nameSpan.textContent = name;
    nameContainer.appendChild(nameSpan);
    
    // Add capacity status badge
    if (ambassador.capacityStatus) {
      const badge = document.createElement("span");
      badge.textContent = `[${ambassador.capacityStatus}]`;
      badge.style.padding = "2px 6px";
      badge.style.borderRadius = "3px";
      badge.style.fontSize = "0.85em";
      
      if (ambassador.capacityStatus === CapacityStatus.WITHIN) {
        badge.style.backgroundColor = "#d4edda";
        badge.style.color = "#155724";
      } else if (ambassador.capacityStatus === CapacityStatus.UNDER) {
        badge.style.backgroundColor = "#fff3cd";
        badge.style.color = "#856404";
      } else if (ambassador.capacityStatus === CapacityStatus.OVER) {
        badge.style.backgroundColor = "#f8d7da";
        badge.style.color = "#721c24";
      }
      
      nameContainer.appendChild(badge);
    }
    
    // Add offboard button
    const offboardButton = document.createElement("button");
    offboardButton.textContent = "Offboard";
    offboardButton.type = "button";
    offboardButton.title = `Offboard ${name}`;
    offboardButton.style.padding = "2px 8px";
    offboardButton.style.fontSize = "0.85em";
    offboardButton.style.cursor = "pointer";
    offboardButton.addEventListener("click", () => {
      handleOffboardRegionalAmbassador(name);
    });
    nameContainer.appendChild(offboardButton);
    
    nameCell.appendChild(nameContainer);
    row.appendChild(nameCell);

    const stateCell = document.createElement("td");
    stateCell.textContent = ambassador.state;
    row.appendChild(stateCell);

    const easCell = document.createElement("td");
    if (ambassador.supportsEAs.length === 0) {
      easCell.textContent = "No Event Ambassadors assigned";
      easCell.style.fontStyle = "italic";
      easCell.style.color = "#666";
    } else {
      easCell.textContent = ambassador.supportsEAs.join(", ");
    }
    row.appendChild(easCell);

    tableBody.appendChild(row);
  });
}

