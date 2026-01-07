import { EventAmbassador } from "./models/EventAmbassador";
import { EventAmbassadorMap } from "./models/EventAmbassadorMap";
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
import { persistChangesLog } from "./actions/persistState";

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
  const eventTeamsTableContainer = document.getElementById("eventTeamsTableContainer");
  eventDetails = await getEvents();
  if (!introduction || !ambassy || !uploadPrompt || !csvFileInput || !mapContainer || !eventTeamsTableContainer) {
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

    eventTeamsTableData = extractEventTeamsTableData(regionalAmbassadors, eventAmbassadors, eventTeams, eventDetails);
    
    refreshUI(eventDetails, eventTeamsTableData, log);
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

window.addEventListener("storage", () => {
  ambassy();
});

document.addEventListener("DOMContentLoaded", () => {
  ambassy();
});


