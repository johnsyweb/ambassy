/**
 * Populate the Prospects table with prospective events data
 */

import { ProspectiveEventList } from "@models/ProspectiveEventList";
import { EventAmbassadorMap } from "@models/EventAmbassadorMap";
import { RegionalAmbassadorMap } from "@models/RegionalAmbassadorMap";
import { showReallocationDialog } from "./showReallocationDialog";
import { reallocateProspect } from "./reallocateProspect";
import {
  ProspectReadinessField,
  toggleProspectReadiness,
} from "./toggleProspectReadiness";
import { LogEntry } from "@models/LogEntry";
import { CapacityStatus } from "@models/CapacityStatus";
import { ReallocationSuggestion } from "@models/ReallocationSuggestion";
import { showProspectLocationDialog } from "./showProspectLocationDialog";
import {
  formatCoordinate,
} from "@models/Coordinate";
import { persistChangesLog } from "./persistState";
import { launchProspect } from "./launchProspect";
import { archiveProspect } from "./archiveProspect";
import { showLaunchDialog } from "./showLaunchDialog";
import { EventDetailsMap } from "@models/EventDetailsMap";
import { calculateDistance } from "@utils/geography";
import {
  formatProspectAmbassadorAssignmentStatusLabel,
  formatProspectGeocodingStatusLabel,
} from "@utils/prospectStatusLabels";
import { applyHomeParkrunBonusFromCoordinate } from "@utils/homeParkrunBonus";
import { ProspectiveEvent } from "@models/ProspectiveEvent";
import { EventAmbassador } from "@models/EventAmbassador";
import { initializeTableSorting } from "./tableSorting";
import { buildAmbassadorFilterText } from "@utils/ambassadorNameFilter";

type AmbassadorWithCounts = {
  name: string;
  ambassador: EventAmbassador;
  liveCount: number;
  prospectCount: number;
  totalCount: number;
};

// Forward declaration - will be set by index.ts
let refreshUIAfterReallocation: (() => void) | null = null;

export function setProspectReallocationRefreshCallback(
  callback: () => void,
): void {
  refreshUIAfterReallocation = callback;
}

/**
 * Populate the Prospects table
 */
export function populateProspectsTable(
  prospects: ProspectiveEventList,
  eventAmbassadors: EventAmbassadorMap,
  regionalAmbassadors: RegionalAmbassadorMap,
  log?: LogEntry[],
  eventDetails?: EventDetailsMap,
): void {
  const tableBody = document.querySelector<HTMLTableSectionElement>(
    "#prospectsTable tbody",
  );
  if (!tableBody) {
    console.error("Prospects table body not found");
    return;
  }

  // Clear existing rows
  tableBody.innerHTML = "";

  const prospectEvents = prospects.getAll();

  if (prospectEvents.length === 0) {
    // Show empty state
    const emptyRow = document.createElement("tr");
    const emptyCell = document.createElement("td");
    emptyCell.colSpan = 14;
    emptyCell.textContent =
      "No prospective events. Import a Prospects CSV file to get started.";
    emptyCell.style.textAlign = "center";
    emptyCell.style.padding = "2em";
    emptyCell.style.fontStyle = "italic";
    emptyCell.style.color = "#666";
    emptyRow.appendChild(emptyCell);
    tableBody.appendChild(emptyRow);
    return;
  }

  // Sort by prospect event name
  prospectEvents.sort((a, b) => a.prospectEvent.localeCompare(b.prospectEvent));

  prospectEvents.forEach((prospect) => {
    const row = createProspectRow(
      prospect,
      eventAmbassadors,
      regionalAmbassadors,
      prospects,
      log,
      eventDetails,
    );
    tableBody.appendChild(row);
  });

  // Initialize sorting with default: Prospect Event (column 0) ascending
  // Only initialize if we have prospects (not empty state)
  if (prospectEvents.length > 0) {
    initializeTableSorting("prospectsTable", 0, "asc");
  }
}

function appendProspectReadinessToggleCell(
  row: HTMLTableRowElement,
  prospect: ProspectiveEvent,
  field: ProspectReadinessField,
  columnLabel: string,
  prospects: ProspectiveEventList,
  log: LogEntry[] | undefined,
): void {
  const cell = document.createElement("td");
  cell.style.textAlign = "center";

  const isComplete = prospect[field];
  const button = document.createElement("button");
  button.type = "button";
  button.className = "prospect-readiness-toggle";
  button.setAttribute("aria-pressed", String(isComplete));
  button.setAttribute(
    "aria-label",
    `${columnLabel}: ${isComplete ? "yes" : "no"}. Activate to toggle.`,
  );
  button.textContent = isComplete ? "✅" : "❌";
  button.disabled = !log;

  if (log) {
    button.addEventListener("click", () => {
      toggleProspectReadiness(prospect.id, field, prospects, log);
      if (refreshUIAfterReallocation) {
        refreshUIAfterReallocation();
      }
    });
  }

  cell.appendChild(button);
  row.appendChild(cell);
}

/**
 * Create a table row for a prospective event
 */
function createProspectRow(
  prospect: ProspectiveEvent,
  eventAmbassadors: EventAmbassadorMap,
  regionalAmbassadors: RegionalAmbassadorMap,
  prospects: ProspectiveEventList,
  log?: LogEntry[],
  eventDetails?: EventDetailsMap,
): HTMLTableRowElement {
  const regionalAmbassador =
    eventAmbassadors.get(prospect.eventAmbassador)?.regionalAmbassador ?? "";

  const row = document.createElement("tr");
  row.setAttribute("data-prospect-id", prospect.id);
  row.dataset.ambassadorFilterText = buildAmbassadorFilterText(
    regionalAmbassador,
    prospect.eventAmbassador,
  );

  // Prospect Event
  const prospectEventCell = document.createElement("td");
  prospectEventCell.textContent = prospect.prospectEvent;
  row.appendChild(prospectEventCell);

  // Country
  const countryCell = document.createElement("td");
  countryCell.textContent = prospect.country;
  row.appendChild(countryCell);

  // State
  const stateCell = document.createElement("td");
  stateCell.textContent = prospect.state;
  row.appendChild(stateCell);

  // Prospect ED/s
  const edsCell = document.createElement("td");
  edsCell.textContent = prospect.prospectEDs || "";
  row.appendChild(edsCell);

  // Regional Event Ambassador (derived from assigned EA)
  const reaCell = document.createElement("td");
  reaCell.textContent = regionalAmbassador;
  row.appendChild(reaCell);

  // Event Ambassador
  const eaCell = document.createElement("td");
  eaCell.textContent = prospect.eventAmbassador;
  row.appendChild(eaCell);

  // Date Made Contact
  const dateCell = document.createElement("td");
  if (prospect.dateMadeContact) {
    dateCell.textContent = prospect.dateMadeContact.toLocaleDateString();
  } else {
    dateCell.textContent = "";
  }
  row.appendChild(dateCell);

  appendProspectReadinessToggleCell(
    row,
    prospect,
    "courseFound",
    "Course found",
    prospects,
    log,
  );
  appendProspectReadinessToggleCell(
    row,
    prospect,
    "landownerPermission",
    "Landowner permission",
    prospects,
    log,
  );
  appendProspectReadinessToggleCell(
    row,
    prospect,
    "fundingConfirmed",
    "Funding confirmed",
    prospects,
    log,
  );

  // Geocoding Status
  const geocodingCell = document.createElement("td");
  geocodingCell.textContent = formatProspectGeocodingStatusLabel(
    prospect.geocodingStatus,
  );
  geocodingCell.style.textAlign = "center";
  row.appendChild(geocodingCell);

  // Coordinates
  const coordinatesCell = document.createElement("td");
  if (prospect.coordinates) {
    coordinatesCell.textContent = formatCoordinate(prospect.coordinates);
    coordinatesCell.title = formatCoordinate(prospect.coordinates);
  } else {
    coordinatesCell.textContent = "";
  }
  coordinatesCell.style.fontFamily = "monospace";
  coordinatesCell.style.fontSize = "0.9em";
  row.appendChild(coordinatesCell);

  // Event Ambassador assignment (import pipeline)
  const matchCell = document.createElement("td");
  matchCell.textContent = formatProspectAmbassadorAssignmentStatusLabel(
    prospect.ambassadorMatchStatus,
  );
  matchCell.style.textAlign = "center";
  row.appendChild(matchCell);

  // Actions
  const actionsCell = document.createElement("td");
  actionsCell.style.textAlign = "center";

  const buttonContainer = document.createElement("div");
  buttonContainer.style.display = "flex";
  buttonContainer.style.flexWrap = "wrap";
  buttonContainer.style.gap = "0.25em";
  buttonContainer.style.justifyContent = "center";

  // Reallocate button
  const reallocateButton = document.createElement("button");
  reallocateButton.type = "button";
  reallocateButton.title = "Reallocate to different Event Ambassador";
  reallocateButton.textContent = "🤝 Reallocate";
  reallocateButton.addEventListener("click", () => {
    if (!log) {
      console.error("Cannot reallocate prospect: log not available");
      return;
    }

    // Get reallocation suggestions based on EA capacity
    const suggestions = generateProspectReallocationSuggestions(
      prospect.eventAmbassador || "",
      prospect,
      eventAmbassadors,
      eventDetails,
      prospects,
    );

    // Show reallocation dialog
    showReallocationDialog(
      prospect.prospectEvent,
      prospect.eventAmbassador || "Unassigned",
      suggestions,
      eventAmbassadors,
      regionalAmbassadors,
      (newAmbassador: string) => {
        // Perform the reallocation
        try {
          reallocateProspect(
            prospect.id,
            prospect.eventAmbassador || "",
            newAmbassador,
            prospects,
            eventAmbassadors,
            log,
            regionalAmbassadors,
          );

          // Refresh the UI after reallocation
          if (refreshUIAfterReallocation) {
            refreshUIAfterReallocation();
          }
        } catch (error) {
          console.error("Failed to reallocate prospect:", error);
          alert(
            `Failed to reallocate prospect: ${error instanceof Error ? error.message : "Unknown error"}`,
          );
        }
      },
      () => {
        // Cancel - do nothing
      },
      eventDetails,
      prospects,
    );
  });
  buttonContainer.appendChild(reallocateButton);

  // Reset Location button
  const resetLocationButton = document.createElement("button");
  resetLocationButton.type = "button";
  resetLocationButton.title = "Reset prospect location";
  resetLocationButton.textContent = "📍 Reset Location";
  resetLocationButton.addEventListener("click", () => {
    showProspectLocationDialog(prospect, prospects, () => {
      if (refreshUIAfterReallocation) {
        refreshUIAfterReallocation();
      }
    });
  });
  buttonContainer.appendChild(resetLocationButton);

  // Launch button
  const launchButton = document.createElement("button");
  launchButton.type = "button";
  launchButton.title = "Mark this prospect as launched";
  launchButton.textContent = "🚀 Launch";
  launchButton.setAttribute(
    "aria-label",
    `Mark prospect ${prospect.prospectEvent} as launched`,
  );
  const handleLaunch = (e: Event) => {
    e.stopPropagation();
    if (!eventDetails) {
      alert(
        "Event details are not available. Cannot launch prospect with event matching.",
      );
      return;
    }
    showLaunchDialog(
      prospect,
      eventDetails,
      eventAmbassadors,
      regionalAmbassadors,
      (selectedEventName, selectedEA) => {
        try {
          launchProspect(
            prospect.id,
            prospects,
            eventAmbassadors,
            regionalAmbassadors,
            eventDetails,
            log ?? [],
            selectedEventName,
            selectedEA,
          );
          if (log) {
            persistChangesLog(log);
          }
          if (refreshUIAfterReallocation) {
            refreshUIAfterReallocation();
          }
        } catch (error) {
          console.error("Failed to launch prospect:", error);
          alert(
            `Failed to launch prospect: ${
              error instanceof Error ? error.message : "Unknown error"
            }`,
          );
        }
      },
      () => {
        // User cancelled
      },
    );
  };
  launchButton.addEventListener("click", handleLaunch);
  launchButton.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleLaunch(e);
    }
  });
  buttonContainer.appendChild(launchButton);

  // Archive button
  const archiveButton = document.createElement("button");
  archiveButton.type = "button";
  archiveButton.title = "Archive this prospect as not viable";
  archiveButton.textContent = "📦 Archive";
  archiveButton.setAttribute(
    "aria-label",
    `Archive prospect ${prospect.prospectEvent} as not viable`,
  );
  const handleArchive = (e: Event) => {
    e.stopPropagation();
    handleProspectLifecycleChange(
      prospect,
      prospects,
      eventAmbassadors,
      regionalAmbassadors,
      log,
      "archived",
      eventDetails,
    );
  };
  archiveButton.addEventListener("click", handleArchive);
  archiveButton.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleArchive(e);
    }
  });
  buttonContainer.appendChild(archiveButton);

  actionsCell.appendChild(buttonContainer);

  row.appendChild(actionsCell);

  // Add click handler for map navigation (only if prospect has coordinates)
  if (
    _prospectRowClickHandler &&
    prospect.coordinates &&
    prospect.geocodingStatus === "success"
  ) {
    row.addEventListener("click", () => {
      _prospectRowClickHandler!(prospect.id);
    });
    row.style.cursor = "pointer";
    row.title = "Click to view on map";
  }

  return row;
}

/**
 * Generate reallocation suggestions for prospects
 */
function generateProspectReallocationSuggestions(
  currentAmbassador: string,
  prospect: ProspectiveEvent,
  eventAmbassadors: EventAmbassadorMap,
  eventDetails?: EventDetailsMap,
  prospects?: ProspectiveEventList,
): ReallocationSuggestion[] {
  const suggestions: ReallocationSuggestion[] = [];

  // Get prospect coordinates for distance calculation
  const prospectCoords =
    prospect.coordinates && prospect.geocodingStatus === "success"
      ? {
          lat: prospect.coordinates.latitude,
          lon: prospect.coordinates.longitude,
        }
      : null;

  // Calculate current allocation counts including prospective events
  const ambassadorsWithCounts: AmbassadorWithCounts[] = Array.from(
    eventAmbassadors.entries(),
  ).map(([name, ambassador]) => {
    const liveCount = ambassador.events.length;
    const prospectCount = ambassador.prospectiveEvents?.length ?? 0;
    const totalCount = liveCount + prospectCount;
    return { name, ambassador, liveCount, prospectCount, totalCount };
  });

  // Sort by available capacity (ascending - those with least allocation first)
  ambassadorsWithCounts.sort(
    (a: AmbassadorWithCounts, b: AmbassadorWithCounts) =>
      a.totalCount - b.totalCount,
  );

  // Generate suggestions
  for (const item of ambassadorsWithCounts) {
    const { name, ambassador, liveCount, prospectCount, totalCount } = item;
    if (name === currentAmbassador) continue; // Skip current ambassador

    const capacityStatus = ambassador.capacityStatus || CapacityStatus.WITHIN;

    // Primary ordering: total allocation count (fewer = higher priority, 0 = highest)
    const baseScore = Math.max(0, 1000 - totalCount * 10);

    // Calculate distance to nearest event (live or prospect) as tiebreaker
    let distanceBonus = 0;
    let neighboringEvents: Array<{ name: string; distanceKm: number }> = [];

    if (
      prospectCoords &&
      (ambassador.events.length > 0 ||
        (ambassador.prospectiveEvents &&
          ambassador.prospectiveEvents.length > 0))
    ) {
      const allEvents: Array<{ name: string; lat: number; lon: number }> = [];

      // Add live events
      if (eventDetails) {
        for (const eventName of ambassador.events) {
          const eventDetail = eventDetails.get(eventName);
          if (eventDetail?.geometry?.coordinates) {
            const [lon, lat] = eventDetail.geometry.coordinates;
            allEvents.push({ name: eventName, lat, lon });
          }
        }
      }

      // Add prospect events
      if (prospects && ambassador.prospectiveEvents) {
        for (const prospectId of ambassador.prospectiveEvents) {
          const prospectEvent = prospects.findById(prospectId);
          if (
            prospectEvent?.coordinates &&
            prospectEvent.geocodingStatus === "success"
          ) {
            allEvents.push({
              name: prospectEvent.prospectEvent,
              lat: prospectEvent.coordinates.latitude,
              lon: prospectEvent.coordinates.longitude,
            });
          }
        }
      }

      // Find nearest event (live or prospect)
      if (allEvents.length > 0) {
        let nearestDistance = Infinity;
        let nearestEvent: { name: string; distanceKm: number } | null = null;

        for (const event of allEvents) {
          const distance = calculateDistance(
            prospectCoords.lat,
            prospectCoords.lon,
            event.lat,
            event.lon,
          );
          if (distance < nearestDistance) {
            nearestDistance = distance;
            nearestEvent = { name: event.name, distanceKm: distance };
          }
        }

        if (nearestEvent && nearestDistance <= 50) {
          neighboringEvents = [nearestEvent];
          // Distance bonus: closer = higher bonus (inverse relationship)
          distanceBonus = Math.max(0, 100 - nearestDistance);
        }
      }
    }

    let score = baseScore + distanceBonus;

    const reasons: string[] = [`Currently has ${totalCount} total allocations`];

    if (prospectCoords && eventDetails) {
      score = applyHomeParkrunBonusFromCoordinate(
        score,
        ambassador.homeParkrun,
        prospectCoords.lat,
        prospectCoords.lon,
        eventDetails,
        reasons,
      );
    }

    // Adjust reasons based on capacity status
    if (capacityStatus === CapacityStatus.UNDER) {
      reasons.push("Has available capacity");
    } else if (capacityStatus === CapacityStatus.OVER) {
      reasons.push("Currently over capacity");
    } else {
      reasons.push("Within capacity limits");
    }

    if (neighboringEvents.length > 0) {
      const eventList = neighboringEvents
        .map((e) => `${e.name} (${e.distanceKm.toFixed(1)}km)`)
        .join(", ");
      reasons.push(`Nearby events: ${eventList}`);
    }

    suggestions.push({
      fromAmbassador: currentAmbassador,
      toAmbassador: name,
      items: [prospect.prospectEvent],
      score: Math.max(0, score),
      reasons: reasons.length > 0 ? reasons : undefined,
      allocationCount: totalCount,
      liveEventsCount: liveCount,
      prospectEventsCount: prospectCount,
      neighboringEvents:
        neighboringEvents.length > 0 ? neighboringEvents : undefined,
    });
  }

  // Sort by score (highest first)
  return suggestions.sort((a, b) => b.score - a.score);
}

type ProspectLifecycleAction = "launched" | "archived";

function handleProspectLifecycleChange(
  prospect: ProspectiveEvent,
  prospects: ProspectiveEventList,
  eventAmbassadors: EventAmbassadorMap,
  regionalAmbassadors: RegionalAmbassadorMap,
  log: LogEntry[] | undefined,
  action: ProspectLifecycleAction,
  eventDetails?: EventDetailsMap,
): void {
  const verb =
    action === "launched" ? "mark as launched" : "archive as not viable";

  const confirmed = confirm(
    `Are you sure you want to ${verb} prospect "${prospect.prospectEvent}"? This action cannot be undone.`,
  );

  if (!confirmed) {
    return;
  }

  try {
    if (action === "launched") {
      launchProspect(
        prospect.id,
        prospects,
        eventAmbassadors,
        regionalAmbassadors,
        eventDetails ?? new Map(),
        log ?? [],
      );
    } else {
      archiveProspect(
        prospect.id,
        prospects,
        eventAmbassadors,
        regionalAmbassadors,
        log ?? [],
      );
      if (log) {
        persistChangesLog(log);
      }
    }

    // Refresh the UI
    if (refreshUIAfterReallocation) {
      refreshUIAfterReallocation();
    }
  } catch (error) {
    const actionLabel = action === "launched" ? "launch" : "archive";
    console.error(`Failed to ${actionLabel} prospect:`, error);
    alert(
      `Failed to ${actionLabel} prospect: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
    );
  }
}

// Global row click handler for prospects
let _prospectRowClickHandler: ((prospectId: string) => void) | null = null;

export function setProspectRowClickHandler(
  handler: (prospectId: string) => void,
): void {
  _prospectRowClickHandler = handler;
}
