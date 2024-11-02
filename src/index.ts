import { EventAmbassador } from "./models/EventAmbassador";
import { EventAmbassadorMap } from "./models/EventAmbassadorMap";
import { EventDetailsMap } from "./models/EventDetailsMap";
import { EventTeam } from "./models/EventTeam";
import { EventTeamMap } from "./models/EventTeamMap";
import { RegionalAmbassador } from "./models/RegionalAmbassador";
import { RegionalAmbassadorMap } from "./models/RegionalAmbassadorMap";

import { getEvents } from "./actions/fetchEvents";
import { handleFileUpload } from "./actions/uploadCSV";
import { populateMap } from "./actions/populateMap";
import { populateEventTeamsTable } from "./actions/populateEventTeamsTable";
import { extractEventTeamsTableData } from "./models/EventTeamsTable";


async function ambassy() {
  const h1Element = document.querySelector("h1");
  const uploadPrompt = document.getElementById("uploadPrompt");
  const csvFileInput = document.getElementById("csvFileInput");
  const uploadButton = document.getElementById("uploadButton");  const mapContainer = document.getElementById("mapContainer");
  const eventTeamsTableContainer = document.getElementById(
    "eventTeamsTableContainer"
  );

  if (
    !h1Element ||
    !uploadPrompt ||
    !csvFileInput ||
    !mapContainer ||
    !eventTeamsTableContainer
  ) {
    console.error("Required elements not found");
    return;
  }

  const regionalAmbassadors = getRegionalAmbassadorsFromSession();
  const eventAmbassadors = getEventAmbassadorsFromSession();
  const eventTeams = getEventTeamsFromSession();
  const eventDetails: EventDetailsMap = await getEvents();
  
  if (eventTeams.size && eventAmbassadors.size && regionalAmbassadors.size) {
    // Update the UI
    h1Element.textContent = "Ambassy";
    uploadPrompt.style.display = "none";
    csvFileInput.style.display = "none";
    mapContainer.style.display = "block";
    eventTeamsTableContainer.style.display = "block";

    const eventTeamsTableData = extractEventTeamsTableData(regionalAmbassadors, eventAmbassadors, eventTeams, eventDetails);
    populateEventTeamsTable(eventTeamsTableData);

    const names = [
      ...new Set([...regionalAmbassadors.keys(), ...eventAmbassadors.keys()]),
    ];


    populateMap(eventTeamsTableData, eventDetails, names);
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
    const missingFilesMessage = `Please upload the following missing files: ${missingFiles.join(
      ", "
    )}`;
    uploadPrompt.textContent = missingFilesMessage;
  }
}

function getEventTeamsFromSession(): EventTeamMap {
  const storedEventTeams = sessionStorage.getItem("Event Teams");
  if (storedEventTeams) {
    const parsedData = JSON.parse(storedEventTeams);
    if (parsedData) {
      return new Map<string, EventTeam>(parsedData);
    }
  }
  return new Map<string, EventTeam>();
}

function getEventAmbassadorsFromSession(): EventAmbassadorMap {
  const storedEventAmbassadors = sessionStorage.getItem("Event Ambassadors");
  if (storedEventAmbassadors) {
    const parsedData = JSON.parse(storedEventAmbassadors);
    return new Map<string, EventAmbassador>(parsedData);
  }
  return new Map<string, EventAmbassador>();
}

function getRegionalAmbassadorsFromSession(): RegionalAmbassadorMap {
  const storedRegionalAmbassadors = sessionStorage.getItem(
    "Regional Ambassadors"
  );
  if (storedRegionalAmbassadors) {
    const parsedData = JSON.parse(storedRegionalAmbassadors);
    return new Map<string, RegionalAmbassador>(parsedData);
  }
  return new Map<string, RegionalAmbassador>();
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

ambassy();
