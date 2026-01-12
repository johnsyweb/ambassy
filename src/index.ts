import { EventAmbassador } from "./models/EventAmbassador";
import { EventAmbassadorMap } from "./models/EventAmbassadorMap";
import { EventDetails } from "./models/EventDetails";
import { EventDetailsMap } from "./models/EventDetailsMap";
import { EventTeamMap } from "./models/EventTeamMap";
import { RegionalAmbassador } from "./models/RegionalAmbassador";
import { RegionalAmbassadorMap } from "./models/RegionalAmbassadorMap";

import { getEvents } from "./actions/fetchEvents";
import { handleFileUpload } from "./actions/uploadCSV";
import { extractEventTeamsTableData } from "./models/EventTeamsTable";
import { getEventTeamsFromSession } from "@parsers/parseEventTeams";
import { LogEntry } from "@models/LogEntry";
import { EventTeamsTableData } from "@models/EventTeamsTableData";
import { refreshUI } from "./actions/refreshUI";
import { restoreApplicationState } from "./actions/persistState";
import { loadFromStorage } from "@utils/storage";
import { exportApplicationState, downloadStateFile } from "./actions/exportState";
import { validateStateFile, importApplicationState, InvalidFileFormatError, MissingFieldError, VersionMismatchError, InvalidDataError } from "./actions/importState";
import { onboardEventAmbassador, onboardRegionalAmbassador } from "./actions/onboardAmbassador";
import { persistChangesLog, persistEventDetails } from "./actions/persistState";
import { initializeTabs } from "./utils/tabs";
import { calculateAllCapacityStatuses, loadCapacityLimits } from "./actions/checkCapacity";
import { offboardEventAmbassador, offboardRegionalAmbassador } from "./actions/offboardAmbassador";
import { suggestEventReallocation, suggestEventAmbassadorReallocation } from "./actions/suggestReallocation";
import { setOffboardingHandlers, setEAReallocateHandler } from "./actions/populateAmbassadorsTable";
import { saveCapacityLimits, validateCapacityLimits } from "./actions/configureCapacityLimits";
import { CapacityLimits } from "./models/CapacityLimits";
import { SelectionState, createSelectionState } from "./models/SelectionState";
import { selectEventTeamRow, selectMapEvent, applyDeferredTableSelection } from "./actions/tableMapNavigation";
import { getMarkerMap, getHighlightLayer, getMap, setMarkerClickHandler } from "./actions/populateMap";
import { setRowClickHandler, setReallocateButtonHandler } from "./actions/populateEventTeamsTable";
import { setEventTeamsTabVisibleCallback, setIssuesTabVisibleCallback } from "./utils/tabs";
import { getReallocationSuggestions } from "./actions/getReallocationSuggestions";
import { showReallocationDialog as showEventTeamReallocationDialog } from "./actions/showReallocationDialog";
import { reallocateEventTeam } from "./actions/reallocateEventTeam";
import { validateReallocation } from "./actions/validateReallocation";
import { clearSelection } from "./models/SelectionState";
import { getEAReallocationSuggestions } from "./actions/getEAReallocationSuggestions";
import { reallocateEventAmbassador } from "./actions/reallocateEventAmbassador";
import { getRegionalAmbassadorForEventAmbassador } from "./utils/regions";
import { detectIssues } from "./actions/detectIssues";
import { populateIssuesTable } from "./actions/populateIssuesTable";
import { IssuesState, createIssuesState, setSelectedIssue } from "./models/IssuesState";
import { EventIssue } from "./models/EventIssue";
import { showEventSearchDialog } from "./actions/showEventSearchDialog";
import { resolveIssueWithEvent, resolveIssueWithAddress } from "./actions/resolveIssue";
import { showAddressDialog } from "./actions/showAddressDialog";

function getRegionalAmbassadorsFromSession(): RegionalAmbassadorMap {
  const storedRegionalAmbassadors = loadFromStorage<Array<[string, RegionalAmbassador]>>("regionalAmbassadors");
  if (storedRegionalAmbassadors) {
    return new Map<string, RegionalAmbassador>(storedRegionalAmbassadors);
  }
  return new Map<string, RegionalAmbassador>();
}

function getEventAmbassadorsFromSession(): EventAmbassadorMap {
  const storedEventAmbassadors = loadFromStorage<Array<[string, EventAmbassador]>>("eventAmbassadors");
  if (storedEventAmbassadors) {
    return new Map<string, EventAmbassador>(storedEventAmbassadors);
  }
  return new Map<string, EventAmbassador>();
}

function getLogFromSession(): LogEntry[] {
  const storedLog = loadFromStorage<LogEntry[]>("changesLog");
  if (storedLog) {
    return storedLog;
  }
  return [];
}

const log: LogEntry[] = getLogFromSession();

let eventTeamsTableData: Map<string, EventTeamsTableData> | null = null;
let eventDetails: EventDetailsMap | null = null;
const selectionState: SelectionState = createSelectionState();
const issuesState = createIssuesState();

function hasApplicationData(
  eventTeams: EventTeamMap,
  eventAmbassadors: EventAmbassadorMap,
  regionalAmbassadors: RegionalAmbassadorMap
): boolean {
  return eventTeams.size > 0 && eventAmbassadors.size > 0 && regionalAmbassadors.size > 0;
}

function isMapViewDisplayed(): boolean {
  const ambassyElement = document.getElementById("ambassy");
  return ambassyElement !== null && ambassyElement.style.display !== "none";
}

function updateButtonVisibility(
  hasData: boolean,
  isMapViewVisible: boolean
): void {
  const exportButtonMap = document.getElementById("exportButtonMap");
  const importButton = document.getElementById("importButton");
  const importButtonMap = document.getElementById("importButtonMap");

  if (exportButtonMap) {
    if (hasData && isMapViewVisible) {
      exportButtonMap.style.display = "";
    } else {
      exportButtonMap.style.display = "none";
    }
  }

  if (importButton) {
    importButton.style.display = "";
  }

  if (importButtonMap) {
    importButtonMap.style.display = "";
  }
}
  
document.getElementById("csvFileInput")?.addEventListener("change", (event) => {
  const input = event.target as HTMLInputElement;
  if (input.files && input.files.length > 0) {
    Array.from(input.files).forEach((file) => {
      handleFileUpload(file, (type) => {
        console.log(`Uploaded ${type} CSV file.`);
        ambassy();
      });
    });
  }
});

document.getElementById("purgeButton")?.addEventListener("click", () => {
  localStorage.clear();
  sessionStorage.clear();
  location.reload();
});

function setupExportButton(buttonId: string): void {
  document.getElementById(buttonId)?.addEventListener("click", () => {
    try {
      const blob = exportApplicationState();
      const filename = `ambassy-state-${new Date().toISOString().split("T")[0]}.json`;
      downloadStateFile(blob, filename);
    } catch (error) {
      alert(`Export failed: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  });
}

function setupImportButton(buttonId: string): void {
  document.getElementById(buttonId)?.addEventListener("click", () => {
    document.getElementById("importFileInput")?.click();
  });
}

setupExportButton("exportButtonMap");
setupImportButton("importButton");
setupImportButton("importButtonMap");

function setupOnboardingButtons(): void {
  const addEventAmbassadorButton = document.getElementById("addEventAmbassadorButton");
  const addRegionalAmbassadorButton = document.getElementById("addRegionalAmbassadorButton");

  addEventAmbassadorButton?.addEventListener("click", () => {
    const name = prompt("Enter Event Ambassador name:");
    if (name === null || name.trim() === "") {
      return;
    }

    try {
      const eventAmbassadors = getEventAmbassadorsFromSession();
      const regionalAmbassadors = getRegionalAmbassadorsFromSession();
      onboardEventAmbassador(name, eventAmbassadors, regionalAmbassadors, log);
      persistChangesLog(log);
      ambassy();
      alert(`Event Ambassador "${name.trim()}" added successfully.`);
    } catch (error) {
      alert(`Failed to add Event Ambassador: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  });

  addRegionalAmbassadorButton?.addEventListener("click", () => {
    const name = prompt("Enter Regional Ambassador name:");
    if (name === null || name.trim() === "") {
      return;
    }

    const state = prompt("Enter state (e.g., VIC, NSW):");
    if (state === null || state.trim() === "") {
      return;
    }

    try {
      const eventAmbassadors = getEventAmbassadorsFromSession();
      const regionalAmbassadors = getRegionalAmbassadorsFromSession();
      onboardRegionalAmbassador(name, state, eventAmbassadors, regionalAmbassadors, log);
      persistChangesLog(log);
      ambassy();
      alert(`Regional Ambassador "${name.trim()}" added successfully.`);
    } catch (error) {
      alert(`Failed to add Regional Ambassador: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  });
}

setupOnboardingButtons();

function setupCapacityLimitsConfiguration(): void {
  const configureButton = document.getElementById("configureCapacityLimitsButton");
  const dialog = document.getElementById("capacityLimitsDialog");
  const form = document.getElementById("capacityLimitsForm") as HTMLFormElement;
  const cancelButton = document.getElementById("cancelCapacityLimitsButton");
  const errorDiv = document.getElementById("capacityLimitsError");

  configureButton?.addEventListener("click", () => {
    const limits = loadCapacityLimits();
    const minEAInput = document.getElementById("eventAmbassadorMin") as HTMLInputElement;
    const maxEAInput = document.getElementById("eventAmbassadorMax") as HTMLInputElement;
    const minRAInput = document.getElementById("regionalAmbassadorMin") as HTMLInputElement;
    const maxRAInput = document.getElementById("regionalAmbassadorMax") as HTMLInputElement;
    
    minEAInput.value = limits.eventAmbassadorMin.toString();
    minEAInput.setAttribute("min", "0");
    maxEAInput.value = limits.eventAmbassadorMax.toString();
    maxEAInput.setAttribute("min", "0");
    minRAInput.value = limits.regionalAmbassadorMin.toString();
    minRAInput.setAttribute("min", "0");
    maxRAInput.value = limits.regionalAmbassadorMax.toString();
    maxRAInput.setAttribute("min", "0");
    
    if (errorDiv) {
      errorDiv.style.display = "none";
      errorDiv.textContent = "";
    }
    if (dialog) {
      dialog.style.display = "block";
      dialog.setAttribute("aria-hidden", "false");
      minEAInput.focus();
    }
  });

  cancelButton?.addEventListener("click", () => {
    if (dialog) {
      dialog.style.display = "none";
      dialog.setAttribute("aria-hidden", "true");
    }
    if (form) {
      form.reset();
    }
    configureButton?.focus();
  });

  form?.addEventListener("submit", (e) => {
    e.preventDefault();
    if (!errorDiv) return;

    const minEAInput = document.getElementById("eventAmbassadorMin") as HTMLInputElement;
    const newLimits: CapacityLimits = {
      eventAmbassadorMin: parseInt(minEAInput.value, 10),
      eventAmbassadorMax: parseInt((document.getElementById("eventAmbassadorMax") as HTMLInputElement).value, 10),
      regionalAmbassadorMin: parseInt((document.getElementById("regionalAmbassadorMin") as HTMLInputElement).value, 10),
      regionalAmbassadorMax: parseInt((document.getElementById("regionalAmbassadorMax") as HTMLInputElement).value, 10),
    };

    if (!validateCapacityLimits(newLimits)) {
      errorDiv.style.display = "block";
      errorDiv.textContent = "Invalid limits: minimum must be less than or equal to maximum, and all values must be non-negative integers.";
      return;
    }

    try {
      saveCapacityLimits(newLimits);
      if (dialog) {
        dialog.style.display = "none";
        dialog.setAttribute("aria-hidden", "true");
      }
      if (form) {
        form.reset();
      }

      const eventAmbassadors = getEventAmbassadorsFromSession();
      const regionalAmbassadors = getRegionalAmbassadorsFromSession();
      calculateAllCapacityStatuses(eventAmbassadors, regionalAmbassadors, newLimits);
      ambassy();
      alert("Capacity limits updated successfully.");
      configureButton?.focus();
    } catch (error) {
      errorDiv.style.display = "block";
      errorDiv.textContent = `Failed to save capacity limits: ${error instanceof Error ? error.message : "Unknown error"}`;
      minEAInput.focus();
    }
  });
}

setupCapacityLimitsConfiguration();

function setupOffboardingButtons(): void {
  const handleOffboardEA = async (name: string) => {
    if (!confirm(`Are you sure you want to offboard Event Ambassador "${name}"?`)) {
      return;
    }
    const eventAmbassadors = getEventAmbassadorsFromSession();
    const regionalAmbassadors = getRegionalAmbassadorsFromSession();
    const eventTeams = getEventTeamsFromSession();
    const eventsToReallocate = eventAmbassadors.get(name)?.events || [];

    if (eventsToReallocate.length > 0) {
      const eventRecipients = new Map<string, string>();

      for (const eventName of eventsToReallocate) {
        const suggestions = suggestEventReallocation(
          name,
          [eventName],
          eventAmbassadors,
          eventDetails!,
          loadCapacityLimits(),
          regionalAmbassadors
        );

        const recipientName = await new Promise<string | null>((resolve) => {
          showEventTeamReallocationDialog(
            eventName,
            name,
            suggestions,
            eventAmbassadors,
            undefined,
            (selectedAmbassador: string) => {
              resolve(selectedAmbassador);
            },
            () => {
              resolve(null);
            }
          );
        });

        if (recipientName === null) {
          return;
        }

        const trimmedRecipient = recipientName.trim();
        if (trimmedRecipient !== "" && !eventAmbassadors.has(trimmedRecipient)) {
          alert(`Recipient Event Ambassador "${trimmedRecipient}" not found. Skipping this event.`);
          eventRecipients.set(eventName, "");
        } else {
          eventRecipients.set(eventName, trimmedRecipient);
        }
      }

      try {
        offboardEventAmbassador(
          name,
          eventRecipients,
          eventAmbassadors,
          regionalAmbassadors,
          eventTeams,
          log
        );
        persistChangesLog(log);
        ambassy();
        const recipientsSummary = Array.from(new Set(Array.from(eventRecipients.values()).filter(r => r !== "")))
          .join(", ") || "unassigned";
        alert(`Event Ambassador "${name}" offboarded. Events reallocated to: ${recipientsSummary}.`);
      } catch (error) {
        alert(`Failed to offboard Event Ambassador: ${error instanceof Error ? error.message : "Unknown error"}`);
      }
    } else {
      try {
        const eventTeams = getEventTeamsFromSession();
        offboardEventAmbassador(name, new Map(), eventAmbassadors, regionalAmbassadors, eventTeams, log);
        persistChangesLog(log);
        ambassy();
        alert(`Event Ambassador "${name}" offboarded.`);
      } catch (error) {
        alert(`Failed to offboard Event Ambassador: ${error instanceof Error ? error.message : "Unknown error"}`);
      }
    }
  };

  const handleOffboardRA = async (name: string) => {
    if (!confirm(`Are you sure you want to offboard Regional Ambassador "${name}"?`)) {
      return;
    }
    const regionalAmbassadors = getRegionalAmbassadorsFromSession();
    const eventAmbassadors = getEventAmbassadorsFromSession();
    const easToReallocate = regionalAmbassadors.get(name)?.supportsEAs || [];

    if (easToReallocate.length > 0) {
      const eaRecipients = new Map<string, string>();

      for (const eaName of easToReallocate) {
        const suggestions = suggestEventAmbassadorReallocation(
          name,
          [eaName],
          regionalAmbassadors,
          eventAmbassadors,
          loadCapacityLimits()
        );

        const recipientName = await new Promise<string | null>((resolve) => {
          showEventTeamReallocationDialog(
            eaName,
            name,
            suggestions,
            undefined,
            regionalAmbassadors,
            (selectedAmbassador: string) => {
              resolve(selectedAmbassador);
            },
            () => {
              resolve(null);
            }
          );
        });

        if (recipientName === null) {
          return;
        }

        const trimmedRecipient = recipientName.trim();
        if (trimmedRecipient !== "" && !regionalAmbassadors.has(trimmedRecipient)) {
          alert(`Recipient Regional Ambassador "${trimmedRecipient}" not found. Skipping this Event Ambassador.`);
          eaRecipients.set(eaName, "");
        } else {
          eaRecipients.set(eaName, trimmedRecipient);
        }
      }

      try {
        offboardRegionalAmbassador(
          name,
          eaRecipients,
          regionalAmbassadors,
          eventAmbassadors,
          log
        );
        persistChangesLog(log);
        ambassy();
        const recipientsSummary = Array.from(new Set(Array.from(eaRecipients.values()).filter(r => r !== "")))
          .join(", ") || "unassigned";
        alert(`Regional Ambassador "${name}" offboarded. Event Ambassadors reallocated to: ${recipientsSummary}.`);
      } catch (error) {
        alert(`Failed to offboard Regional Ambassador: ${error instanceof Error ? error.message : "Unknown error"}`);
      }
    } else {
      try {
        offboardRegionalAmbassador(name, new Map(), regionalAmbassadors, eventAmbassadors, log);
        persistChangesLog(log);
        ambassy();
        alert(`Regional Ambassador "${name}" offboarded.`);
      } catch (error) {
        alert(`Failed to offboard Regional Ambassador: ${error instanceof Error ? error.message : "Unknown error"}`);
      }
    }
  };

  setOffboardingHandlers(handleOffboardEA, handleOffboardRA);

  setEAReallocateHandler((eaName: string) => {
    const eventAmbassadors = getEventAmbassadorsFromSession();
    const regionalAmbassadors = getRegionalAmbassadorsFromSession();

    if (!eventAmbassadors.has(eaName)) {
      alert(`Event Ambassador "${eaName}" not found.`);
      return;
    }

    const currentREA = getRegionalAmbassadorForEventAmbassador(eaName, regionalAmbassadors);

    try {
      const suggestions = getEAReallocationSuggestions(
        eaName,
        eventAmbassadors,
        regionalAmbassadors,
        loadCapacityLimits()
      );

      showEventTeamReallocationDialog(
        eaName,
        currentREA || "",
        suggestions,
        undefined,
        regionalAmbassadors,
        (selectedREA: string) => {
          if (!selectedREA || selectedREA.trim() === "") {
            alert("Please select a Regional Ambassador.");
            return;
          }

          if (selectedREA === currentREA) {
            alert("Event Ambassador is already assigned to this Regional Ambassador.");
            return;
          }

          if (!regionalAmbassadors.has(selectedREA)) {
            alert(`Regional Ambassador "${selectedREA}" not found.`);
            return;
          }

          try {
            reallocateEventAmbassador(
              eaName,
              currentREA,
              selectedREA,
              eventAmbassadors,
              regionalAmbassadors,
              log
            );

            persistChangesLog(log);

            // Recalculate eventTeamsTableData because REA relationships have changed
            // All events under this EA now belong to a different REA
            const eventTeams = getEventTeamsFromSession();
            if (eventDetails && eventTeams) {
              eventTeamsTableData = extractEventTeamsTableData(
                regionalAmbassadors,
                eventAmbassadors,
                eventTeams,
                eventDetails
              );
            }

            refreshUI(eventDetails!, eventTeamsTableData!, log, eventAmbassadors, regionalAmbassadors);

            alert(`Event Ambassador "${eaName}" reallocated to "${selectedREA}"`);
          } catch (error) {
            alert(`Failed to reallocate Event Ambassador: ${error instanceof Error ? error.message : "Unknown error"}`);
          }
        },
        () => {
          // Handle cancel - dialog already closed by showEventTeamReallocationDialog
        }
      );
    } catch (error) {
      alert(`Failed to get reallocation suggestions: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  });
}

setupOffboardingButtons();

document.getElementById("importFileInput")?.addEventListener("change", async (event) => {
  const input = event.target as HTMLInputElement;
  if (input.files && input.files.length > 0) {
    const file = input.files[0];
    try {
      const hasExistingData = localStorage.getItem("ambassy:eventAmbassadors") !== null ||
                              localStorage.getItem("ambassy:eventTeams") !== null ||
                              localStorage.getItem("ambassy:regionalAmbassadors") !== null;

      if (hasExistingData) {
        const confirmed = confirm("Importing will replace your current data. Do you want to continue?");
        if (!confirmed) {
          return;
        }
      }

      const state = await validateStateFile(file);
      importApplicationState(state);
      ambassy();
      alert("State imported successfully");
    } catch (error) {
      let errorMessage = "Import failed: ";
      if (error instanceof InvalidFileFormatError) {
        errorMessage += "File format is invalid. Please select a valid Ambassy state file.";
      } else if (error instanceof MissingFieldError) {
        errorMessage += "File is missing required data. Please ensure file is complete.";
      } else if (error instanceof VersionMismatchError) {
        errorMessage += "File version is incompatible. Please export a new file from the current version.";
      } else if (error instanceof InvalidDataError) {
        errorMessage += "File contains invalid data. Please verify the file is not corrupted.";
      } else {
        errorMessage += error instanceof Error ? error.message : "Unknown error";
      }
      alert(errorMessage);
    }
    input.value = "";
  }
});

async function ambassy() {
  const introduction = document.getElementById("introduction");
  const ambassy = document.getElementById("ambassy");
  const uploadPrompt = document.getElementById("uploadPrompt");
  const csvFileInput = document.getElementById("csvFileInput");
  const mapContainer = document.getElementById("mapContainer");
  eventDetails = await getEvents();
  if (!introduction || !ambassy || !uploadPrompt || !csvFileInput || !mapContainer) {
    console.error("Required elements not found");
    return;
  }

  restoreApplicationState();

  const regionalAmbassadors = getRegionalAmbassadorsFromSession();
  const eventAmbassadors = getEventAmbassadorsFromSession();
  const eventTeams = getEventTeamsFromSession();
  
  // Reload log from storage to ensure consistency
  const currentLog = getLogFromSession();
  log.length = 0;
  log.push(...currentLog);
  
  const hasData = hasApplicationData(eventTeams, eventAmbassadors, regionalAmbassadors);

  if (hasData) {
    // Update the UI
    introduction.style.display = "none";
    ambassy.style.display = "block";

    // Calculate capacity statuses for all ambassadors
    const capacityLimits = loadCapacityLimits();
    calculateAllCapacityStatuses(eventAmbassadors, regionalAmbassadors, capacityLimits);
    
    eventTeamsTableData = extractEventTeamsTableData(regionalAmbassadors, eventAmbassadors, eventTeams, eventDetails);
    
    // Initialize navigation handlers BEFORE populating tables
    initializeTableMapNavigation();
    
    // Initialize Issues tab callback
    initializeIssuesTab();
    
    refreshUI(eventDetails, eventTeamsTableData, log, eventAmbassadors, regionalAmbassadors);
  } else {
    introduction.style.display = "block";
    ambassy.style.display = "none";

    const missingFiles = [];
    if (eventTeams.size === 0) {
      missingFiles.push("Event Teams CSV");
    }
    if (regionalAmbassadors.size === 0) {
      missingFiles.push("Regional Ambassadors CSV");
    }
    if (eventAmbassadors.size === 0) {
      missingFiles.push("Event Ambassadors CSV");
    }
    uploadPrompt.textContent = `Please upload the following files: ${missingFiles.join(", ")}`;
  }

  updateButtonVisibility(hasData, isMapViewDisplayed());
}

function refreshIssuesTable(): void {
  if (!eventDetails || !eventTeamsTableData) {
    return;
  }

  const eventTeams = getEventTeamsFromSession();
  const eventAmbassadors = getEventAmbassadorsFromSession();
  const regionalAmbassadors = getRegionalAmbassadorsFromSession();

  if (!eventTeams || eventAmbassadors.size === 0 || regionalAmbassadors.size === 0) {
    return;
  }

  const issues = detectIssues(eventTeams, eventDetails, eventAmbassadors, regionalAmbassadors);
  issuesState.issues = issues;

  populateIssuesTable(
    issues,
    issuesState,
    onIssueSelect,
    onSearchEvents,
    onEnterAddress
  );
}

function onIssueSelect(issue: EventIssue): void {
  setSelectedIssue(issuesState, issue.eventShortName);
  refreshIssuesTable();
}

function onSearchEvents(issue: EventIssue): void {
  if (!eventDetails) {
    alert("Event details not loaded. Please wait and try again.");
    return;
  }

  showEventSearchDialog(
    issue.eventShortName,
    eventDetails,
      (selectedEvent: EventDetails) => {
        try {
          if (!eventDetails) {
            alert("Event details not available");
            return;
          }

          resolveIssueWithEvent(issue, selectedEvent, eventDetails, log);
          persistEventDetails(eventDetails);
          persistChangesLog(log);

          const eventTeams = getEventTeamsFromSession();
          const eventAmbassadors = getEventAmbassadorsFromSession();
          const regionalAmbassadors = getRegionalAmbassadorsFromSession();

          if (eventTeams && eventDetails) {
            eventTeamsTableData = extractEventTeamsTableData(
              regionalAmbassadors,
              eventAmbassadors,
              eventTeams,
              eventDetails
            );
          }

          refreshUI(eventDetails!, eventTeamsTableData!, log, eventAmbassadors, regionalAmbassadors);
          refreshIssuesTable();

          alert(`Event "${issue.eventShortName}" resolved successfully!`);
        } catch (error) {
          alert(`Failed to resolve issue: ${error instanceof Error ? error.message : "Unknown error"}`);
        }
      },
    () => {
      // Cancel - dialog already closed
    }
  );
}

async function onEnterAddress(issue: EventIssue): Promise<void> {
  if (!eventDetails) {
    alert("Event details not loaded. Cannot geocode address.");
    return;
  }

  showAddressDialog(
    issue,
    eventDetails,
    log,
    () => {
      // Success callback - refresh UI
      persistEventDetails(eventDetails!);
      persistChangesLog(log);
      refreshIssuesTable();
      refreshUI(eventDetails!, eventTeamsTableData!, log);
    },
    () => {
      // Cancel callback - do nothing
    }
  );
}

function initializeIssuesTab(): void {
  setIssuesTabVisibleCallback(() => {
    refreshIssuesTable();
  });
}

function initializeTableMapNavigation(): void {
  if (!eventTeamsTableData || !eventDetails) {
    return;
  }

  setMarkerClickHandler((eventShortName: string) => {
    const markerMap = getMarkerMap();
    const highlightLayer = getHighlightLayer();
    const map = getMap();
    selectMapEvent(
      selectionState,
      eventShortName,
      markerMap,
      highlightLayer,
      eventDetails!,
      map
    );
  });

  setRowClickHandler((eventShortName: string) => {
    const markerMap = getMarkerMap();
    const highlightLayer = getHighlightLayer();
    const map = getMap();
    selectEventTeamRow(
      selectionState,
      eventShortName,
      eventTeamsTableData!,
      markerMap,
      highlightLayer,
      eventDetails!,
      map
    );
  });

  setEventTeamsTabVisibleCallback(() => {
    applyDeferredTableSelection(
      selectionState,
      eventTeamsTableData!
    );
  });

  setReallocateButtonHandler(selectionState, (eventShortName: string) => {
    if (!eventTeamsTableData || !eventDetails) {
      return;
    }

    const eventAmbassadors = getEventAmbassadorsFromSession();
    const regionalAmbassadors = getRegionalAmbassadorsFromSession();

    const eventData = eventTeamsTableData.get(eventShortName);
    if (!eventData || !eventData.eventAmbassador) {
      alert("Event is not currently assigned to any ambassador.");
      return;
    }

    try {
      const suggestions = getReallocationSuggestions(
        eventShortName,
        eventTeamsTableData,
        eventAmbassadors,
        eventDetails,
        loadCapacityLimits(),
        regionalAmbassadors
      );

      showEventTeamReallocationDialog(
        eventShortName,
        eventData.eventAmbassador,
        suggestions,
        eventAmbassadors,
        undefined,
        (selectedAmbassador: string) => {
          if (!eventTeamsTableData) {
            return;
          }

          const validation = validateReallocation(
            eventShortName,
            selectedAmbassador,
            eventAmbassadors,
            eventTeamsTableData
          );

          if (!validation.valid) {
            alert(`Cannot reallocate: ${validation.error}`);
            return;
          }

          try {
            const eventTeams = getEventTeamsFromSession();
            
            reallocateEventTeam(
              eventShortName,
              eventData.eventAmbassador,
              selectedAmbassador,
              eventAmbassadors,
              eventTeamsTableData,
              log,
              regionalAmbassadors,
              eventTeams,
              eventDetails ?? undefined
            );

            persistChangesLog(log);

            if (eventDetails) {
              clearSelection(selectionState);
              refreshUI(eventDetails, eventTeamsTableData, log, eventAmbassadors, regionalAmbassadors);
            }

            const eventNameDisplay = eventShortName;
            alert(`Event "${eventNameDisplay}" reallocated to "${selectedAmbassador}"`);
          } catch (error) {
            alert(`Failed to reallocate event: ${error instanceof Error ? error.message : "Unknown error"}`);
          }
        },
        () => {
          // Handle cancel - dialog already closed by showEventTeamReallocationDialog
        }
      );
    } catch (error) {
      alert(`Failed to get reallocation suggestions: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  });
}

let lastStorageEventTime = 0;
window.addEventListener("storage", () => {
  const now = Date.now();
  if (now - lastStorageEventTime > 100) {
    lastStorageEventTime = now;
    ambassy();
  }
});

document.addEventListener("DOMContentLoaded", () => {
  initializeTabs();
  ambassy();
});


