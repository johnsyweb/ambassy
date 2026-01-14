import { EventAmbassador } from "./models/EventAmbassador";
import { EventAmbassadorMap } from "./models/EventAmbassadorMap";
import { EventDetails } from "./models/EventDetails";
import { EventDetailsMap } from "./models/EventDetailsMap";
import { EventTeamMap } from "./models/EventTeamMap";
import { RegionalAmbassador } from "./models/RegionalAmbassador";
import { RegionalAmbassadorMap } from "./models/RegionalAmbassadorMap";

import { getEvents } from "./actions/fetchEvents";
import { getCountries } from "./models/country";
import { handleFileUpload } from "./actions/uploadCSV";
import { importProspectiveEvents } from "./actions/importProspectiveEvents";
import { extractEventTeamsTableData } from "./models/EventTeamsTable";
import { getEventTeamsFromSession } from "@parsers/parseEventTeams";
import { LogEntry } from "@models/LogEntry";
import { EventTeamsTableData } from "@models/EventTeamsTableData";
import { refreshUI } from "./actions/refreshUI";
import { restoreApplicationState } from "./actions/persistState";
import { loadFromStorage } from "@utils/storage";
import { exportApplicationState, downloadStateFile } from "./actions/exportState";
import { showSharingDialog } from "./actions/showSharingDialog";
import { validateStateFile } from "./actions/importState";
import { shouldShowImportGuidance, showImportGuidance } from "./actions/showImportGuidance";
import { handleStateImport } from "./actions/handleStateImport";
import { onboardEventAmbassador, onboardRegionalAmbassador } from "./actions/onboardAmbassador";
import { persistChangesLog, persistEventDetails } from "./actions/persistState";
import { initializeTabs } from "./utils/tabs";
import { calculateAllCapacityStatuses, loadCapacityLimits } from "./actions/checkCapacity";
import { offboardEventAmbassador, offboardRegionalAmbassador } from "./actions/offboardAmbassador";
import { suggestEventReallocation, suggestEventAmbassadorReallocation } from "./actions/suggestReallocation";
import { setOffboardingHandlers, setEAReallocateHandler } from "./actions/populateAmbassadorsTable";
import { setProspectReallocationRefreshCallback } from "./actions/populateProspectsTable";
import { saveCapacityLimits, validateCapacityLimits } from "./actions/configureCapacityLimits";
import { CapacityLimits } from "./models/CapacityLimits";
import { SelectionState, createSelectionState } from "./models/SelectionState";
import { selectEventTeamRow, selectMapEvent, selectProspectRow, applyDeferredTableSelection, highlightProspectTableRow, scrollToProspectTableRow } from "./actions/tableMapNavigation";
import { getMarkerMap, getHighlightLayer, getMap, setMarkerClickHandler, populateMap } from "./actions/populateMap";
import { setRowClickHandler, setReallocateButtonHandler } from "./actions/populateEventTeamsTable";
import { setProspectRowClickHandler } from "./actions/populateProspectsTable";
import { setEventTeamsTabVisibleCallback, setIssuesTabVisibleCallback, setProspectsTabVisibleCallback } from "./utils/tabs";
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
import { populateProspectsTable } from "./actions/populateProspectsTable";
import { loadProspectiveEvents } from "./actions/persistProspectiveEvents";
import { ProspectiveEventList } from "./models/ProspectiveEventList";
import { createIssuesState, setSelectedIssue } from "./models/IssuesState";
import { EventIssue } from "./models/EventIssue";
import { showEventSearchDialog } from "./actions/showEventSearchDialog";
import { resolveIssueWithEvent } from "./actions/resolveIssue";
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
    showSharingDialog();
  });
}

function setupImportButton(buttonId: string): void {
  document.getElementById(buttonId)?.addEventListener("click", () => {
    document.getElementById("importFileInput")?.click();
  });
}

function setupProspectsImportButton(): void {
  const button = document.getElementById("importProspectsButton");
  const input = document.getElementById("prospectsCsvFileInput");

  if (!button || !input) {
    return;
  }

  button.addEventListener("click", () => {
    input.click();
  });

  input.addEventListener("change", (event) => {
    const target = event.target as HTMLInputElement;
    const file = target.files?.[0];
    if (file) {
      handleProspectsFileUpload(file);
    }
  });
}

setupExportButton("exportButtonMap");
setupImportButton("importButton");
setupImportButton("importButtonMap");
setupProspectsImportButton();

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
      // Create a working copy of eventAmbassadors to track allocations during offboarding
      const workingEventAmbassadors = new Map(eventAmbassadors);

      for (const eventName of eventsToReallocate) {
        const suggestions = suggestEventReallocation(
          name,
          [eventName],
          workingEventAmbassadors,
          eventDetails!,
          loadCapacityLimits(),
          regionalAmbassadors
        );

        const recipientName = await new Promise<string | null>((resolve) => {
          showEventTeamReallocationDialog(
            eventName,
            name,
            suggestions,
            workingEventAmbassadors,
            regionalAmbassadors,
            (selectedAmbassador: string) => {
              resolve(selectedAmbassador);
            },
            () => {
              resolve(null);
            },
            eventDetails ?? undefined
          );
        });

        if (recipientName === null) {
          return;
        }

        const trimmedRecipient = recipientName.trim();
        if (trimmedRecipient !== "" && !workingEventAmbassadors.has(trimmedRecipient)) {
          alert(`Recipient Event Ambassador "${trimmedRecipient}" not found. Skipping this event.`);
          eventRecipients.set(eventName, "");
        } else {
          eventRecipients.set(eventName, trimmedRecipient);
          // Update the working copy to reflect the new allocation
          if (trimmedRecipient !== "") {
            const recipient = workingEventAmbassadors.get(trimmedRecipient);
            if (recipient) {
              recipient.events = [...recipient.events, eventName];
            }
          }
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
      // Create a working copy of regionalAmbassadors to track allocations during offboarding
      const workingRegionalAmbassadors = new Map(regionalAmbassadors);

      for (const eaName of easToReallocate) {
        const suggestions = suggestEventAmbassadorReallocation(
          name,
          [eaName],
          workingRegionalAmbassadors,
          eventAmbassadors,
          loadCapacityLimits()
        );

        const recipientName = await new Promise<string | null>((resolve) => {
          showEventTeamReallocationDialog(
            eaName,
            name,
            suggestions,
            undefined,
            workingRegionalAmbassadors,
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
        if (trimmedRecipient !== "" && !workingRegionalAmbassadors.has(trimmedRecipient)) {
          alert(`Recipient Regional Ambassador "${trimmedRecipient}" not found. Skipping this Event Ambassador.`);
          eaRecipients.set(eaName, "");
        } else {
          eaRecipients.set(eaName, trimmedRecipient);
          // Update the working copy to reflect the new allocation
          if (trimmedRecipient !== "") {
            const recipient = workingRegionalAmbassadors.get(trimmedRecipient);
            if (recipient) {
              recipient.supportsEAs = [...recipient.supportsEAs, eaName];
            }
          }
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
    const result = await handleStateImport(file);
    if (result.success) {
      ambassy();
    }
    alert(result.message);
    input.value = "";
  }
});

function setupDragAndDrop(): void {
  const body = document.body;

  body.addEventListener("dragover", (event) => {
    event.preventDefault();
    event.stopPropagation();
  });

  body.addEventListener("drop", async (event) => {
    event.preventDefault();
    event.stopPropagation();

    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (file.type === "application/json" || file.name.endsWith(".json")) {
        const result = await handleStateImport(file);
        if (result.success) {
          ambassy();
        }
        alert(result.message);
      }
    }
  });
}

setupDragAndDrop();

async function ambassy() {
  const introduction = document.getElementById("introduction");
  const ambassy = document.getElementById("ambassy");
  const uploadPrompt = document.getElementById("uploadPrompt");
  const csvFileInput = document.getElementById("csvFileInput");
  const mapContainer = document.getElementById("mapContainer");
  eventDetails = await getEvents();
  // Preload countries to populate cache
  await getCountries();
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

  if (!hasData && shouldShowImportGuidance()) {
    showImportGuidance();
  }

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

  // Initialize Prospects tab callback
  initializeProspectsTab();

  // Set up prospect reallocation refresh callback
  setProspectReallocationRefreshCallback(() => {
    if (eventDetails && eventTeamsTableData) {
      refreshUI(eventDetails, eventTeamsTableData, log, eventAmbassadors, regionalAmbassadors);
    }
  });
    
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
    onResolve
  );
}

function refreshProspectsTable(): void {
  const eventAmbassadors = getEventAmbassadorsFromSession();
  const regionalAmbassadors = getRegionalAmbassadorsFromSession();

  if (eventAmbassadors.size === 0 || regionalAmbassadors.size === 0) {
    return;
  }

  const prospects = loadProspectiveEvents();
  const prospectsList = new ProspectiveEventList(prospects);

  populateProspectsTable(prospectsList, eventAmbassadors, regionalAmbassadors, log, eventDetails ?? undefined);

  // Also refresh the map to show updated prospects
  if (eventDetails && eventTeamsTableData) {
    populateMap(eventTeamsTableData, eventDetails, eventAmbassadors, regionalAmbassadors, prospects);
  }
}

function onIssueSelect(issue: EventIssue): void {
  setSelectedIssue(issuesState, issue.eventShortName);
  refreshIssuesTable();
}

function onResolve(issue: EventIssue): void {
  if (!eventDetails) {
    alert("Event details not loaded. Please wait and try again.");
    return;
  }

  // First, try searching events.json
  showEventSearchDialog(
    issue.eventShortName,
    eventDetails,
    (selectedEvent: EventDetails) => {
      // Search succeeded - resolve with found event
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
      // Search cancelled - dialog already closed
    },
    () => {
      // Switch to address entry
      onEnterAddress(issue);
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

function initializeProspectsTab(): void {
  setProspectsTabVisibleCallback(() => {
    refreshProspectsTable();
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

  setProspectRowClickHandler((prospectId: string) => {
    const map = getMap();
    const prospectiveEvents = loadProspectiveEvents();
    const prospectsList = new ProspectiveEventList(prospectiveEvents);
    selectProspectRow(
      selectionState,
      prospectId,
      prospectsList,
      map
    );
  });

  setEventTeamsTabVisibleCallback(() => {
    applyDeferredTableSelection(
      selectionState,
      eventTeamsTableData!
    );
  });

  setProspectsTabVisibleCallback(() => {
    // Handle deferred prospect selection when prospects tab becomes visible
    if (selectionState.selectedEventShortName?.startsWith('prospect:')) {
      const prospectId = selectionState.selectedEventShortName.substring(9); // Remove 'prospect:' prefix
      const prospectiveEvents = loadProspectiveEvents();
      const prospectsList = new ProspectiveEventList(prospectiveEvents);
      const prospect = prospectsList.findById(prospectId);
      if (prospect && prospect.coordinates && prospect.geocodingStatus === 'success') {
        highlightProspectTableRow("prospectsTable", prospectId, true);
        scrollToProspectTableRow("prospectsTable", prospectId);
      }
    }
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
        regionalAmbassadors,
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
        },
        eventDetails
      );
    } catch (error) {
      alert(`Failed to get reallocation suggestions: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  });
}

async function handleProspectsFileUpload(file: File): Promise<void> {
  try {
    const csvContent = await file.text();
    const eventAmbassadors = getEventAmbassadorsFromSession();
    const regionalAmbassadors = getRegionalAmbassadorsFromSession();

    // Show progress indicator
    const progressDiv = document.getElementById('prospectsImportProgress') as HTMLDivElement;
    const progressBar = document.getElementById('prospectsProgressBar') as HTMLProgressElement;
    const progressText = document.getElementById('progressText') as HTMLSpanElement;
    const progressStage = document.getElementById('progressStage') as HTMLDivElement;
    const progressCurrentEvent = document.getElementById('progressCurrentEvent') as HTMLSpanElement;

    progressDiv.style.display = 'block';
    progressBar.value = 0;
    progressText.textContent = '0/0';
    progressStage.textContent = 'Starting import...';
    progressCurrentEvent.textContent = '';

    const result = await importProspectiveEvents(
      csvContent,
      eventAmbassadors,
      regionalAmbassadors,
      (progress) => {
        progressBar.value = progress.current;
        progressBar.max = progress.total;
        progressText.textContent = `${progress.current}/${progress.total}`;

        if (progress.stage) {
          progressStage.textContent = progress.stage;
        }

        if (progress.currentEvent) {
          progressCurrentEvent.textContent = `Processing: ${progress.currentEvent}`;
        }
      }
    );

    // Hide progress indicator
    progressDiv.style.display = 'none';

    if (result.success) {
      alert(`Successfully imported ${result.imported} prospective events.\n\nWarnings:\n${result.warnings.join('\n')}`);
      refreshProspectsTable();
    } else {
      alert(`Import failed:\n\nErrors:\n${result.errors.join('\n')}\n\nWarnings:\n${result.warnings.join('\n')}`);
    }

    // Clear the input
    const input = document.getElementById("prospectsCsvFileInput") as HTMLInputElement;
    if (input) {
      input.value = "";
    }
  } catch (error) {
    alert(`Failed to process prospects file: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
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


