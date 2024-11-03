import { EventAmbassador } from "./models/EventAmbassador";
import { EventAmbassadorMap } from "./models/EventAmbassadorMap";
import { EventDetailsMap } from "./models/EventDetailsMap";
import { RegionalAmbassador } from "./models/RegionalAmbassador";
import { RegionalAmbassadorMap } from "./models/RegionalAmbassadorMap";

import { getEvents } from "./actions/fetchEvents";
import { handleFileUpload } from "./actions/uploadCSV";
import { populateMap } from "./actions/populateMap";
import { populateEventTeamsTable } from "./actions/populateEventTeamsTable";
import { extractEventTeamsTableData } from "./models/EventTeamsTable";
import { getEventTeamsFromSession } from "@parsers/parseEventTeams";
import { LogEntry } from "@models/LogEntry";
import { updateEventAmbassador } from "@actions/updateEventAmbassador";
import { EventTeamsTableData } from "@models/EventTeamsTableData";
import { populateChangesLogTable } from "@actions/populateChangesLogTable";

function getRegionalAmbassadorsFromSession(): RegionalAmbassadorMap {
  const storedRegionalAmbassadors = sessionStorage.getItem("Regional Ambassadors");
  if (storedRegionalAmbassadors) {
    const parsedData = JSON.parse(storedRegionalAmbassadors);
    return new Map<string, RegionalAmbassador>(parsedData);
  }
  return new Map<string, RegionalAmbassador>();
}

function getEventAmbassadorsFromSession(): EventAmbassadorMap {
  const storedEventAmbassadors = sessionStorage.getItem("Event Ambassadors");
  if (storedEventAmbassadors) {
    const parsedData = JSON.parse(storedEventAmbassadors);
    return new Map<string, EventAmbassador>(parsedData);
  }
  return new Map<string, EventAmbassador>();
}

function getLogFromSession(): LogEntry[] {
  const storedLog = sessionStorage.getItem("log");
  if (storedLog) {
    return JSON.parse(storedLog);
  }
  return [];
}

const log: LogEntry[] = getLogFromSession();

let eventTeamsTableData: Map<string, EventTeamsTableData> | null = null;
let eventDetails: EventDetailsMap | null = null;
  
function updateEventAmbassadorUI(eventShortName: string, newEventAmbassador: string) {
  if (!eventTeamsTableData) {
    console.error("Event Teams Table Data not available");  
    return;
  }
  updateEventAmbassador(eventTeamsTableData, eventShortName, newEventAmbassador, log);
  sessionStorage.setItem("log", JSON.stringify(log));
  updateUIWithEventDetails();
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
  sessionStorage.clear();
  location.reload();
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

  const regionalAmbassadors = getRegionalAmbassadorsFromSession();
  const eventAmbassadors = getEventAmbassadorsFromSession();
  const eventTeams = getEventTeamsFromSession();
  
  if (eventTeams.size && eventAmbassadors.size && regionalAmbassadors.size) {
    // Update the UI
    introduction.style.display = "none";
    ambassy.style.display = "block";

    eventTeamsTableData = extractEventTeamsTableData(regionalAmbassadors, eventAmbassadors, eventTeams, eventDetails);
    
    updateUIWithEventDetails();
  } else {
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
}

document.addEventListener("DOMContentLoaded", () => {
  ambassy();
});

function updateUIWithEventDetails() {
  if (!eventDetails || !eventTeamsTableData) {
    console.error("Event details are not available");
    return
  }
  populateEventTeamsTable(eventTeamsTableData, updateEventAmbassadorUI);
  populateMap(eventTeamsTableData, eventDetails);
  populateChangesLogTable(log);
}
